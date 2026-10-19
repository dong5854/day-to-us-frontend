import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { CalendarPage } from './CalendarPage'

const deletes = vi.hoisted(() => ({ budget: vi.fn(), schedule: vi.fn(), savings: vi.fn() }))

vi.mock('@/features/budget/hooks/useBudget', () => ({ useBudget: () => ({ entries: [{ id: 'income', description: '테스트 월급', amount: 3000000, date: '2026-10-08' }], loading: false, deleteEntry: deletes.budget }) }))
vi.mock('@/features/budget/hooks/useExpenseCategories', () => ({ useExpenseCategories: () => ({ categories: [] }) }))
vi.mock('@/features/budget/hooks/usePaymentMethods', () => ({ usePaymentMethods: () => ({ paymentMethods: [] }) }))
vi.mock('@/features/fixedExpense/hooks/useFixedExpense', () => ({ useFixedExpense: () => ({ expenses: [], loading: false }) }))
vi.mock('@/features/schedule/hooks/useSchedule', () => ({ useSchedule: () => ({ schedules: [{ id: 'schedule', title: '테스트 약속', startDateTime: '2026-10-08T10:00:00', endDateTime: '2026-10-08T11:00:00', isAllDay: false }], loading: false, deleteSchedule: deletes.schedule }) }))
vi.mock('@/features/savings/hooks/useSavings', () => ({
  savingsError: (e: Error) => e.message,
  useSavings: () => ({ deleteRecord: deletes.savings, loading: false, error: '', members: [], data: { plans: [], balance: 0, deposits: 0, withdrawals: 0, balanceDate: '2026-10-18', records: [
    { id: 'a', planId: 'p', planName: '여행 자금', date: '2026-10-08', amount: 10000, payerName: '동영', planned: false, automatic: true },
    { id: 'b', planId: 'p', planName: '여행 자금', date: '2026-10-25', amount: 10000, payerName: '동영', planned: true, automatic: true },
  ] } }),
}))
afterEach(() => { cleanup(); Object.values(deletes).forEach(mock => mock.mockReset()) })
const openDate = (day: string) => {
  render(<CalendarPage spaceId="space" currentDate={new Date(2026, 9, 1)} onDateChange={vi.fn()}/>)
  fireEvent.click(screen.getByText(day))
  return screen.getByRole('dialog', { name: '상세 보기' })
}
const swipe = (drawer: HTMLElement, title: string, vertical = false) => {
  const card = within(drawer).getByText(title).closest('[style*="translateX"]')!
  fireEvent.touchStart(card, { touches: [{ clientX: 200, clientY: 100 }] })
  fireEvent.touchMove(card, { touches: [{ clientX: vertical ? 198 : 110, clientY: vertical ? 180 : 100 }] })
  fireEvent.touchEnd(card, { changedTouches: [{ clientX: vertical ? 198 : 110, clientY: vertical ? 180 : 100 }] })
}
it.each([
  ['테스트 약속', 'schedule', ['schedule']],
  ['테스트 월급', 'budget', ['income']],
  ['여행 자금', 'savings', ['p', 'a']],
] as const)('%s는 drawer에서 스와이프한 뒤 확인해야 삭제한다', async (title, kind, args) => {
  const drawer = openDate('8')
  expect(within(drawer).queryByRole('button', { name: '삭제' })).toBeNull()
  swipe(drawer, title)
  fireEvent.click(within(drawer).getByRole('button', { name: '삭제' }))
  expect(screen.getByText('삭제 확인')).toBeDefined()
  expect(deletes[kind]).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '삭제' }))
  await waitFor(() => expect(deletes[kind]).toHaveBeenCalledWith(...args))
  expect(screen.getByRole('dialog', { name: '상세 보기' })).toBeDefined()
})
it('삭제를 취소하면 API를 호출하지 않고 drawer를 유지한다', () => {
  const drawer = openDate('8')
  swipe(drawer, '테스트 약속')
  fireEvent.click(within(drawer).getByRole('button', { name: '삭제' }))
  fireEvent.click(screen.getByRole('button', { name: '취소' }))
  expect(deletes.schedule).not.toHaveBeenCalled()
  expect(screen.queryByText('삭제 확인')).toBeNull()
  expect(screen.getByRole('dialog', { name: '상세 보기' })).toBeDefined()
})
it('세로 스크롤은 삭제 동작이나 일정 편집을 실행하지 않는다', () => {
  const drawer = openDate('8')
  swipe(drawer, '테스트 약속', true)
  expect(within(drawer).queryByRole('button', { name: '삭제' })).toBeNull()
  expect(screen.queryByText('일정 수정')).toBeNull()
  expect(deletes.schedule).not.toHaveBeenCalled()
})
it('미래 저축 예정은 실제 기록처럼 스와이프 삭제하지 않는다', () => {
  const drawer = openDate('25')
  expect(within(drawer).getByText(/납입 예정/)).toBeDefined()
  expect(within(drawer).queryByRole('button', { name: '삭제', hidden: true })).toBeNull()
})
it('삭제 실패 시 오류를 표시하고 drawer 내역은 유지한다', async () => {
  deletes.schedule.mockRejectedValueOnce(new Error('network'))
  const drawer = openDate('8')
  swipe(drawer, '테스트 약속')
  fireEvent.click(within(drawer).getByRole('button', { name: '삭제' }))
  fireEvent.click(screen.getByRole('button', { name: '삭제' }))
  await screen.findByText('일정 삭제에 실패했습니다')
  expect(within(drawer).getByText('테스트 약속')).toBeDefined()
})
