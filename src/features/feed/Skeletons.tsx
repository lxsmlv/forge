/**
 * Skeletons match real content layouts.
 * Shimmer animation lives in design-system.css — a single spark traverses viewport
 * and lights each forge-shimmer block based on its real X position.
 */

export function PostSkeleton() {
  return (
    <div className="forge-card overflow-hidden">
      {/* Header */}
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

      {/* Actions */}
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

      {/* Caption */}
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
        <div className="h-[100px] w-[100px] rounded-full forge-shimmer" />

        <div className="flex flex-col items-center gap-1.5 mt-1">
          <div className="h-[20px] w-40 forge-shimmer rounded-md" />
          <div className="h-[13px] w-24 forge-shimmer rounded-md" />
          <div className="h-[13px] w-56 forge-shimmer rounded-md mt-1" />
        </div>

        <div className="flex gap-2">
          <div className="h-[22px] w-20 forge-shimmer rounded-full" />
          <div className="h-[22px] w-24 forge-shimmer rounded-full" />
        </div>

        <div className="flex gap-2">
          <div className="h-[22px] w-16 forge-shimmer rounded-full" />
          <div className="h-[22px] w-16 forge-shimmer rounded-full" />
        </div>

        <div className="h-[14px] w-16 forge-shimmer rounded-md mt-1" />

        <div className="flex gap-8 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-5 w-8 forge-shimmer rounded-md" />
              <div className="h-[11px] w-14 forge-shimmer rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 mb-4 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <div className="flex-1 h-9 forge-shimmer rounded-[var(--forge-radius-sm)]" />
        <div className="flex-1 h-9 rounded-[var(--forge-radius-sm)] opacity-0" />
      </div>

      <PostSkeleton />
    </main>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="forge-card flex items-center gap-3 px-3 py-3">
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
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="forge-card flex items-center gap-3 px-3 py-3">
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
      <div className="flex gap-1 p-1 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <div className="flex-1 h-9 forge-shimmer rounded-[var(--forge-radius-sm)]" />
        <div className="flex-1 h-9 rounded-[var(--forge-radius-sm)] opacity-0" />
      </div>

      <div className="h-5 w-28 forge-shimmer rounded-md" />

      <div className="flex gap-1.5 flex-wrap">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[22px] w-16 forge-shimmer rounded-full" />
        ))}
      </div>

      {[0, 1, 2].map((row) => (
        <div key={row} className="forge-card px-4 py-4 flex gap-3">
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
      <div className="h-10 w-full forge-shimmer rounded-[var(--forge-radius-md)]" />
      <div className="h-[13px] w-28 forge-shimmer rounded-md" />
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[22px] w-20 forge-shimmer rounded-full" />
        ))}
      </div>
      <div className="h-[13px] w-20 forge-shimmer rounded-md mt-2" />
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="forge-card flex items-center gap-3 px-3 py-3">
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
