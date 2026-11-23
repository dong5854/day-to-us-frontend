import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CalendarMonthHeader } from './CalendarMonthHeader'

afterEach(cleanup)

it('월 이동과 카테고리 분석을 구분하고 선택한 월을 표시한다', () => {
  const props = { view: 'calendar' as const, onViewChange: vi.fn(), year: 2026, month: 9, onPrevMonth: vi.fn(), onNextMonth: vi.fn(), onToday: vi.fn(), onOpenCategories: vi.fn() }
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

it('보기 버튼에서 키보드로 목록을 선택하고 Escape로 선택을 취소할 수 있다', () => {
  const onViewChange = vi.fn()
  render(<CalendarMonthHeader year={2026} month={10} view="calendar" onViewChange={onViewChange}
    onPrevMonth={vi.fn()} onNextMonth={vi.fn()} onToday={vi.fn()} />)
  const menu = screen.getByRole('combobox', { name: '보기 방식' })
  fireEvent.keyDown(menu, { key: 'ArrowDown' })
  expect(screen.getByRole('option', { name: '달력' }).getAttribute('aria-selected')).toBe('true')
  fireEvent.keyDown(menu, { key: 'Escape' })
  expect(onViewChange).not.toHaveBeenCalled()
  fireEvent.keyDown(menu, { key: 'ArrowDown' })
  fireEvent.keyDown(menu, { key: 'Enter' })
  expect(onViewChange).toHaveBeenCalledWith('list')
  expect(menu.getAttribute('aria-expanded')).toBe('false')
})
