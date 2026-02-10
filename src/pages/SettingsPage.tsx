import type { FC } from 'react'
import type { SharedSpaceResponse, UserResponse } from '@/features/space/types/space.types'

interface Props {
  space: SharedSpaceResponse | null
  members: UserResponse[]
}

export const SettingsPage: FC<Props> = ({ space, members }) => {
  const handleCopyCode = () => {
    if (space?.inviteCode) {
      navigator.clipboard.writeText(space.inviteCode)
      alert('초대 코드가 복사되었습니다!')
    }
  }

  return (
    <div className="animate-[fade-in_0.3s_ease-out] space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">설정</h2>

      {/* Space Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">공간 정보</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">공간 이름</label>
            <div className="text-base text-gray-900">{space?.name}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">초대 코드</label>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono text-[#4F46E5] flex-1">
                {space?.inviteCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-sm font-medium text-gray-700 transition-colors"
              >
                복사
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>👫</span> 함께하는 멤버
        </h3>
        
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.email} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                {member.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                <div className="text-xs text-gray-500 truncate">{member.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">계정</h3>
        
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            로그아웃
          </button>
          <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            공간 탈퇴
          </button>
        </div>
      </div>
    </div>
  )
}
