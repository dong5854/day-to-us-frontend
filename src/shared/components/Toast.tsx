import { useEffect, type FC } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Props {
  message: string
  type?: ToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export const Toast: FC<Props> = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-gray-800'
  }

  const icons = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[1200] flex items-center gap-3 px-6 py-3 rounded-full shadow-lg text-white ${bgColors[type]} animate-[fade-in_0.3s_ease-out]`}>
      <span className="text-lg">{icons[type]}</span>
      <span className="font-medium">{message}</span>
    </div>
  )
}
