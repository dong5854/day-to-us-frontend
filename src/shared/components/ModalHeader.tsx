import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  children: ReactNode
  onClose: () => void
  titleId?: string
}

export function ModalHeader({ children, onClose, titleId }: Props) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-white">
      <h3 id={titleId} className="text-xl font-bold text-gray-900">{children}</h3>
      <button type="button" onClick={onClose} aria-label="닫기"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-indigo-600">
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  )
}
