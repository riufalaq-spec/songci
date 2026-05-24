import { useEffect, useState, useRef } from 'react'
import { getPoemDetail, toggleLike, toggleFavorite, addHistory } from '../api'
import { useAuthStore } from '../store/auth'
import { parseParagraphs } from '../utils/paragraphs'

interface PoemDetailDialogProps {
  poemId: number
  source: string
  onClose: () => void
}

interface PoemDetail {
  id: number
  author: string
  rhythmic: string
  paragraphs: string
  source: string
  like_count: number
  is_liked: boolean
  is_favorited: boolean
}

export default function PoemDetailDialog({ poemId, source, onClose }: PoemDetailDialogProps) {
  const [poem, setPoem] = useState<PoemDetail | null>(null)
  const [vertical, setVertical] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isLoggedIn } = useAuthStore()
  const historySent = useRef(false)

  useEffect(() => {
    setLoading(true)
    getPoemDetail(poemId, source)
      .then((res: any) => {
        setPoem(res.data)
        if (isLoggedIn() && !historySent.current) {
          historySent.current = true
          addHistory(poemId, source).catch(() => { })
        }
      })
      .finally(() => setLoading(false))
  }, [poemId, source])

  // Lock body scroll when dialog is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const refreshPoem = async () => {
    try {
      const res: any = await getPoemDetail(poemId, source)
      setPoem(res.data)
    } catch { }
  }

  const handleLike = async () => {
    if (!isLoggedIn()) return
    try {
      await toggleLike(poemId, source)
      await refreshPoem()
    } catch { }
  }

  const handleFavorite = async () => {
    if (!isLoggedIn()) return
    try {
      await toggleFavorite(poemId, source)
      await refreshPoem()
    } catch { }
  }

  const paragraphs = parseParagraphs(poem?.paragraphs)

  return (
    <div className="fixed inset-0 z-50 bg-bg-paper">
      {/* Top bar */}
      <div className="w-full h-[60px] px-20 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-body text-sm">返回词库</span>
        </button>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setVertical(false)}
            className={`font-body text-sm transition-colors ${!vertical ? 'text-accent-red' : 'text-text-secondary hover:text-text-primary'}`}
          >
            横排
          </button>
          <button
            onClick={() => setVertical(true)}
            className={`font-body text-sm transition-colors ${vertical ? 'text-accent-red' : 'text-text-secondary hover:text-text-primary'}`}
          >
            竖排
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center overflow-y-auto px-20" style={{ height: 'calc(100vh - 120px)' }}>
        {loading ? (
          <div className="text-center text-text-secondary">加载中...</div>
        ) : poem ? (
          <div className="relative h-full">
            {vertical ? (
              /* Vertical Layout */
              <div className="flex gap-10">
                {/* Floating Toolbar */}
                <div className="flex flex-col items-center justify-center gap-5 bg-[#2C3539CC] rounded-3xl py-5 px-0 w-12 h-[220px]">
                  <button
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1"
                  >
                    <svg className={`w-5 h-5 ${poem.is_liked ? 'text-accent-red' : 'text-text-inverse'}`} fill={poem.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-caption text-[10px] text-text-inverse/80">{poem.like_count}</span>
                  </button>
                  <div className="w-5 h-px bg-white/30" />
                  <button
                    onClick={handleFavorite}
                    className="flex flex-col items-center gap-1"
                  >
                    <svg className={`w-5 h-5 ${poem.is_favorited ? 'text-accent-red' : 'text-text-inverse'}`} fill={poem.is_favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="font-caption text-[10px] text-text-inverse/80">收藏</span>
                  </button>
                  <div className="w-5 h-px bg-white/30" />
                  <button className="flex flex-col items-center gap-1">
                    <svg className="w-5 h-5 text-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="font-caption text-[10px] text-text-inverse/80">分享</span>
                  </button>
                </div>

                {/* Scroll Card */}
                <div className="bg-surface-card border border-border-subtle rounded-lg px-14 py-10 h-[760px] w-[1120px] flex">
                  {/* Left panel - vertical text */}
                  <div className="writing-vertical flex items-center justify-center h-full overflow-x-auto pr-8">
                    <div className="flex gap-6">
                      {paragraphs.map((line, i) => (
                        <span key={i} className="font-heading text-xl text-text-primary tracking-[4px]" style={{ lineHeight: 2 }}>
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-border-subtle h-full mx-8" />

                  {/* Right panel - info */}
                  <div className="flex flex-col justify-center gap-6 h-full">
                    <div className="flex flex-col gap-2">
                      <h1 className="font-heading text-[32px] text-text-primary tracking-[8px]">
                        {poem.rhythmic}
                      </h1>
                      <span className="font-body text-base text-text-secondary tracking-[2px]">
                        {poem.author}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Horizontal Layout - Scroll Card */
              <div className="bg-surface-card border border-border-subtle rounded-lg px-14 py-10 w-[680px]">
                {/* Top border */}
                <div className="w-full h-px bg-border-subtle mb-5" />

                {/* Title */}
                <div className="flex flex-col items-center gap-2 mb-7">
                  <h1 className="font-heading text-[32px] text-text-primary tracking-[8px]">
                    {poem.rhythmic}
                  </h1>
                  <span className="font-body text-base text-text-secondary tracking-[2px]">
                    {poem.author}
                  </span>
                </div>

                {/* Spacer */}
                <div className="h-7" />

                {/* Poem text */}
                <div className="flex flex-col items-center gap-[18px]">
                  {paragraphs.map((line, i) => (
                    <p key={i} className="font-heading text-xl text-text-primary tracking-[4px]" style={{ lineHeight: 2 }}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Spacer */}
                <div className="h-7" />

                {/* Bottom border */}
                <div className="w-full h-px bg-border-subtle" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-text-secondary">未找到词作</div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="w-full h-[60px] flex items-center justify-center gap-12">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-red transition-colors"
          >
            <svg className={`w-5 h-5 ${poem?.is_liked ? 'text-accent-red' : ''}`} fill={poem?.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-caption text-sm">{poem?.like_count || 0}</span>
          </button>
          <button
            onClick={handleFavorite}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-red transition-colors"
          >
            <svg className={`w-5 h-5 ${poem?.is_favorited ? 'text-accent-red' : ''}`} fill={poem?.is_favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="font-caption text-sm">{poem?.is_favorited ? '已收藏' : '收藏'}</span>
          </button>
          <button className="flex items-center gap-2 text-text-secondary hover:text-accent-red transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="font-caption text-sm">分享</span>
          </button>
        </div>
      </div>
    </div>
  )
}
