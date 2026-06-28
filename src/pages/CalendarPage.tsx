import { useState, useMemo, type FC } from 'react'
import { Calendar, List, Wallet } from 'lucide-react'
import { useBudget } from '@/features/budget/hooks/useBudget'
import { useFixedExpense } from '@/features/fixedExpense/hooks/useFixedExpense'
import { useSchedule } from '@/features/schedule/hooks/useSchedule'
import { useEventBars } from '@/features/schedule/hooks/useEventBars'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useSwipe } from '@/shared/hooks/useSwipe'
import { CalendarGridView } from './calendar/CalendarGridView'
import { CalendarListView } from './calendar/CalendarListView'
import { BudgetForm } from '@/features/budget/components/BudgetForm'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'
import { ScheduleForm } from '@/features/schedule/components/ScheduleForm'
import { Modal } from '@/shared/components/Modal'
import { Drawer } from '@/shared/components/Drawer'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { Toast } from '@/shared/components/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { buildDateStr } from '@/shared/utils/dateUtils'
import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'
import type { FixedExpenseRequest, FixedExpenseResponse } from '@/features/fixedExpense/types/fixedExpense.types'
import type { ScheduleRequest, ScheduleResponse } from '@/features/schedule/types/schedule.types'

type ViewType = 'calendar' | 'list'
type FilterType = 'all' | 'budget' | 'schedule'
type ListFilterType = 'budget' | 'schedule'

interface Props {
  spaceId: string
  currentDate: Date
  onDateChange: (date: Date) => void
}

export const CalendarPage: FC<Props> = ({ spaceId, currentDate, onDateChange }) => {
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // ─── Data Hooks ───────────────────────────────────────────────────────────
  const {
    entries,
    loading: budgetLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    totalIncome,
    totalExpense,
    balance,
  } = useBudget(spaceId, currentYear, currentMonth)

  const {
    expenses: fixedExpenses,
    loading: fixedExpenseLoading,
    createExpense: createFixedExpense,
    updateExpense: updateFixedExpense,
    deleteExpense: deleteFixedExpense,
  } = useFixedExpense(spaceId)

  const {
    schedules,
    loading: scheduleLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedule(spaceId, currentYear, currentMonth)

  // ─── Calendar Derived State (memoized) ────────────────────────────────────
  const { daysInMonth, startingDayOfWeek, year, month } = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    return {
      year: y,
      month: m,
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    }
  }, [currentDate])

  // ─── Event Bars (memoized via hook) ───────────────────────────────────────
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [listFilterType, setListFilterType] = useState<ListFilterType>('budget')

  const eventBars = useEventBars({
    schedules,
    year,
    month,
    daysInMonth,
    startingDayOfWeek,
    enabled: filterType !== 'budget',
  })

  // ─── Device Detection ─────────────────────────────────────────────────────
  const isMobile = useMediaQuery('(max-width: 767px)')

  // ─── Toast ────────────────────────────────────────────────────────────────
  const { toast, showToast, hideToast } = useToast()

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [viewType, setViewType] = useState<ViewType>('calendar')
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false)
  const [isFixedExpenseFormOpen, setIsFixedExpenseFormOpen] = useState(false)
  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpenseResponse | null>(null)
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BudgetEntryResponse | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDateChoiceModalOpen, setIsDateChoiceModalOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    onConfirm: () => void
  }>({ isOpen: false, message: '', onConfirm: () => {} })

  // Mobile drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDateForDrawer, setSelectedDateForDrawer] = useState<string | null>(null)

  // ─── Navigation ───────────────────────────────────────────────────────────
  const prevMonth = () => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  const goToday = () => onDateChange(new Date())

  const swipeHandlers = useSwipe({ onSwipeLeft: nextMonth, onSwipeRight: prevMonth })

  // ─── Date Click ───────────────────────────────────────────────────────────
  const handleDateClick = (y: number, m: number, d: number) => {
    const dateStr = buildDateStr(y, m, d)
    if (isMobile) {
      setSelectedDateForDrawer(dateStr)
      setIsDrawerOpen(true)
    } else {
      setSelectedDate(dateStr)
      setIsDateChoiceModalOpen(true)
    }
  }

  // ─── Handler: Budget ──────────────────────────────────────────────────────
  const handleEditEntry = (entry: BudgetEntryResponse) => {
    setEditingEntry(entry)
    setIsBudgetFormOpen(true)
  }

  const handleSubmitEntry = async (data: { description: string; amount: number; date: string }) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, data)
        showToast('항목이 수정되었습니다', 'success')
      } else {
        await createEntry(data)
        showToast('내역이 추가되었습니다', 'success')
      }
      setIsBudgetFormOpen(false)
      setEditingEntry(null)
    } catch {
      showToast('저장에 실패했습니다', 'error')
      throw new Error('저장에 실패했습니다')
    }
  }

  const handleDeleteEntry = (entryId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 내역을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await deleteEntry(entryId)
          showToast('삭제되었습니다', 'info')
        } catch {
          showToast('삭제에 실패했습니다', 'error')
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // ─── Handler: Fixed Expense ───────────────────────────────────────────────
  const handleEditFixedExpense = (expense: FixedExpenseResponse) => {
    setEditingFixedExpense(expense)
    setIsFixedExpenseFormOpen(true)
  }

  const handleSubmitFixedExpense = async (data: FixedExpenseRequest) => {
    try {
      if (editingFixedExpense) {
        await updateFixedExpense(editingFixedExpense.id, data)
        showToast('고정지출이 수정되었습니다', 'success')
      } else {
        await createFixedExpense(data)
        showToast('고정지출이 추가되었습니다', 'success')
      }
      setIsFixedExpenseFormOpen(false)
      setEditingFixedExpense(null)
    } catch {
      showToast('저장에 실패했습니다', 'error')
      throw new Error('저장에 실패했습니다')
    }
  }

  const handleDeleteFixedExpense = (expenseId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 고정지출을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await deleteFixedExpense(expenseId)
          showToast('고정지출이 삭제되었습니다', 'info')
        } catch {
          showToast('삭제에 실패했습니다', 'error')
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // ─── Handler: Schedule ────────────────────────────────────────────────────
  const handleEditSchedule = (schedule: ScheduleResponse) => {
    setEditingSchedule(schedule)
    setIsScheduleFormOpen(true)
  }

  const handleSubmitSchedule = async (data: ScheduleRequest) => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, data)
        showToast('일정이 수정되었습니다', 'success')
      } else {
        await createSchedule(data)
        showToast('일정이 추가되었습니다', 'success')
      }
      setIsScheduleFormOpen(false)
      setEditingSchedule(null)
    } catch {
      showToast(editingSchedule ? '일정 수정에 실패했습니다' : '일정 추가에 실패했습니다', 'error')
      throw new Error('일정 처리에 실패했습니다')
    }
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 일정을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await deleteSchedule(scheduleId)
          showToast('일정이 삭제되었습니다', 'success')
        } catch {
          showToast('일정 삭제에 실패했습니다', 'error')
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // ─── List view "add" dispatcher ───────────────────────────────────────────
  const handleListAdd = (target: 'entries' | 'fixed' | 'schedule') => {
    setSelectedDate(null)
    setEditingEntry(null)
    setEditingSchedule(null)
    setEditingFixedExpense(null)
    if (target === 'fixed') setIsFixedExpenseFormOpen(true)
    else if (target === 'schedule') setIsScheduleFormOpen(true)
    else setIsBudgetFormOpen(true)
  }

  // ─── Drawer helpers ───────────────────────────────────────────────────────
  const getEntriesForDateStr = (dateStr: string) =>
    entries.filter((e) => e.date === dateStr)

  const getSchedulesForDateStr = (dateStr: string) =>
    schedules.filter((s) => dateStr >= s.startDateTime.split('T')[0] && dateStr <= s.endDateTime.split('T')[0])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full">
      {/* View Toggle & Filters */}
      <div className="mb-4">
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg mb-3">
          <button
            onClick={() => setViewType('calendar')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewType === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block" /> 달력
          </button>
          <button
            onClick={() => { setViewType('list'); setListFilterType('budget') }}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewType === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4 inline-block" /> 목록
          </button>
        </div>

        {viewType === 'calendar' && (
          <div className="flex gap-1.5">
            {(['all', 'budget', 'schedule'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`flex-1 px-2 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === f ? 'bg-[#4F46E5] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' && '전체'}
                {f === 'budget' && <><Wallet className="w-4 h-4 inline-block" /> 가계부</>}
                {f === 'schedule' && <><Calendar className="w-4 h-4 inline-block" /> 일정</>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        {...swipeHandlers}
        className="animate-[slide-up_0.3s_ease-out] flex-1 flex flex-col touch-pan-y"
      >
        {viewType === 'calendar' ? (
          <CalendarGridView
            currentDate={currentDate}
            year={year}
            month={month}
            daysInMonth={daysInMonth}
            startingDayOfWeek={startingDayOfWeek}
            filterType={filterType}
            entries={entries}
            schedules={schedules}
            eventBars={eventBars}
            onDateClick={handleDateClick}
            onEditEntry={handleEditEntry}
            onEditSchedule={handleEditSchedule}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onToday={goToday}
          />
        ) : (
          <CalendarListView
            year={year}
            month={month}
            entries={entries}
            budgetLoading={budgetLoading}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            fixedExpenses={fixedExpenses}
            fixedExpenseLoading={fixedExpenseLoading}
            schedules={schedules}
            scheduleLoading={scheduleLoading}
            filterType={listFilterType}
            onFilterChange={setListFilterType}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onEditFixedExpense={handleEditFixedExpense}
            onDeleteFixedExpense={handleDeleteFixedExpense}
            onEditSchedule={handleEditSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onAdd={handleListAdd}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onToday={goToday}
          />
        )}
      </div>

      {/* ─── Modals & Overlays ─────────────────────────────────────────────── */}

      {/* Date Choice Modal */}
      <Modal isOpen={isDateChoiceModalOpen} onClose={() => setIsDateChoiceModalOpen(false)}>
        <div className="bg-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">무엇을 추가하시겠어요?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setIsDateChoiceModalOpen(false); setEditingEntry(null); setIsBudgetFormOpen(true) }}
              className="p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <Wallet className="w-12 h-12 mb-2 mx-auto text-gray-700" />
              <div className="text-lg font-semibold text-gray-900">수입/지출</div>
            </button>
            <button
              onClick={() => { setIsDateChoiceModalOpen(false); setEditingSchedule(null); setIsScheduleFormOpen(true) }}
              className="p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
            >
              <Calendar className="w-12 h-12 mb-2 mx-auto text-gray-700" />
              <div className="text-lg font-semibold text-gray-900">일정</div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Budget Entry Form */}
      <Modal isOpen={isBudgetFormOpen} onClose={() => setIsBudgetFormOpen(false)}>
        <BudgetForm
          entry={editingEntry}
          initialDate={selectedDate}
          onSubmit={handleSubmitEntry}
          onCancel={() => setIsBudgetFormOpen(false)}
        />
      </Modal>

      {/* Fixed Expense Form */}
      <Modal isOpen={isFixedExpenseFormOpen} onClose={() => { setIsFixedExpenseFormOpen(false); setEditingFixedExpense(null) }}>
        <FixedExpenseForm
          expense={editingFixedExpense}
          onSubmit={handleSubmitFixedExpense}
          onCancel={() => { setIsFixedExpenseFormOpen(false); setEditingFixedExpense(null) }}
        />
      </Modal>

      {/* Schedule Form */}
      <Modal isOpen={isScheduleFormOpen} onClose={() => setIsScheduleFormOpen(false)}>
        <ScheduleForm
          schedule={editingSchedule}
          initialDate={selectedDate}
          onSubmit={handleSubmitSchedule}
          onCancel={() => setIsScheduleFormOpen(false)}
        />
      </Modal>

      {/* Confirm Delete */}
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
          {selectedDateForDrawer && (() => {
            const dateEntries = getEntriesForDateStr(selectedDateForDrawer)
            const dateSchedules = getSchedulesForDateStr(selectedDateForDrawer)
            const showBudget = filterType === 'all' || filterType === 'budget'
            const showSchedule = filterType === 'all' || filterType === 'schedule'
            const hasItems = (showBudget && dateEntries.length > 0) || (showSchedule && dateSchedules.length > 0)

            return (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {new Date(selectedDateForDrawer).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </h3>

                <div className="space-y-2 mb-4">
                  {showBudget && dateEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => { setIsDrawerOpen(false); handleEditEntry(entry) }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{entry.description}</div>
                        <div className="text-sm text-gray-500">가계부</div>
                      </div>
                      <div className={`font-semibold ${entry.amount > 0 ? 'text-green-600' : 'text-rose-400'}`}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}원
                      </div>
                    </div>
                  ))}

                  {showSchedule && dateSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      onClick={() => { setIsDrawerOpen(false); handleEditSchedule(schedule) }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{schedule.title}</div>
                        <div className="text-sm text-gray-500">일정 {schedule.isAllDay ? '(종일)' : ''}</div>
                      </div>
                      <div className="text-violet-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  ))}

                  {!hasItems && (
                    <div className="text-center py-8 text-gray-400">
                      {filterType === 'budget' ? '등록된 가계부 내역이 없습니다'
                        : filterType === 'schedule' ? '등록된 일정이 없습니다'
                        : '등록된 항목이 없습니다'}
                    </div>
                  )}
                </div>

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
            )
          })()}
        </div>
      </Drawer>

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  )
}
