import { addAmount, amountIncrements } from '@/shared/utils/amount'
import { InlineOptionInput } from '@/shared/components/InlineOptionInput'
import { ModalHeader } from '@/shared/components/ModalHeader'
import { useState, useEffect, type FC, type FormEvent } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { BudgetEntryRequest, BudgetEntryResponse } from '../types/budget.types'
import type { ExpenseCategoryResponse } from '../types/expenseCategory.types'
import type { PaymentMethodResponse } from '../types/paymentMethod.types'
import { Select } from '@/shared/components/Select'
import { DatePicker } from '@/shared/components/DatePicker'
import { toDateString } from '@/shared/utils/dateUtils'
import { formatKoreanWon } from '@/shared/utils/format'
import { readBudgetPreferences, rememberBudgetPreferences } from '../utils/budgetPreferences'

interface Props {
  spaceId?: string
  entry?: BudgetEntryResponse | null
  initialDate?: string | null
  categories?: ExpenseCategoryResponse[]
  paymentMethods?: PaymentMethodResponse[]
  onCreateCategory?: (name: string) => Promise<ExpenseCategoryResponse | undefined>
  onCreatePaymentMethod?: (name: string) => Promise<PaymentMethodResponse | undefined>
  onManageCategories?: () => void
  onDeleteCategory?: (id: string) => Promise<void>
  onDeletePaymentMethod?: (id: string) => Promise<void>
  onSubmit: (data: BudgetEntryRequest) => Promise<void>
  onCancel: () => void
}

export const BudgetForm: FC<Props> = ({
  spaceId,
  entry,
  initialDate,
  categories = [],
  paymentMethods = [],
  onCreateCategory,
  onCreatePaymentMethod,
  onManageCategories,
  onDeletePaymentMethod,
  onSubmit,
  onCancel,
}) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(toDateString(new Date())) // YYYY-MM-DD
  const [preferences] = useState(() => readBudgetPreferences(spaceId))
  const [isIncome, setIsIncome] = useState(preferences.isIncome)
  const [loading, setLoading] = useState(false)

  // Category state
  const [categoryId, setSelectedCategoryId] = useState(preferences.categoryId)
  const selectedCategoryId = entry || categories.some(category => category.id === categoryId && !category.archived) ? categoryId : ''
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  // Payment method state
  const [paymentMethodId, setSelectedPaymentMethodId] = useState(preferences.paymentMethodId)
  const selectedPaymentMethodId = entry || paymentMethods.some(method => method.id === paymentMethodId) ? paymentMethodId : ''
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)

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
      rememberBudgetPreferences(spaceId, { categoryId: value })
      setIsAddingCategory(false)
    }
  }

  const handlePaymentMethodSelectChange = (value: string) => {
    if (value === '__add_new__') {
      setIsAddingPaymentMethod(true)
      setSelectedPaymentMethodId('')
    } else {
      setSelectedPaymentMethodId(value)
      rememberBudgetPreferences(spaceId, { paymentMethodId: value })
      setIsAddingPaymentMethod(false)
    }
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
      setDate(toDateString(new Date()))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col bg-white rounded-lg">
      <ModalHeader onClose={onCancel}>
        {entry ? '항목 수정' : '새 항목 추가'}
      </ModalHeader>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">

      {/* 유형 (income/expense) */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">유형</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={isIncome}
            onClick={() => { setIsIncome(true); rememberBudgetPreferences(spaceId, { isIncome: true }) }}
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
            aria-pressed={!isIncome}
            onClick={() => { setIsIncome(false); rememberBudgetPreferences(spaceId, { isIncome: false }) }}
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
          <div className="flex items-center justify-between mb-2"><label className="text-sm font-semibold text-gray-900">카테고리</label>{onManageCategories && <button type="button" onClick={onManageCategories} className="min-h-11 px-2 text-sm text-[#4F46E5]">관리</button>}</div>
          {isAddingCategory && onCreateCategory ? (
            <InlineOptionInput
              placeholder="새 카테고리 이름"
              defaultError="이미 존재하는 카테고리이거나 추가에 실패했습니다."
              onCreate={onCreateCategory}
              onCreated={handleCategorySelectChange}
              onCancel={() => setIsAddingCategory(false)}
            />
          ) : (
            <Select
              value={selectedCategoryId}
              onChange={handleCategorySelectChange}
              options={[
                { value: '', label: '카테고리 없음' },
                                  ...categories.filter(cat => !cat.archived || cat.id === selectedCategoryId).map(cat => ({ value: cat.id, label: cat.name + (cat.archived ? ' (보관됨)' : '') })),
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
          {isAddingPaymentMethod && onCreatePaymentMethod ? (
            <InlineOptionInput
              placeholder="새 결제 수단 이름"
              defaultError="이미 존재하는 결제 수단이거나 추가에 실패했습니다."
              onCreate={onCreatePaymentMethod}
              onCreated={handlePaymentMethodSelectChange}
              onCancel={() => setIsAddingPaymentMethod(false)}
            />
          ) : (
            <Select
              value={selectedPaymentMethodId}
              onChange={handlePaymentMethodSelectChange}
              options={[
                { value: '', label: '결제 수단 없음' },
                ...paymentMethods.map((pm) => ({
                  value: pm.id,
                  label: pm.name,
                  onDelete: onDeletePaymentMethod
                    ? async () => {
                        await onDeletePaymentMethod(pm.id)
                        if (selectedPaymentMethodId === pm.id) setSelectedPaymentMethodId('')
                      }
                    : undefined,
                })),
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
        <DatePicker
          id="date"
          value={date}
          onChange={setDate}
          required
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
          aria-describedby="amount-readable"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
        />
        <p id="amount-readable" aria-live="polite" className="mt-2 min-h-5 text-right text-sm text-gray-500">
          {formatKoreanWon(Number(amount))}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {amountIncrements.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-label={`${value.toLocaleString('ko-KR')}원 더하기`}
              disabled={loading}
              onClick={() => setAmount(current => addAmount(current, value))}
              className="min-h-11 rounded-full bg-gray-100 px-1 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 disabled:opacity-60"
            >
              {label}
            </button>
          ))}
        </div>
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
      </div>
    </form>
  )
}
