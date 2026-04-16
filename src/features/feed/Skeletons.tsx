/**
 * Skeletons match real content layouts.
 * Each forge-shimmer block has inline --i index for cascading spark animation
 * (defined in design-system.css). Spark travels L→R top-to-bottom across the card.
 */

function s(i: number): React.CSSProperties {
  return { ['--i' as string]: i };
}

export function PostSkeleton() {
  return (
    <div className="forge-card overflow-hidden">
      {/* Header: avatar + name/meta + category badge + menu */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" style={s(0)} />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-[14px] w-32 forge-shimmer rounded-md" style={s(1)} />
          <div className="h-[11px] w-24 forge-shimmer rounded-md" style={s(2)} />
        </div>
        <div className="h-[22px] w-16 forge-shimmer rounded-full shrink-0" style={s(3)} />
        <div className="h-4 w-4 forge-shimmer rounded shrink-0" style={s(4)} />
      </div>

      {/* Image */}
      <div className="aspect-[4/3] forge-shimmer" style={s(5)} />

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className="h-[22px] w-[22px] forge-shimmer rounded" style={s(6)} />
          <div className="h-[13px] w-5 forge-shimmer rounded-md" style={s(7)} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-[22px] w-[22px] forge-shimmer rounded" style={s(8)} />
          <div className="h-[13px] w-5 forge-shimmer rounded-md" style={s(9)} />
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="h-[18px] w-[18px] forge-shimmer rounded" style={s(10)} />
          <div className="h-[18px] w-[18px] forge-shimmer rounded" style={s(11)} />
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4 space-y-1.5">
        <div className="h-[14px] w-full forge-shimmer rounded-md" style={s(12)} />
        <div className="h-[14px] w-3/5 forge-shimmer rounded-md" style={s(13)} />
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
        {/* Avatar */}
        <div className="h-[100px] w-[100px] rounded-full forge-shimmer" style={s(0)} />

        {/* Name + @username + bio */}
        <div className="flex flex-col items-center gap-1.5 mt-1">
          <div className="h-[20px] w-40 forge-shimmer rounded-md" style={s(1)} />
          <div className="h-[13px] w-24 forge-shimmer rounded-md" style={s(2)} />
          <div className="h-[13px] w-56 forge-shimmer rounded-md mt-1" style={s(3)} />
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-[22px] w-20 forge-shimmer rounded-full" style={s(4)} />
          <div className="h-[22px] w-24 forge-shimmer rounded-full" style={s(5)} />
        </div>

        {/* Sports */}
        <div className="flex gap-2">
          <div className="h-[22px] w-16 forge-shimmer rounded-full" style={s(6)} />
          <div className="h-[22px] w-16 forge-shimmer rounded-full" style={s(7)} />
        </div>

        {/* Edit link */}
        <div className="h-[14px] w-16 forge-shimmer rounded-md mt-1" style={s(8)} />

        {/* Stats */}
        <div className="flex gap-8 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-5 w-8 forge-shimmer rounded-md" style={s(9 + i * 2)} />
              <div className="h-[11px] w-14 forge-shimmer rounded-md" style={s(10 + i * 2)} />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-4 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <div className="flex-1 h-9 forge-shimmer rounded-[var(--forge-radius-sm)]" style={s(17)} />
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
          <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" style={s(row * 4)} />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="h-[14px] w-28 forge-shimmer rounded-md" style={s(row * 4 + 1)} />
              <div className="h-[11px] w-10 forge-shimmer rounded-md" style={s(row * 4 + 2)} />
            </div>
            <div className="h-[12px] w-48 forge-shimmer rounded-md" style={s(row * 4 + 3)} />
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
          <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" style={s(row * 4)} />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-[14px] w-56 forge-shimmer rounded-md" style={s(row * 4 + 1)} />
            <div className="h-[11px] w-16 forge-shimmer rounded-md" style={s(row * 4 + 2)} />
          </div>
          <div className="h-4 w-4 forge-shimmer rounded shrink-0" style={s(row * 4 + 3)} />
        </div>
      ))}
    </div>
  );
}

export function CabinetSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 p-1 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <div className="flex-1 h-9 forge-shimmer rounded-[var(--forge-radius-sm)]" style={s(0)} />
        <div className="flex-1 h-9 rounded-[var(--forge-radius-sm)] opacity-0" />
      </div>

      <div className="h-5 w-28 forge-shimmer rounded-md" style={s(1)} />

      <div className="flex gap-1.5 flex-wrap">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[22px] w-16 forge-shimmer rounded-full" style={s(2 + i)} />
        ))}
      </div>

      {[0, 1, 2].map((row) => (
        <div key={row} className="forge-card px-4 py-4 flex gap-3">
          <div className="h-5 w-5 rounded-full forge-shimmer shrink-0 mt-0.5" style={s(6 + row * 3)} />
          <div className="flex-1 space-y-1.5">
            <div className="h-[14px] w-40 forge-shimmer rounded-md" style={s(7 + row * 3)} />
            <div className="h-[12px] w-56 forge-shimmer rounded-md" style={s(8 + row * 3)} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="h-10 w-full forge-shimmer rounded-[var(--forge-radius-md)]" style={s(0)} />
      <div className="h-[13px] w-28 forge-shimmer rounded-md" style={s(1)} />
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[22px] w-20 forge-shimmer rounded-full" style={s(2 + i)} />
        ))}
      </div>
      <div className="h-[13px] w-20 forge-shimmer rounded-md mt-2" style={s(7)} />
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="forge-card flex items-center gap-3 px-3 py-3">
          <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" style={s(8 + row * 3)} />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-[14px] w-32 forge-shimmer rounded-md" style={s(9 + row * 3)} />
            <div className="h-[12px] w-48 forge-shimmer rounded-md" style={s(10 + row * 3)} />
          </div>
        </div>
      ))}
    </div>
  );
}
