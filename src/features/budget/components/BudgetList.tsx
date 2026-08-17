import { useState, type FC } from 'react'
import { Wallet } from 'lucide-react'
import type { BudgetEntryResponse } from '../types/budget.types'
import { BudgetCard } from './BudgetCard'
import { formatCurrency } from '@/shared/utils/format'
import { Select } from '@/shared/components/Select'

interface Props {
  entries: BudgetEntryResponse[]
  onEdit: (entry: BudgetEntryResponse) => void
  onDelete: (entryId: string) => void
  loading: boolean
  categories?: { id: string; name: string }[]
  paymentMethods?: { id: string; name: string }[]
}

export const BudgetList: FC<Props> = ({
  entries,
  onEdit,
  onDelete,
  loading,
  categories = [],
  paymentMethods = [],
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('all')

  if (loading) {
    return <div className="text-center py-16 text-gray-500">로딩 중...</div>
  }

  const filteredEntries = entries.filter((entry) => {
    const matchCategory = selectedCategoryId === 'all' || entry.category?.id === selectedCategoryId
    const matchPaymentMethod = selectedPaymentMethodId === 'all' || entry.paymentMethod?.id === selectedPaymentMethodId
    return matchCategory && matchPaymentMethod
  })

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <Wallet className="w-16 h-16 mb-4 mx-auto text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 기록이 없습니다</h3>
        <p className="text-gray-500">첫 번째 수입/지출을 추가해보세요!</p>
      </div>
    )
  }

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, BudgetEntryResponse[]>)

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a))

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const dateOnly = dateString
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (dateOnly === todayStr) return '오늘'
    if (dateOnly === yesterdayStr) return '어제'

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]

    return `${year}년 ${month}월 ${day}일 (${weekday})`
  }

  const filteredIncome = filteredEntries.filter((e) => e.amount > 0).reduce((sum, e) => sum + e.amount, 0)
  const filteredExpense = filteredEntries.filter((e) => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0)
  const filteredBalance = filteredIncome - filteredExpense

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">수입</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(filteredIncome)}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">지출</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(filteredExpense)}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#4F46E5] flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">잔액</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(filteredBalance)}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
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

      <div className="flex flex-col gap-6">
        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
            조건에 맞는 내역이 없습니다.
          </div>
        )}
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-bold text-gray-900">{formatDateLabel(date)}</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="flex flex-col gap-3">
              {groupedEntries[date].map((entry) => (
                <BudgetCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => onEdit(entry)}
                  onDelete={() => onDelete(entry.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
