import { ReactNode } from 'react'
import { useAuthStore } from '../store/auth'
import { useNavigate } from 'react-router-dom'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  if (!isLoggedIn()) {
    return (
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
    )
  }

  return <>{children}</>
}
