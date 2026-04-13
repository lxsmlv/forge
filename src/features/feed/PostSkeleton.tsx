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
