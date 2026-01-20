import { useState, type FC, type FormEvent } from 'react'

interface Props {
  onSubmit: (name: string) => Promise<void>
  onJoin: (code: string) => Promise<void>
  onCancel: () => void
}

export const SpaceForm: FC<Props> = ({ onSubmit, onJoin, onCancel }) => {
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'create') {
        if (!name.trim()) return
        await onSubmit(name.trim())
      } else {
        if (!inviteCode.trim()) return
        await onJoin(inviteCode.trim())
      }
      setName('')
      setInviteCode('')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
      <div className="flex gap-4 mb-6 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`pb-3 text-lg font-bold transition-colors ${
            mode === 'create' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          새 공간 만들기
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`pb-3 text-lg font-bold transition-colors ${
            mode === 'join' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          초대 코드로 참여
        </button>
      </div>

      <div className="mb-6">
        {mode === 'create' ? (
          <>
            <label htmlFor="spaceName" className="block text-sm font-semibold text-gray-900 mb-2">
              공간 이름
            </label>
            <input
              id="spaceName"
              type="text"
              placeholder="예: 민수영희의 공간"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
            />
          </>
        ) : (
          <>
            <label htmlFor="inviteCode" className="block text-sm font-semibold text-gray-900 mb-2">
              초대 코드
            </label>
            <input
              id="inviteCode"
              type="text"
              placeholder="전달받은 초대 코드를 입력하세요"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
            />
          </>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || (mode === 'create' ? !name.trim() : !inviteCode.trim())}
          className="px-5 py-2.5 rounded-lg font-medium text-white gradient-bg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          {loading ? '처리 중...' : (mode === 'create' ? '만들기' : '참여하기')}
        </button>
      </div>
    </form>
  )
}
