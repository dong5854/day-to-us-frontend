import { useState, type FC } from 'react'
import { Calendar, Wallet } from 'lucide-react'
import { BudgetList } from '@/features/budget/components/BudgetList'
import { FixedExpenseList } from '@/features/fixedExpense/components/FixedExpenseList'
import { ScheduleList } from '@/features/schedule/components/ScheduleList'
import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'
import type { FixedExpenseResponse } from '@/features/fixedExpense/types/fixedExpense.types'
import type { ScheduleResponse } from '@/features/schedule/types/schedule.types'

type FilterType = 'budget' | 'schedule'
type BudgetSubTab = 'entries' | 'fixed'

interface Props {
  year: number
  month: number  // 0-indexed
  entries: BudgetEntryResponse[]
  budgetLoading: boolean
  totalIncome: number
  totalExpense: number
  balance: number
  fixedExpenses: FixedExpenseResponse[]
  fixedExpenseLoading: boolean
  schedules: ScheduleResponse[]
  scheduleLoading: boolean
  filterType: FilterType
  onFilterChange: (filter: FilterType) => void
  onEditEntry: (entry: BudgetEntryResponse) => void
  onDeleteEntry: (id: string) => void
  onEditFixedExpense: (expense: FixedExpenseResponse) => void
  onDeleteFixedExpense: (id: string) => void
  onEditSchedule: (schedule: ScheduleResponse) => void
  onDeleteSchedule: (id: string) => void
  onAdd: (tab: BudgetSubTab | 'schedule') => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export const CalendarListView: FC<Props> = ({
  year,
  month,
  entries,
  budgetLoading,
  totalIncome,
  totalExpense,
  balance,
  fixedExpenses,
  fixedExpenseLoading,
  schedules,
  scheduleLoading,
  filterType,
  onFilterChange,
  onEditEntry,
  onDeleteEntry,
  onEditFixedExpense,
  onDeleteFixedExpense,
  onEditSchedule,
  onDeleteSchedule,
  onAdd,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const [budgetSubTab, setBudgetSubTab] = useState<BudgetSubTab>('entries')

  const addTarget: BudgetSubTab | 'schedule' =
    filterType === 'schedule' ? 'schedule'
    : budgetSubTab === 'fixed' ? 'fixed'
    : 'entries'

  return (
    <>
      {/* Tabs & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => { onFilterChange('budget'); setBudgetSubTab('entries') }}
            className={`px-4 py-2 text-lg font-bold transition-colors ${
              filterType === 'budget' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Wallet className="w-5 h-5 inline-block mr-1" /> 가계부
          </button>
          <button
            onClick={() => onFilterChange('schedule')}
            className={`px-4 py-2 text-lg font-bold transition-colors ${
              filterType === 'schedule' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calendar className="w-5 h-5 inline-block mr-1" /> 일정
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4">
          <h2 className="text-xl font-bold text-gray-900">{year}년 {month + 1}월</h2>
          <div className="flex gap-2">
            <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">←</button>
            <button onClick={onToday} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">오늘</button>
            <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">→</button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filterType === 'budget' && (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setBudgetSubTab('entries')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                budgetSubTab === 'entries' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              수입/지출 내역
            </button>
            <button
              onClick={() => setBudgetSubTab('fixed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                budgetSubTab === 'fixed' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              고정지출
            </button>
          </div>

          {budgetSubTab === 'entries' ? (
            <BudgetList
              entries={entries}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              loading={budgetLoading}
            />
          ) : (
            <FixedExpenseList expenses={fixedExpenses} loading={fixedExpenseLoading} onEdit={onEditFixedExpense} onDelete={onDeleteFixedExpense} />
          )}
        </>
      )}

      {filterType === 'schedule' && (
        <ScheduleList
          schedules={schedules}
          loading={scheduleLoading}
          onEdit={onEditSchedule}
          onDelete={onDeleteSchedule}
        />
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => onAdd(addTarget)}
        className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
        title={addTarget === 'fixed' ? '고정지출 추가' : addTarget === 'schedule' ? '일정 추가' : '항목 추가'}
      >
        +
      </button>
    </>
  )
}
