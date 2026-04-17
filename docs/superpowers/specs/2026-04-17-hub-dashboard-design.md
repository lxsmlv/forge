# Hub Dashboard — личный дашборд с виджетами

**Дата:** 2026-04-17
**Статус:** Дизайн согласован

## Мотивация

Hub (бывший Cabinet) сейчас = список заметок + тренировок в двух табах. Выглядит как утилитарный TODO, не как продукт за который платят. Dashboard-first подход: первое что видит юзер = персональный overview с прогрессом, задачами на сегодня, статистикой и быстрым вводом. Это то за что готовы платить — «мой личный штаб».

## Скоуп

**Включено:**
- Hub Dashboard экран с виджетами-карточками (greeting, XP, today, stats, notes, workouts, badges)
- Табы внутри Hub: [Dashboard] [Notes] [Workouts] — dashboard дефолт
- Кастомизация виджетов: «×» скрыть + «+ Добавить виджет» внизу
- Unified notes: поля `due_date` + `is_task` на таблице notes
- Виджет «Сегодня»: интерактивные checkbox'ы прямо на dashboard
- Адаптивный layout: desktop 2 колонки, mobile 1 колонка scroll
- Server action `getHubData()` — один round-trip для всех виджетов
- Quick-add: NoteCreateModal с toggle «задача» + date picker

**Не входит (отдельные подпроекты):**
- Points/XP engine (подпроект #2 — Level, XP earning rules, badges awarding)
- Calendar/Planner (подпроект #4)
- Analytics/графики (подпроект #5)
- Goals с дедлайнами (подпроект #6)

**Заглушки для будущего:**
- GreetingWidget показывает «Lvl 1 · 0 XP» (hardcoded) пока Points engine не готов
- BadgesWidget показывает существующие achievements из текущей системы
- StatsWidget показывает реальные counts из БД

## Дизайн

### Виджеты

| ID | Виджет | Убирается? | Содержимое |
|---|---|---|---|
| `greeting` | Greeting + Streak + Level + XP bar | нет | Приветствие по имени, дата, streak badge, level + XP progress bar (заглушка пока) |
| `today` | Сегодня | да | Заметки где `is_task=true` AND (`due_date=today` OR `due_date IS NULL`). Checkbox toggle. Пустое: «Нет задач на сегодня 💪» |
| `stats` | Статистика | да | 3 карточки: тренировок всего / заметок всего / задач выполнено |
| `recent-notes` | Последние заметки | да | 2-3 свежих, «все →» переключает на таб Notes |
| `recent-workouts` | Последние тренировки | да | 2-3 свежих, «все →» переключает на таб Workouts |
| `badges` | Бейджи | да | Последние 4 achievement'а из существующей системы |
| `quick-add` | Quick-add кнопки | нет | «+ Заметка» / «+ Тренировка» — открывают существующие модалки |

### Layout

**Desktop (>640px):**
```
┌─────────────────────────────────────────┐
│ Привет, Алекс 👊    🔥12  Lvl 7 · XP   │  greeting (full-width)
│ ████████████████████░░░░  82%           │  XP bar
├───────────────────┬─────────────────────┤
│ 📋 СЕГОДНЯ        │ 💪28  📝45  🎯3     │  today + stats
│ □ Зал в 18:00     │                     │
│ □ Помыть машину   │ 🏆 ⚡ 🎯 💎          │  badges
│ ✓ Купить протеин  │                     │
├───────────────────┼─────────────────────┤
│ 📝 Заметки  все → │ 💪 Тренировки все → │  recent-notes + recent-workouts
│ ...               │ ...                 │
├───────────────────┴─────────────────────┤
│ [+ Заметка]  [+ Тренировка]             │  quick-add (full-width)
└─────────────────────────────────────────┘
```

**Mobile (<640px):** single column, тот же порядок сверху вниз. Stats в горизонтальный row из 3 карточек.

### Табы Hub

```
[Dashboard]  [Notes]  [Workouts]
```

- Dashboard = виджет-экран (описан выше)
- Notes = текущий полный список заметок (из Cabinet)
- Workouts = текущий полный список тренировок (из Cabinet)
- Переключение вкладок через state, не URL (всё на `/cabinet`)
- «все →» на виджетах → setActiveTab('notes') / setActiveTab('workouts')

### Кастомизация виджетов

- Каждый виджет (кроме `greeting` и `quick-add`) имеет иконку `×` в правом верхнем углу
- Клик `×` → виджет скрывается, ID добавляется в `forge-hub-hidden` localStorage
- Внизу dashboard (перед quick-add) — кнопка `+ Добавить виджет`
- Клик → bottom-sheet со списком скрытых виджетов, checkbox'ами
- Дефолт: все видны

### Unified Notes (миграция)

Текущая таблица `notes`:
- Добавить `due_date date` (nullable)
- Добавить `is_task boolean DEFAULT false`

Заметка с `is_task=true`:
- Показывает checkbox
- Попадает в виджет «Сегодня» если `due_date = today` OR `due_date IS NULL`
- `is_done=true` → checkbox отмечен, текст зачёркнут

Заметка с `is_task=false`:
- Обычная заметка, без checkbox, не в «Сегодня»

### NoteCreateModal обновление

Добавить:
- Toggle switch «Задача» (ставит `is_task=true`)
- Когда toggle ON → появляется date picker (опционально, можно оставить пустым = «всегда»)
- Date picker: простой native `<input type="date">` (не кастомный календарь в этой итерации)

### Server actions

**`getHubData(): Promise<HubData>`** — один запрос, агрегирует:
```ts
interface HubData {
  profile: { full_name: string; current_streak: number };
  todayTasks: Array<{ id: string; title: string; is_done: boolean; due_date: string | null }>;
  stats: { workouts_count: number; notes_count: number; tasks_done_count: number };
  recentNotes: Array<{ id: string; title: string; text: string; created_at: string; is_done: boolean }>;
  recentWorkouts: Array<{ id: string; type: string; duration_min: number; created_at: string }>;
  achievements: Array<{ type: string }>;
}
```

**`toggleTaskDone(noteId: string)`** — toggle `is_done` на заметке, оптимистичный update на клиенте.

### Затрагиваемые файлы

**Create:**
- `src/features/hub/HubDashboard.tsx` — виджет-экран
- `src/features/hub/widgets/GreetingWidget.tsx`
- `src/features/hub/widgets/TodayWidget.tsx`
- `src/features/hub/widgets/StatsWidget.tsx`
- `src/features/hub/widgets/RecentNotesWidget.tsx`
- `src/features/hub/widgets/RecentWorkoutsWidget.tsx`
- `src/features/hub/widgets/BadgesWidget.tsx`
- `src/features/hub/WidgetManager.tsx`
- `src/features/hub/actions.ts` — `getHubData`, `toggleTaskDone`
- `supabase/migrations/003_notes_task_fields.sql`

**Modify:**
- `src/app/cabinet/page.tsx` — табы [Dashboard][Notes][Workouts]
- `src/features/cabinet/Cabinet.tsx` — рефактор: Notes и Workouts как sub-views, добавить activeTab prop
- `src/features/cabinet/NoteCreateModal.tsx` — toggle is_task + date picker
- `src/features/cabinet/actions.ts` — обновить createNote сигнатуру

### Граничные случаи

- **Нет заметок / тренировок** — виджеты показывают «Пусто» + кнопка quick-add внутри
- **Все виджеты скрыты** — показывается greeting + quick-add + «+ Добавить виджет»
- **100+ задач на сегодня** — виджет «Сегодня» показывает первые 5 + «ещё N →»
- **Оффлайн** — данные кешируются при последнем запросе, отображаются stale с badge «offline»

### Что НЕ делаем

- Drag-and-drop реордер виджетов (кастомизация только show/hide)
- Кастомный calendar picker (нативный `<input type="date">`)
- Points/XP earning rules (заглушка Level 1 / 0 XP)
- Графики/аналитика (отдельный подпроект)
- Reminders/push по задачам (отдельный подпроект)

## Критерии успеха

- Hub открывается по дефолту после логина → юзер видит dashboard с виджетами
- Виджет «Сегодня» показывает задачи на день, checkbox toggle работает inline
- Quick-add → создаёт заметку-задачу, она появляется в «Сегодня»
- «все →» переключает на полный список
- × на виджете скрывает его, «+ Добавить виджет» возвращает
- Desktop: 2 колонки. Mobile: 1 колонка scroll.
- Один server round-trip `getHubData()` для всех данных dashboard
