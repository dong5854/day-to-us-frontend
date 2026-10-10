import { useState, type FC } from 'react'
import { CreditCard } from 'lucide-react'
import type { FixedExpenseResponse, Frequency } from '../types/fixedExpense.types'
import type { ExpenseCategoryResponse } from '@/features/budget/types/expenseCategory.types'
import type { PaymentMethodResponse } from '@/features/budget/types/paymentMethod.types'
import { formatCurrency } from '@/shared/utils/format'
import { Select } from '@/shared/components/Select'
import { SwipeableCard } from '@/shared/components/SwipeableCard'
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
  const [selectedType, setSelectedType] = useState('all')
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
    return (selectedType === 'all' || (expense.type ?? 'EXPENSE') === selectedType) && matchCategory && matchPaymentMethod
  })

  const monthlyTotal = (type: string) => filteredExpenses.filter(expense => (expense.type ?? 'EXPENSE') === type).reduce((sum, expense) => {
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
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs text-gray-500">월 평균 예정 금액</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0"><p className="text-sm text-gray-600">고정수입</p><p className="break-all text-lg font-semibold text-green-700">{formatCurrency(monthlyTotal('INCOME'))}</p></div>
          <div className="min-w-0"><p className="text-sm text-gray-600">고정지출</p><p className="break-all text-lg font-semibold text-red-600">{formatCurrency(monthlyTotal('EXPENSE'))}</p></div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-gray-500">
        예정일에 수입·지출 내역으로 자동 반영됩니다. 반영된 금액과 날짜는 내역에서 수정할 수 있습니다.
        자동 반영은 등록 시작일과 2026년 6월 1일 중 늦은 날부터 적용됩니다.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-2">
        <Select value={selectedType} onChange={setSelectedType} size="sm" className="min-w-0"
          options={[{ value: 'all', label: '전체 유형' }, { value: 'INCOME', label: '고정수입' }, { value: 'EXPENSE', label: '고정지출' }]} />
        <Select
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          options={[
            { value: 'all', label: '전체 카테고리' },
            ...categories.map((c) => ({ value: c.id, label: c.name }))
          ]}
          size="sm" className="min-w-0"
        />
        <Select
          value={selectedPaymentMethodId}
          onChange={setSelectedPaymentMethodId}
          options={[
            { value: 'all', label: '전체 결제수단' },
            ...paymentMethods.map((p) => ({ value: p.id, label: p.name }))
          ]}
          size="sm" className="min-w-0"
        />
      </div>

      {/* 고정지출 목록 */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <CreditCard className="w-12 h-12 mb-4 mx-auto text-gray-400" />
          <p className="text-gray-500">
            {expenses.length === 0 ? '등록된 고정 수입·지출이 없습니다' : '조건에 맞는 고정 수입·지출이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const categoryName = categories.find(c => c.id === expense.categoryId)?.name
            const paymentMethodName = paymentMethods.find(p => p.id === expense.paymentMethodId)?.name

            return (
              <SwipeableCard
                key={expense.id}
                onEdit={onEdit ? () => onEdit(expense) : undefined}
                onDelete={onDelete ? () => onDelete(expense.id) : undefined}
              >
                <div className="bg-white rounded-xl p-4 border border-gray-100 transition-colors hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${frequencyColors[expense.frequency]}`}
                        >
                          {expense.type === 'INCOME' ? '수입' : '지출'} · {frequencyLabels[expense.frequency]}
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
                        {expense.type === 'INCOME' ? '다음 입금 예정: ' : '다음 결제: '}{calculateNextPaymentDate(expense.startDate, expense.frequency)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${expense.type === 'INCOME' ? 'text-green-700' : 'text-red-600'}`}>{formatCurrency(expense.amount)}</div>
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
                </div>
              </SwipeableCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
