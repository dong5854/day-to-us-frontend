import type { FC } from 'react'
import type { BudgetEntryResponse } from '../types/budget.types'
import { BudgetCard } from './BudgetCard'
import { formatCurrency } from '@/shared/utils/format'

interface Props {
  entries: BudgetEntryResponse[]
  onEdit: (entry: BudgetEntryResponse) => void
  onDelete: (entryId: string) => void
  totalIncome: number
  totalExpense: number
  balance: number
  loading: boolean
}

export const BudgetList: FC<Props> = ({
  entries,
  onEdit,
  onDelete,
  totalIncome,
  totalExpense,
  balance,
  loading,
}) => {
  if (loading) {
    return <div className="text-center py-16 text-gray-500">로딩 중...</div>
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 기록이 없습니다</h3>
        <p className="text-gray-500">첫 번째 수입/지출을 추가해보세요!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">수입</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">지출</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpense)}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#667eea] flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">잔액</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {entries.map(entry => (
          <BudgetCard
            key={entry.id}
            entry={entry}
            onEdit={() => onEdit(entry)}
            onDelete={() => onDelete(entry.id)}
          />
        ))}
      </div>
    </div>
  )
}
