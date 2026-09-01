export default function ClubsLoading() {
  return (
    <div className="px-4 pt-4 pb-16 space-y-4 animate-pulse">
      {/* Header */}
      <div className="space-y-1 mb-2">
        <div className="w-24 h-2.5 rounded bg-bg-surface" />
        <div className="w-48 h-5 rounded bg-bg-surface" />
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="card p-3.5 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-bg-surface" />
            <div className="w-20 h-3 rounded bg-bg-surface" />
            <div className="w-12 h-2.5 rounded bg-bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
