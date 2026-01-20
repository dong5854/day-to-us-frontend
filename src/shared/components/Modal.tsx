import type { FC, ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export const Modal: FC<Props> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1050] p-4 animate-[fade-in_0.2s_ease-in-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-[slide-up_0.2s_ease-in-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xl flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-all z-10"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
