import { DialogLayer } from './DialogLayer'
import { type FC, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  label: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export const Modal: FC<Props> = ({ label, isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <DialogLayer label={label} onDismiss={onClose} dismissOnBackdrop>
      <div
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-full overflow-y-auto overflow-x-hidden relative animate-[slide-up_0.2s_ease-in-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </DialogLayer>
  )
}
