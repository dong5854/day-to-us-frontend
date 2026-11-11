import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from '@/shared/components/Layout'
import { PensionPage } from './PensionPage'
const { monthly } = vi.hoisted(() => ({ monthly: vi.fn() }))
vi.mock('@/features/savings/hooks/useSavings', () => ({ useSavings: monthly }))
vi.mock('@/features/savings/hooks/usePensionYear', () => ({ usePensionYear: () => ({ loading: false, error: '', accounts: [
  { planId: 'a', ownerEmail: 'a@test.com', kind: 'IRP', confirmedDeposits: 9000000, unconfirmedCount: 0, hasWithdrawals: false },
  { planId: 'b', ownerEmail: 'b@test.com', kind: 'PENSION_SAVINGS', confirmedDeposits: 1000000, unconfirmedCount: 0, hasWithdrawals: false },
] }) }))
vi.mock('@/features/savings/api/kisApi', () => ({ kisApi: { status: vi.fn().mockResolvedValue({ canConnect: false, accounts: [], connectablePlanIds: [] }) } }))
afterEach(() => { cleanup(); vi.useRealTimers() })
it('연금만 조회하고 명의자별로 공제 한도를 독립 계산한다', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-08T00:00:00Z'))
  monthly.mockReturnValue({ loading: false, error: '', members: [{ email: 'a@test.com', name: '첫째' }, { email: 'b@test.com', name: '둘째' }], data: { plans: [], records: [], balance: 0, deposits: 0, withdrawals: 0, balanceDate: '2026-11-08' } })
  const openCategory = vi.fn()
  render(<MemoryRouter initialEntries={['/pensions']}><Layout space={{ id: 'space', name: '테스트 공간', inviteCode: '' }} hasSpace><PensionPage spaceId="space" onOpenCategory={openCategory}/></Layout></MemoryRouter>)
  expect(screen.getByRole('heading', { name: '테스트 공간' })).toBeTruthy()
  expect(screen.getByRole('button', { name: /달력/ }).getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: /목록/ }))
  expect(screen.getByText('공제 기준·납입 기한 안내').closest('details')?.open).toBe(false)
  expect(screen.queryByRole('button', { name: '달력으로 돌아가기' })).toBeNull()
  expect(screen.getByRole('button', { name: '연금' }).getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: '저축' }))
  expect(openCategory).toHaveBeenCalledWith('savings')
  expect(monthly).toHaveBeenCalledWith('space', 2026, 11, 'pension')
  expect(screen.getByText('올해 일반 공제 한도를 채웠어요')).toBeTruthy()
  fireEvent.click(screen.getByText('첫째'))
  fireEvent.click(screen.getByRole('option', { name: '둘째' }))
  expect(screen.queryByText('올해 일반 공제 한도를 채웠어요')).toBeNull()
  expect(screen.getByText(/일반 공제 한도까지.*8,000,000/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '달력' }))
  expect(screen.getByText('연금 예정')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '다음 달' }))
  expect(monthly).toHaveBeenLastCalledWith('space', 2026, 12, 'pension')
  fireEvent.click(screen.getByRole('button', { name: '목록' }))
  expect(screen.getByRole('heading', { name: '2026년 12월' })).toBeTruthy()
})
