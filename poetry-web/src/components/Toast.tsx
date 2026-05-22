import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'error', onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded shadow-lg transition-all duration-300 font-body text-sm ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${type === 'error' ? 'bg-accent-red text-text-inverse' : 'bg-green-600 text-white'}`}
    >
      {message}
    </div>
  )
}
