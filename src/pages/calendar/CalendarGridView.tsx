import { type FC } from 'react'
import { Calendar, Wallet } from 'lucide-react'
import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'
import type { ScheduleResponse } from '@/features/schedule/types/schedule.types'
import type { EventBar } from '@/features/schedule/hooks/useEventBars'
import { buildDateStr } from '@/shared/utils/dateUtils'

type FilterType = 'all' | 'budget' | 'schedule'

interface Props {
  currentDate: Date
  year: number
  month: number        // 0-indexed
  daysInMonth: number
  startingDayOfWeek: number
  filterType: FilterType
  entries: BudgetEntryResponse[]
  schedules: ScheduleResponse[]
  eventBars: EventBar[]
  onDateClick: (year: number, month: number, day: number) => void
  onEditEntry: (entry: BudgetEntryResponse) => void
  onEditSchedule: (schedule: ScheduleResponse) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export const CalendarGridView: FC<Props> = ({
  currentDate,
  year,
  month,
  daysInMonth,
  startingDayOfWeek,
  filterType,
  entries,
  schedules,
  eventBars,
  onDateClick,
  onEditEntry,
  onEditSchedule,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const today = new Date()

  const getEntriesForDate = (day: number) => {
    const dateStr = buildDateStr(year, month, day)
    return entries.filter((entry) => entry.date === dateStr)
  }

  const getSchedulesForDate = (day: number) => {
    const dateStr = buildDateStr(year, month, day)
    return schedules.filter((schedule) => {
      const start = schedule.startDateTime.split('T')[0]
      const end = schedule.endDateTime.split('T')[0]
      return dateStr >= start && dateStr <= end
    })
  }

  return (
    <div className="bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-100 p-2 md:p-6 -mx-2 md:mx-0 flex-1 flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {year}년 {month + 1}월
        </h2>
        <div className="flex gap-2">
          <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">←</button>
          <button onClick={onToday} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">오늘</button>
          <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">→</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {/* Day Headers */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-semibold py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}

        {/* Empty cells */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="md:min-h-[120px] bg-gray-50 rounded-lg" />
        ))}

        {/* Calendar Days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
          const dayOfWeek = (startingDayOfWeek + index) % 7
          const dayEntries = getEntriesForDate(day)
          const daySchedules = getSchedulesForDate(day)

          const cellIndex = index + startingDayOfWeek
          const currentWeek = Math.floor(cellIndex / 7)
          const currentDayOfWeek = (cellIndex % 7) + 1

          const cellEventBars = eventBars.filter(
            (bar) =>
              bar.weekIndex === currentWeek &&
              currentDayOfWeek >= bar.startCol &&
              currentDayOfWeek < bar.startCol + bar.span
          )

          const singleDaySchedules = daySchedules.filter((schedule) => {
            const start = schedule.startDateTime.split('T')[0]
            const end = schedule.endDateTime.split('T')[0]
            return start === end
          })

          const hasEntries = dayEntries.length > 0
          const hasSingleDaySchedules = singleDaySchedules.length > 0

          return (
            <div
              key={day}
              onClick={() => onDateClick(year, month, day)}
              className={`md:min-h-[140px] border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
            >
              {/* Date number */}
              <div
                className={`text-base font-semibold mb-1 ${
                  isToday ? 'text-blue-600'
                  : dayOfWeek === 0 ? 'text-red-500'
                  : dayOfWeek === 6 ? 'text-blue-500'
                  : 'text-gray-700'
                }`}
              >
                {day}
              </div>

              {/* + Button (desktop) */}
              <button
                onClick={(e) => { e.stopPropagation(); onDateClick(year, month, day) }}
                className="hidden md:flex absolute top-1 right-1 w-5 h-5 items-center justify-center text-gray-400 hover:text-white hover:bg-[#4F46E5] rounded-full transition-all duration-200 text-sm font-bold opacity-60 hover:opacity-100 z-10"
                title="항목 추가"
              >
                +
              </button>

              {/* Multi-day event bars */}
              {cellEventBars.length > 0 && (
                <div className="mb-1 space-y-0.5">
                  {cellEventBars.map((bar) => {
                    const isStart = currentDayOfWeek === bar.startCol
                    const isEnd = currentDayOfWeek === bar.startCol + bar.span - 1
                    return (
                      <div
                        key={`${bar.schedule.id}-${bar.weekIndex}`}
                        onClick={(e) => { e.stopPropagation(); onEditSchedule(bar.schedule) }}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className={`h-3 md:h-6 bg-indigo-200/80 text-indigo-800 text-xs px-2 py-0.5 flex items-center font-medium shadow-sm ${
                          isStart && isEnd ? 'rounded-md' : isStart ? 'rounded-l-md' : isEnd ? 'rounded-r-md' : ''
                        }`}>
                          {isStart && <span className="hidden md:block truncate">{bar.schedule.title}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Mobile: Event dots */}
              <div className="md:hidden absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {(filterType === 'all' || filterType === 'budget') && dayEntries.slice(0, 4).map((entry) => (
                  <div key={entry.id} className={`w-1.5 h-1.5 rounded-full ${entry.amount > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                ))}
                {(filterType === 'all' || filterType === 'schedule') && singleDaySchedules.slice(0, 4).map((s) => (
                  <div key={s.id} className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                ))}
                {(dayEntries.length + singleDaySchedules.length) > 4 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
              </div>

              {/* Desktop: Budget entries */}
              {hasEntries && (filterType === 'all' || filterType === 'budget') && (
                <div className="hidden md:block space-y-1">
                  {dayEntries.slice(0, 2).map((entry) => (
                    <div
                      key={entry.id}
                      onClick={(e) => { e.stopPropagation(); onEditEntry(entry) }}
                      className={`text-xs font-medium truncate px-2 py-1 rounded-md cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${
                        entry.amount > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                      title={`${entry.description}: ${entry.amount > 0 ? '+' : ''}${entry.amount.toLocaleString()}원`}
                    >
                      {entry.description}
                    </div>
                  ))}
                  {dayEntries.length > 2 && (
                    <div className="text-xs text-gray-500 px-1 font-medium">+{dayEntries.length - 2}개</div>
                  )}
                </div>
              )}

              {/* Desktop: Single-day schedules */}
              {hasSingleDaySchedules && (filterType === 'all' || filterType === 'schedule') && (
                <div className="hidden md:block space-y-1 mt-1">
                  {singleDaySchedules.slice(0, 2).map((schedule) => (
                    <div
                      key={schedule.id}
                      onClick={(e) => { e.stopPropagation(); onEditSchedule(schedule) }}
                      className="text-xs font-medium truncate px-2 py-1 rounded-md bg-violet-200/80 text-violet-800 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                      title={`${schedule.title}${schedule.isAllDay ? ' (종일)' : ''}`}
                    >
                      {schedule.title}
                    </div>
                  ))}
                  {singleDaySchedules.length > 2 && (
                    <div className="text-xs text-gray-500 px-1 font-medium">+{singleDaySchedules.length - 2}개</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Unused icon import suppressor */}
      <span className="hidden"><Wallet /><Calendar /></span>
    </div>
  )
}
