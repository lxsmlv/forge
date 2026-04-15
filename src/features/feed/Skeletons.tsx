/**
 * Skeletons match the exact layout of rendered content.
 * When real data replaces skeleton, there should be minimal reflow.
 */

export function PostSkeleton() {
  return (
    <div className="forge-card overflow-hidden">
      {/* Header: avatar + name/meta + category badge + menu — matches PostCard px-4 py-3 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-[14px] w-32 forge-shimmer rounded-md" />
          <div className="h-[11px] w-24 forge-shimmer rounded-md" />
        </div>
        <div className="h-[22px] w-16 forge-shimmer rounded-full shrink-0" />
        <div className="h-4 w-4 forge-shimmer rounded shrink-0" />
      </div>

      {/* Image */}
      <div className="aspect-[4/3] forge-shimmer" />

      {/* Actions: heart + count, comment + count, right side bookmark + share — px-4 py-3 */}
      <div className="px-4 py-3 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className="h-[22px] w-[22px] forge-shimmer rounded" />
          <div className="h-[13px] w-5 forge-shimmer rounded-md" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-[22px] w-[22px] forge-shimmer rounded" />
          <div className="h-[13px] w-5 forge-shimmer rounded-md" />
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="h-[18px] w-[18px] forge-shimmer rounded" />
          <div className="h-[18px] w-[18px] forge-shimmer rounded" />
        </div>
      </div>

      {/* Caption — px-4 pb-4 */}
      <div className="px-4 pb-4 space-y-1.5">
        <div className="h-[14px] w-full forge-shimmer rounded-md" />
        <div className="h-[14px] w-3/5 forge-shimmer rounded-md" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Avatar ring — matches real h-24 w-24 wrapped in forge-avatar-ring (28x28 effective with 2px padding) */}
        <div className="h-[100px] w-[100px] rounded-full forge-shimmer" />

        {/* Name + @username + bio */}
        <div className="flex flex-col items-center gap-1.5 mt-1">
          <div className="h-[20px] w-40 forge-shimmer rounded-md" />
          <div className="h-[13px] w-24 forge-shimmer rounded-md" />
          <div className="h-[13px] w-56 forge-shimmer rounded-md mt-1" />
        </div>

        {/* Badges (city / car) */}
        <div className="flex gap-2">
          <div className="h-[22px] w-20 forge-shimmer rounded-full" />
          <div className="h-[22px] w-24 forge-shimmer rounded-full" />
        </div>

        {/* Sports */}
        <div className="flex gap-2">
          <div className="h-[22px] w-16 forge-shimmer rounded-full" />
          <div className="h-[22px] w-16 forge-shimmer rounded-full" />
        </div>

        {/* Edit link */}
        <div className="h-[14px] w-16 forge-shimmer rounded-md mt-1" />

        {/* 4-col stats: posts / followers / following / workouts */}
        <div className="flex gap-8 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-5 w-8 forge-shimmer rounded-md" />
              <div className="h-[11px] w-14 forge-shimmer rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs (Posts / Activity) */}
      <div className="flex gap-1 p-1 mb-4 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <div className="flex-1 h-9 forge-shimmer rounded-[var(--forge-radius-sm)]" />
        <div className="flex-1 h-9 rounded-[var(--forge-radius-sm)] opacity-0" />
      </div>

      {/* One post preview */}
      <PostSkeleton />
    </main>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="forge-card flex items-center gap-3 px-3 py-3">
          <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="h-[14px] w-28 forge-shimmer rounded-md" />
              <div className="h-[11px] w-10 forge-shimmer rounded-md" />
            </div>
            <div className="h-[12px] w-48 forge-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="forge-card flex items-center gap-3 px-3 py-3">
          <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-[14px] w-56 forge-shimmer rounded-md" />
            <div className="h-[11px] w-16 forge-shimmer rounded-md" />
          </div>
          <div className="h-4 w-4 forge-shimmer rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function CabinetSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Section tabs (Notes / Workouts) */}
      <div className="flex gap-1 p-1 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <div className="flex-1 h-9 forge-shimmer rounded-[var(--forge-radius-sm)]" />
        <div className="flex-1 h-9 rounded-[var(--forge-radius-sm)] opacity-0" />
      </div>

      {/* Add button link */}
      <div className="h-5 w-28 forge-shimmer rounded-md" />

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[22px] w-16 forge-shimmer rounded-full" />
        ))}
      </div>

      {/* Notes list */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="forge-card px-4 py-4 flex gap-3">
          <div className="h-5 w-5 rounded-full forge-shimmer shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="h-[14px] w-40 forge-shimmer rounded-md" />
            <div className="h-[12px] w-56 forge-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Search input */}
      <div className="h-10 w-full forge-shimmer rounded-[var(--forge-radius-md)]" />

      {/* Trending tags label */}
      <div className="h-[13px] w-28 forge-shimmer rounded-md" />

      {/* Trending tags row */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[22px] w-20 forge-shimmer rounded-full" />
        ))}
      </div>

      {/* Discover label */}
      <div className="h-[13px] w-20 forge-shimmer rounded-md mt-2" />

      {/* User rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="forge-card flex items-center gap-3 px-3 py-3">
          <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-[14px] w-32 forge-shimmer rounded-md" />
            <div className="h-[12px] w-48 forge-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
