import { type FC, type ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export const Drawer: FC<Props> = ({ isOpen, onClose, children }) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; startY: number; distance: number } | null>(null)

  const resetDrag = () => {
    drag.current = null
    if (panelRef.current) {
      panelRef.current.style.transition = ''
      panelRef.current.style.transform = ''
    }
  }
  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // body 스크롤 방지
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      drag.current = null
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="상세 보기"
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden flex flex-col max-h-[85dvh] overflow-hidden transition-transform duration-200 ease-out"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle bar */}
        <div className="relative shrink-0">
          <div
            className="flex h-11 items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0 || drag.current) return
              e.currentTarget.setPointerCapture(e.pointerId)
              drag.current = { id: e.pointerId, startY: e.clientY, distance: 0 }
              if (panelRef.current) panelRef.current.style.transition = 'none'
            }}
            onPointerMove={(e) => {
              if (drag.current?.id !== e.pointerId) return
              drag.current.distance = Math.max(0, e.clientY - drag.current.startY)
              if (panelRef.current) panelRef.current.style.transform = `translateY(${drag.current.distance}px)`
            }}
            onPointerUp={(e) => {
              if (drag.current?.id !== e.pointerId) return
              const shouldClose = Math.max(0, e.clientY - drag.current.startY) >= 64
              resetDrag()
              if (shouldClose) onClose()
            }}
            onPointerCancel={resetDrag}
            onLostPointerCapture={resetDrag}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <button type="button" aria-label="닫기" onClick={onClose} className="absolute right-1 top-0 flex h-11 w-11 items-center justify-center text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </>
  )
}
