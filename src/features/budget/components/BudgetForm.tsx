import { useState, useEffect, type FC, type FormEvent } from 'react'
import type { BudgetEntryRequest, BudgetEntryResponse } from '../types/budget.types'

interface Props {
  entry?: BudgetEntryResponse | null
  initialDate?: string | null
  onSubmit: (data: BudgetEntryRequest) => Promise<void>
  onCancel: () => void
}

export const BudgetForm: FC<Props> = ({ entry, initialDate, onSubmit, onCancel }) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD
  const [isIncome, setIsIncome] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (entry) {
      setDescription(entry.description)
      setAmount(Math.abs(entry.amount).toString())
      setDate(entry.date)
      setIsIncome(entry.amount > 0)
    } else if (initialDate) {
      setDate(initialDate)
    }
  }, [entry, initialDate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!description.trim() || !amount) return

    setLoading(true)
    try {
      const numAmount = parseFloat(amount)
      await onSubmit({
        description: description.trim(),
        amount: isIncome ? numAmount : -numAmount,
        date,
      })
      setDescription('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setIsIncome(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">
        {entry ? '항목 수정' : '새 항목 추가'}
      </h3>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">유형</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsIncome(true)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
              isIncome
                ? 'border-[#667eea] gradient-bg text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#667eea] hover:bg-gray-50'
            }`}
          >
            💰 수입
          </button>
          <button
            type="button"
            onClick={() => setIsIncome(false)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
              !isIncome
                ? 'border-[#667eea] gradient-bg text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#667eea] hover:bg-gray-50'
            }`}
          >
            💸 지출
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          내용
        </label>
        <input
          id="description"
          type="text"
          placeholder="예: 월급, 식비, 교통비"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-semibold text-gray-900 mb-2">
          날짜
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors focus:outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
        />
      </div>

      <div className="mb-8">
        <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-2">
          금액
        </label>
        <input
          id="amount"
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="1"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-semibold text-base transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg font-semibold text-base gradient-bg text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : entry ? '수정' : '추가'}
        </button>
      </div>
    </form>
  )
}
