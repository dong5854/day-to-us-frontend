import { useState, type FC, type FormEvent } from 'react'

interface Props {
  onSubmit: (name: string) => Promise<void>
  onCancel: () => void
}

export const SpaceForm: FC<Props> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSubmit(name.trim())
      setName('')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
      <h3 className="text-xl font-bold text-gray-900 mb-6">새 공간 만들기</h3>

      <div className="mb-6">
        <label htmlFor="spaceName" className="block text-sm font-semibold text-gray-900 mb-2">
          공간 이름
        </label>
        <input
          id="spaceName"
          type="text"
          placeholder="예: 민수영희의 공간, 민수영희 커플룸"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
        />
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
          disabled={loading || !name.trim()}
          className="px-5 py-2.5 rounded-lg font-medium text-white gradient-bg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          {loading ? '생성 중...' : '만들기'}
        </button>
      </div>
    </form>
  )
}
