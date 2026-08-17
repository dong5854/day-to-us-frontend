import { useState, type FC } from 'react'
import { CreditCard, Pencil, Trash2 } from 'lucide-react'
import type { FixedExpenseResponse, Frequency } from '../types/fixedExpense.types'
import type { ExpenseCategoryResponse } from '@/features/budget/types/expenseCategory.types'
import type { PaymentMethodResponse } from '@/features/budget/types/paymentMethod.types'
import { formatCurrency } from '@/shared/utils/format'
import { Select } from '@/shared/components/Select'

interface Props {
  expenses: FixedExpenseResponse[]
  loading: boolean
  categories?: ExpenseCategoryResponse[]
  paymentMethods?: PaymentMethodResponse[]
  onEdit?: (expense: FixedExpenseResponse) => void
  onDelete?: (id: string) => void
}

const frequencyLabels: Record<Frequency, string> = {
  WEEKLY: '매주',
  MONTHLY: '매월',
  YEARLY: '매년',
}

const frequencyColors: Record<Frequency, string> = {
  WEEKLY: 'bg-blue-50 text-blue-700',
  MONTHLY: 'bg-purple-50 text-purple-700',
  YEARLY: 'bg-green-50 text-green-700',
}

export const FixedExpenseList: FC<Props> = ({ 
  expenses, 
  loading, 
  categories = [], 
  paymentMethods = [], 
  onEdit, 
  onDelete 
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('all')

  const calculateNextPaymentDate = (startDate: string, frequency: Frequency): string => {
    const start = new Date(startDate)
    const today = new Date()
    const next = new Date(start)

    if (frequency === 'WEEKLY') {
      while (next < today) {
        next.setDate(next.getDate() + 7)
      }
    } else if (frequency === 'MONTHLY') {
      while (next < today) {
        next.setMonth(next.getMonth() + 1)
      }
    } else if (frequency === 'YEARLY') {
      while (next < today) {
        next.setFullYear(next.getFullYear() + 1)
      }
    }

    return next.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchCategory = selectedCategoryId === 'all' || expense.categoryId === selectedCategoryId
    const matchPaymentMethod = selectedPaymentMethodId === 'all' || expense.paymentMethodId === selectedPaymentMethodId
    return matchCategory && matchPaymentMethod
  })

  const totalMonthlyExpense = filteredExpenses.reduce((sum, expense) => {
    if (expense.frequency === 'WEEKLY') {
      return sum + (expense.amount * 52) / 12 // 주간 → 월간 환산
    } else if (expense.frequency === 'MONTHLY') {
      return sum + expense.amount
    } else if (expense.frequency === 'YEARLY') {
      return sum + expense.amount / 12 // 연간 → 월간 환산
    }
    return sum
  }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 월간 총액 카드 */}
      <div className="bg-[#4F46E5] rounded-xl p-6 text-white shadow-lg">
        <div className="text-sm opacity-90 mb-1">월 예상 고정지출</div>
        <div className="text-3xl font-bold">{formatCurrency(totalMonthlyExpense)}</div>
      </div>

      <div className="flex gap-2 mb-2">
        <Select
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          options={[
            { value: 'all', label: '전체 카테고리' },
            ...categories.map((c) => ({ value: c.id, label: c.name }))
          ]}
          className="flex-1 min-w-0"
        />
        <Select
          value={selectedPaymentMethodId}
          onChange={setSelectedPaymentMethodId}
          options={[
            { value: 'all', label: '전체 결제수단' },
            ...paymentMethods.map((p) => ({ value: p.id, label: p.name }))
          ]}
          className="flex-1 min-w-0"
        />
      </div>

      {/* 고정지출 목록 */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <CreditCard className="w-12 h-12 mb-4 mx-auto text-gray-400" />
          <p className="text-gray-500">
            {expenses.length === 0 ? '등록된 고정지출이 없습니다' : '조건에 맞는 고정지출이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const categoryName = categories.find(c => c.id === expense.categoryId)?.name
            const paymentMethodName = paymentMethods.find(p => p.id === expense.paymentMethodId)?.name

            return (
              <div
                key={expense.id}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${frequencyColors[expense.frequency]}`}
                      >
                        {frequencyLabels[expense.frequency]}
                      </span>
                    </div>
                    {(categoryName || paymentMethodName) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        {categoryName && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                            {categoryName}
                          </span>
                        )}
                        {paymentMethodName && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                            {paymentMethodName}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      다음 결제: {calculateNextPaymentDate(expense.startDate, expense.frequency)}
                    </div>
                  </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(expense.amount)}</div>
                  {expense.frequency !== 'MONTHLY' && (
                    <div className="text-xs text-gray-400 mt-1">
                      월{' '}
                      {formatCurrency(
                        expense.frequency === 'WEEKLY'
                          ? (expense.amount * 52) / 12
                          : expense.amount / 12
                      )}
                    </div>
                  )}
                </div>
              </div>
              {(onEdit || onDelete) && (
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(expense)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-[#4F46E5] hover:bg-[#4F46E5]/5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      수정
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  )}
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
