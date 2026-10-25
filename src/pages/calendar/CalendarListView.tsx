import { CalendarMonthHeader } from './CalendarMonthHeader'
import { useState, type FC } from 'react'
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
  onOpenCategories?: () => void
  categories?: { id: string; name: string }[]
  paymentMethods?: { id: string; name: string }[]
}

export const CalendarListView: FC<Props> = ({
  year,
  month,
  entries,
  budgetLoading,
  fixedExpenses,
  fixedExpenseLoading,
  schedules,
  scheduleLoading,
  filterType,
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
  onOpenCategories,
  categories,
  paymentMethods,
}) => {
  const [budgetSubTab, setBudgetSubTab] = useState<BudgetSubTab>('entries')

  const addTarget: BudgetSubTab | 'schedule' =
    filterType === 'schedule' ? 'schedule'
    : budgetSubTab === 'fixed' ? 'fixed'
    : 'entries'

  return (
    <>
      <CalendarMonthHeader
        year={year}
        month={month}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
        onOpenCategories={filterType === 'budget' ? onOpenCategories : undefined}
      />

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
              고정 수입/지출
            </button>
          </div>

          {budgetSubTab === 'entries' ? (
            <BudgetList
              entries={entries}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
              loading={budgetLoading}
              categories={categories}
              paymentMethods={paymentMethods}
            />
          ) : (
            <FixedExpenseList 
              expenses={fixedExpenses} 
              loading={fixedExpenseLoading} 
              categories={categories}
              paymentMethods={paymentMethods}
              onEdit={onEditFixedExpense} 
              onDelete={onDeleteFixedExpense} 
            />
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
        title={addTarget === 'fixed' ? '고정 수입/지출 추가' : addTarget === 'schedule' ? '일정 추가' : '항목 추가'}
      >
        +
      </button>
    </>
  )
}
