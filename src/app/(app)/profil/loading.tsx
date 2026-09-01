export default function ProfilLoading() {
  return (
    <div className="px-4 pt-4 pb-16 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="space-y-1">
          <div className="w-20 h-2.5 rounded bg-bg-surface" />
          <div className="w-40 h-5 rounded bg-bg-surface" />
        </div>
        <div className="w-24 h-7 rounded-xl bg-bg-surface" />
      </div>

      {/* VIP Card Skeleton */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-bg-surface shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-20 h-4 rounded bg-bg-surface" />
            <div className="w-32 h-6 rounded bg-bg-surface" />
            <div className="w-24 h-3 rounded bg-bg-surface" />
          </div>
        </div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-2 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-bg-surface shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="w-16 h-2.5 rounded bg-bg-surface" />
              <div className="w-12 h-4 rounded bg-bg-surface" />
            </div>
          </div>
        ))}
      </div>

      {/* Trophy Cabinet Skeleton */}
      <div className="card p-4 space-y-3">
        <div className="w-36 h-3 rounded bg-bg-surface" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-2xl bg-bg-surface flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-card shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="w-28 h-3 rounded bg-bg-card" />
                <div className="w-36 h-2 rounded bg-bg-card" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
