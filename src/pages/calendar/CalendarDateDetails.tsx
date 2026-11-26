import { Calendar } from 'lucide-react'
import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'
import type { ScheduleResponse } from '@/features/schedule/types/schedule.types'
import type { SavingsRecord } from '@/features/savings/types/savings.types'
import { SavingsRecordRow } from '@/features/savings/components/SavingsList'
import { SwipeableCard } from '@/shared/components/SwipeableCard'
import type { CalendarFilter } from './CalendarCategoryTabs'

interface Props {
  date: string
  filterType: CalendarFilter
  entries: BudgetEntryResponse[]
  schedules: ScheduleResponse[]
  savingsRecords: SavingsRecord[]
  savingsLoading: boolean
  onEditEntry: (entry: BudgetEntryResponse) => void
  onDeleteEntry: (id: string) => void
  onEditSchedule: (schedule: ScheduleResponse) => void
  onDeleteSchedule: (id: string) => void
  onEditSavings: (record: SavingsRecord) => void
  onDeleteSavings: (record: SavingsRecord) => void
  onAdd: () => void
}

export function CalendarDateDetails({
  date, filterType, entries, schedules, savingsRecords, savingsLoading,
  onEditEntry, onDeleteEntry, onEditSchedule, onDeleteSchedule, onEditSavings, onDeleteSavings, onAdd,
}: Props) {
  const dateEntries = entries.filter(entry => entry.date === date)
  const dateSchedules = schedules.filter(schedule =>
    date >= schedule.startDateTime.split('T')[0] && date <= schedule.endDateTime.split('T')[0])
  const dateSavings = savingsRecords.filter(record => record.date === date)
  const showSavings = filterType === 'all' || filterType === 'savings'
  const showBudget = filterType === 'all' || filterType === 'budget'
  const showSchedule = filterType === 'all' || filterType === 'schedule'
  const hasItems = (showSavings && dateSavings.length > 0) || (showBudget && dateEntries.length > 0) || (showSchedule && dateSchedules.length > 0)

  return (
    <div className="p-4 pb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {new Date(date).toLocaleDateString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </h3>

      <div className="space-y-2 mb-4">
        {showBudget && dateEntries.map((entry) => (
          <SwipeableCard key={entry.id}
            onEdit={() => onEditEntry(entry)}
            onDelete={() => onDeleteEntry(entry.id)}>
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{entry.description}</div>
                <div className="text-sm text-gray-500">가계부</div>
              </div>
              <div className={`font-semibold ${entry.amount > 0 ? 'text-green-600' : 'text-rose-400'}`}>
                {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}원
              </div>
            </div>
          </SwipeableCard>
        ))}

        {showSchedule && dateSchedules.map((schedule) => (
          <SwipeableCard key={schedule.id}
            onEdit={() => onEditSchedule(schedule)}
            onDelete={() => onDeleteSchedule(schedule.id)}>
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{schedule.title}</div>
                <div className="text-sm text-gray-500">일정 {schedule.isAllDay ? '(종일)' : ''}</div>
              </div>
              <Calendar className="w-4 h-4 text-violet-500 shrink-0" />
            </div>
          </SwipeableCard>
        ))}

        {showSavings && dateSavings.map(record => <SavingsRecordRow key={record.id} record={record}
          onClick={() => onEditSavings(record)}
          onDelete={record.planned ? undefined : () => onDeleteSavings(record)}/>)}
        {showSavings && savingsLoading && <p role="status">저축을 불러오는 중입니다</p>}
        {!hasItems && (
          <div className="text-center py-8 text-gray-400">
            {filterType === 'budget' ? '등록된 가계부 내역이 없습니다'
              : filterType === 'schedule' ? '등록된 일정이 없습니다'
              : '등록된 항목이 없습니다'}
          </div>
        )}
      </div>

      <button
        onClick={onAdd}
        className="w-full py-3 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
      >
        {filterType === 'savings' ? '저축 목록에서 기록 추가' : '+ 항목 추가'}
      </button>
    </div>
  )
}
