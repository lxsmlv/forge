export function PostSkeleton() {
  return (
    <div className="forge-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className="h-10 w-10 rounded-full forge-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 forge-shimmer rounded-md" />
          <div className="h-2.5 w-20 forge-shimmer rounded-md" />
        </div>
      </div>
      <div className="aspect-[4/3] forge-shimmer" />
      <div className="px-5 py-3.5 flex gap-5">
        <div className="h-5 w-14 forge-shimmer rounded-md" />
        <div className="h-5 w-14 forge-shimmer rounded-md" />
      </div>
      <div className="px-5 pb-4">
        <div className="h-3 w-3/4 forge-shimmer rounded-md" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-5 py-8 px-5">
      <div className="h-24 w-24 rounded-full forge-shimmer" />
      <div className="h-5 w-36 forge-shimmer rounded-md" />
      <div className="h-3 w-48 forge-shimmer rounded-md" />
      <div className="flex gap-3 mt-2">
        <div className="h-7 w-16 forge-shimmer rounded-full" />
        <div className="h-7 w-16 forge-shimmer rounded-full" />
        <div className="h-7 w-16 forge-shimmer rounded-full" />
      </div>
      <div className="flex gap-10 mt-4">
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="h-5 w-8 forge-shimmer rounded-md" />
            <div className="h-2.5 w-12 forge-shimmer rounded-md" />
          </div>
        ))}
      </div>
      <div className="w-full mt-8"><PostSkeleton /></div>
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 px-5 py-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="forge-card flex items-center gap-3 px-4 py-3.5">
          <div className="h-11 w-11 rounded-full forge-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-24 forge-shimmer rounded-md" />
            <div className="h-2.5 w-40 forge-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 px-5 py-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="forge-card flex items-center gap-3 px-4 py-3.5">
          <div className="h-10 w-10 rounded-full forge-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-48 forge-shimmer rounded-md" />
            <div className="h-2.5 w-16 forge-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CabinetSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <div className="flex-1 h-10 forge-shimmer rounded-lg" />
        <div className="flex-1 h-10 forge-shimmer rounded-lg opacity-50" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="forge-card px-4 py-4 flex gap-3">
          <div className="h-5 w-5 rounded-full forge-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 forge-shimmer rounded-md" />
            <div className="h-2.5 w-48 forge-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <div className="h-10 w-full forge-shimmer rounded-xl" />
      <div className="h-4 w-24 forge-shimmer rounded-md mt-2" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 forge-shimmer rounded-full" />
        ))}
      </div>
      <div className="h-4 w-28 forge-shimmer rounded-md mt-2" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="forge-card flex items-center gap-3 px-4 py-3.5">
          <div className="h-10 w-10 rounded-full forge-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-28 forge-shimmer rounded-md" />
            <div className="h-2.5 w-40 forge-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
