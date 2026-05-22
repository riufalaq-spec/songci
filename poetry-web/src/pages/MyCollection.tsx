import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavorites, getLikes, getHistory } from '../api'
import { useAuthStore } from '../store/auth'
import PoemCard from '../components/PoemCard'
import PoemDetailDialog from '../components/PoemDetailDialog'
import Skeleton from '../components/Skeleton'

type Tab = 'favorites' | 'likes' | 'history'

interface Poem {
  id: number
  author: string
  rhythmic: string
  paragraphs: string
  source: string
}

export default function MyCollection() {
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  if (!isLoggedIn()) {
    return (
      <div className="px-20">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-6">
          <div className="w-[60px] h-[2px] bg-border-subtle" />
          <h2 className="font-heading text-2xl text-text-primary tracking-[4px]">
            「 私家雅集，暂未开启 」
          </h2>
          <p className="font-body text-base text-text-secondary tracking-[2px]">
            登录后可收藏与点赞您钟爱的词作
          </p>
          <div className="w-[60px] h-[2px] bg-border-subtle" />
          <button
            onClick={() => navigate('/auth')}
            className="bg-accent-red text-text-inverse font-heading text-base tracking-[2px] rounded px-10 py-3.5 hover:bg-accent-red/90 transition-colors"
          >
            即刻登录
          </button>
        </div>
      </div>
    )
  }

  return <CollectionContent />
}

function CollectionContent() {
  const [tab, setTab] = useState<Tab>('favorites')
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPoem, setSelectedPoem] = useState<{ id: number; source: string } | null>(null)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'favorites', label: '我收藏的词' },
    { key: 'likes', label: '我点赞的词' },
    { key: 'history', label: '寻踪足迹' },
  ]

  useEffect(() => {
    setLoading(true)
    const fetcher = tab === 'favorites' ? getFavorites : tab === 'likes' ? getLikes : getHistory
    fetcher()
      .then((res: any) => setPoems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPoems([]))
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div className="px-20">
      {/* Title */}
      <div className="py-4">
        <h1 className="font-heading text-[28px] text-text-primary tracking-[4px]">我的雅集</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <div
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-col gap-2 px-5 py-3 cursor-pointer transition-colors ${
              tab === t.key ? 'bg-accent-red-light/50' : 'hover:bg-bg-paper'
            }`}
          >
            <span className={`font-body text-[15px] ${tab === t.key ? 'text-accent-red' : 'text-text-secondary'}`}>
              {t.label}
            </span>
            {tab === t.key && (
              <div className="w-[60px] h-[2px] bg-accent-red rounded" />
            )}
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-border-subtle" />

      {/* Content */}
      <div className="py-6">
        {loading ? (
          <Skeleton count={3} />
        ) : poems.length === 0 ? (
          <div className="text-center py-16 text-text-secondary font-body">
            {tab === 'favorites' && '暂无收藏，去发现好词吧'}
            {tab === 'likes' && '暂无点赞，去为好词点个赞吧'}
            {tab === 'history' && '暂无浏览记录'}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Array.from({ length: Math.ceil(poems.length / 3) }, (_, rowIdx) => (
              <div key={rowIdx} className="flex gap-4">
                {poems.slice(rowIdx * 3, rowIdx * 3 + 3).map((poem) => (
                  <div key={`${poem.source}-${poem.id}`} className="flex-1">
                    <PoemCard
                      {...poem}
                      onClick={() => setSelectedPoem({ id: poem.id, source: poem.source })}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
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
