# План: убрать «All» из ленты + Discover empty-state

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Цель:** Убрать режим `all` из ленты и показать список Discover-профилей как empty-state когда у юзера 0 подписок.

**Архитектура:** Сигнатура `getPosts` сокращается с 4 режимов до 3 — TypeScript подсветит все сломанные callsites. Новый компонент `FeedEmptyState` рендерит suggested-профили с инлайн-Follow. Страница ленты показывает этот компонент когда `feedMode === 'following'`, посты пусты и у юзера 0 подписок.

**Стек:** Next.js 15 App Router, React, TypeScript, Tailwind, Supabase (existing server actions).

**Проект тесты не использует** — вместо TDD каждый шаг проверяется через `npx tsc --noEmit` и визуально на деве.

---

## File Structure

- **Изменяем** `src/features/feed/actions.ts` — убираем `'all'` из union и ветки кода.
- **Изменяем** `src/app/feed/page.tsx` — убираем кнопку All, меняем тип `feedMode`, добавляем рендер `<FeedEmptyState />`.
- **Создаём** `src/features/feed/FeedEmptyState.tsx` — компонент с Discover-карточками и inline Follow.
- **Изменяем** `src/lib/i18n.ts` — убираем `feed.all` + `feed.switch_all`, добавляем `feed.empty_start_following` + `feed.empty_find_more`.
- **Изменяем** `src/features/profile/actions.ts` — не требуется, `getMyProfile()` уже возвращает `following_count`.

---

## Задача 1: Сократить сигнатуру `getPosts`

**Файлы:**
- Modify: `src/features/feed/actions.ts:10-75`

- [ ] **Шаг 1: Обновить сигнатуру и дефолтный режим**

В `src/features/feed/actions.ts` заменить строку 10:

```ts
export async function getPosts(mode: 'following' | 'bookmarks' | 'trending' = 'following', offset: number = 0, limit: number = 20) {
```

- [ ] **Шаг 2: Убедиться что ветки `all` нет**

Грепаем в файле:

```bash
grep -n "'all'" src/features/feed/actions.ts
```

Ожидание: пусто. Если что-то осталось — удалить.

- [ ] **Шаг 3: TS-чек (должен подсветить сломанные callsites)**

```bash
npx tsc --noEmit 2>&1 | grep -E "feed/page|getPosts" | head -20
```

Ожидание: ошибки в `src/app/feed/page.tsx` на строках 27 и 30 вокруг типа `'all' | ...`. Это нормально — починим в Задаче 2.

- [ ] **Шаг 4: Не коммитим** — TS сломан, коммит после Задачи 2.

---

## Задача 2: Убрать `All` из страницы ленты, сделать дефолтом `following`

**Файлы:**
- Modify: `src/app/feed/page.tsx:14-200`

- [ ] **Шаг 1: Обновить тип стейта и дефолтный режим**

В `src/app/feed/page.tsx` строка 18:

```tsx
const [feedMode, setFeedMode] = useState<'following' | 'bookmarks' | 'trending'>('following');
```

- [ ] **Шаг 2: Обновить сигнатуру `loadPosts`**

Строка 27:

```tsx
const loadPosts = (mode: 'following' | 'bookmarks' | 'trending') => {
```

- [ ] **Шаг 3: Убрать кнопку `All` из фильтров**

Найти массив с кнопками режимов (строки 127-133) и удалить объект `{ id: 'all', icon: Globe, label: t('feed.all') }`. Оставить только `following`, `bookmarks`, `trending`:

```tsx
{([
  { id: 'following', icon: Users, label: t('feed.following') },
  { id: 'bookmarks', icon: Bookmark, label: t('feed.saved') },
  { id: 'trending', icon: Flame, label: t('feed.trending') },
] as const).map(({ id, icon: Icon, label }) => {
```

- [ ] **Шаг 4: Убрать неиспользуемый импорт `Globe`**

Строка 14 — удалить `Globe` из импорта `lucide-react`.

- [ ] **Шаг 5: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто, без ошибок.

- [ ] **Шаг 6: Коммит**

```bash
git add src/features/feed/actions.ts src/app/feed/page.tsx
git commit -m "feat(feed): remove All mode, default to Following"
```

---

## Задача 3: Создать компонент `FeedEmptyState`

**Файлы:**
- Create: `src/features/feed/FeedEmptyState.tsx`

- [ ] **Шаг 1: Создать файл с компонентом**

Записать в `src/features/feed/FeedEmptyState.tsx`:

```tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Search } from 'lucide-react';
import { getDiscoverProfiles } from './discover-actions';
import { toggleFollow } from '@/features/profile/follow-actions';
import { useT } from '@/lib/useT';

interface Props {
  onFirstFollow: () => void;
}

export function FeedEmptyState({ onFirstFollow }: Props) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const t = useT();

  useEffect(() => {
    getDiscoverProfiles().then((data) => {
      setProfiles(data);
      setLoading(false);
    });
  }, []);

  const handleFollow = (userId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    startTransition(async () => {
      await toggleFollow(userId);
      onFirstFollow();
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="forge-card flex flex-col items-center py-16 px-6 mt-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-[var(--forge-purple-bright)]" />
        </div>
        <p className="text-[15px] font-semibold text-[var(--forge-text-primary)]">
          {t('feed.empty_start_following')}
        </p>
        <Link href="/search" className="text-[13px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] mt-2 transition-colors">
          {t('feed.empty_find_more')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">
          {t('feed.empty_start_following')}
        </h2>
        <Link href="/search" className="text-[12px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] flex items-center gap-1 transition-colors">
          <Search className="w-3 h-3" />
          {t('feed.empty_find_more')}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {profiles.map((profile) => {
          const initials = (profile.full_name || '?')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          return (
            <div key={profile.id} className="forge-card flex items-center gap-3 px-3 py-3">
              <Link href={`/profile/${profile.username}`} className="forge-avatar h-10 w-10 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-sm font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </Link>
              <Link href={`/profile/${profile.username}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--forge-text-primary)] truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-[var(--forge-text-tertiary)] truncate">
                  @{profile.username}
                  {profile.city ? ` · ${profile.city}` : ''}
                  {profile.car ? ` · ${profile.car}` : ''}
                </p>
              </Link>
              <button
                onClick={() => handleFollow(profile.id)}
                disabled={isPending}
                className="forge-btn-primary forge-press shrink-0 px-3 py-1.5 text-[12px] flex items-center gap-1 disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Follow
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Шаг 2: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

- [ ] **Шаг 3: Коммит**

```bash
git add src/features/feed/FeedEmptyState.tsx
git commit -m "feat(feed): add FeedEmptyState with Discover suggestions"
```

---

## Задача 4: Подключить `FeedEmptyState` к странице ленты

**Файлы:**
- Modify: `src/app/feed/page.tsx:1-250`

- [ ] **Шаг 1: Добавить стейт `followingCount`**

После других useState (около строки 23) добавить:

```tsx
const [followingCount, setFollowingCount] = useState<number | null>(null);
```

- [ ] **Шаг 2: Импортировать `getMyProfile` и `FeedEmptyState`**

В начале файла, после существующих импортов:

```tsx
import { FeedEmptyState } from '@/features/feed/FeedEmptyState';
import { getMyProfile } from '@/features/profile/actions';
```

- [ ] **Шаг 3: Загружать `following_count` при маунте**

В существующий `useEffect` (после `loadPosts(feedMode)` на ~строке 50) добавить:

```tsx
getMyProfile().then((p) => setFollowingCount(p?.following_count ?? 0));
```

- [ ] **Шаг 4: Рендерить `FeedEmptyState` вместо текстовой заглушки для Following с 0 подписками**

Найти блок где рендерится старое пустое состояние (примерно строка 217). Заменить рендер-логику: когда `filteredPosts.length === 0`:

```tsx
) : feedMode === 'following' && followingCount === 0 ? (
  <FeedEmptyState
    onFirstFollow={() => {
      getMyProfile().then((p) => setFollowingCount(p?.following_count ?? 0));
      loadPosts(feedMode);
    }}
  />
) : (
  <div className="forge-card flex flex-col items-center py-16 px-6 mt-4 text-center">
    <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center mb-4">
      <Flame className="w-7 h-7 text-[var(--forge-purple-bright)]" />
    </div>
    <p className="text-[15px] font-semibold text-[var(--forge-text-primary)]">
      {feedMode === 'following' ? t('feed.follow_someone') : t('feed.no_posts')}
    </p>
    <p className="text-[13px] text-[var(--forge-text-tertiary)] mt-1.5 max-w-xs">
      {feedMode === 'following' ? t('feed.switch_all') : t('feed.be_first')}
    </p>
  </div>
)
```

Обрати внимание: сохранили fallback-текст для кейса «у меня есть подписки, но они молчат» — используется `t('feed.switch_all')` временно, поменяем на новый ключ в Задаче 5.

- [ ] **Шаг 5: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

- [ ] **Шаг 6: Коммит**

```bash
git add src/app/feed/page.tsx
git commit -m "feat(feed): wire FeedEmptyState for zero-follow users"
```

---

## Задача 5: Обновить i18n-ключи

**Файлы:**
- Modify: `src/lib/i18n.ts`

- [ ] **Шаг 1: В английской секции (около строк 29 и 50)** удалить строки с `'feed.all'` и `'feed.switch_all'`. Добавить:

```ts
'feed.empty_start_following': 'Start following to fill your feed',
'feed.empty_find_more': 'Find more people',
```

Остальные ключи `feed.follow_someone`, `feed.be_first`, `feed.no_posts` — не трогаем.

- [ ] **Шаг 2: В русской секции (около строк 187 и 206)** сделать зеркально:

```ts
'feed.empty_start_following': 'Подпишись чтобы заполнить ленту',
'feed.empty_find_more': 'Найти ещё людей',
```

Удалить `'feed.all'` и `'feed.switch_all'` из русской части.

- [ ] **Шаг 3: Удалить оставшуюся ссылку `t('feed.switch_all')` в `src/app/feed/page.tsx`**

В fallback-ветке empty-state (осталась из Задачи 4 Шаг 4) заменить `t('feed.switch_all')` на `t('feed.be_first')`. Например строка:

```tsx
{feedMode === 'following' ? t('feed.switch_all') : t('feed.be_first')}
```

становится:

```tsx
{t('feed.be_first')}
```

(одинаковый текст подходит для обоих режимов: «be the first to post»).

- [ ] **Шаг 3b: Проверить что нигде в коде не осталось ссылок на удалённые ключи**

```bash
grep -rn "feed\.all\b\|feed\.switch_all" src --include="*.ts" --include="*.tsx"
```

Ожидание: пусто.

- [ ] **Шаг 4: TS-чек**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Ожидание: чисто.

- [ ] **Шаг 5: Коммит**

```bash
git add src/lib/i18n.ts src/app/feed/page.tsx
git commit -m "feat(i18n): remove feed.all keys, add empty-state copy"
```

---

## Задача 6: Проверка прод-билда и визуал

- [ ] **Шаг 1: Production-билд**

```bash
npm run build
```

Ожидание: билд зелёный, ни одна страница не отвалилась.

- [ ] **Шаг 2: Запустить dev и проверить визуально**

```bash
npm run dev
```

Открыть `http://localhost:3000/feed` и вручную проверить:

- Кнопки фильтров режимов: Following, Saved, Trending — БЕЗ кнопки All.
- Дефолт — Following.
- Если у тестового юзера 0 подписок — виден список Discover-профилей с кнопкой Follow.
- Клик Follow: карточка исчезает, лента подгружает посты этого юзера.
- Если подписан хотя бы на одного — видишь обычную ленту или текстовое «Quiet around here».

- [ ] **Шаг 3: Итоговый коммит-sweep (если что-то подправлял)**

Если в процессе ручной проверки пришлось точечно что-то фиксить:

```bash
git add -A
git commit -m "fix(feed): polish empty-state after manual QA"
```

- [ ] **Шаг 4: Деплой на прод**

```bash
git push origin main
vercel --prod --yes
```

Ожидание: deployment ready, изменения видны на forgeclub.app.
