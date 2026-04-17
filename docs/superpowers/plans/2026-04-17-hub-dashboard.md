# Hub Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Цель:** Превратить Hub (бывший Cabinet) из списка заметок/тренировок в персональный виджет-dashboard с greeting, streak, XP, задачами на сегодня, статистикой, кастомизацией виджетов.

**Архитектура:** Новая папка `src/features/hub/` с виджет-компонентами. Один server action `getHubData()` агрегирует все данные dashboard за один round-trip. Страница `/cabinet` получает 3 таба: Dashboard (дефолт) / Notes / Workouts. Миграция БД добавляет `due_date` + `is_task` к notes.

**Стек:** Next.js 15, React, TypeScript, Tailwind, Supabase, forge-* design system.

---

## File Structure

**Create:**
- `supabase/migrations/003_notes_task_fields.sql` — миграция: due_date + is_task
- `src/features/hub/actions.ts` — `getHubData()`, `toggleTaskDone()`
- `src/features/hub/HubDashboard.tsx` — контейнер виджетов + кастомизация
- `src/features/hub/widgets/GreetingWidget.tsx`
- `src/features/hub/widgets/TodayWidget.tsx`
- `src/features/hub/widgets/StatsWidget.tsx`
- `src/features/hub/widgets/RecentNotesWidget.tsx`
- `src/features/hub/widgets/RecentWorkoutsWidget.tsx`
- `src/features/hub/widgets/BadgesWidget.tsx`
- `src/features/hub/widgets/QuickAddWidget.tsx`
- `src/features/hub/WidgetManager.tsx` — bottom-sheet «+ Добавить виджет»

**Modify:**
- `src/app/cabinet/page.tsx` — табы [Dashboard][Notes][Workouts]
- `src/features/cabinet/Cabinet.tsx` — принимает activeTab prop, рефактор
- `src/features/cabinet/NoteCreateModal.tsx` — toggle is_task + date input
- `src/features/cabinet/actions.ts` — updateCreateNote signature

---

## Задача 1: Миграция БД — добавить due_date и is_task к notes

**Файлы:**
- Create: `supabase/migrations/003_notes_task_fields.sql`

- [ ] **Шаг 1: Записать файл миграции**

```sql
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_task boolean DEFAULT false;
```

- [ ] **Шаг 2: Применить миграцию**

```bash
PGPASSWORD='watsow-xyRfin-6meqby' psql -h aws-1-eu-central-1.pooler.supabase.com -p 5432 -U postgres.hvppajvjacfqcnxxeqeu -d postgres -f supabase/migrations/003_notes_task_fields.sql
```

Ожидание: `ALTER TABLE` ×2 без ошибок.

- [ ] **Шаг 3: Проверить**

```bash
PGPASSWORD='watsow-xyRfin-6meqby' psql -h aws-1-eu-central-1.pooler.supabase.com -p 5432 -U postgres.hvppajvjacfqcnxxeqeu -d postgres -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='notes' AND column_name IN ('due_date','is_task');"
```

Ожидание: 2 строки.

- [ ] **Шаг 4: Коммит**

```bash
git add supabase/migrations/003_notes_task_fields.sql && git commit -m "migration: add due_date and is_task fields to notes table"
```

---

## Задача 2: Server actions — getHubData + toggleTaskDone

**Файлы:**
- Create: `src/features/hub/actions.ts`
- Modify: `src/features/cabinet/actions.ts`

- [ ] **Шаг 1: Создать `src/features/hub/actions.ts`**

```ts
'use server';

import { createClient } from '@/lib/supabase/server';

export interface HubData {
  profile: { full_name: string; current_streak: number };
  todayTasks: Array<{ id: string; title: string; is_done: boolean; due_date: string | null }>;
  stats: { workouts_count: number; notes_count: number; tasks_done_count: number };
  recentNotes: Array<{ id: string; title: string; text: string; created_at: string; is_done: boolean; category: string }>;
  recentWorkouts: Array<{ id: string; type: string; duration_min: number; created_at: string; notes: string }>;
  achievements: Array<{ type: string }>;
}

export async function getHubData(): Promise<HubData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const [profileRes, todayRes, notesCountRes, workoutsCountRes, tasksDoneRes, recentNotesRes, recentWorkoutsRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('full_name, current_streak').eq('id', user.id).single(),
    supabase.from('notes').select('id, title, is_done, due_date').eq('user_id', user.id).eq('is_task', true).or(`due_date.eq.${today},due_date.is.null`).order('is_done', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_task', true).eq('is_done', true),
    supabase.from('notes').select('id, title, text, created_at, is_done, category').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('workouts').select('id, type, duration_min, created_at, notes').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('user_achievements').select('type').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
  ]);

  return {
    profile: { full_name: profileRes.data?.full_name || '', current_streak: profileRes.data?.current_streak || 0 },
    todayTasks: todayRes.data || [],
    stats: { workouts_count: workoutsCountRes.count || 0, notes_count: notesCountRes.count || 0, tasks_done_count: tasksDoneRes.count || 0 },
    recentNotes: recentNotesRes.data || [],
    recentWorkouts: recentWorkoutsRes.data || [],
    achievements: achievementsRes.data || [],
  };
}

export async function toggleTaskDone(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: note } = await supabase.from('notes').select('is_done').eq('id', noteId).eq('user_id', user.id).single();
  if (!note) return;

  await supabase.from('notes').update({ is_done: !note.is_done }).eq('id', noteId).eq('user_id', user.id);
}
```

- [ ] **Шаг 2: Обновить `createNote` в `src/features/cabinet/actions.ts`**

Изменить сигнатуру:

```ts
export async function createNote(title: string, text: string, category: string, isTask: boolean = false, dueDate: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('notes').insert({
    user_id: user.id,
    title,
    text,
    category,
    is_task: isTask,
    due_date: dueDate || null,
  });

  revalidatePath('/cabinet');
}
```

- [ ] **Шаг 3: TS-чек + коммит**

```bash
npx tsc --noEmit && git add src/features/hub/actions.ts src/features/cabinet/actions.ts && git commit -m "feat(hub): getHubData + toggleTaskDone server actions, createNote accepts is_task + due_date"
```

---

## Задача 3: Виджет-компоненты

**Файлы:**
- Create: все 7 виджетов в `src/features/hub/widgets/`

- [ ] **Шаг 1: GreetingWidget.tsx**

```tsx
'use client';

import { Flame } from 'lucide-react';

interface Props {
  fullName: string;
  streak: number;
}

export function GreetingWidget({ fullName, streak }: Props) {
  const firstName = fullName.split(' ')[0] || fullName;
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="col-span-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--forge-text-primary)]">
            {firstName} 👊
          </h2>
          <p className="text-[11px] text-[var(--forge-text-tertiary)] capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/8 border border-orange-500/15">
              <Flame className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
              <span className="text-xs font-semibold text-orange-400 tabular-nums">{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)]">
            <span className="text-xs font-bold text-[var(--forge-purple-bright)]">Lvl 1</span>
            <span className="text-[10px] text-[var(--forge-text-tertiary)]">· 0 XP</span>
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--forge-surface)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '0%', background: 'var(--forge-gradient-action)' }} />
      </div>
    </div>
  );
}
```

- [ ] **Шаг 2: TodayWidget.tsx**

```tsx
'use client';

import { useTransition } from 'react';
import { toggleTaskDone } from '@/features/hub/actions';

interface Task {
  id: string;
  title: string;
  is_done: boolean;
}

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onHide: () => void;
}

export function TodayWidget({ tasks, onToggle, onHide }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string) => {
    onToggle(id);
    startTransition(() => { toggleTaskDone(id); });
  };

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] text-xs">✕</button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-3">📋 Сегодня</div>
      {tasks.length === 0 ? (
        <p className="text-[13px] text-[var(--forge-text-tertiary)]">Нет задач на сегодня 💪</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.slice(0, 5).map((task) => (
            <button
              key={task.id}
              onClick={() => handleToggle(task.id)}
              disabled={isPending}
              className="flex items-center gap-2.5 text-left forge-press"
            >
              <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center transition-colors ${
                task.is_done
                  ? 'bg-[var(--forge-purple)] text-white'
                  : 'border-2 border-[var(--forge-text-muted)]'
              }`}>
                {task.is_done && <span className="text-[9px]">✓</span>}
              </div>
              <span className={`text-[13px] ${task.is_done ? 'line-through text-[var(--forge-text-muted)]' : 'text-[var(--forge-text-primary)]'}`}>
                {task.title}
              </span>
            </button>
          ))}
          {tasks.length > 5 && (
            <span className="text-[11px] text-[var(--forge-purple-bright)]">ещё {tasks.length - 5} →</span>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Шаг 3: StatsWidget, RecentNotesWidget, RecentWorkoutsWidget, BadgesWidget, QuickAddWidget**

Создать каждый в `src/features/hub/widgets/`. Все принимают props из HubData + `onHide` callback. Используют forge-card, forge-badge, forge-text-* токены. StatsWidget = 3 числа в row. RecentNotesWidget/RecentWorkoutsWidget = список 2-3 items + «все →» кнопка с `onViewAll` callback. BadgesWidget = горизонтальный ряд emoji из ACHIEVEMENTS map. QuickAddWidget = 2 кнопки forge-btn-primary + forge-btn-secondary.

Код всех 5 виджетов по тому же паттерну что GreetingWidget/TodayWidget — forge-card + props + onHide.

- [ ] **Шаг 4: TS-чек + коммит**

```bash
npx tsc --noEmit && git add src/features/hub/widgets/ && git commit -m "feat(hub): all 7 widget components"
```

---

## Задача 4: WidgetManager — bottom-sheet для «+ Добавить виджет»

**Файлы:**
- Create: `src/features/hub/WidgetManager.tsx`

- [ ] **Шаг 1: Создать WidgetManager**

Компонент-bottom-sheet (как PlusSheet). Принимает `hiddenWidgets: string[]` и `onRestore: (id: string) => void`. Показывает список скрытых виджетов с checkbox'ами. Клик → restore.

Использовать `forge-glass`, `rounded-t-[var(--forge-radius-xl)]`, backdrop `bg-black/60`, закрытие по backdrop/swipe.

- [ ] **Шаг 2: TS-чек + коммит**

```bash
npx tsc --noEmit && git add src/features/hub/WidgetManager.tsx && git commit -m "feat(hub): WidgetManager bottom-sheet for restoring hidden widgets"
```

---

## Задача 5: HubDashboard — контейнер виджетов

**Файлы:**
- Create: `src/features/hub/HubDashboard.tsx`

- [ ] **Шаг 1: Создать HubDashboard**

Компонент загружает `getHubData()` на mount. Управляет:
- `hiddenWidgets` из localStorage key `forge-hub-hidden`
- `showWidgetManager` state для bottom-sheet
- Отображает виджеты в grid: `grid-cols-1 sm:grid-cols-2`, greeting и quick-add = `col-span-full`
- Виджеты отображаются если их ID не в hiddenWidgets
- Внизу (перед quick-add): если есть скрытые → кнопка «+ Добавить виджет»
- `onHide(id)`: добавляет в localStorage + state
- `onRestore(id)`: убирает из localStorage + state
- `onViewAll(tab)`: вызывает prop `onSwitchTab('notes' | 'workouts')`

Props: `onSwitchTab: (tab: 'notes' | 'workouts') => void`

- [ ] **Шаг 2: TS-чек + коммит**

```bash
npx tsc --noEmit && git add src/features/hub/HubDashboard.tsx && git commit -m "feat(hub): HubDashboard container with widget grid and customization"
```

---

## Задача 6: Обновить NoteCreateModal — toggle is_task + date

**Файлы:**
- Modify: `src/features/cabinet/NoteCreateModal.tsx`

- [ ] **Шаг 1: Добавить в форму toggle + date input**

В state формы добавить `isTask: false` и `dueDate: ''`. Под полем category добавить:
- Toggle switch «Задача» (стилизованный checkbox с forge-badge-purple)
- Если toggle ON → показать `<input type="date">` с forge-input стилем

В `handleSave` передать `isTask` и `dueDate` в `createNote(title, text, category, isTask, dueDate || null)`.

- [ ] **Шаг 2: TS-чек + коммит**

```bash
npx tsc --noEmit && git add src/features/cabinet/NoteCreateModal.tsx && git commit -m "feat(hub): NoteCreateModal with is_task toggle and due_date picker"
```

---

## Задача 7: Переделать /cabinet страницу — табы Dashboard/Notes/Workouts

**Файлы:**
- Modify: `src/app/cabinet/page.tsx`
- Modify: `src/features/cabinet/Cabinet.tsx`

- [ ] **Шаг 1: Обновить cabinet/page.tsx**

Добавить state `activeTab: 'dashboard' | 'notes' | 'workouts'` (дефолт 'dashboard'). Рендерить:
- Табы: 3 кнопки [Dashboard][Notes][Workouts] в forge-tab стиле
- Если dashboard → `<HubDashboard onSwitchTab={setActiveTab} />`
- Если notes → `<Cabinet initialModal={...} onModalClosed={...} />` в режиме notes
- Если workouts → `<Cabinet ...>` в режиме workouts

Query-params `?new=note|workout` → если есть, переключить на notes/workouts + открыть модалку.

- [ ] **Шаг 2: Обновить Cabinet.tsx**

Принять prop `forcedSection?: 'notes' | 'workouts'` — если задан, убрать внутренний переключатель и показать только указанную секцию.

- [ ] **Шаг 3: TS-чек + коммит**

```bash
npx tsc --noEmit && git add src/app/cabinet/page.tsx src/features/cabinet/Cabinet.tsx && git commit -m "feat(hub): 3 tabs Dashboard/Notes/Workouts on /cabinet"
```

---

## Задача 8: Билд + QA + деплой

- [ ] **Шаг 1: Production билд**

```bash
npm run build
```

Ожидание: успех.

- [ ] **Шаг 2: Dev + визуальная проверка**

```bash
npm run dev
```

Проверить:
1. `/cabinet` → Dashboard-таб по дефолту → виджеты: greeting + streak + today + stats + notes + workouts + badges + quick-add
2. Desktop (>640px): 2 колонки. Mobile (<640px): 1 колонка scroll.
3. Виджет «Сегодня» — checkbox toggle работает inline
4. «×» на виджете → скрывается. «+ Добавить виджет» → bottom-sheet со скрытыми → restore.
5. «все →» на notes-виджете → таб Notes. То же для workouts.
6. Quick-add «+ Заметка» → модалка с toggle «Задача» + date picker.
7. Создать заметку-задачу с due_date=today → появляется в «Сегодня».
8. Логин → редирект на `/cabinet` → Dashboard виден.

- [ ] **Шаг 3: Деплой**

```bash
git push origin main && vercel --prod --yes
```

- [ ] **Шаг 4: Обновить Current state в forge.md**

Добавить: «Hub Dashboard задеплоен — виджеты, unified notes, tabs, кастомизация».
