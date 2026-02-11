import { type FC } from 'react'
import { CreditCard } from 'lucide-react'
import type { FixedExpenseResponse, Frequency } from '../types/fixedExpense.types'
import { formatCurrency } from '@/shared/utils/format'

interface Props {
  expenses: FixedExpenseResponse[]
  loading: boolean
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

export const FixedExpenseList: FC<Props> = ({ expenses, loading }) => {
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

  const totalMonthlyExpense = expenses.reduce((sum, expense) => {
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

      {/* 고정지출 목록 */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <CreditCard className="w-12 h-12 mb-4 mx-auto text-gray-400" />
          <p className="text-gray-500">등록된 고정지출이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${frequencyColors[expense.frequency]}`}
                    >
                      {frequencyLabels[expense.frequency]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
