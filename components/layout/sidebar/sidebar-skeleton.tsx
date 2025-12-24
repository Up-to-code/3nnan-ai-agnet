export function SidebarSkeleton() {
  return (
    <div className="space-y-6 pb-4 animate-in fade-in">
      {/* Today Group Skeleton */}
      <div className="space-y-1">
        <div className="h-3 w-16 bg-muted/50 rounded mx-2 mb-2 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full rounded-lg p-3">
            <div className="h-4 w-full bg-muted/50 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          </div>
        ))}
      </div>

      {/* Yesterday Group Skeleton */}
      <div className="space-y-1">
        <div className="h-3 w-20 bg-muted/50 rounded mx-2 mb-2 animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="w-full rounded-lg p-3">
            <div className="h-4 w-full bg-muted/50 rounded animate-pulse" style={{ animationDelay: `${(i + 3) * 100}ms` }} />
          </div>
        ))}
      </div>

      {/* Last Week Group Skeleton */}
      <div className="space-y-1">
        <div className="h-3 w-24 bg-muted/50 rounded mx-2 mb-2 animate-pulse" />
        {[1].map((i) => (
          <div key={i} className="w-full rounded-lg p-3">
            <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" style={{ animationDelay: `${(i + 5) * 100}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

