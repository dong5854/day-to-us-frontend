import { useState, useEffect, type FC, type FormEvent } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { BudgetEntryRequest, BudgetEntryResponse } from '../types/budget.types'
import type { ExpenseCategoryResponse } from '../types/expenseCategory.types'
import type { PaymentMethodResponse } from '../types/paymentMethod.types'
import { Select } from '@/shared/components/Select'

interface Props {
  entry?: BudgetEntryResponse | null
  initialDate?: string | null
  categories?: ExpenseCategoryResponse[]
  paymentMethods?: PaymentMethodResponse[]
  onCreateCategory?: (name: string) => Promise<ExpenseCategoryResponse | undefined>
  onCreatePaymentMethod?: (name: string) => Promise<PaymentMethodResponse | undefined>
  onSubmit: (data: BudgetEntryRequest) => Promise<void>
  onCancel: () => void
}

export const BudgetForm: FC<Props> = ({
  entry,
  initialDate,
  categories = [],
  paymentMethods = [],
  onCreateCategory,
  onCreatePaymentMethod,
  onSubmit,
  onCancel,
}) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD
  const [isIncome, setIsIncome] = useState(true)
  const [loading, setLoading] = useState(false)

  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Payment method state
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('')
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('')

  useEffect(() => {
    if (entry) {
      setDescription(entry.description)
      setAmount(Math.abs(entry.amount).toString())
      setDate(entry.date)
      setIsIncome(entry.amount > 0)
      setSelectedCategoryId(entry.category?.id ?? '')
      setSelectedPaymentMethodId(entry.paymentMethod?.id ?? '')
    } else if (initialDate) {
      setDate(initialDate)
    }
  }, [entry, initialDate])

  const handleCategorySelectChange = (value: string) => {
    if (value === '__add_new__') {
      setIsAddingCategory(true)
      setSelectedCategoryId('')
    } else {
      setSelectedCategoryId(value)
      setIsAddingCategory(false)
    }
  }

  const handleConfirmNewCategory = async () => {
    if (!newCategoryName.trim() || !onCreateCategory) return
    const created = await onCreateCategory(newCategoryName.trim())
    if (created) {
      setSelectedCategoryId(created.id)
    }
    setNewCategoryName('')
    setIsAddingCategory(false)
  }

  const handlePaymentMethodSelectChange = (value: string) => {
    if (value === '__add_new__') {
      setIsAddingPaymentMethod(true)
      setSelectedPaymentMethodId('')
    } else {
      setSelectedPaymentMethodId(value)
      setIsAddingPaymentMethod(false)
    }
  }

  const handleConfirmNewPaymentMethod = async () => {
    if (!newPaymentMethodName.trim() || !onCreatePaymentMethod) return
    const created = await onCreatePaymentMethod(newPaymentMethodName.trim())
    if (created) {
      setSelectedPaymentMethodId(created.id)
    }
    setNewPaymentMethodName('')
    setIsAddingPaymentMethod(false)
  }

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
        categoryId: selectedCategoryId || undefined,
        paymentMethodId: selectedPaymentMethodId || undefined,
      })
      setDescription('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setIsIncome(true)
      setSelectedCategoryId('')
      setSelectedPaymentMethodId('')
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

      {/* 유형 (income/expense) */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">유형</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsIncome(true)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
              isIncome
                ? 'border-[#4F46E5] gradient-bg text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#4F46E5] hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block" /> 수입
          </button>
          <button
            type="button"
            onClick={() => setIsIncome(false)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
              !isIncome
                ? 'border-[#4F46E5] gradient-bg text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#4F46E5] hover:bg-gray-50'
            }`}
          >
            <TrendingDown className="w-4 h-4 inline-block" /> 지출
          </button>
        </div>
      </div>

      {/* Category selector (only shown when categories are provided) */}
      {(categories.length > 0 || onCreateCategory) && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">카테고리</label>
          {isAddingCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="새 카테고리 이름"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirmNewCategory() } }}
                className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                autoFocus
              />
              <button
                type="button"
                onClick={handleConfirmNewCategory}
                className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border-2 border-[#4F46E5] gradient-bg text-white text-sm"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingCategory(false); setNewCategoryName('') }}
                className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm"
              >
                취소
              </button>
            </div>
          ) : (
            <Select
              value={selectedCategoryId}
              onChange={handleCategorySelectChange}
              options={[
                { value: '', label: '카테고리 없음' },
                ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
                ...(onCreateCategory ? [{ value: '__add_new__', label: '+ 새로 추가', isSpecial: true }] : []),
              ]}
            />
          )}
        </div>
      )}

      {/* Payment method selector (only shown when paymentMethods are provided) */}
      {(paymentMethods.length > 0 || onCreatePaymentMethod) && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">결제 수단</label>
          {isAddingPaymentMethod ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="새 결제 수단 이름"
                value={newPaymentMethodName}
                onChange={(e) => setNewPaymentMethodName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirmNewPaymentMethod() } }}
                className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                autoFocus
              />
              <button
                type="button"
                onClick={handleConfirmNewPaymentMethod}
                className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border-2 border-[#4F46E5] gradient-bg text-white text-sm"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingPaymentMethod(false); setNewPaymentMethodName('') }}
                className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm"
              >
                취소
              </button>
            </div>
          ) : (
            <Select
              value={selectedPaymentMethodId}
              onChange={handlePaymentMethodSelectChange}
              options={[
                { value: '', label: '결제 수단 없음' },
                ...paymentMethods.map((pm) => ({ value: pm.id, label: pm.name })),
                ...(onCreatePaymentMethod ? [{ value: '__add_new__', label: '+ 새로 추가', isSpecial: true }] : []),
              ]}
            />
          )}
        </div>
      )}

      {/* 내용 */}
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
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
        />
      </div>

      {/* 날짜 */}
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
          className="w-full min-w-0 px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
        />
      </div>

      {/* 금액 */}
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
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
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
