# План: миграция realtime на Ably

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans или subagent-driven-development. Шаги с checkbox.

**Цель:** Заменить Supabase `postgres_changes` и поллинг-фолбэки на Ably pub/sub. Все realtime-события (сообщения, нотификации) идут через канал `user:{userId}`.

**Архитектура:** Server-side Ably REST клиент публикует, client-side Ably Realtime клиент подписывается с JWT-токеном (выдаётся нашим server action'ом). Supabase остаётся source of truth.

**Стек:** ably@2.x npm, Next.js 15, React 19, TypeScript, Supabase (без изменений).

---

## File Structure

- **Create:**
  - `src/lib/ably/server.ts` — REST клиент + `publishToUser(userId, event, data)`
  - `src/lib/ably/token-action.ts` — server action `getAblyToken()`
  - `src/lib/ably/client-provider.tsx` — React provider + `useAbly()` хук
- **Modify:**
  - `src/features/messages/actions.ts` — publish после INSERT
  - `src/features/notifications/actions.ts` — publish после INSERT
  - `src/app/layout.tsx` — обёртка `<AblyProvider>`
  - `src/app/messages/[userId]/page.tsx` — Ably вместо Supabase realtime, убрать polling
  - `src/app/messages/page.tsx` — Ably вместо Supabase realtime, убрать polling
  - `src/features/navigation/BottomNav.tsx` — useAbly
  - `src/features/feed/FeedHeader.tsx` — useAbly

---

## Задача 1: Установить пакет ably

- [ ] **Шаг 1: npm install**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npm install ably
```

Ожидание: `+ ably@2.x.x`, без ошибок.

- [ ] **Шаг 2: проверить что .env.local содержит ABLY_ROOT_KEY**

```bash
grep ABLY_ROOT_KEY .env.local
```

Ожидание: одна строка с ключом.

---

## Задача 2: Серверный Ably клиент + publish-хелпер

**Files:**
- Create: `src/lib/ably/server.ts`

- [ ] **Шаг 1: Записать файл**

```ts
import Ably from 'ably';

let restClient: Ably.Rest | null = null;

function getRestClient(): Ably.Rest {
  if (!restClient) {
    const key = process.env.ABLY_ROOT_KEY;
    if (!key) throw new Error('ABLY_ROOT_KEY missing from env');
    restClient = new Ably.Rest(key);
  }
  return restClient;
}

export async function publishToUser(
  userId: string,
  event: string,
  data: unknown,
): Promise<void> {
  try {
    const client = getRestClient();
    const channel = client.channels.get(`user:${userId}`);
    await channel.publish(event, data);
  } catch (err) {
    // Don't fail the request if Ably is down — DB is source of truth
    console.error('Ably publish failed', err);
  }
}
```

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

---

## Задача 3: Server action для token auth

**Files:**
- Create: `src/lib/ably/token-action.ts`

- [ ] **Шаг 1: Записать файл**

```ts
'use server';

import Ably from 'ably';
import { createClient } from '@/lib/supabase/server';

export async function getAblyToken(): Promise<{ token: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { token: null, error: 'not authenticated' };

  const key = process.env.ABLY_ROOT_KEY;
  if (!key) return { token: null, error: 'ABLY_ROOT_KEY missing' };

  const rest = new Ably.Rest(key);
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: user.id,
    capability: JSON.stringify({ [`user:${user.id}`]: ['subscribe'] }),
    ttl: 60 * 60 * 1000, // 1 hour
  });

  return { token: JSON.stringify(tokenRequest) };
}
```

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

---

## Задача 4: React Provider + useAbly хук

**Files:**
- Create: `src/lib/ably/client-provider.tsx`

- [ ] **Шаг 1: Записать файл**

```tsx
'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as Ably from 'ably';
import { getAblyToken } from './token-action';

interface AblyContextValue {
  client: Ably.Realtime | null;
  userId: string | null;
}

const AblyContext = createContext<AblyContextValue>({ client: null, userId: null });

export function AblyProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const clientRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!userId) return;

    const realtime = new Ably.Realtime({
      authCallback: async (_params, callback) => {
        const { token, error } = await getAblyToken();
        if (error || !token) {
          callback(error || 'no token', null);
          return;
        }
        callback(null, JSON.parse(token));
      },
      clientId: userId,
    });

    clientRef.current = realtime;
    setClient(realtime);

    return () => {
      realtime.close();
      clientRef.current = null;
      setClient(null);
    };
  }, [userId]);

  return (
    <AblyContext.Provider value={{ client, userId }}>
      {children}
    </AblyContext.Provider>
  );
}

export function useAbly() {
  return useContext(AblyContext);
}

/**
 * Subscribe to a specific event on the user's personal channel.
 * Automatically unsubscribes on unmount or when handler changes.
 */
export function useAblyEvent(event: string, handler: (data: any) => void) {
  const { client, userId } = useAbly();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!client || !userId) return;
    const channel = client.channels.get(`user:${userId}`);
    const listener = (msg: Ably.Message) => {
      handlerRef.current(msg.data);
    };
    channel.subscribe(event, listener);
    return () => {
      channel.unsubscribe(event, listener);
    };
  }, [client, userId, event]);
}
```

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

---

## Задача 5: Обернуть приложение в AblyProvider

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Шаг 1: Проверить текущее содержимое layout.tsx**

```bash
cat src/app/layout.tsx
```

- [ ] **Шаг 2: Найти где получается current user в layout (если есть), либо добавить client-компонент-обёртку**

Если layout — server component, создаём отдельный client-компонент для provider'а. Создай `src/lib/ably/root-provider.tsx`:

```tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { AblyProvider } from './client-provider';
import { createClient } from '@/lib/supabase/client';

export function AblyRootProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  return <AblyProvider userId={userId}>{children}</AblyProvider>;
}
```

- [ ] **Шаг 3: В `src/app/layout.tsx` обернуть children в `<AblyRootProvider>`**

Пример (покажи существующий layout первым шагом чтобы не снести):

```tsx
import { AblyRootProvider } from '@/lib/ably/root-provider';

// в JSX:
<body>
  <AblyRootProvider>
    {/* existing providers and children */}
  </AblyRootProvider>
</body>
```

- [ ] **Шаг 4: TS-чек + dev-build**

```bash
npx tsc --noEmit 2>&1 | tail -5
npm run build 2>&1 | tail -5
```

Ожидание: чисто.

- [ ] **Шаг 5: Коммит**

```bash
git add -A && git commit -m "feat(ably): install SDK, add server publish + client provider"
```

---

## Задача 6: Publish в Ably при отправке сообщения

**Files:**
- Modify: `src/features/messages/actions.ts`

- [ ] **Шаг 1: Добавить импорт и publish-вызовы в `sendEncryptedMessage`**

Перед `return` в `sendEncryptedMessage`, после INSERT сообщения, добавить publish-ивенты:

```ts
import { publishToUser } from '@/lib/ably/server';

// ... в sendEncryptedMessage, после INSERT и notification:

// Fetch the inserted row to get id + created_at
const { data: inserted } = await supabase
  .from('messages')
  .select('id, created_at, text, encrypted_key, encrypted_key_sender, iv, sender_id, receiver_id')
  .eq('sender_id', user.id)
  .eq('receiver_id', receiverId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (inserted) {
  const payload = {
    id: inserted.id,
    text: inserted.text,
    encrypted_key: inserted.encrypted_key,
    encrypted_key_sender: inserted.encrypted_key_sender,
    iv: inserted.iv,
    sender_id: inserted.sender_id,
    receiver_id: inserted.receiver_id,
    created_at: inserted.created_at,
  };
  await Promise.all([
    publishToUser(receiverId, 'message:new', payload),
    publishToUser(user.id, 'message:echo', payload),
  ]);
}
```

**Важно:** сам INSERT уже происходит раньше в существующем коде — не дублируй. Просто добавь fetch + publish после него.

Замени целиком функцию `sendEncryptedMessage`:

```ts
export async function sendEncryptedMessage(receiverId: string, text: string, encryptedKey: string, iv: string, encryptedKeySender?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !text.trim()) return;

  const { data: inserted } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    text: text.trim(),
    encrypted_key: encryptedKey || null,
    encrypted_key_sender: encryptedKeySender || null,
    iv: iv || null,
  }).select('id, created_at, text, encrypted_key, encrypted_key_sender, iv, sender_id, receiver_id').single();

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  await createNotification(receiverId, 'message', user.id);
  sendPush(receiverId, 'FORGE', `New message from @${profile?.username || 'Someone'}`, `/messages/${user.id}`);

  if (inserted) {
    const payload = {
      id: inserted.id,
      text: inserted.text,
      encrypted_key: inserted.encrypted_key,
      encrypted_key_sender: inserted.encrypted_key_sender,
      iv: inserted.iv,
      sender_id: inserted.sender_id,
      receiver_id: inserted.receiver_id,
      created_at: inserted.created_at,
    };
    await Promise.all([
      publishToUser(receiverId, 'message:new', payload),
      publishToUser(user.id, 'message:echo', payload),
    ]);
  }

  revalidatePath('/messages');
}
```

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

---

## Задача 7: Publish в Ably при создании нотификации

**Files:**
- Modify: `src/features/notifications/actions.ts`

- [ ] **Шаг 1: Добавить publish в `createNotification`**

```ts
import { publishToUser } from '@/lib/ably/server';

// в createNotification, после INSERT, перед return:

await publishToUser(userId, 'notification:new', {
  type,
  actor_id: actorId,
  post_id: postId || null,
});
```

Полная функция станет:

```ts
export async function createNotification(userId: string, type: string, actorId: string, postId?: string) {
  const supabase = await createClient();
  if (userId === actorId) return;

  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    actor_id: actorId,
    post_id: postId || null,
    is_read: false,
  });

  await publishToUser(userId, 'notification:new', {
    type,
    actor_id: actorId,
    post_id: postId || null,
  });
}
```

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

- [ ] **Шаг 3: Коммит**

```bash
git add -A && git commit -m "feat(ably): publish message:new and notification:new events from server actions"
```

---

## Задача 8: Чат — убрать Supabase realtime и polling, подключить Ably

**Files:**
- Modify: `src/app/messages/[userId]/page.tsx`

- [ ] **Шаг 1: Заменить useEffect с подпиской**

Найти блок `const supabase = createClient();` и целый useEffect подписывающийся на channel. Заменить на:

```tsx
import { useAbly } from '@/lib/ably/client-provider';

// ... внутри компонента:
const { client } = useAbly();

useEffect(() => {
  const supabase = createClient();

  supabase.auth.getUser().then(({ data: { user } }) => {
    currentUserIdRef.current = user?.id || null;
  });

  supabase
    .from('profiles')
    .select('username, full_name, avatar_url, public_key')
    .eq('id', otherUserId)
    .single()
    .then(({ data }) => setOtherUser(data));

  loadMessages();
}, [otherUserId, loadMessages]);

// Ably subscription
useEffect(() => {
  if (!client) return;
  const userId = currentUserIdRef.current;
  if (!userId) {
    // wait for userId to be set then retry
    const t = setTimeout(() => { /* will retry via client dep change */ }, 100);
    return () => clearTimeout(t);
  }

  const channel = client.channels.get(`user:${userId}`);
  const supabase = createClient();

  const handler = (msg: any) => {
    const payload = msg.data;
    if (payload.sender_id !== otherUserId && payload.receiver_id !== otherUserId) return;

    setMessages((prev) => {
      if (prev.some((m) => m.id === payload.id)) return prev;
      return [
        ...prev,
        {
          id: payload.id,
          text: payload.text,
          encrypted_key: payload.encrypted_key,
          encrypted_key_sender: payload.encrypted_key_sender,
          iv: payload.iv,
          sender_id: payload.sender_id,
          is_mine: payload.sender_id === userId,
          time: new Date(payload.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
      ];
    });

    if (payload.receiver_id === userId) {
      supabase.from('messages').update({ is_read: true }).eq('id', payload.id).then(() => {});
    }
  };

  channel.subscribe('message:new', handler);
  channel.subscribe('message:echo', handler);

  return () => {
    channel.unsubscribe('message:new', handler);
    channel.unsubscribe('message:echo', handler);
  };
}, [client, otherUserId]);
```

Удалить блок с `supabase.channel(channelName)`, `const pollId = setInterval(...)`, соответствующие cleanup.

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

---

## Задача 9: Список диалогов — на Ably

**Files:**
- Modify: `src/app/messages/page.tsx`

- [ ] **Шаг 1: Заменить useRealtime + polling на useAblyEvent**

```tsx
import { useAblyEvent } from '@/lib/ably/client-provider';

// Удалить:
// - useRealtime('messages', 'INSERT', refreshConversations);
// - useEffect с setInterval(refreshConversations, 8000)

// Добавить:
useAblyEvent('message:new', () => {
  refreshConversations();
});
useAblyEvent('message:echo', () => {
  refreshConversations();
});
```

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

---

## Задача 10: BottomNav и FeedHeader — на Ably

**Files:**
- Modify: `src/features/navigation/BottomNav.tsx`
- Modify: `src/features/feed/FeedHeader.tsx`

- [ ] **Шаг 1: BottomNav — убрать useRealtime, добавить useAblyEvent**

```tsx
import { useAblyEvent } from '@/lib/ably/client-provider';

// Удалить оба useRealtime вызова
// Добавить:
useAblyEvent('message:new', refreshMessages);
useAblyEvent('message:echo', refreshMessages);
useAblyEvent('notification:new', refreshNotifications);
```

- [ ] **Шаг 2: FeedHeader — то же самое**

```tsx
import { useAblyEvent } from '@/lib/ably/client-provider';

// Удалить useRealtime('notifications', ...)
useAblyEvent('notification:new', refreshUnread);
```

- [ ] **Шаг 3: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

- [ ] **Шаг 4: Коммит**

```bash
git add -A && git commit -m "feat(ably): subscribe on client, remove Supabase postgres_changes and polling"
```

---

## Задача 11: Билд + QA + деплой

- [ ] **Шаг 1: Production-билд**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npm run build 2>&1 | tail -20
```

Ожидание: билд зелёный.

- [ ] **Шаг 2: Dev + визуальная проверка**

```bash
npm run dev
```

- Открыть два окна браузера, логин в два аккаунта
- Написать сообщение A → B. Должно прийти за ≤300ms
- Проверить badge сообщений в BottomNav у B — тикает быстро
- Проверить Bell badge у B — тикает при сообщении
- Открыть чат B → сообщение видно
- Проверить DevTools Network / Console: нет ошибок Ably, `Ably connected` в логах

- [ ] **Шаг 3: Deploy**

```bash
git push origin main && vercel --prod --yes
```

- [ ] **Шаг 4: Обновить Current state в `/Users/alexsamoilov/ObsidianVault/ClaudeMemory/projects/forge.md`**

Добавить пункт: «Realtime delivery мигрирована на Ably. Supabase postgres_changes и polling удалены. Latency сообщений 100-300ms.»
