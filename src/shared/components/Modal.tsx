import { type FC, type ReactNode } from 'react'
import { DialogLayer } from './DialogLayer'
import { X } from 'lucide-react'

interface Props {
  label: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  formLayout?: boolean
}

export const Modal: FC<Props> = ({ label, isOpen, onClose, children, formLayout = false }) => {
  if (!isOpen) return null

  return (
    <DialogLayer label={label} onDismiss={onClose} dismissOnBackdrop>
      <div
        className={`bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-full relative animate-[slide-up_0.2s_ease-in-out] ${formLayout ? "flex flex-col overflow-hidden" : "overflow-y-auto overflow-x-hidden overscroll-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!formLayout && <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>}
        {children}
      </div>
    </DialogLayer>
  )
}
