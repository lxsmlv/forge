# Миграция realtime-доставки на Ably

**Дата:** 2026-04-16
**Статус:** Дизайн согласован

## Мотивация

Текущая инфра использует Supabase Realtime `postgres_changes` для доставки сообщений, нотификаций и обновлений ленты. Это **replication-based** механизм, не предназначенный для чатов. Последствия:

1. Нестабильная латентность: от 100ms до 20+ секунд
2. Пачки сообщений раз в 20 секунд (поллинг-фолбэк берёт на себя когда realtime дропает)
3. Коллизии имён каналов при переоткрытии чата
4. Нет гарантий доставки / повторов

Ably — специализированный pub/sub брокер, spawned именно под real-time мессенджинг. Latency 20-80ms глобально, 99.999% SLA, free tier покрывает 3M msg/мес.

## Скоуп

**Включено:**
- Интеграция серверного action'а `getAblyToken()` — выдаёт короткоживущий JWT с узкими правами текущему пользователю
- Чат `/messages/[userId]` — подписка на личный канал + publish через server action
- Список диалогов `/messages` — подписка на уведомление-канал юзера
- Бейдж нотификаций и сообщений в `BottomNav` и `FeedHeader` — слушать Ably-уведомления
- Полностью удалить Supabase `postgres_changes` подписки из клиента
- Удалить поллинг-фолбэки (`setInterval` на loadMessages / refreshConversations)

**Не входит:**
- Ably Presence (online/offline индикаторы) — отложим до отдельной задачи
- Ably Rewind / History — пока не нужно, персистенция в Supabase остаётся
- Мобильное приложение
- Изменения E2E-шифрования — остаётся как есть, Ably несёт encrypted payload

## Архитектура

### Источник правды
- **Supabase Postgres** — единственный источник правды для `messages`, `notifications`, `profiles`. Ably НЕ источник, а только трансляция.

### Поток отправки сообщения

1. Клиент шифрует текст (Web Crypto, без изменений)
2. Клиент вызывает server action `sendEncryptedMessage(receiverId, text, encryptedKey, iv, encryptedKeySender)`
3. Server action:
   a. INSERT в `messages` таблицу
   b. `createNotification(receiverId, 'message', userId)` — запись в `notifications`
   c. Параллельно: через серверный Ably REST SDK publish на канал `user:{receiverId}` событие `message:new` с payload (id, text, iv, encrypted_key, encrypted_key_sender, sender_id, created_at)
   d. Также publish на `user:{senderId}` (echo для других вкладок отправителя)
4. Клиент отправителя — оптимистично добавляет в UI (без изменений)

### Поток получения сообщения

1. Клиент после логина получает Ably-токен через server action `getAblyToken()` (signed JWT, TTL 1 час, capability: `{"user:{userId}": ["subscribe"]}`)
2. Создаёт `Ably.Realtime` с этим токеном
3. Подписывается на канал `user:{myUserId}` на события:
   - `message:new` → в контексте чата: если `sender_id === otherUserId` или `receiver_id === otherUserId` → append в messages → decrypt-pipeline рендерит
   - `message:new` → в контексте списка диалогов: обновить превью + unread counter
   - `message:new` → в BottomNav / FeedHeader: ++unreadMessages badge
   - `notification:new` → BottomNav / FeedHeader: ++unreadNotifications badge
4. Канал переиспользуется во всех компонентах текущей сессии (один коннект на юзера)

### Token auth
**Никогда не используем root key на клиенте.** Клиент получает JWT-токен от нашего сервера:
- TTL: 1 час
- Capability: `{ "user:{userId}": ["subscribe"] }` — только на свой канал, только subscribe
- Publish только с сервера через REST API с root key

### Ably SDK
- Сервер (Next.js server actions / API routes): `ably` npm package, используем REST клиент для publish и token generation
- Клиент: `ably` тот же пакет, импортим `Ably.Realtime`
- Один коннект на юзера через React Context / singleton hook

### Имена каналов
- `user:{userId}` — личный канал юзера. Сюда приходят новые сообщения И нотификации.
- В будущем (не сейчас): `group:{groupId}` для групповых чатов.

Имена channel'ов намеренно не содержат `conv:` (разговор), потому что подписка на свой канал — один коннект ловит всё, проще и дешевле по connection квотам Ably.

### Fallback стратегия
- Никакого поллинга.
- При потере соединения Ably SDK автоматически переконнектится (built-in). При реконнекте можно дёрнуть `loadMessages()`/`getConversations()` один раз чтобы подтянуть что пропустили (используем `ATTACHED` событие канала как trigger).
- Open-chat-fetch при маунте остаётся — юзер видит историю сразу.

### Environment
- `ABLY_ROOT_KEY` — серверная переменная, уже в Vercel env для production/preview/development + локально

## Затрагиваемые файлы

**Create:**
- `src/lib/ably/server.ts` — серверный Ably REST клиент (init с root key), функции `publishToUser(userId, event, data)`
- `src/lib/ably/token.ts` — server action `getAblyToken()` возвращает JWT для клиента
- `src/lib/ably/client-provider.tsx` — React Provider с одним Ably.Realtime на сессию, hook `useAbly()` для доступа к instance и channel

**Modify:**
- `src/features/messages/actions.ts` — `sendEncryptedMessage` дополнительно публикует в Ably после INSERT
- `src/features/notifications/actions.ts` — `createNotification` дополнительно публикует в Ably
- `src/app/messages/[userId]/page.tsx` — убрать Supabase realtime подписку, убрать polling, добавить Ably-подписку через useAbly
- `src/app/messages/page.tsx` — убрать Supabase realtime, убрать polling, добавить Ably
- `src/features/navigation/BottomNav.tsx` — убрать `useRealtime`, перевести на `useAbly`
- `src/features/feed/FeedHeader.tsx` — то же самое
- `src/app/layout.tsx` — обернуть в `<AblyProvider>`

**Delete (или отметить deprecated):**
- `src/lib/useRealtime.ts` — пока оставим (используется для posts feed), но удалим из messages/notifications контекстов

## Граничные случаи

- **Клиент оффлайн когда пришло сообщение** — Ably не доставит retrospective (не включали History для данной миграции). Но при открытии чата `loadMessages()` подтянет из БД. **Источник правды — БД.**
- **Токен истёк** — Ably SDK автоматически запрашивает новый через `authCallback` который дёргает наш `getAblyToken()`.
- **Публикация в Ably упала** — сообщение всё равно в БД. Получатель увидит при следующем fetch (открытие чата / refresh). Не критично.
- **Множественные вкладки одного юзера** — все подписаны на `user:{userId}`, каждая получит событие. Echo для отправителя в другой вкладке работает через `user:{senderId}` publish.
- **Юзер на `/messages/abc` получает сообщение от `/messages/xyz`** — сообщение прилетает в канал `user:{userId}`, но чат-компонент фильтрует по `sender_id === otherUserId`. Badge в BottomNav всё равно инкрементится.

## Риски

- **Ably free tier лимит** — 3M msg/мес, 200 concurrent connections. На наших 3 юзерах — запас в 1000x. Не проблема.
- **Ably даун (99.999% SLA = ~5 мин/год)** — в эти 5 минут realtime не работает, сообщения копятся в БД, юзеры увидят при refresh. Не критично.
- **Дополнительная точка отказа** — да, добавляем ещё один сервис. Но его аптайм >= Supabase, риск приемлемый.
- **RU-блокировки** — у Ably глобальная edge-сеть, блокировок не было зафиксировано. Если случится — CloudFlare fronting или свой WS fallback.

## Критерии успеха

- Клиент подключается к Ably при открытии любой страницы, видит в консоли `Ably connected`
- Отправка сообщения с аккаунта A → получатель B видит в открытом чате **в течение 100-300ms**
- BottomNav badge сообщений тикает в течение 100-300ms
- FeedHeader bell badge тикает в течение 100-300ms при лайке/комменте/фолоу/сообщении
- Нет 5s/15s/20s задержек которые были с поллингом
- Нет Supabase postgres_changes подписок на messages/notifications в клиентском коде
- Supabase остаётся source-of-truth, всё сохраняется в БД как сейчас
