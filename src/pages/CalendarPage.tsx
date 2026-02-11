import { useState, type FC } from 'react'
import { Calendar, List, Wallet } from 'lucide-react'
import { BudgetList } from '@/features/budget/components/BudgetList'
import { BudgetForm } from '@/features/budget/components/BudgetForm'
import { FixedExpenseList } from '@/features/fixedExpense/components/FixedExpenseList'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'
import { ScheduleList } from '@/features/schedule/components/ScheduleList'
import { ScheduleForm } from '@/features/schedule/components/ScheduleForm'
import { Modal } from '@/shared/components/Modal'
import { Drawer } from '@/shared/components/Drawer'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'
import type { FixedExpenseRequest, FixedExpenseResponse } from '@/features/fixedExpense/types/fixedExpense.types'
import type { ScheduleRequest, ScheduleResponse } from '@/features/schedule/types/schedule.types'

type ViewType = 'calendar' | 'list'
type FilterType = 'all' | 'budget' | 'schedule'
type BudgetSubTab = 'entries' | 'fixed'

interface Props {
  entries: BudgetEntryResponse[]
  loading: boolean
  totalIncome: number
  totalExpense: number
  balance: number
  onCreateEntry: (data: { description: string; amount: number; date: string }) => Promise<void>
  onUpdateEntry: (id: string, data: { description: string; amount: number; date: string }) => Promise<void>
  onDeleteEntry: (id: string) => Promise<void>
  fixedExpenses: FixedExpenseResponse[]
  fixedExpenseLoading: boolean
  onCreateFixedExpense: (data: FixedExpenseRequest) => Promise<void>
  schedules: ScheduleResponse[]
  scheduleLoading: boolean
  onCreateSchedule: (data: ScheduleRequest) => Promise<void>
  onUpdateSchedule: (id: string, data: ScheduleRequest) => Promise<void>
  onDeleteSchedule: (id: string) => Promise<void>
  currentDate: Date
  onDateChange: (date: Date) => void
}

export const CalendarPage: FC<Props> = ({
  entries,
  loading,
  totalIncome,
  totalExpense,
  balance,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  fixedExpenses,
  fixedExpenseLoading,
  onCreateFixedExpense,
  schedules,
  scheduleLoading,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  currentDate,
  onDateChange,
}) => {
  const [viewType, setViewType] = useState<ViewType>('calendar')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [budgetSubTab, setBudgetSubTab] = useState<BudgetSubTab>('entries')
  // currentDate state removed (lifted up)
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false)
  const [isFixedExpenseFormOpen, setIsFixedExpenseFormOpen] = useState(false)
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BudgetEntryResponse | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDateChoiceModalOpen, setIsDateChoiceModalOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  })
  
  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDateForDrawer, setSelectedDateForDrawer] = useState<string | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const getEntriesForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return entries.filter((entry) => entry.date === dateStr)
  }

  const getSchedulesForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter((schedule) => {
      const scheduleStartDate = schedule.startDateTime.split('T')[0]
      const scheduleEndDate = schedule.endDateTime.split('T')[0]
      
      // Check if the date falls within the schedule's date range
      return dateStr >= scheduleStartDate && dateStr <= scheduleEndDate
    })
  }

  // Calculate event bars for multi-day schedules
  interface EventBar {
    schedule: ScheduleResponse
    weekIndex: number
    startCol: number
    span: number
    rowOffset: number
  }

  const getScheduleEventBars = (): EventBar[] => {
    if (filterType === 'budget') return []
    
    const bars: EventBar[] = []
    const totalCells = startingDayOfWeek + daysInMonth
    const weeks = Math.ceil(totalCells / 7)
    
    // Process each schedule
    schedules.forEach((schedule) => {
      const scheduleStart = new Date(schedule.startDateTime.split('T')[0])
      const scheduleEnd = new Date(schedule.endDateTime.split('T')[0])
      
      // Only create bars for multi-day events
      const daysDiff = Math.ceil((scheduleEnd.getTime() - scheduleStart.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff === 0) return // Skip single-day events
      
      // For each week, check if schedule appears
      for (let weekIdx = 0; weekIdx < weeks; weekIdx++) {
        const weekStartCell = weekIdx * 7
        const weekEndCell = Math.min(weekStartCell + 6, totalCells - 1)
        
        // Calculate which day of month corresponds to each cell
        const weekStartDay = weekStartCell - startingDayOfWeek + 1
        const weekEndDay = weekEndCell - startingDayOfWeek + 1
        
        // Create date objects for this week's range
        const weekStartDate = new Date(year, month, Math.max(1, weekStartDay))
        const weekEndDate = new Date(year, month, Math.min(daysInMonth, weekEndDay))
        
        // Check if schedule overlaps with this week
        if (scheduleEnd >= weekStartDate && scheduleStart <= weekEndDate) {
          // Calculate start column (1-7) for this week
          let startCol = 1
          let span = 7
          
          if (scheduleStart >= weekStartDate) {
            // Event starts this week
            const dayInMonth = scheduleStart.getDate()
            const cellIndex = dayInMonth - 1 + startingDayOfWeek
            startCol = (cellIndex % 7) + 1
          }
          
          if (scheduleEnd <= weekEndDate) {
            // Event ends this week
            const dayInMonth = scheduleEnd.getDate()
            const cellIndex = dayInMonth - 1 + startingDayOfWeek
            const endCol = (cellIndex % 7) + 1
            span = endCol - startCol + 1
          } else {
            // Event continues past this week
            span = 8 - startCol
          }
          
          bars.push({
            schedule,
            weekIndex: weekIdx,
            startCol,
            span,
            rowOffset: 0, // Will be calculated for stacking
          })
        }
      }
    })
    
    // Calculate row offsets for overlapping events
    const weekGroups: { [key: number]: EventBar[] } = {}
    bars.forEach((bar) => {
      if (!weekGroups[bar.weekIndex]) weekGroups[bar.weekIndex] = []
      weekGroups[bar.weekIndex].push(bar)
    })
    
    Object.values(weekGroups).forEach((weekBars) => {
      weekBars.sort((a, b) => {
        if (a.startCol !== b.startCol) return a.startCol - b.startCol
        return b.span - a.span
      })
      
      weekBars.forEach((bar, idx) => {
        bar.rowOffset = idx
      })
    })
    
    return bars
  }

  const eventBars = getScheduleEventBars()


  const prevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // Check if mobile (< 768px, md breakpoint)
    if (window.innerWidth < 768) {
      setSelectedDateForDrawer(dateStr)
      setIsDrawerOpen(true)
    } else {
      setSelectedDate(dateStr)
      setIsDateChoiceModalOpen(true)
    }
  }

  const handleChoiceBudget = () => {
    setIsDateChoiceModalOpen(false)
    setEditingEntry(null)
    setIsBudgetFormOpen(true)
  }

  const handleChoiceSchedule = () => {
    setIsDateChoiceModalOpen(false)
    setEditingSchedule(null)
    setIsScheduleFormOpen(true)
  }

  const handleAddEntry = () => {
    setSelectedDate(null)
    setEditingEntry(null)
    setIsBudgetFormOpen(true)
  }

  const handleEditEntry = (entry: BudgetEntryResponse) => {
    setEditingEntry(entry)
    setIsBudgetFormOpen(true)
  }

  const handleSubmitEntry = async (data: { description: string; amount: number; date: string }) => {
    if (editingEntry) {
      await onUpdateEntry(editingEntry.id, data)
    } else {
      await onCreateEntry(data)
    }
    setIsBudgetFormOpen(false)
    setEditingEntry(null)
  }

  const handleDeleteEntry = (entryId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 내역을 삭제하시겠습니까?',
      onConfirm: async () => {
        await onDeleteEntry(entryId)
        setConfirmState((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleAddFixedExpense = () => {
    setIsFixedExpenseFormOpen(true)
  }

  const handleSubmitFixedExpense = async (data: FixedExpenseRequest) => {
    await onCreateFixedExpense(data)
    setIsFixedExpenseFormOpen(false)
  }

  const handleAddSchedule = () => {
    setEditingSchedule(null)
    setIsScheduleFormOpen(true)
  }

  const handleEditSchedule = (schedule: ScheduleResponse) => {
    setEditingSchedule(schedule)
    setIsScheduleFormOpen(true)
  }

  const handleSubmitSchedule = async (data: ScheduleRequest) => {
    if (editingSchedule) {
      await onUpdateSchedule(editingSchedule.id, data)
    } else {
      await onCreateSchedule(data)
    }
    setIsScheduleFormOpen(false)
    setEditingSchedule(null)
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 일정을 삭제하시겠습니까?',
      onConfirm: async () => {
        await onDeleteSchedule(scheduleId)
        setConfirmState((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* View Toggle & Filters */}
      <div className="mb-4">
        {/* View Type Toggle */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg mb-3">
          <button
            onClick={() => setViewType('calendar')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewType === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block" /> 달력
          </button>
          <button
            onClick={() => {
              setViewType('list')
              setFilterType('budget')
            }}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewType === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4 inline-block" /> 목록
          </button>
        </div>

        {/* Filter Toggles - Only visible in calendar view */}
        {viewType === 'calendar' && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('budget')}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterType === 'budget'
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Wallet className="w-4 h-4 inline-block" /> 가계부
            </button>
            <button
              onClick={() => setFilterType('schedule')}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterType === 'schedule'
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline-block" /> 일정
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="animate-[slide-up_0.3s_ease-out] flex-1 flex flex-col min-h-0">
        {viewType === 'calendar' ? (
          <div className="bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-100 p-2 md:p-6 -mx-2 md:mx-0 flex-1 flex flex-col min-h-0">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {year}년 {month + 1}월
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => onDateChange(new Date())}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  오늘
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  →
                </button>
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

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="md:min-h-[120px] bg-gray-50 rounded-lg" />
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear()
                const dayOfWeek = (startingDayOfWeek + index) % 7
                const dayEntries = getEntriesForDate(year, month, day)
                const daySchedules = getSchedulesForDate(year, month, day)
                
                // Get event bars for this specific cell
                const cellIndex = index + startingDayOfWeek
                const currentWeek = Math.floor(cellIndex / 7)
                const currentDayOfWeek = (cellIndex % 7) + 1
                
                const cellEventBars = eventBars.filter(
                  (bar) => 
                    bar.weekIndex === currentWeek &&
                    currentDayOfWeek >= bar.startCol &&
                    currentDayOfWeek < bar.startCol + bar.span
                )
                
                // Filter out multi-day schedules from cell display
                const singleDaySchedules = daySchedules.filter((schedule) => {
                  const scheduleStart = schedule.startDateTime.split('T')[0]
                  const scheduleEnd = schedule.endDateTime.split('T')[0]
                  return scheduleStart === scheduleEnd
                })
                
                const hasEntries = dayEntries.length > 0
                const hasSingleDaySchedules = singleDaySchedules.length > 0

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(year, month, day)}
                    className={`md:min-h-[140px] border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                      isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    {/* Date number */}
                    <div
                      className={`text-base font-semibold mb-1 ${
                        isToday
                          ? 'text-blue-600'
                          : dayOfWeek === 0
                          ? 'text-red-500'
                          : dayOfWeek === 6
                          ? 'text-blue-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                    
                    {/* + Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDateClick(year, month, day)
                      }}
                      className="hidden md:flex absolute top-1 right-1 w-5 h-5 items-center justify-center text-gray-400 hover:text-white hover:bg-[#4F46E5] rounded-full transition-all duration-200 text-sm font-bold opacity-60 hover:opacity-100 z-10"
                      title="항목 추가"
                    >
                      +
                    </button>

                    {/* Event bars below date */}
                    {cellEventBars.length > 0 && (
                      <div className="mb-1 space-y-0.5">
                        {cellEventBars.map((bar) => {
                          const isStartOfBar = currentDayOfWeek === bar.startCol
                          const isEndOfBar = currentDayOfWeek === bar.startCol + bar.span - 1
                          
                          return (
                            <div
                              key={`${bar.schedule.id}-${bar.weekIndex}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditSchedule(bar.schedule)
                              }}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              <div 
                                className={`h-3 md:h-6 bg-indigo-200/80 text-indigo-800 text-xs px-2 py-0.5 flex items-center font-medium shadow-sm ${
                                  isStartOfBar && isEndOfBar
                                    ? 'rounded-md'
                                    : isStartOfBar
                                    ? 'rounded-l-md'
                                    : isEndOfBar
                                    ? 'rounded-r-md'
                                    : ''
                                }`}
                              >
                                {isStartOfBar && (
                                  <span className="hidden md:block truncate">{bar.schedule.title}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    
                    {/* Mobile: Event dots */}
                    <div className="md:hidden absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {/* Budget entry dots */}
                      {(filterType === 'all' || filterType === 'budget') && dayEntries.slice(0, 4).map((entry) => (
                        <div
                          key={entry.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            entry.amount > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                      ))}
                      {/* Single-day schedule dots */}
                      {(filterType === 'all' || filterType === 'schedule') && singleDaySchedules.slice(0, 4).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]"
                        />
                      ))}
                      {/* Overflow indicator */}
                      {((dayEntries.length + singleDaySchedules.length) > 4) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      )}
                    </div>
                    
                    {/* Desktop: Display budget entries */}
                    {hasEntries && (filterType === 'all' || filterType === 'budget') && (
                      <div className="hidden md:block space-y-1">
                        {dayEntries.slice(0, 2).map((entry) => (
                          <div
                            key={entry.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditEntry(entry)
                            }}
                            className={`text-xs font-medium truncate px-2 py-1 rounded-md cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${
                              entry.amount > 0
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                            title={`${entry.description}: ${entry.amount > 0 ? '+' : ''}${entry.amount.toLocaleString()}원`}
                          >
                            {entry.description}
                          </div>
                        ))}
                        {dayEntries.length > 2 && (
                          <div className="text-xs text-gray-500 px-1 font-medium">
                            +{dayEntries.length - 2}개
                          </div>
                        )}
                      </div>
                    )}

                    {/* Desktop: Display single-day schedules only */}
                    {hasSingleDaySchedules && (filterType === 'all' || filterType === 'schedule') && (
                      <div className="hidden md:block space-y-1 mt-1">
                        {singleDaySchedules.slice(0, 2).map((schedule) => (
                          <div
                            key={schedule.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditSchedule(schedule)
                            }}
                            className="text-xs font-medium truncate px-2 py-1 rounded-md bg-violet-200/80 text-violet-800 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                            title={`${schedule.title}${schedule.isAllDay ? ' (종일)' : ''}`}
                          >
                            {schedule.title}
                          </div>
                        ))}
                        {singleDaySchedules.length > 2 && (
                          <div className="text-xs text-gray-500 px-1 font-medium">
                            +{singleDaySchedules.length - 2}개
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {/* List View - Budget (with sub-tabs) or Schedule */}
            {/* List View - Date Navigation & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilterType('budget')
                    setBudgetSubTab('entries')
                  }}
                  className={`px-4 py-2 text-lg font-bold transition-colors ${
                    filterType === 'budget'
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Wallet className="w-5 h-5 inline-block mr-1" /> 가계부
                </button>
                <button
                  onClick={() => setFilterType('schedule')}
                  className={`px-4 py-2 text-lg font-bold transition-colors ${
                    filterType === 'schedule'
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Calendar className="w-5 h-5 inline-block mr-1" /> 일정
                </button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-between md:justify-end gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {year}년 {month + 1}월
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => onDateChange(new Date())}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    오늘
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Budget Sub-tabs */}
            {filterType === 'budget' && (
              <>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setBudgetSubTab('entries')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      budgetSubTab === 'entries'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    수입/지출 내역
                  </button>
                  <button
                    onClick={() => setBudgetSubTab('fixed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      budgetSubTab === 'fixed'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    고정지출
                  </button>
                </div>

                {budgetSubTab === 'entries' ? (
                  <BudgetList
                    entries={entries}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                    balance={balance}
                    loading={loading}
                  />
                ) : (
                  <FixedExpenseList expenses={fixedExpenses} loading={fixedExpenseLoading} />
                )}
              </>
            )}

            {/* Schedule content */}
            {filterType === 'schedule' && (
              <ScheduleList
                schedules={schedules}
                loading={scheduleLoading}
                onEdit={handleEditSchedule}
                onDelete={handleDeleteSchedule}
              />
            )}
          </>
        )}
      </div>

      {/* Floating Add Button - only in list view */}
      {viewType === 'list' && (
        <button
          onClick={
            filterType === 'budget' && budgetSubTab === 'fixed'
              ? handleAddFixedExpense
              : filterType === 'schedule'
              ? handleAddSchedule
              : handleAddEntry
          }
          className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
          title={
            filterType === 'budget' && budgetSubTab === 'fixed'
              ? '고정지출 추가'
              : filterType === 'schedule'
              ? '일정 추가'
              : '항목 추가'
          }
        >
          +
        </button>
      )}

      {/* Date Choice Modal */}
      <Modal isOpen={isDateChoiceModalOpen} onClose={() => setIsDateChoiceModalOpen(false)}>
        <div className="bg-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">무엇을 추가하시겠어요?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleChoiceBudget}
              className="p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <Wallet className="w-12 h-12 mb-2 mx-auto text-gray-700" />
              <div className="text-lg font-semibold text-gray-900">수입/지출</div>
            </button>
            <button
              onClick={handleChoiceSchedule}
              className="p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
            >
              <Calendar className="w-12 h-12 mb-2 mx-auto text-gray-700" />
              <div className="text-lg font-semibold text-gray-900">일정</div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Budget Entry Form Modal */}
      <Modal isOpen={isBudgetFormOpen} onClose={() => setIsBudgetFormOpen(false)}>
        <BudgetForm
          entry={editingEntry}
          initialDate={selectedDate}
          onSubmit={handleSubmitEntry}
          onCancel={() => setIsBudgetFormOpen(false)}
        />
      </Modal>

      {/* Fixed Expense Form Modal */}
      <Modal isOpen={isFixedExpenseFormOpen} onClose={() => setIsFixedExpenseFormOpen(false)}>
        <FixedExpenseForm
          onSubmit={handleSubmitFixedExpense}
          onCancel={() => setIsFixedExpenseFormOpen(false)}
        />
      </Modal>

      {/* Schedule Form Modal */}
      <Modal isOpen={isScheduleFormOpen} onClose={() => setIsScheduleFormOpen(false)}>
        <ScheduleForm
          schedule={editingSchedule}
          initialDate={selectedDate}
          onSubmit={handleSubmitSchedule}
          onCancel={() => setIsScheduleFormOpen(false)}
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="삭제 확인"
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        confirmText="삭제"
        isDangerous
      />
      
      {/* Mobile Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className="p-4 pb-8">
          {selectedDateForDrawer && (
            <>
              {/* Date header */}
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {new Date(selectedDateForDrawer).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              
              {/* Event list */}
              <div className="space-y-2 mb-4">
                {(() => {
                  const [y, m, d] = selectedDateForDrawer.split('-').map(Number)
                  const dateEntries = getEntriesForDate(y, m - 1, d)
                  const dateSchedules = getSchedulesForDate(y, m - 1, d)
                  
                  return (
                    <>
                      {/* Budget entries */}
                      {dateEntries.map((entry) => (
                        <div
                          key={entry.id}
                          onClick={() => {
                            setIsDrawerOpen(false)
                            handleEditEntry(entry)
                          }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{entry.description}</div>
                            <div className="text-sm text-gray-500">가계부</div>
                          </div>
                          <div className={`font-semibold ${
                            entry.amount > 0 ? 'text-green-600' : 'text-rose-400'
                          }`}>
                            {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}원
                          </div>
                        </div>
                      ))}
                      
                      {/* Schedules */}
                      {dateSchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          onClick={() => {
                            setIsDrawerOpen(false)
                            handleEditSchedule(schedule)
                          }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{schedule.title}</div>
                            <div className="text-sm text-gray-500">
                              일정 {schedule.isAllDay ? '(종일)' : ''}
                            </div>
                          </div>
                          <div className="text-violet-500">
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                      
                      {/* Empty state */}
                      {dateEntries.length === 0 && dateSchedules.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          등록된 항목이 없습니다
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
              
              {/* Add button */}
              <button
                onClick={() => {
                  setSelectedDate(selectedDateForDrawer)
                  setIsDrawerOpen(false)
                  setIsDateChoiceModalOpen(true)
                }}
                className="w-full py-3 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
              >
                + 항목 추가
              </button>
            </>
          )}
        </div>
      </Drawer>
    </div>
  )
}
