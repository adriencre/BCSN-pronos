export default function ClassementLoading() {
  return (
    <div className="px-4 pt-4 pb-16 space-y-4 animate-pulse">
      {/* Title */}
      <div className="flex justify-between items-center mb-2">
        <div className="space-y-1">
          <div className="w-24 h-2.5 rounded bg-bg-surface" />
          <div className="w-36 h-5 rounded bg-bg-surface" />
        </div>
        <div className="w-24 h-6 rounded-full bg-bg-surface" />
      </div>

      {/* Podium Skeleton */}
      <div className="card-elevated p-5 space-y-4">
        <div className="w-36 h-3 rounded bg-bg-surface mx-auto" />
        <div className="grid grid-cols-3 gap-2 items-end pt-8 pb-2">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-surface" />
            <div className="w-14 h-3 rounded bg-bg-surface" />
            <div className="w-full h-16 rounded-t-xl bg-bg-surface" />
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-bg-surface" />
            <div className="w-16 h-3 rounded bg-bg-surface" />
            <div className="w-full h-24 rounded-t-xl bg-bg-surface" />
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-surface" />
            <div className="w-14 h-3 rounded bg-bg-surface" />
            <div className="w-full h-12 rounded-t-xl bg-bg-surface" />
          </div>
        </div>
      </div>

      {/* Leaderboard rows */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-4 rounded bg-bg-surface" />
              <div className="w-8 h-8 rounded-xl bg-bg-surface" />
              <div className="w-28 h-3 rounded bg-bg-surface" />
            </div>
            <div className="w-12 h-5 rounded bg-bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
