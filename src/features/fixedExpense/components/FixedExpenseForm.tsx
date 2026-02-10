import { useState, type FC, type FormEvent } from 'react'
import type { FixedExpenseRequest, Frequency } from '../types/fixedExpense.types'

interface Props {
  onSubmit: (data: FixedExpenseRequest) => Promise<void>
  onCancel: () => void
}

export const FixedExpenseForm: FC<Props> = ({ onSubmit, onCancel }) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('MONTHLY')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    setLoading(true)
    try {
      await onSubmit({
        description: description.trim(),
        amount: parseFloat(amount),
        frequency,
        startDate,
      })
      setDescription('')
      setAmount('')
      setFrequency('MONTHLY')
      setStartDate(new Date().toISOString().split('T')[0])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
      <h3 className="text-xl font-bold text-gray-900 mb-6">고정지출 등록</h3>

      <div className="space-y-4 mb-6">
        {/* 설명 */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            항목명
          </label>
          <input
            id="description"
            type="text"
            placeholder="예: 넷플릭스 구독료"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
          />
        </div>

        {/* 금액 */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-2">
            금액 (원)
          </label>
          <input
            id="amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="1"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
          />
        </div>

        {/* 주기 */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-semibold text-gray-900 mb-2">
            결제 주기
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
          >
            <option value="WEEKLY">매주</option>
            <option value="MONTHLY">매월</option>
            <option value="YEARLY">매년</option>
          </select>
        </div>

        {/* 시작일 */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-2">
            결제 시작일 (첫 결제일)
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || !description.trim() || !amount}
          className="px-5 py-2.5 rounded-lg font-medium text-white gradient-bg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </form>
  )
}
