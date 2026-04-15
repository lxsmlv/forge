# План: реструктуризация bottom navigation + Cabinet как страница + Plus-меню

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Цель:** Переделать bottom nav в `[Feed] [Messages] [+] [Cabinet] [Profile]`, Plus открывает bottom-sheet с тремя кнопками (Post/Note/Workout), Cabinet становится отдельной страницей, Reels убирается из nav.

**Архитектура:** `PlusSheet` — новый компонент bottom-sheet, управляется локальным state в `BottomNav`. Cabinet выносится в отдельный роут `/cabinet`, внутри которого существующий компонент `Cabinet` принимает проп `initialModal?: 'note' | 'workout'` на основе query-param. Формы создания Note и Workout извлекаются в `NoteCreateModal` и `WorkoutCreateModal` — bottom-sheet'ы в том же стиле.

**Стек:** Next.js 15 App Router, React, TypeScript, Tailwind, Supabase (server actions).

**Тестов нет в проекте** — верификация через `npx tsc --noEmit`, `npm run build`, визуальная QA на деве.

---

## File Structure

- **Create:**
  - `src/features/navigation/PlusSheet.tsx` — bottom sheet с тремя кнопками создания
  - `src/app/cabinet/page.tsx` — страница-обёртка для `<Cabinet />`
  - `src/features/cabinet/NoteCreateModal.tsx` — модалка создания заметки
  - `src/features/cabinet/WorkoutCreateModal.tsx` — модалка создания тренировки
- **Modify:**
  - `src/features/navigation/BottomNav.tsx` — новая структура NAV_ITEMS, Plus управляет sheet'ом
  - `src/app/feed/page.tsx` — убрать cabinet-вкладку и переключатель
  - `src/features/cabinet/Cabinet.tsx` — принять `initialModal`, вынести inline-формы в модалки, оставить CRUD-логику

---

## Задача 1: Создать `PlusSheet`

**Файлы:**
- Create: `src/features/navigation/PlusSheet.tsx`

- [ ] **Шаг 1: Записать файл компонента**

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, StickyNote, Dumbbell } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PlusSheet({ open, onClose }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-1 rounded-full bg-[var(--forge-text-muted)] mx-auto" />
          <button
            onClick={onClose}
            className="forge-press absolute right-5 top-5 text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)] px-1">Public</span>
          <button
            onClick={() => go('/create')}
            className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3 text-left"
          >
            <div className="h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-[var(--forge-purple-bright)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--forge-text-primary)]">New post</p>
              <p className="text-xs text-[var(--forge-text-tertiary)]">Share a photo</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)] px-1">Private</span>
          <button
            onClick={() => go('/cabinet?new=note')}
            className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3 text-left"
          >
            <div className="h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
              <StickyNote className="w-5 h-5 text-[var(--forge-purple-bright)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--forge-text-primary)]">Note</p>
              <p className="text-xs text-[var(--forge-text-tertiary)]">Quick thought</p>
            </div>
          </button>
          <button
            onClick={() => go('/cabinet?new=workout')}
            className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3 text-left"
          >
            <div className="h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-[var(--forge-purple-bright)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--forge-text-primary)]">Workout</p>
              <p className="text-xs text-[var(--forge-text-tertiary)]">Log a session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Шаг 2: TS-чек**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

- [ ] **Шаг 3: Коммит**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && git add src/features/navigation/PlusSheet.tsx && git commit -m "feat(nav): add PlusSheet component with Post/Note/Workout options"
```

---

## Задача 2: Обновить `BottomNav` — новые иконки, Plus управляет sheet'ом

**Файлы:**
- Modify: `src/features/navigation/BottomNav.tsx`

- [ ] **Шаг 1: Полностью заменить содержимое файла**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageCircle, Plus, BookOpen, User } from 'lucide-react';
import { useT } from '@/lib/useT';
import { useRealtime } from '@/lib/useRealtime';
import { getUnreadCount } from '@/features/notifications/actions';
import { PlusSheet } from './PlusSheet';

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [plusOpen, setPlusOpen] = useState(false);

  const refreshCounts = useCallback(async () => {
    const count = await getUnreadCount();
    setUnreadNotifications(count);
  }, []);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  useRealtime('notifications', 'INSERT', refreshCounts);
  useRealtime('messages', 'INSERT', useCallback(() => {
    setUnreadMessages((prev) => prev + 1);
  }, []));

  useEffect(() => {
    if (pathname.startsWith('/messages')) setUnreadMessages(0);
  }, [pathname]);

  const NAV_ITEMS = [
    { href: '/feed', icon: Home, label: t('nav.feed'), badge: 0 },
    { href: '/messages', icon: MessageCircle, label: t('messages.title'), badge: unreadMessages },
    { href: '/cabinet', icon: BookOpen, label: t('feed.tab_cabinet'), badge: 0 },
    { href: '/profile', icon: User, label: t('nav.profile'), badge: unreadNotifications },
  ];

  return (
    <>
      <nav className="forge-bottom-nav fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around px-4 py-1.5">
          {/* Left: Feed + Messages */}
          {NAV_ITEMS.slice(0, 2).map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                  active ? 'forge-nav-item-active' : 'forge-nav-item'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
                {badge > 0 && (
                  <span className="absolute -top-0.5 right-1 h-[18px] min-w-[18px] px-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Center: Plus */}
          <button
            type="button"
            onClick={() => setPlusOpen(true)}
            className="forge-nav-create h-11 w-11 rounded-full flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>

          {/* Right: Cabinet + Profile */}
          {NAV_ITEMS.slice(2).map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                  active ? 'forge-nav-item-active' : 'forge-nav-item'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
                {badge > 0 && (
                  <span className="absolute -top-0.5 right-1 h-[18px] min-w-[18px] px-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <PlusSheet open={plusOpen} onClose={() => setPlusOpen(false)} />
    </>
  );
}
```

- [ ] **Шаг 2: TS-чек**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

- [ ] **Шаг 3: Коммит**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && git add src/features/navigation/BottomNav.tsx && git commit -m "feat(nav): restructure to Feed/Messages/+/Cabinet/Profile, remove Reels"
```

---

## Задача 3: Создать `/cabinet` страницу

**Файлы:**
- Create: `src/app/cabinet/page.tsx`

- [ ] **Шаг 1: Создать файл**

```tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Cabinet } from '@/features/cabinet/Cabinet';
import { useT } from '@/lib/useT';

function CabinetPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useT();
  const newParam = searchParams.get('new');
  const initialModal = newParam === 'note' || newParam === 'workout' ? newParam : undefined;

  const handleModalClosed = () => {
    if (initialModal) {
      router.replace('/cabinet');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5">
          <span className="text-sm font-semibold text-[var(--forge-text-primary)]">{t('feed.tab_cabinet')}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <Cabinet initialModal={initialModal} onModalClosed={handleModalClosed} />
      </main>
    </div>
  );
}

export default function CabinetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--forge-black)]" />}>
      <CabinetPageInner />
    </Suspense>
  );
}
```

- [ ] **Шаг 2: TS-чек (ожидается ошибка — Cabinet ещё не принимает props)**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npx tsc --noEmit 2>&1 | tail -10
```

Ожидание: ошибка на `<Cabinet initialModal={...} onModalClosed={...} />` — пропы ещё не объявлены. Это нормально, Задача 5 их добавит.

- [ ] **Шаг 3: НЕ коммитим** — ждём Задачи 5 чтобы коммитить вместе с Cabinet-обновлениями.

---

## Задача 4: Убрать вкладку Cabinet из `/feed`

**Файлы:**
- Modify: `src/app/feed/page.tsx`

- [ ] **Шаг 1: Удалить import Cabinet и `PenSquare`, `Home` (home остаётся если используется где-то ещё — проверить)**

В `src/app/feed/page.tsx`:

- Убрать: `import { Cabinet } from '@/features/cabinet/Cabinet';`
- Из импорта `lucide-react` убрать `Home, PenSquare,` (оставить `Users, RefreshCw, Dumbbell, Car, Flame, Trophy, Bookmark` + уже недавно убрал `Globe`)

- [ ] **Шаг 2: Удалить state `activeTab`**

Строка `const [activeTab, setActiveTab] = useState<'feed' | 'cabinet'>('feed');` — удалить.

- [ ] **Шаг 3: Удалить блок переключателя**

Удалить весь блок с кнопками Home/PenSquare в `<div className="max-w-lg mx-auto px-4 pt-4">` (строки ~86-111 в текущем файле).

- [ ] **Шаг 4: Удалить условный рендер Cabinet в `main`**

Заменить:

```tsx
{activeTab === 'feed' ? (
  <>
    {/* ... feed content ... */}
  </>
) : (
  <Cabinet />
)}
```

На просто содержимое feed (убрать внешний `{activeTab === 'feed' ? ... : <Cabinet />}` — оставить только внутренности первой ветки).

Также убрать `{newPostsAvailable && activeTab === 'feed' && (...)}` → просто `{newPostsAvailable && (...)}`.

- [ ] **Шаг 5: TS-чек**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: всё ещё ошибка на Cabinet props (из Задачи 3). Не коммитим.

---

## Задача 5: Обновить `Cabinet` — принимать пропы, извлечь модалки

**Файлы:**
- Modify: `src/features/cabinet/Cabinet.tsx`
- Create: `src/features/cabinet/NoteCreateModal.tsx`
- Create: `src/features/cabinet/WorkoutCreateModal.tsx`

- [ ] **Шаг 1: Создать `NoteCreateModal.tsx`**

```tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createNote } from './actions';
import { useT } from '@/lib/useT';

const NOTE_CATEGORIES = ['general', 'gym', 'car', 'personal'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NoteCreateModal({ open, onClose, onCreated }: Props) {
  const t = useT();
  const [form, setForm] = useState({ title: '', text: '', category: 'general' });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) setForm({ title: '', text: '', category: 'general' });
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.title.trim()) return;
    startTransition(async () => {
      await createNote(form.title, form.text, form.category);
      onCreated();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">New note</h3>
          <button
            onClick={onClose}
            className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Input
          placeholder={t('cabinet.what_done')}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSave()}
          className="forge-input"
        />
        <Textarea
          placeholder={t('cabinet.details')}
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          rows={3}
          className="forge-input resize-none"
        />
        <div className="flex gap-1.5 flex-wrap">
          {NOTE_CATEGORIES.map((cat) => {
            const active = form.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setForm({ ...form, category: cat })}
                className={`forge-badge forge-badge-interactive capitalize ${active ? 'forge-badge-purple' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={isPending || !form.title.trim()}
            className="forge-btn-primary flex-1 py-2.5 text-[13px] uppercase disabled:opacity-50"
            style={{ letterSpacing: '0.08em' }}
          >
            {isPending ? '...' : t('common.add')}
          </button>
          <button
            onClick={onClose}
            className="forge-btn-secondary flex-1 py-2.5 text-[13px]"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Шаг 2: Создать `WorkoutCreateModal.tsx`**

```tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createWorkout } from './actions';
import { useT } from '@/lib/useT';

const WORKOUT_TYPES = ['gym', 'tennis', 'padel', 'running', 'other'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function WorkoutCreateModal({ open, onClose, onCreated }: Props) {
  const t = useT();
  const [form, setForm] = useState({ type: 'gym', duration: '', notes: '' });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) setForm({ type: 'gym', duration: '', notes: '' });
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    const dur = parseInt(form.duration);
    if (!dur || dur <= 0) return;
    startTransition(async () => {
      await createWorkout(form.type, dur, form.notes);
      onCreated();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">Log workout</h3>
          <button
            onClick={onClose}
            className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {WORKOUT_TYPES.map((type) => {
            const active = form.type === type;
            return (
              <button
                key={type}
                onClick={() => setForm({ ...form, type })}
                className={`forge-badge forge-badge-interactive capitalize ${active ? 'forge-badge-purple' : ''}`}
              >
                {type}
              </button>
            );
          })}
        </div>
        <Input
          type="text"
          inputMode="numeric"
          placeholder={t('cabinet.duration')}
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value.replace(/\D/g, '') })}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="forge-input"
        />
        <Input
          placeholder={t('cabinet.details')}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="forge-input"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={isPending || !form.duration}
            className="forge-btn-primary flex-1 py-2.5 text-[13px] uppercase disabled:opacity-50"
            style={{ letterSpacing: '0.08em' }}
          >
            {isPending ? '...' : t('cabinet.log_workout')}
          </button>
          <button
            onClick={onClose}
            className="forge-btn-secondary flex-1 py-2.5 text-[13px]"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Шаг 3: Обновить `Cabinet.tsx` — принять пропы, заменить inline-формы на модалки**

Полностью переписать `src/features/cabinet/Cabinet.tsx`:

```tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { NoteCard } from './NoteCard';
import { WorkoutCard } from './WorkoutCard';
import { CabinetSkeleton } from '@/features/feed/Skeletons';
import { getNotes, toggleNote, deleteNote, getWorkouts } from './actions';
import { Plus, StickyNote, Dumbbell } from 'lucide-react';
import { useT } from '@/lib/useT';
import { NoteCreateModal } from './NoteCreateModal';
import { WorkoutCreateModal } from './WorkoutCreateModal';

const NOTE_CATEGORIES = ['general', 'gym', 'car', 'personal'] as const;

interface Props {
  initialModal?: 'note' | 'workout';
  onModalClosed?: () => void;
}

export function Cabinet({ initialModal, onModalClosed }: Props = {}) {
  const [activeSection, setActiveSection] = useState<'notes' | 'workouts'>(
    initialModal === 'workout' ? 'workouts' : 'notes',
  );
  const [notes, setNotes] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [noteFilter, setNoteFilter] = useState<string | null>(null);
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const [showNoteModal, setShowNoteModal] = useState(initialModal === 'note');
  const [showWorkoutModal, setShowWorkoutModal] = useState(initialModal === 'workout');

  useEffect(() => {
    Promise.all([getNotes(), getWorkouts()]).then(([n, w]) => {
      setNotes(n);
      setWorkouts(w);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setShowNoteModal(initialModal === 'note');
    setShowWorkoutModal(initialModal === 'workout');
    if (initialModal === 'workout') setActiveSection('workouts');
    if (initialModal === 'note') setActiveSection('notes');
  }, [initialModal]);

  const refreshNotes = async () => {
    const updated = await getNotes();
    setNotes(updated);
  };

  const refreshWorkouts = async () => {
    const updated = await getWorkouts();
    setWorkouts(updated);
  };

  const handleToggleNote = (noteId: string) => {
    setNotes(notes.map((n) => n.id === noteId ? { ...n, is_done: !n.is_done } : n));
    startTransition(async () => {
      await toggleNote(noteId);
      const updated = await getNotes();
      setNotes(updated);
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
    startTransition(async () => { await deleteNote(noteId); });
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <CabinetSkeleton />;
  }

  const closeNoteModal = () => {
    setShowNoteModal(false);
    onModalClosed?.();
  };

  const closeWorkoutModal = () => {
    setShowWorkoutModal(false);
    onModalClosed?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)]">
        <button
          onClick={() => setActiveSection('notes')}
          className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
            activeSection === 'notes'
              ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
              : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          {t('cabinet.notes')}
        </button>
        <button
          onClick={() => setActiveSection('workouts')}
          className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
            activeSection === 'workouts'
              ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
              : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          {t('cabinet.workouts')}
        </button>
      </div>

      {activeSection === 'notes' ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowNoteModal(true)}
            className="forge-press flex items-center gap-2 text-sm text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors py-2"
          >
            <Plus className="w-4 h-4" />
            {t('cabinet.add_note')}
          </button>

          <div className="flex gap-1.5 flex-wrap mb-2">
            {['all', ...NOTE_CATEGORIES].map((cat) => {
              const labels: Record<string, string> = { all: 'All', general: 'General', gym: t('cat.gym'), car: t('cat.cars'), personal: 'Personal' };
              const active = (cat === 'all' && !noteFilter) || noteFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setNoteFilter(cat === 'all' ? null : cat)}
                  className={`forge-badge forge-badge-interactive ${active ? 'forge-badge-purple' : ''}`}
                >
                  {labels[cat] || cat}
                </button>
              );
            })}
          </div>

          {(noteFilter ? notes.filter((n) => n.category === noteFilter) : notes).length === 0 ? (
            <div className="forge-card flex flex-col items-center py-12 px-6 text-center">
              <StickyNote className="w-8 h-8 mb-2 text-[var(--forge-text-tertiary)]" />
              <p className="text-sm text-[var(--forge-text-tertiary)]">{t('cabinet.no_notes')}</p>
            </div>
          ) : (
            (noteFilter ? notes.filter((n) => n.category === noteFilter) : notes).map((note) => (
              <NoteCard key={note.id} {...note} onToggle={handleToggleNote} onDelete={handleDeleteNote} />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="forge-press flex items-center gap-2 text-sm text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors py-2"
          >
            <Plus className="w-4 h-4" />
            {t('cabinet.log_workout')}
          </button>

          {workouts.length === 0 ? (
            <div className="forge-card flex flex-col items-center py-12 px-6 text-center">
              <Dumbbell className="w-8 h-8 mb-2 text-[var(--forge-text-tertiary)]" />
              <p className="text-sm text-[var(--forge-text-tertiary)]">{t('cabinet.no_workouts')}</p>
            </div>
          ) : (
            workouts.map((w) => (
              <WorkoutCard key={w.id} {...w} duration_min={w.duration_min} created_at={formatTimeAgo(w.created_at)} />
            ))
          )}
        </div>
      )}

      <NoteCreateModal open={showNoteModal} onClose={closeNoteModal} onCreated={refreshNotes} />
      <WorkoutCreateModal open={showWorkoutModal} onClose={closeWorkoutModal} onCreated={refreshWorkouts} />
    </div>
  );
}
```

- [ ] **Шаг 4: TS-чек**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто (все пропы Cabinet теперь есть, ошибка из Задачи 3 ушла).

- [ ] **Шаг 5: Итоговый коммит для задач 3-5**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && git add src/app/cabinet/page.tsx src/app/feed/page.tsx src/features/cabinet/Cabinet.tsx src/features/cabinet/NoteCreateModal.tsx src/features/cabinet/WorkoutCreateModal.tsx && git commit -m "feat(cabinet): promote to /cabinet route with bottom-sheet create modals"
```

---

## Задача 6: Билд + QA + деплой

- [ ] **Шаг 1: Production-билд**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npm run build 2>&1 | tail -20
```

Ожидание: билд успешный, в списке маршрутов появляется `/cabinet`, `/reels` по-прежнему есть (мы его не удаляли).

- [ ] **Шаг 2: Запустить dev и проверить визуально**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && npm run dev
```

Открыть `http://localhost:3000/feed` и проверить по пунктам:

1. Bottom nav показывает 5 иконок: Home, MessageCircle, Plus (круглая градиентная), BookOpen (cabinet), User. Reels-иконки НЕТ.
2. Тап на `+` открывает bottom sheet снизу с тремя кнопками (New post / Note / Workout).
3. Клик на «New post» → sheet закрывается, переход на `/create`.
4. Back → возвращаемся на `/feed`.
5. Тап `+` → «Note» → переход на `/cabinet?new=note`, модалка New note открыта.
6. Закрытие модалки (X или тап на backdrop) → URL становится `/cabinet`, модалка закрыта.
7. Тап `+` → «Workout» → `/cabinet?new=workout`, модалка Log workout открыта.
8. `/feed` — нет вкладки Cabinet в верхней части (убрали переключатель Home/PenSquare).
9. Кликабельная иконка Cabinet в nav → переход на `/cabinet`, модалки не открыты (query-param пустой).
10. Прямая ссылка `http://localhost:3000/reels` — работает, Reels-лента открывается.

- [ ] **Шаг 3: Если нашёл мелкие косяки — починить, закоммитить**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && git add -A && git commit -m "fix(nav): polish after manual QA"
```

- [ ] **Шаг 4: Деплой**

```bash
cd /Users/alexsamoilov/WebstormProjects/MyProjects/forge && git push origin main && vercel --prod --yes
```

Ожидание: deployment ready, изменения видны на forgeclub.app.

- [ ] **Шаг 5: Обновить Current state**

В `/Users/alexsamoilov/ObsidianVault/ClaudeMemory/projects/forge.md` секция «Последняя сессия» — добавить пункт: «Bottom nav restructure — новая nav, PlusSheet, Cabinet как отдельная страница, Reels убран из nav».
