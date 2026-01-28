import { useState, type FC } from 'react'
import { BudgetList } from '@/features/budget/components/BudgetList'
import { BudgetForm } from '@/features/budget/components/BudgetForm'
import { FixedExpenseList } from '@/features/fixedExpense/components/FixedExpenseList'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'
import { ScheduleList } from '@/features/schedule/components/ScheduleList'
import { ScheduleForm } from '@/features/schedule/components/ScheduleForm'
import { Modal } from '@/shared/components/Modal'
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
}) => {
  const [viewType, setViewType] = useState<ViewType>('calendar')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [budgetSubTab, setBudgetSubTab] = useState<BudgetSubTab>('entries')
  const [currentDate, setCurrentDate] = useState(new Date())
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
      const scheduleDate = schedule.startDateTime.split('T')[0]
      return scheduleDate === dateStr
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setIsDateChoiceModalOpen(true)
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
    <>
      {/* View Toggle & Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* View Type Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewType('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 달력
            </button>
            <button
              onClick={() => {
                setViewType('list')
                setFilterType('budget')
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 목록
            </button>
          </div>

          {/* Filter Toggles - Only visible in calendar view */}
          {viewType === 'calendar' && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-[#667eea] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterType('budget')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'budget'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                💰 가계부
              </button>
              <button
                onClick={() => setFilterType('schedule')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'schedule'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📅 일정
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="animate-[slide-up_0.3s_ease-out]">
        {viewType === 'calendar' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
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
                  onClick={() => setCurrentDate(new Date())}
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
            <div className="grid grid-cols-7 gap-1">
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
                <div key={`empty-${index}`} className="aspect-square bg-gray-50 rounded-lg" />
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
                const hasEntries = dayEntries.length > 0
                const hasSchedules = daySchedules.length > 0

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(year, month, day)}
                    className={`aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors overflow-hidden cursor-pointer ${
                      isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
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
                    
                    {/* Display budget entries */}
                    {hasEntries && (filterType === 'all' || filterType === 'budget') && (
                      <div className="space-y-0.5">
                        {dayEntries.slice(0, 2).map((entry) => (
                          <div
                            key={entry.id}
                            className={`text-xs truncate px-1 py-0.5 rounded ${
                              entry.amount > 0
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                            title={`${entry.description}: ${entry.amount > 0 ? '+' : ''}${entry.amount.toLocaleString()}원`}
                          >
                            {entry.description}
                          </div>
                        ))}
                        {dayEntries.length > 2 && (
                          <div className="text-xs text-gray-400 px-1">
                            +{dayEntries.length - 2}개
                          </div>
                        )}
                      </div>
                    )}

                    {/* Display schedules */}
                    {hasSchedules && (filterType === 'all' || filterType === 'schedule') && (
                      <div className="space-y-0.5 mt-1">
                        {daySchedules.slice(0, 2).map((schedule) => (
                          <div
                            key={schedule.id}
                            className="text-xs truncate px-1 py-0.5 rounded bg-purple-50 text-purple-700"
                            title={`${schedule.title}${schedule.isAllDay ? ' (종일)' : ''}`}
                          >
                            📅 {schedule.title}
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <div className="text-xs text-gray-400 px-1">
                            +{daySchedules.length - 2}개
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              ✅ 가계부 내역이 달력에 표시됩니다
            </div>
          </div>
        ) : (
          <>
            {/* List View - Budget (with sub-tabs) or Schedule */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => {
                  setFilterType('budget')
                  setBudgetSubTab('entries')
                }}
                className={`pb-3 px-4 text-lg font-bold transition-colors ${
                  filterType === 'budget'
                    ? 'text-gray-900 border-b-2 border-[#667eea]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                💰 가계부
              </button>
              <button
                onClick={() => setFilterType('schedule')}
                className={`pb-3 px-4 text-lg font-bold transition-colors ${
                  filterType === 'schedule'
                    ? 'text-gray-900 border-b-2 border-[#667eea]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                📅 일정
              </button>
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

      {/* Floating Add Button */}
      <button
        onClick={
          viewType === 'list' && filterType === 'budget' && budgetSubTab === 'fixed'
            ? handleAddFixedExpense
            : viewType === 'list' && filterType === 'schedule'
            ? handleAddSchedule
            : handleAddEntry
        }
        className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
        title={
          viewType === 'list' && filterType === 'budget' && budgetSubTab === 'fixed'
            ? '고정지출 추가'
            : viewType === 'list' && filterType === 'schedule'
            ? '일정 추가'
            : '항목 추가'
        }
      >
        +
      </button>

      {/* Date Choice Modal */}
      <Modal isOpen={isDateChoiceModalOpen} onClose={() => setIsDateChoiceModalOpen(false)}>
        <div className="bg-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">무엇을 추가하시겠어요?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleChoiceBudget}
              className="p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <div className="text-4xl mb-2">💰</div>
              <div className="text-lg font-semibold text-gray-900">수입/지출</div>
            </button>
            <button
              onClick={handleChoiceSchedule}
              className="p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
            >
              <div className="text-4xl mb-2">📅</div>
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
    </>
  )
}
