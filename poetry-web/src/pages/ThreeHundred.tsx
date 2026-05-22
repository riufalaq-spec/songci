import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getThreeHundred } from '../api'
import PoemCard from '../components/PoemCard'
import PoemDetailDialog from '../components/PoemDetailDialog'
import Skeleton from '../components/Skeleton'

interface Poem {
  id: number
  author: string
  rhythmic: string
  paragraphs: string
  source: string
}

export default function ThreeHundred() {
  const [searchParams] = useSearchParams()
  const [poems, setPoems] = useState<Poem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [author, setAuthor] = useState('')
  const [rhythmicFilter, setRhythmicFilter] = useState(searchParams.get('rhythmic') || '')
  const [loading, setLoading] = useState(true)
  const [selectedPoem, setSelectedPoem] = useState<{ id: number; source: string } | null>(null)

  useEffect(() => {
    const r = searchParams.get('rhythmic')
    if (r) setRhythmicFilter(r)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    getThreeHundred({ page, page_size: 20, author: author || undefined })
      .then((res: any) => {
        const allPoems = res.data.poems || []
        if (rhythmicFilter) {
          const filtered = allPoems.filter((p: Poem) =>
            p.rhythmic.toLowerCase().includes(rhythmicFilter.toLowerCase())
          )
          setPoems(filtered)
          setTotal(filtered.length)
        } else {
          setPoems(allPoems)
          setTotal(res.data.total || 0)
        }
      })
      .finally(() => setLoading(false))
  }, [page, author, rhythmicFilter])

  return (
    <div className="px-20">
      {/* Header */}
      <div className="py-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-[28px] text-text-primary tracking-[4px]">
            宋词三百首 · 经典留传
          </h1>
          {rhythmicFilter && (
            <button
              onClick={() => { setRhythmicFilter(''); setPage(1) }}
              className="flex items-center gap-1 px-3 py-1 bg-accent-red-light text-accent-red text-sm font-body rounded hover:bg-accent-red/10 transition-colors"
            >
              {rhythmicFilter}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="font-body text-sm text-text-secondary tracking-[2px] mt-2">
          精选经典，品味千年词韵
        </p>
      </div>


      {/* Content */}
      <div className="py-6">
        {loading ? (
          <Skeleton count={6} />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {Array.from({ length: Math.ceil(poems.length / 3) }, (_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4">
                  {poems.slice(rowIdx * 3, rowIdx * 3 + 3).map((poem) => (
                    <div key={poem.id} className="flex-1">
                      <PoemCard
                        {...poem}
                        onClick={() => setSelectedPoem({ id: poem.id, source: 'three_hundred_poems' })}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {poems.length === 0 && (
              <div className="text-center py-16 text-text-secondary font-body">
                未找到匹配「{rhythmicFilter}」的词作
              </div>
            )}

            {total > 20 && !rhythmicFilter && (
              <div className="flex justify-center gap-2 mt-7">
                {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) < 3 || p === 1 || p === Math.ceil(total / 20))
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-text-secondary/40">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded text-sm font-caption transition-colors ${p === page
                          ? 'bg-accent-red text-text-inverse'
                          : 'text-text-secondary hover:bg-accent-red-light'
                          }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedPoem && (
        <PoemDetailDialog
          poemId={selectedPoem.id}
          source={selectedPoem.source}
          onClose={() => setSelectedPoem(null)}
        />
      )}
    </div>
  )
}
