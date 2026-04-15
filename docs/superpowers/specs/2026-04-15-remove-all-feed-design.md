# Remove "All" feed mode, add Discover empty-state

**Date:** 2026-04-15
**Status:** Design approved

## Motivation

The "All" feed mode is a chronological dump of every post. Three problems:

1. **UX:** Shows mostly noise or emptiness depending on activity. No algorithm, no ranking.
2. **Brand:** Forge positions as a friends club. A firehose of strangers breaks the club feel.
3. **Tech:** Smart ranking requires data volume we don't have and won't have for months.

Decision: remove "All" now, reintroduce a curated Discover mode later if needed. Following becomes the primary feed.

## Scope

In:
- Remove `all` feed mode from feed page, actions, and i18n
- Replace empty "Following" state with inline Discover (suggested profiles + Follow button)
- Make `following` the default feed mode

Out:
- Any changes to Trending, Saved (bookmarks) modes
- Smart feed ranking (future work)
- Discover as separate tab (it's only an empty-state treatment for now)

## Design

### Feed modes after change

| Mode | Purpose | Source |
|------|---------|--------|
| Following (default) | Friends you chose | `getPosts('following')` |
| Trending | Discovery by signal | `getPosts('trending')` |
| Saved | Bookmarked posts | `getPosts('bookmarks')` |

### Empty Following state

When the authenticated user has `following_count === 0`:

- Show suggested profiles from `getDiscoverProfiles()` in a card list
- Card contains: avatar, full name, @username, city/car/sports (when present), inline **Follow** button
- Clicking Follow:
  - Calls existing `toggleFollow(userId)` server action
  - Removes the card from the list with a short transition
  - After the first successful follow the empty state unmounts and the regular Following feed takes over
- Header above list: "Start following to fill your feed"
- Copy under header: short hint pointing to `/search` for more discovery

When the user has ≥1 follow but none of them posted yet, keep the existing textual empty state with a link to search.

### Files affected

- `src/app/feed/page.tsx`
  - Remove `'all'` from the `feedMode` union type
  - Remove the "All" button from the filter row
  - Set `useState<'following' | 'bookmarks' | 'trending'>('following')`
  - Render `<FeedEmptyState />` when mode is `following`, posts are empty, and `following_count === 0`
- `src/features/feed/actions.ts`
  - Update `getPosts` signature to drop `'all'` from its mode parameter
  - Remove the branch that handled `mode === 'all'`
  - TypeScript will flag other callsites; update them
- `src/features/feed/FeedEmptyState.tsx` (new)
  - Fetches `getDiscoverProfiles()` on mount
  - Renders header + list of profile cards with Follow buttons
  - On Follow, updates local list and triggers a feed refresh callback passed from the page
- i18n (`src/lib/i18n/*` keys used via `useT`)
  - Remove keys: `feed.all`, `feed.switch_all`
  - Add keys: `feed.empty_start_following` (header), `feed.empty_find_more` (hint text pointing to `/search`)

### Edge cases

- **Deep link to `/feed?mode=all`** — if any exists in code or old shares, route to `following` silently. Audit first; likely not used.
- **User at 0 followed, but suggestions endpoint returns 0 profiles** — fall back to the plain text empty state with a link to `/search`.
- **Bookmarks/Trending empty** — existing empty states unchanged; they are not the hot path.
- **Feed category filter** applies only inside the chosen mode; removing `all` does not interact with category filtering.

### What we explicitly do NOT do

- Do not introduce smart ranking
- Do not add a separate Discover tab
- Do not change the Stories bar, header, or any other surface
- Do not touch the Profile/Groups/Messages empty states

## Risks

- Users who relied on "All" to stumble on posts lose that path. Mitigated by Trending still being available and by Discover as empty-state onboarding.
- Follow counter badge math must remain correct after toggle; already handled by `toggleFollow` action.

## Success criteria

- No "All" control visible anywhere in the UI
- New user with zero follows lands on Following and sees the Discover empty state, not a blank area
- One-click follow from the empty state works and smoothly transitions into the real feed
- Build passes, no runtime errors on `/feed` for both zero-follow and existing-follow users
