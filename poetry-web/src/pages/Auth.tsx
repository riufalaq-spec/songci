import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, forgotPassword, sendCode } from '../api'
import { useAuthStore } from '../store/auth'
import Toast from '../components/Toast'

type TabType = 'login' | 'register' | 'forgot'

export default function Auth() {
  const [tab, setTab] = useState<TabType>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setCode('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res: any = await login(email, password)
      setAuth(res.data.token, res.data.user)
      setToast({ message: '登录成功', type: 'success' })
      setTimeout(() => navigate('/'), 500)
    } catch (err: any) {
      setToast({ message: err?.message || '登录失败', type: 'error' })
    }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setToast({ message: '两次密码不一致', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      setToast({ message: '注册成功，请登录', type: 'success' })
      setTab('login')
      resetForm()
    } catch (err: any) {
      setToast({ message: err?.message || '注册失败', type: 'error' })
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setToast({ message: '两次密码不一致', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email, code, password)
      setToast({ message: '密码重置成功，请登录', type: 'success' })
      setTab('login')
      resetForm()
    } catch (err: any) {
      setToast({ message: err?.message || '重置失败', type: 'error' })
    }
    setLoading(false)
  }

  const handleSendCode = async () => {
    if (!email) {
      setToast({ message: '请先输入邮箱', type: 'error' })
      return
    }
    try {
      const purpose = tab === 'register' ? 'register' : 'reset'
      const res: any = await sendCode(email, purpose)
      setToast({ message: `验证码已发送: ${res.data.code}`, type: 'success' })
    } catch (err: any) {
      setToast({ message: err?.message || '发送失败', type: 'error' })
    }
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'login', label: '登录' },
    { key: 'register', label: '注册' },
    { key: 'forgot', label: '忘记密码' },
  ]

  return (
    <div className="min-h-screen bg-bg-paper">
      {/* Nav */}
      <nav className="w-full px-20 py-5 flex items-center justify-between">
        <span
          onClick={() => navigate('/')}
          className="font-heading text-2xl text-text-primary tracking-[4px] cursor-pointer"
        >
          宋词别苑
        </span>
        <div className="flex items-center gap-8">
          <span
            onClick={() => navigate('/')}
            className="font-body text-[15px] text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
          >
            首页
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-20">
        <div className="w-[420px] bg-surface-card rounded-lg border border-border-subtle shadow-[0_4px_16px_#0000000D] p-10">
          <h1 className="font-heading text-2xl text-text-primary tracking-[4px] text-center mb-7">
            账号中心
          </h1>

          {/* Tabs */}
          <div className="flex justify-center gap-1 mb-7">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); resetForm() }}
                className={`px-4 py-2 font-body text-sm transition-colors ${
                  tab === t.key
                    ? 'text-accent-red border-b-2 border-accent-red'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-border-subtle mb-7" />

          {/* Forms */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  required
                  className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    required
                    className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTab('forgot')}
                className="text-accent-red font-body text-[13px] hover:underline self-start"
              >
                忘记密码？
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-accent-red text-text-inverse font-heading text-base tracking-[4px] rounded hover:bg-accent-red/90 transition-colors disabled:opacity-50"
              >
                {loading ? '登录中...' : '登 录'}
              </button>
              <div className="flex items-center justify-center gap-1">
                <span className="font-body text-[13px] text-text-secondary">还没有账号？</span>
                <button
                  type="button"
                  onClick={() => { setTab('register'); resetForm() }}
                  className="font-body text-[13px] text-accent-red hover:underline"
                >
                  立即注册
                </button>
              </div>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  required
                  className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（至少6位）"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  required
                  className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-accent-red text-text-inverse font-heading text-base tracking-[4px] rounded hover:bg-accent-red/90 transition-colors disabled:opacity-50"
              >
                {loading ? '注册中...' : '注 册'}
              </button>
              <div className="flex items-center justify-center gap-1">
                <span className="font-body text-[13px] text-text-secondary">已有账号？</span>
                <button
                  type="button"
                  onClick={() => { setTab('login'); resetForm() }}
                  className="font-body text-[13px] text-accent-red hover:underline"
                >
                  立即登录
                </button>
              </div>
            </form>
          )}

          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">注册邮箱</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入注册邮箱"
                    required
                    className="flex-1 px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="px-4 py-3 bg-accent-red-light text-accent-red rounded text-sm font-body hover:bg-accent-red/10 transition-colors whitespace-nowrap"
                  >
                    发送验证码
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  required
                  className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">新密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] text-text-primary">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  required
                  className="w-full px-4 py-3 bg-bg-paper border border-border-subtle rounded text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-accent-red text-text-inverse font-heading text-base tracking-[4px] rounded hover:bg-accent-red/90 transition-colors disabled:opacity-50"
              >
                {loading ? '重置中...' : '重置密码'}
              </button>
              <div className="flex items-center justify-center gap-1">
                <span className="font-body text-[13px] text-text-secondary">想起密码了？</span>
                <button
                  type="button"
                  onClick={() => { setTab('login'); resetForm() }}
                  className="font-body text-[13px] text-accent-red hover:underline"
                >
                  返回登录
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full py-4 text-center">
        <p className="font-caption text-xs text-text-secondary tracking-[1px]">
          数据来源：chinese-poetry 开放数据集  ·  宋词别苑 © 2026
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
