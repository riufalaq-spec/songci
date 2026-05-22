import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchPopover, { SearchPopoverHandle } from '../components/SearchPopover'
import PoemDetailDialog from '../components/PoemDetailDialog'
import { getDailyQuote } from '../api'

interface DailyQuote {
  quote: string
  author: string
  rhythmic: string
}

const DEFAULT_QUOTE: DailyQuote = {
  quote: '明月几时有？把酒问青天。',
  author: '苏轼',
  rhythmic: '水调歌头',
}

export default function Home() {
  const navigate = useNavigate()
  const [selectedPoem, setSelectedPoem] = useState<{ id: number; source: string } | null>(null)
  const [dailyQuote, setDailyQuote] = useState<DailyQuote>(DEFAULT_QUOTE)
  const searchRef = useRef<SearchPopoverHandle>(null)

  useEffect(() => {
    getDailyQuote()
      .then((res: any) => {
        if (res.data?.quote) setDailyQuote(res.data)
      })
      .catch(() => {})
  }, [])

  const fillSearch = (value: string) => {
    searchRef.current?.setQuery(value)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-20">
      {/* Poem Quote Display */}
      <div className="flex items-center gap-10 mb-12">
        <div className="w-px h-[120px] bg-border-subtle" />
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-heading text-[36px] text-text-primary tracking-[6px]">
            {dailyQuote.quote}
          </h2>
          <p className="font-body text-base text-text-secondary tracking-[2px]">
            —— {dailyQuote.author}《{dailyQuote.rhythmic}》
          </p>
        </div>
        <div className="w-px h-[120px] bg-border-subtle" />
      </div>

      {/* Search */}
      <SearchPopover
        ref={searchRef}
        onSelect={(poem) => setSelectedPoem({ id: poem.id, source: poem.source })}
      />

      {/* Quick Tags */}
      <div className="w-[560px] flex flex-col gap-4 mt-8">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-caption text-xs text-text-secondary tracking-[1px]">推荐词牌</span>
          {['水调歌头', '声声慢', '念奴娇', '满江红', '雨霖铃'].map((tag) => (
            <span
              key={tag}
              onClick={() => fillSearch(tag)}
              className="px-4 py-1.5 bg-surface-card border border-border-subtle rounded text-sm text-text-secondary cursor-pointer hover:text-accent-red hover:border-accent-red/30 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-caption text-xs text-text-secondary tracking-[1px]">名家</span>
          {['苏轼', '李清照', '辛弃疾', '柳永', '陆游'].map((tag) => (
            <span
              key={tag}
              onClick={() => fillSearch(tag)}
              className="px-4 py-1.5 bg-surface-card border border-border-subtle rounded text-sm text-text-secondary cursor-pointer hover:text-accent-red hover:border-accent-red/30 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Featured 300 Banner */}
      <button
        onClick={() => navigate('/three-hundred')}
        className="w-[560px] mt-6 bg-accent-red rounded p-5 flex items-center justify-between
                   hover:bg-accent-red/90 transition-colors group"
      >
        <div className="flex flex-col gap-1">
          <span className="font-heading text-xl text-text-inverse tracking-[2px]">
            《宋词三百首》
          </span>
          <span className="font-body text-sm text-text-inverse/80">
            精选经典，品味千年词韵
          </span>
        </div>
        <svg className="w-6 h-6 text-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Decorative Mountains - Left */}
      <div className="fixed bottom-0 left-[60px] w-[180px] h-[180px] opacity-15 pointer-events-none">
        <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 180q35-90 70-60 35-75 70-20 20-35 40 80z" fill="#6B7280" opacity="0.5"/>
          <path d="M10 180q35-80 70-50 35-75 70-25 20-30 30 75z" fill="#2C3539"/>
        </svg>
      </div>
      {/* Decorative Mountains - Right */}
      <div className="fixed bottom-0 right-[60px] w-[180px] h-[180px] opacity-15 pointer-events-none">
        <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 180q45-100 90-65 35-65 70-20 15-25 20 85z" fill="#6B7280" opacity="0.5"/>
          <path d="M0 180q40-85 75-55 35-70 70-25 20-25 35 80z" fill="#2C3539"/>
        </svg>
      </div>
      {/* Cloud - Left */}
      <div className="fixed bottom-[130px] left-[200px] w-[120px] h-[16px] opacity-20 pointer-events-none">
        <svg viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 8q20-6 40 0 20-6 40 0 20-6 40 0" fill="none" stroke="#6B7280" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>
      {/* Cloud - Right */}
      <div className="fixed bottom-[130px] right-[200px] w-[120px] h-[16px] opacity-20 pointer-events-none">
        <svg viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 8q20-6 40 0 20-6 40 0 20-6 40 0" fill="none" stroke="#6B7280" strokeWidth="1" strokeLinecap="round"/>
        </svg>
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
