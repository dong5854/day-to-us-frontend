import { act, renderHook, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { savingsApi } from '../api/savingsApi'
import { usePensionYear } from './usePensionYear'
import type { PensionAccountSummary, SavingsMonth } from '../types/savings.types'
vi.mock('../api/savingsApi', () => ({ savingsApi: { pensionYear: vi.fn() } }))
it('갱신 중 기존 집계를 유지하고 다른 공간으로 이동하면 이전 결과를 버린다', async () => {
  const source: SavingsMonth = { plans: [], records: [], balance: 0, deposits: 0, withdrawals: 0, balanceDate: '2026-11-08' }
  const accounts: PensionAccountSummary[] = [{ planId: 'p', ownerEmail: 'a@test.com', kind: 'IRP', confirmedDeposits: 100, unconfirmedCount: 0, hasWithdrawals: false }]
  vi.mocked(savingsApi.pensionYear).mockResolvedValueOnce(accounts)
  const { result, rerender } = renderHook(({ space, data }) => usePensionYear(space, 2026, data), { initialProps: { space: 'a', data: source } })
  await waitFor(() => expect(result.current.accounts).toEqual(accounts))
  let resolveOld!: (value: PensionAccountSummary[]) => void
  vi.mocked(savingsApi.pensionYear).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
  rerender({ space: 'a', data: { ...source } })
  expect(result.current.accounts).toEqual(accounts)
  expect(result.current.refreshing).toBe(true)
  vi.mocked(savingsApi.pensionYear).mockResolvedValueOnce([])
  rerender({ space: 'b', data: { ...source } })
  expect(result.current.accounts).toEqual([])
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { resolveOld(accounts) })
  expect(result.current.accounts).toEqual([])
})
