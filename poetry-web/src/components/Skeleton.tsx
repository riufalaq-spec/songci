export default function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface-card border border-border-subtle rounded-lg p-5 animate-pulse">
          <div className="h-4 bg-accent-red-light rounded w-1/4 mb-3" />
          <div className="h-3 bg-border-subtle rounded w-full mb-2" />
          <div className="h-3 bg-border-subtle rounded w-4/5 mb-2" />
          <div className="h-3 bg-border-subtle rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}
