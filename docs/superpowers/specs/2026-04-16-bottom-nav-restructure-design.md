# Реструктуризация bottom navigation + Cabinet как страница + Plus-меню

**Дата:** 2026-04-16
**Статус:** Дизайн согласован

## Мотивация

Текущий bottom nav: `[Feed] [Messages] [+ Create] [Reels] [Profile]`.

Проблемы:
1. Нет очевидного способа добраться до Cabinet (спрятан как вкладка внутри `/feed`).
2. Reels на главном пути противоречит решению по MVP scope (Reels — кандидат на «спрятать»).
3. Plus-кнопка сейчас = прямой переход на `/create` (только пост). У юзера нет возможности быстро создать заметку или тренировку.
4. Нет ментальной модели «публичное слева / приватное справа», хотя продукт разделён на два слоя.

Решение: переделать nav в `[Feed] [Messages] [+] [Cabinet] [Profile]`, `+` разворачивает bottom sheet с выбором (Post / Note / Workout), Cabinet становится отдельной страницей, Reels убирается из nav.

## Скоуп

**Включено:**
- Реструктуризация `BottomNav` (5 иконок: Feed, Messages, Plus, Cabinet, Profile)
- Новый компонент `PlusSheet` — bottom sheet с тремя кнопками создания
- Cabinet выносится из вкладки `/feed` в отдельный роут `/cabinet`
- Поддержка query-params `/cabinet?new=note|workout` — автооткрытие модалок создания
- Извлечение форм создания Note/Workout в модалки (bottom sheet стиль)

**Не входит:**
- Реализация «умного» plus-меню (с персонализацией)
- Изменения в самом `/reels` (роут остаётся как есть, просто без nav-иконки)
- Создание Story/Reel из plus-меню (решение по MVP — Story/Reel вне главного пути)
- Переписывание существующего `/create` (страница остаётся без изменений)
- Изменения в функционале Cabinet (CRUD-логика не трогается, только извлечение форм в модалки)

## Дизайн

### 1. Bottom nav — новая структура

```
┌──────────────────────────────────────┐
│    [🏠]  [💬]  [ + ]  [📓]  [👤]   │
│    Feed  Msgs  plus  Cabinet Profile │
└──────────────────────────────────────┘
```

- **Публичное слева:** Feed (`/feed`), Messages (`/messages`)
- **Центр:** Plus — градиентная круглая кнопка (как сейчас), при тапе открывает `PlusSheet` (не navigate)
- **Приватное справа:** Cabinet (`/cabinet`), Profile (`/profile`)
- Badge unread сохраняется на Messages и Profile как сейчас
- Active state подсвечивает текущий pathname
- Reels из nav убирается (роут `/reels` живой, просто без иконки в nav)

### 2. PlusSheet — bottom sheet с выбором создания

Содержимое:

```
┌────────────────────────────────┐
│        ──── (drag handle)       │
│                                 │
│   PUBLIC                        │
│   ┌──────────────────────────┐  │
│   │ 📸  New post              │  │
│   │     Share a photo          │  │
│   └──────────────────────────┘  │
│                                 │
│   PRIVATE                       │
│   ┌──────────────────────────┐  │
│   │ 📝  Note                  │  │
│   │     Quick thought          │  │
│   └──────────────────────────┘  │
│   ┌──────────────────────────┐  │
│   │ 💪  Workout               │  │
│   │     Log a session          │  │
│   └──────────────────────────┘  │
└────────────────────────────────┘
```

**Поведение:**
- Тап на `+` в nav → sheet открывается (slide up + fade backdrop)
- Backdrop `bg-black/60` + `backdrop-blur-sm`, закрытие по тапу
- Свайп вниз на drag handle → закрытие (можно отложить как v2, но лучше сразу)
- Нажатие на iOS/Android back → закрытие
- **New post** → sheet закрывается, `router.push('/create')`
- **Note** → sheet закрывается, `router.push('/cabinet?new=note')`
- **Workout** → sheet закрывается, `router.push('/cabinet?new=workout')`

**Стиль:**
- Обёртка: `forge-glass` + `rounded-t-[var(--forge-radius-xl)]`, закреплена снизу
- Кнопки действий: `forge-card forge-card-interactive`
- Заголовки разделов (PUBLIC/PRIVATE): `text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)]`
- Иконки: `text-[var(--forge-purple-bright)]` на подложке `bg-[var(--forge-purple-glow)]` round 10, размер 10×10
- Подтитры: `text-xs text-[var(--forge-text-tertiary)]`

### 3. Cabinet как отдельная страница

Текущее состояние: Cabinet рендерится как вкладка внутри `/feed` (state `activeTab: 'feed' | 'cabinet'`), переключатель Home/PenSquare в верхней части `/feed`.

Новое состояние:

- Новый файл `src/app/cabinet/page.tsx` — клиентский роут, рендерит `<Cabinet />` из `src/features/cabinet/Cabinet.tsx`
- `/feed/page.tsx` очищается от cabinet-таба: убирается `activeTab` state, переключатель Home/PenSquare, условная ветка `{activeTab === 'cabinet' ? <Cabinet /> : ...}`
- `/cabinet` имеет свой `forge-header` с заголовком «Cabinet», без back-кнопки (top-level роут)

**Query-params:**
- `/cabinet?new=note` — автоматически открывает модалку создания заметки
- `/cabinet?new=workout` — автоматически открывает модалку создания тренировки
- После закрытия модалки query-param удаляется (`router.replace('/cabinet')`) чтобы back не вернул обратно в модалку

**Компонент `Cabinet`:**
- Принимает проп `initialModal?: 'note' | 'workout'`, выставляется на основе query-param в роуте
- Формы создания Note/Workout извлекаются в отдельные компоненты-модалки:
  - `src/features/cabinet/NoteCreateModal.tsx`
  - `src/features/cabinet/WorkoutCreateModal.tsx`
- Модалки — bottom sheet в том же стиле что PlusSheet (консистентно)
- CRUD-логика внутри `Cabinet.tsx` (loadNotes, createNote, loadWorkouts, createWorkout) не меняется — только UI-вынесение форм

### 4. Что происходит с `/reels`

- Роут `/reels` остаётся живым (не удаляем код)
- Иконка Play и объект в `NAV_ITEMS` убираются из `BottomNav.tsx`
- Доступ только по прямой ссылке `forgeclub.app/reels`
- Данные (video posts) не трогаем
- Позже (отдельная сессия) решим — вернуть Reels в какой форме или удалять полностью

### Затрагиваемые файлы

**Create:**
- `src/features/navigation/PlusSheet.tsx` — новый компонент bottom sheet с тремя кнопками
- `src/app/cabinet/page.tsx` — новая страница-обёртка для Cabinet
- `src/features/cabinet/NoteCreateModal.tsx` — модалка создания заметки (извлечение из Cabinet.tsx)
- `src/features/cabinet/WorkoutCreateModal.tsx` — модалка создания тренировки (извлечение из Cabinet.tsx)

**Modify:**
- `src/features/navigation/BottomNav.tsx` — новая структура NAV_ITEMS (убрать Reels, добавить Cabinet), Plus-кнопка управляет state sheet'а вместо navigate
- `src/app/feed/page.tsx` — удалить activeTab cabinet, переключатель Home/PenSquare, условный рендер Cabinet
- `src/features/cabinet/Cabinet.tsx` — принять проп `initialModal`, вынести формы создания в новые модалки, open/close управляется через state + query-param

### Граничные случаи

- **Юзер на `/feed` → Plus → Note → `/cabinet?new=note`** — query-param ловится, модалка открывается на маунте.
- **Юзер на `/cabinet` → нажал back после закрытия модалки** — поскольку `router.replace` (не push), back не возвращает в модалку, а возвращает на предыдущий роут из истории.
- **Юзер открыл глубокую ссылку `/cabinet?new=workout` из вне** — модалка открывается сразу, под ней видно Cabinet. Закрытие модалки → `/cabinet`.
- **Plus-sheet открыт + юзер нажал back** — sheet закрывается вместо навигации назад. Пока реализуем через внутренний state (навигация не трогается); back будет закрывать sheet только если мы слушаем history event. Базовая версия: back выполняется как обычно (уходим с текущего роута). Улучшение — отложить на v2.
- **Messages или Profile badge с числом > 99** — отображается `9+` (уже реализовано).

### Что явно НЕ делаем

- Не создаём Story/Reel кнопки в plus-меню
- Не переписываем `/create` (остаётся как есть)
- Не вносим анимации iOS-native transitions между вкладками nav (native Next.js Link)
- Не делаем плюс-меню контекстным (на `/cabinet` не прячем приватные опции, всё видно всегда — меню всегда одинаковое для consistency)
- Не добавляем свайп-закрытие по drag handle в v1 (тап на backdrop + кнопка закрытия достаточны; свайп в v2 если попросим)

## Риски

- **Пользователь ищет Reels в nav** — не находит. Митигация: на текущий момент 3 юзера, никто не ищет.
- **`/feed` и `/cabinet` переход ощущается как «страница грузится»** — раньше был instant state-switch. Next.js prefetch и Link уже работают, на практике задержки 50-100ms. Приемлемо.
- **Модалки создания в Cabinet — новый UX для юзера** — раньше создавал inline в `/feed`. Эффект: юзер видит сначала Cabinet-страницу, потом сверху модалку. Это нормальный паттерн (Instagram, Twitter).
- **Query-params `?new=note` — пользователь обновил страницу** — модалка откроется заново. Допустимо (не хуже текущего). Если напрягает — можно переключать на local state сразу после открытия модалки.

## Критерии успеха

- Bottom nav: `[Feed] [Messages] [+] [Cabinet] [Profile]` — пять иконок, Reels отсутствует
- Тап `+` открывает bottom sheet с тремя кнопками (Post / Note / Workout), корректно группированными
- Клик «Post» → переход на `/create`
- Клик «Note» → переход на `/cabinet`, модалка создания заметки открыта
- Клик «Workout» → переход на `/cabinet`, модалка создания тренировки открыта
- `/cabinet` доступен напрямую, отображает заметки + тренировки
- `/feed` не содержит вкладку Cabinet
- `/reels` доступен по прямой ссылке
- Билд проходит, на всех маршрутах нет рантайм-ошибок
