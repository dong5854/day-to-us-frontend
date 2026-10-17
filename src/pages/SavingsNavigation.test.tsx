import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CalendarPage } from './CalendarPage'

vi.mock('@/features/budget/hooks/useBudget', () => ({ useBudget: () => ({ entries: [], loading: false }) }))
vi.mock('@/features/budget/hooks/useExpenseCategories', () => ({ useExpenseCategories: () => ({ categories: [] }) }))
vi.mock('@/features/budget/hooks/usePaymentMethods', () => ({ usePaymentMethods: () => ({ paymentMethods: [] }) }))
vi.mock('@/features/fixedExpense/hooks/useFixedExpense', () => ({ useFixedExpense: () => ({ expenses: [], loading: false }) }))
vi.mock('@/features/schedule/hooks/useSchedule', () => ({ useSchedule: () => ({ schedules: [], loading: false }) }))
vi.mock('@/features/savings/hooks/useSavings', () => ({
  savingsError: (e: Error) => e.message,
  useSavings: () => ({ loading: false, error: '', members: [], data: { plans: [], balance: 0, deposits: 0, withdrawals: 0, balanceDate: '2026-10-18', records: [
    { id: 'a', planId: 'p', planName: '여행 자금', date: '2026-10-08', amount: 10000, payerName: '동영', planned: false, automatic: true },
    { id: 'b', planId: 'p', planName: '여행 자금', date: '2026-10-25', amount: 10000, payerName: '동영', planned: true, automatic: true },
  ] } }),
}))
afterEach(cleanup)
it('저축은 목록으로 진입하고 달력 및 통합 달력에 예정과 기록을 표시한다', () => {
  render(<CalendarPage spaceId="space" currentDate={new Date(2026, 9, 1)} onDateChange={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button', { name: '저축' }))
  expect(screen.getByRole('button', { name: '목록' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('region', { name: '월별 저축 요약' })).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: '달력' }))
  expect(screen.getByRole('img', { name: '여행 자금 납입 예정' })).toBeDefined()
  expect(screen.getByRole('img', { name: '여행 자금 납입 기록' })).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: '통합 달력' }))
  expect(screen.getByRole('img', { name: '여행 자금 납입 예정' })).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: '가계부' }))
  expect(screen.queryByRole('img', { name: '여행 자금 납입 예정' })).toBeNull()
})
