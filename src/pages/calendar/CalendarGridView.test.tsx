import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { CalendarGridView } from './CalendarGridView'

it('날짜마다 키보드로 접근 가능한 버튼이 있고 선택한 날짜를 한 번만 연다', () => {
  const onDateClick = vi.fn()
  render(<CalendarGridView currentDate={new Date(2028, 1, 1)} year={2028} month={1}
    daysInMonth={29} startingDayOfWeek={2} filterType="all" entries={[]} schedules={[]} eventBars={[]}
    onDateClick={onDateClick} onEditEntry={vi.fn()} onEditSchedule={vi.fn()}
    onPrevMonth={vi.fn()} onNextMonth={vi.fn()} onToday={vi.fn()} />)

  expect(screen.getAllByRole('button', { name: /^2028년 2월 \d+일 열기$/ })).toHaveLength(29)
  const leapDay = screen.getByRole('button', { name: '2028년 2월 29일 열기' })
  leapDay.focus()
  expect(document.activeElement).toBe(leapDay)
  fireEvent.click(leapDay)
  expect(onDateClick).toHaveBeenCalledTimes(1)
  expect(onDateClick).toHaveBeenCalledWith(2028, 1, 29)
})
