import { ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  year: number
  month: number // 0-indexed
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  onOpenCategories?: () => void
}

export function CalendarMonthHeader({ year, month, onPrevMonth, onNextMonth, onToday, onOpenCategories }: Props) {
  return (
    <div className="mb-3 md:mb-5">
      <div className="flex items-center justify-between gap-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{year}년 {month + 1}월</h2>
        <div className="flex shrink-0 items-center">
          <button type="button" aria-label="이전 달" onClick={onPrevMonth} className="flex size-11 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={onToday} className="min-h-11 px-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">오늘</button>
          <button type="button" aria-label="다음 달" onClick={onNextMonth} className="flex size-11 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
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
