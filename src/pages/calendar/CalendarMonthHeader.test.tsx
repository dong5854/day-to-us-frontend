import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CalendarMonthHeader } from './CalendarMonthHeader'

afterEach(cleanup)

it('월 이동과 카테고리 분석을 구분하고 선택한 월을 표시한다', () => {
  const props = { year: 2026, month: 9, onPrevMonth: vi.fn(), onNextMonth: vi.fn(), onToday: vi.fn(), onOpenCategories: vi.fn() }
  const { rerender } = render(<CalendarMonthHeader {...props} />)
  fireEvent.click(screen.getByRole('button', { name: '10월 카테고리별 지출' }))
  expect(props.onOpenCategories).toHaveBeenCalledOnce()
  expect(props.onNextMonth).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '이전 달' }))
  fireEvent.click(screen.getByRole('button', { name: '다음 달' }))
  fireEvent.click(screen.getByRole('button', { name: '오늘' }))
  expect(props.onPrevMonth).toHaveBeenCalledOnce()
  expect(props.onNextMonth).toHaveBeenCalledOnce()
  expect(props.onToday).toHaveBeenCalledOnce()
  rerender(<CalendarMonthHeader {...props} month={8} />)
  expect(screen.getByRole('button', { name: '9월 카테고리별 지출' })).toBeDefined()
  rerender(<CalendarMonthHeader {...props} onOpenCategories={undefined} />)
  expect(screen.queryByRole('button', { name: /카테고리별 지출/ })).toBeNull()
})
