import type { FC } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { BudgetEntryResponse } from '../types/budget.types'
import { formatCurrency } from '@/shared/utils/format'
import { SwipeableCard } from '@/shared/components/SwipeableCard'
interface Props {
  entry: BudgetEntryResponse
  onEdit: () => void
  onDelete: () => void
}

export const BudgetCard: FC<Props> = ({ entry, onEdit, onDelete }) => {
  const isIncome = entry.amount > 0
  const displayAmount = Math.abs(entry.amount)

  return (
    <SwipeableCard onEdit={onEdit} onDelete={onDelete}>
      <div className={`bg-white rounded-lg p-6 transition-all border-l-4 ${
        isIncome ? 'border-green-500' : 'border-red-500'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            {isIncome ? <TrendingUp className="w-8 h-8 text-green-500" /> : <TrendingDown className="w-8 h-8 text-red-500" />}
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-900">{entry.description}</h4>
              {(entry.category || entry.paymentMethod) && (
                <div className="flex gap-2 mt-1 flex-wrap">
                  {entry.category && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                      {entry.category.name}
                    </span>
                  )}
                  {entry.paymentMethod && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full">
                      {entry.paymentMethod.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="text-xl font-bold w-full sm:w-auto text-right">
            <span className={isIncome ? 'text-green-600' : 'text-red-600'}>
              {isIncome ? '+' : '-'}{formatCurrency(displayAmount)}
            </span>
          </div>
        </div>
      </div>
    </SwipeableCard>
  )
}
