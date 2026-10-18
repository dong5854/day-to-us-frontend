import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CalendarPage } from './CalendarPage'

vi.mock('@/features/budget/hooks/useBudget', () => ({ useBudget: () => ({ entries: [{ id: 'income', description: '테스트 월급', amount: 3000000, date: '2026-10-01' }], loading: false }) }))
vi.mock('@/features/budget/hooks/useExpenseCategories', () => ({ useExpenseCategories: () => ({ categories: [] }) }))
vi.mock('@/features/budget/hooks/usePaymentMethods', () => ({ usePaymentMethods: () => ({ paymentMethods: [] }) }))
vi.mock('@/features/fixedExpense/hooks/useFixedExpense', () => ({ useFixedExpense: () => ({ expenses: [], loading: false }) }))
vi.mock('@/features/schedule/hooks/useSchedule', () => ({ useSchedule: () => ({ schedules: [{ id: 'schedule', title: '테스트 약속', startDateTime: '2026-10-08T10:00:00', endDateTime: '2026-10-08T11:00:00', isAllDay: false }], loading: false }) }))
vi.mock('@/features/savings/hooks/useSavings', () => ({
  savingsError: (e: Error) => e.message,
  useSavings: () => ({ loading: false, error: '', members: [], data: { plans: [], balance: 0, deposits: 0, withdrawals: 0, balanceDate: '2026-10-18', records: [
    { id: 'a', planId: 'p', planName: '여행 자금', date: '2026-10-08', amount: 10000, payerName: '동영', planned: false, automatic: true },
    { id: 'b', planId: 'p', planName: '여행 자금', date: '2026-10-25', amount: 10000, payerName: '동영', planned: true, automatic: true },
  ] } }),
}))
afterEach(cleanup)
it('보기 선택이 항목 필터보다 위에 있고 항목 변경은 달력과 목록을 유지한다', () => {
  render(<CalendarPage spaceId="space" currentDate={new Date(2026, 9, 1)} onDateChange={vi.fn()}/>)
  const view = screen.getByLabelText('보기 방식')
  const filters = screen.getByRole('navigation', { name: '항목 필터' })
  expect(view.compareDocumentPosition(filters) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  for (const mode of ['달력', '목록']) {
    fireEvent.click(screen.getByRole('button', { name: mode }))
    for (const category of ['가계부', '저축', '일정', '전체']) {
      fireEvent.click(screen.getByRole('button', { name: category }))
      expect(screen.getByRole('button', { name: mode }).getAttribute('aria-pressed')).toBe('true')
      expect(screen.getByRole('button', { name: category }).getAttribute('aria-pressed')).toBe('true')
    }
  }
})
it('모든 필터에서 보기 변경이 필터를 유지하고 전체 목록에도 세 종류가 표시된다', () => {
  render(<CalendarPage spaceId="space" currentDate={new Date(2026, 9, 1)} onDateChange={vi.fn()}/>)
  for (const category of ['가계부', '저축', '일정', '전체']) {
    fireEvent.click(screen.getByRole('button', { name: category }))
    for (const mode of ['목록', '달력', '목록']) {
      fireEvent.click(screen.getByRole('button', { name: mode }))
      expect(screen.getByRole('button', { name: category }).getAttribute('aria-pressed')).toBe('true')
      expect(screen.getByRole('button', { name: mode }).getAttribute('aria-pressed')).toBe('true')
    }
  }
  expect(screen.getByRole('region', { name: '전체 내역' })).toBeDefined()
  expect(screen.getByText('테스트 월급')).toBeDefined()
  expect(screen.getByText('테스트 약속')).toBeDefined()
  expect(screen.getAllByText('여행 자금')).toHaveLength(2)
})
it('저축 달력 점은 주황 계열이며 예정과 실제 기록을 구분한다', () => {
  render(<CalendarPage spaceId="space" currentDate={new Date(2026, 9, 1)} onDateChange={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button', { name: '저축' }))
  const planned = screen.getByRole('img', { name: '여행 자금 납입 예정' })
  const posted = screen.getByRole('img', { name: '여행 자금 납입 기록' })
  expect(planned.className).toContain('bg-transparent')
  expect(posted.className).toContain('bg-[#D97706]')
  fireEvent.click(screen.getByRole('button', { name: '가계부' }))
  expect(screen.queryByRole('img', { name: '여행 자금 납입 예정' })).toBeNull()
})
