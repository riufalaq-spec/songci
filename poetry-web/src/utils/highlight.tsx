import { ReactNode } from 'react'

export function highlight(text: string, query: string): ReactNode[] {
  if (!query.trim() || !text) return [text]
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-accent-red font-semibold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}
