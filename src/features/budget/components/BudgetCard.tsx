import type { FC } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { BudgetEntryResponse } from '../types/budget.types'
import { formatCurrency } from '@/shared/utils/format'

interface Props {
  entry: BudgetEntryResponse
  onEdit: () => void
  onDelete: () => void
}

export const BudgetCard: FC<Props> = ({ entry, onEdit, onDelete }) => {
  const isIncome = entry.amount > 0
  const displayAmount = Math.abs(entry.amount)

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 border-l-4 ${
      isIncome ? 'border-green-500' : 'border-red-500'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4 flex-1">
          {isIncome ? <TrendingUp className="w-8 h-8 text-green-500" /> : <TrendingDown className="w-8 h-8 text-red-500" />}
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900">{entry.description}</h4>
          </div>
        </div>
        <div className="text-xl font-bold w-full sm:w-auto text-right">
          <span className={isIncome ? 'text-green-600' : 'text-red-600'}>
            {isIncome ? '+' : '-'}{formatCurrency(displayAmount)}
          </span>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-md text-sm font-medium transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-[#4F46E5] hover:text-[#4F46E5]"
        >
          수정
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-md text-sm font-medium transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-red-500 hover:text-red-500"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
