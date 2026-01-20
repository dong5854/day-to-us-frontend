import type { FC } from 'react'

interface Props {
  onNavigate: (module: 'budget') => void
}

export const SpaceDashboard: FC<Props> = ({ onNavigate }) => {
  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">우리 공간의 기능</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Budget Module (Active) */}
        <button
          onClick={() => onNavigate('budget')}
          className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-md hover:-translate-y-1 active:scale-95 group"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
            💰
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-1">가계부</h3>
            <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full">
              사용 중
            </span>
          </div>
        </button>

        {/* Schedule Module (Coming Soon) */}
        <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-4 opacity-70 cursor-not-allowed">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl grayscale">
            📅
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-500 mb-1">일정</h3>
            <span className="text-xs text-gray-400 font-medium bg-gray-200 px-2 py-1 rounded-full">
              준비 중
            </span>
          </div>
        </div>

        {/* Album Module (Coming Soon) */}
        <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-4 opacity-70 cursor-not-allowed">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl grayscale">
            📸
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-500 mb-1">앨범</h3>
            <span className="text-xs text-gray-400 font-medium bg-gray-200 px-2 py-1 rounded-full">
              준비 중
            </span>
          </div>
        </div>

        {/* Wishlist Module (Coming Soon) */}
        <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-4 opacity-70 cursor-not-allowed">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl grayscale">
            🎁
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-500 mb-1">위시</h3>
            <span className="text-xs text-gray-400 font-medium bg-gray-200 px-2 py-1 rounded-full">
              준비 중
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
