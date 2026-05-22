interface PoetCardProps {
  id: number
  name: string
  short_description?: string
  onClick?: () => void
}

export default function PoetCard({ name, short_description, onClick }: PoetCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-surface-card border border-border-subtle rounded-lg p-5 cursor-pointer
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="w-16 h-16 rounded-full bg-accent-red-light flex items-center justify-center mb-3">
        <span className="text-2xl font-heading text-accent-red/60">{name[0]}</span>
      </div>
      <h3 className="font-heading text-lg text-text-primary group-hover:text-accent-red transition-colors">{name}</h3>
      {short_description && (
        <p className="font-body text-sm text-text-secondary mt-2 line-clamp-2">{short_description}</p>
      )}
    </div>
  )
}
