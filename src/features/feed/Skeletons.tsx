export function PostSkeleton() {
  return (
    <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800" />
        <div className="flex-1">
          <div className="h-3.5 w-28 bg-zinc-800 rounded" />
          <div className="h-2.5 w-20 bg-zinc-800/50 rounded mt-1.5" />
        </div>
        <div className="h-5 w-16 bg-zinc-800 rounded-full" />
      </div>
      <div className="aspect-[4/3] bg-zinc-800" />
      <div className="px-4 py-3 flex gap-5">
        <div className="h-5 w-12 bg-zinc-800 rounded" />
        <div className="h-5 w-12 bg-zinc-800 rounded" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-3 w-3/4 bg-zinc-800 rounded" />
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
    <div className="animate-pulse flex flex-col items-center gap-4 py-6 px-4">
      <div className="h-24 w-24 rounded-full bg-zinc-800" />
      <div className="h-5 w-36 bg-zinc-800 rounded" />
      <div className="h-3 w-48 bg-zinc-800/50 rounded" />
      <div className="flex gap-3 mt-2">
        <div className="h-6 w-16 bg-zinc-800 rounded-full" />
        <div className="h-6 w-16 bg-zinc-800 rounded-full" />
        <div className="h-6 w-16 bg-zinc-800 rounded-full" />
      </div>
      <div className="flex gap-8 mt-4">
        <div className="flex flex-col items-center gap-1">
          <div className="h-5 w-8 bg-zinc-800 rounded" />
          <div className="h-2.5 w-10 bg-zinc-800/50 rounded" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-5 w-8 bg-zinc-800 rounded" />
          <div className="h-2.5 w-14 bg-zinc-800/50 rounded" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-5 w-8 bg-zinc-800 rounded" />
          <div className="h-2.5 w-14 bg-zinc-800/50 rounded" />
        </div>
      </div>
      <div className="w-full mt-6 space-y-3">
        <PostSkeleton />
      </div>
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-2 px-4 py-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50">
          <div className="h-10 w-10 rounded-full bg-zinc-800 shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 w-24 bg-zinc-800 rounded" />
            <div className="h-2.5 w-40 bg-zinc-800/50 rounded mt-1.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-2 px-4 py-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50">
          <div className="h-10 w-10 rounded-full bg-zinc-800 shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-48 bg-zinc-800 rounded" />
            <div className="h-2.5 w-16 bg-zinc-800/50 rounded mt-1.5" />
          </div>
          <div className="h-4 w-4 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CabinetSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50">
        <div className="flex-1 h-9 bg-zinc-800 rounded-md" />
        <div className="flex-1 h-9 bg-zinc-800/50 rounded-md" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex gap-3">
          <div className="h-5 w-5 rounded-full bg-zinc-800" />
          <div className="flex-1">
            <div className="h-3.5 w-32 bg-zinc-800 rounded" />
            <div className="h-2.5 w-48 bg-zinc-800/50 rounded mt-1.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3 px-4 py-4">
      <div className="h-10 w-full bg-zinc-800 rounded-lg" />
      <div className="h-4 w-24 bg-zinc-800/50 rounded mt-4" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 bg-zinc-800 rounded-full" />
        ))}
      </div>
      <div className="h-4 w-28 bg-zinc-800/50 rounded mt-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50">
          <div className="h-10 w-10 rounded-full bg-zinc-800" />
          <div className="flex-1">
            <div className="h-3.5 w-28 bg-zinc-800 rounded" />
            <div className="h-2.5 w-40 bg-zinc-800/50 rounded mt-1.5" />
          </div>
        </div>
      ))}
    </div>
  );
}
