import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPoetList, getPoetDetail } from '../api'
import PoetCard from '../components/PoetCard'
import PoemCard from '../components/PoemCard'
import PoemDetailDialog from '../components/PoemDetailDialog'
import Skeleton from '../components/Skeleton'

interface Author {
  id: number
  name: string
  short_description: string
  description: string
}

interface Poem {
  id: number
  author: string
  rhythmic: string
  paragraphs: string
  source: string
}

export default function Poets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [authors, setAuthors] = useState<Author[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)
  const [authorPoems, setAuthorPoems] = useState<Poem[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedPoem, setSelectedPoem] = useState<{ id: number; source: string } | null>(null)
  const [poemFilter, setPoemFilter] = useState('')
  const scrollPosRef = useRef(0)
  const searchRef = useRef('')

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      loadPoetDetail(Number(id))
    }
  }, [])

  useEffect(() => {
    if (selectedAuthor) return
    setLoading(true)
    getPoetList(search || undefined)
      .then((res: any) => setAuthors(res.data || []))
      .finally(() => setLoading(false))
  }, [search, selectedAuthor])

  const loadPoetDetail = async (id: number) => {
    setDetailLoading(true)
    try {
      const res: any = await getPoetDetail(id)
      setSelectedAuthor(res.data.author)
      setAuthorPoems(res.data.poems || [])
    } catch { }
    setDetailLoading(false)
  }

  const handlePoetClick = (author: Author) => {
    scrollPosRef.current = window.scrollY
    searchRef.current = search
    setPoemFilter('')
    loadPoetDetail(author.id)
    setSearchParams({ id: String(author.id) })
  }

  const handleBack = () => {
    setSelectedAuthor(null)
    setAuthorPoems([])
    setPoemFilter('')
    setSearch(searchRef.current)
    setSearchParams({})
    setTimeout(() => window.scrollTo(0, scrollPosRef.current), 0)
  }

  const filteredPoems = authorPoems.filter(
    (p) => !poemFilter || p.rhythmic.includes(poemFilter) || p.paragraphs.includes(poemFilter)
  )

  if (selectedAuthor) {
    return (
      <div className="px-20">
        {/* Back button */}
        <div className="py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-red transition-colors font-body text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
        </div>

        {detailLoading ? (
          <Skeleton count={3} />
        ) : (
          <div className="flex gap-10">
            {/* Sidebar */}
            <div className="w-[400px] flex-shrink-0">
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="w-20 h-20 rounded-full bg-accent-red-light flex items-center justify-center">
                  <span className="text-3xl font-heading text-accent-red/60">{selectedAuthor.name[0]}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h2 className="font-heading text-2xl text-text-primary">{selectedAuthor.name}</h2>
                  <span className="font-body text-sm text-text-secondary">
                    {selectedAuthor.description ? '宋代词人' : ''}
                  </span>
                </div>

                <div className="w-full">
                  <h3 className="font-heading text-base text-text-primary mb-3">生平简介</h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    {selectedAuthor.description || selectedAuthor.short_description || '暂无简介'}
                  </p>
                </div>
              </div>
            </div>

            {/* Works */}
            <div className="flex-1 py-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg text-text-primary">
                  作品归档
                  <span className="font-body text-sm text-text-secondary ml-2">({filteredPoems.length}首)</span>
                </h3>
                <div className="flex items-center gap-2 bg-surface-card border border-border-subtle rounded px-3 py-1.5">
                  <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={poemFilter}
                    onChange={(e) => setPoemFilter(e.target.value)}
                    placeholder="筛选作品..."
                    className="bg-transparent outline-none font-body text-xs text-text-primary placeholder:text-text-secondary w-32"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {Array.from({ length: Math.ceil(filteredPoems.length / 2) }, (_, rowIdx) => (
                  <div key={rowIdx} className="flex gap-4">
                    {filteredPoems.slice(rowIdx * 2, rowIdx * 2 + 2).map((poem) => (
                      <div key={poem.id} className="flex-1">
                        <PoemCard
                          {...poem}
                          onClick={() => setSelectedPoem({ id: poem.id, source: 'poems' })}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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

  return (
    <div className="px-20">
      {/* Search bar */}
      <div className="py-4">
        <div className="flex items-center gap-3 bg-surface-card border border-border-subtle rounded-md px-5 py-3">
          <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索诗人..."
            className="flex-1 bg-transparent outline-none font-body text-sm text-text-primary placeholder:text-text-secondary"
          />
        </div>
      </div>

      {/* Section title */}
      <div className="py-4">
        <h2 className="font-heading text-xl text-text-primary tracking-[2px]">常见诗人</h2>
      </div>

      {/* Poet grid */}
      {loading ? (
        <Skeleton count={8} />
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from({ length: Math.ceil(authors.length / 4) }, (_, rowIdx) => (
            <div key={rowIdx} className="flex gap-4">
              {authors.slice(rowIdx * 4, rowIdx * 4 + 4).map((author) => (
                <div key={author.id} className="flex-1">
                  <PoetCard
                    {...author}
                    onClick={() => handlePoetClick(author)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
