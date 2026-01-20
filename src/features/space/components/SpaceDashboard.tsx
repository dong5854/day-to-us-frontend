import { type FC } from 'react'
import type { SharedSpaceResponse, UserResponse } from '../types/space.types'

interface Props {
  onNavigate: (module: 'budget') => void
  space: SharedSpaceResponse | null
  members: UserResponse[]
}

export const SpaceDashboard: FC<Props> = ({ onNavigate, space, members }) => {
  const handleCopyCode = () => {
    if (space?.inviteCode) {
      navigator.clipboard.writeText(space.inviteCode)
      // Toast functionality is parent-managed, so standard alert for now or optional prop
      // Or we can just let it be silent copy or handle via prop.
      // Assuming simple copy for now.
      alert('초대 코드가 복사되었습니다!')
    }
  }

  return (
    <div className="animate-[fade-in_0.3s_ease-out] space-y-6">
      {/* Space Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{space?.name}</h2>
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <span className="text-sm font-medium">초대 코드:</span>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-[#667eea]">{space?.inviteCode}</code>
          <button
            onClick={handleCopyCode}
            className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-600 transition-colors"
            title="복사하기"
          >
            복사
          </button>
        </div>
        
        <div className="border-t border-gray-100 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>👫</span> 함께하는 멤버
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {members.map((member) => (
              <div key={member.email} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {member.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{member.name}</div>
                  <div className="text-xs text-gray-500 truncate">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">우리 공간의 기능</h2>
      
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
