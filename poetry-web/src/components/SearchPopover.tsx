import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchPoetry } from '../api'
import { highlight } from '../utils/highlight'
import { parseParagraphs } from '../utils/paragraphs'

interface SearchResult {
  poets: { id: number; name: string; short_description: string }[]
  poems: { id: number; author: string; rhythmic: string; paragraphs: string; source: string }[]
  rhythmic: string[]
}

export interface SearchPopoverHandle {
  setQuery: (q: string) => void
}

const SearchPopover = forwardRef<SearchPopoverHandle, { onSelect?: (poem: any) => void }>(
  ({ onSelect }, ref) => {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<SearchResult | null>(null)
    const [open, setOpen] = useState(false)
    const timerRef = useRef<number>()
    const containerRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useImperativeHandle(ref, () => ({ setQuery }))

    useEffect(() => {
      if (!query.trim()) {
        setResult(null)
        setOpen(false)
        return
      }
      clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(async () => {
        try {
          const res: any = await searchPoetry(query)
          setResult(res.data)
          setOpen(true)
        } catch {
          setResult(null)
        }
      }, 300)
      return () => clearTimeout(timerRef.current)
    }, [query])

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const hasResult = result && (result.poets.length > 0 || result.poems.length > 0)

    return (
      <div ref={containerRef} className="relative w-[560px]">
        <div className="flex items-center gap-3 bg-surface-card border border-border-subtle rounded px-6 py-3.5">
          <svg className="w-5 h-5 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hasResult && setOpen(true)}
            placeholder="输入关键词、诗人或词牌名..."
            className="flex-1 bg-transparent outline-none font-body text-base text-text-primary placeholder:text-text-secondary"
          />
        </div>

        {open && hasResult && (
          <div className="absolute top-full mt-2 w-full bg-surface-card rounded border border-border-subtle shadow-xl overflow-y-auto max-h-[450px] z-50">
            {result.poets.length > 0 && (
              <div className="sticky top-0 z-10 bg-surface-card border-b border-border-subtle">
                <div className="p-4 pb-2">
                  <h4 className="font-caption text-xs text-text-secondary tracking-[1px] mb-2">相关词人</h4>
                  {result.poets.map((p) => (
                    <div
                      key={p.id}
                      className="px-3 py-2 hover:bg-bg-paper rounded cursor-pointer transition-colors"
                      onClick={() => {
                        navigate(`/poets?id=${p.id}`)
                        setOpen(false)
                      }}
                    >
                      <span className="font-body font-semibold text-text-primary">{highlight(p.name, query)}</span>
                      {p.short_description && (
                        <span className="ml-2 text-sm text-text-secondary">{p.short_description.slice(0, 50)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.poems.length > 0 && (
              <div className="sticky top-0 z-10 bg-surface-card">
                <div className="p-4">
                  <h4 className="font-caption text-xs text-text-secondary tracking-[1px] mb-2">相关词作</h4>
                  {result.poems.map((p) => (
                    <div
                      key={`${p.source}-${p.id}`}
                      className="px-3 py-2 hover:bg-bg-paper rounded cursor-pointer transition-colors"
                      onClick={() => {
                        if (onSelect) {
                          onSelect(p)
                        } else {
                          navigate(`/three-hundred?poem_id=${p.id}&source=${p.source}`)
                        }
                        setOpen(false)
                      }}
                    >
                      <span className="text-accent-red font-semibold">{highlight(p.rhythmic, query)}</span>
                      <span className="mx-2 text-text-secondary/40">·</span>
                      <span className="text-text-secondary">{highlight(p.author, query)}</span>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                        {highlight(parseParagraphs(p.paragraphs).join(' / ').slice(0, 60), query)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

SearchPopover.displayName = 'SearchPopover'
export default SearchPopover
