import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/auth'

const navItems = [
  { path: '/', label: '首页' },
  { path: '/three-hundred', label: '宋词三百首' },
  { path: '/poets', label: '文人墨客' },
  { path: '/my-collection', label: '我的雅集' },
]

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY < 10) {
        setNavVisible(true)
      } else if (currentY > lastScrollY.current) {
        setNavVisible(false)
      } else {
        setNavVisible(true)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-bg-paper">
      <nav className={`w-full px-20 py-5 flex items-center justify-between sticky top-0 bg-bg-paper/95 backdrop-blur-sm z-50 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <Link to="/" className="font-heading text-2xl text-text-primary tracking-[4px]">
          宋词别苑
        </Link>
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-body text-[15px] transition-colors ${location.pathname === item.path
                  ? 'text-accent-red'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              {item.label}
            </Link>
          ))}
          {/* {user ? (
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm text-text-secondary">{user.nickname || user.email}</span>
              <button
                onClick={logout}
                className="text-xs text-text-secondary hover:text-accent-red transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-accent-red font-body text-[15px] hover:opacity-80 transition-opacity"
            >
              登录
            </Link>
          )} */}
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="w-full py-4 text-center">
        <p className="font-caption text-xs text-text-secondary tracking-[1px]">
          数据来源：chinese-poetry 开放数据集  ·  宋词别苑 © 2026
        </p>
      </footer>
    </div>
  )
}
