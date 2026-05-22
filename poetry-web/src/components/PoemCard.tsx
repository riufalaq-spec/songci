import { parseParagraphs } from '../utils/paragraphs'

interface PoemCardProps {
  id: number
  author: string
  rhythmic: string
  paragraphs: string
  source?: string
  onClick?: () => void
}

export default function PoemCard({ author, rhythmic, paragraphs, onClick }: PoemCardProps) {
  const lines = parseParagraphs(paragraphs)

  return (
    <div
      onClick={onClick}
      className="bg-surface-card border border-border-subtle rounded p-4 cursor-pointer hover:shadow-sm hover:border-accent-red/20 transition-all group"
    >
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="font-heading text-base text-accent-red">
          {rhythmic}
        </h3>
        <span className="text-text-secondary/40">·</span>
        <span className="font-body text-sm text-text-secondary">{author}</span>
      </div>
      <p className="font-body text-sm text-text-secondary leading-relaxed line-clamp-2">
        {lines.slice(0, 2).join(' / ')}
      </p>
    </div>
  )
}
