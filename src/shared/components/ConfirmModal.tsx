import type { FC } from 'react'

interface Props {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export const ConfirmModal: FC<Props> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  isDangerous = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4 animate-[fade-in_0.2s_ease-in-out]">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-[slide-up_0.2s_ease-in-out]">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
              isDangerous 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'gradient-bg'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
