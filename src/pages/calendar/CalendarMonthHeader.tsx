import { useId } from 'react'
import { Select } from '@/shared/components/Select'
import type { CalendarView } from './CalendarViewTabs'
import { ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  year: number
  month: number // 0-indexed
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  onOpenCategories?: () => void
}

export function CalendarMonthHeader({ view, onViewChange, year, month, onPrevMonth, onNextMonth, onToday, onOpenCategories }: Props) {
  const viewId = useId()
  return (
    <div className="mb-3 md:mb-5">
      <div className="mx-2 flex flex-wrap items-center justify-between gap-y-1 md:mx-0">
        <div className="flex items-center">
          <h2 className="min-[360px]:mr-1 sm:mr-2 text-lg min-[360px]:text-xl sm:text-2xl font-bold text-gray-900">{year}년 {month + 1}월</h2>
          <button type="button" aria-label="이전 달" onClick={onPrevMonth} className="flex size-11 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={onToday} className="min-h-11 px-1 min-[360px]:px-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">오늘</button>
          <button type="button" aria-label="다음 달" onClick={onNextMonth} className="flex size-11 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
        <label className="sr-only" htmlFor={viewId}>보기 방식</label>
        <Select id={viewId} size="sm" variant="toolbar" className="ml-auto [&_[role=option]]:min-h-11"
          value={view} options={[{ value: 'calendar', label: '달력' }, { value: 'list', label: '목록' }]}
          onChange={value => onViewChange(value === 'list' ? 'list' : 'calendar')} />
      </div>
      {onOpenCategories && (
        <button
          type="button"
          onClick={onOpenCategories}
          className="mt-2 flex min-h-11 w-full items-center gap-2.5 rounded-xl bg-indigo-50/70 px-3 text-left text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 active:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <ChartNoAxesColumnIncreasing className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{month + 1}월 카테고리별 지출</span>
          <ChevronRight className="size-4 shrink-0 text-indigo-400" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
