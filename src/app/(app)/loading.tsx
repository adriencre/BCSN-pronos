export default function Loading() {
  return (
    <div className="px-4 pt-4 pb-12 space-y-4 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-bg-card/60 border border-border-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-bg-surface" />
          <div className="space-y-1.5">
            <div className="w-24 h-3 rounded bg-bg-surface" />
            <div className="w-32 h-2 rounded bg-bg-surface" />
          </div>
        </div>
        <div className="w-16 h-7 rounded-xl bg-bg-surface" />
      </div>

      {/* Main Hero Card Skeleton */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-36 h-5 rounded-full bg-bg-surface" />
          <div className="w-20 h-5 rounded-full bg-bg-surface" />
        </div>

        <div className="flex justify-around items-center py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface" />
            <div className="w-16 h-3 rounded bg-bg-surface" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-bg-surface" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface" />
            <div className="w-16 h-3 rounded bg-bg-surface" />
          </div>
        </div>

        <div className="w-full h-12 rounded-xl bg-bg-surface" />
      </div>

      {/* Secondary Card Skeleton */}
      <div className="card p-4 space-y-3">
        <div className="w-40 h-4 rounded bg-bg-surface" />
        <div className="w-full h-3 rounded-full bg-bg-surface" />
        <div className="w-full h-10 rounded-xl bg-bg-surface" />
      </div>
    </div>
  );
}
