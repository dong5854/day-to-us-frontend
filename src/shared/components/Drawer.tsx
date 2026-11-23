import { type FC, type ReactNode, useRef } from 'react'

import { DialogLayer } from './DialogLayer'

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
  if (!isOpen) return null

  return (
    <DialogLayer label="상세 보기" dismissOnBackdrop onDismiss={onClose}>
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden flex flex-col max-h-[85dvh] overflow-hidden transition-transform duration-200 ease-out"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle bar */}
        <div className="relative shrink-0">
          <div
            role="button"
            tabIndex={0}
            aria-label="아래로 끌어 닫기"
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClose()
              }
            }}
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
        </div>

        {/* Content */}
        <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </DialogLayer>
  )
}
