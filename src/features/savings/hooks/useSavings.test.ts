import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { useSavings } from './useSavings'
import { savingsApi } from '../api/savingsApi'
import { spaceApi } from '@/features/space/api/spaceApi'
import type { SavingsMonth } from '../types/savings.types'
vi.mock('../api/savingsApi', () => ({ savingsApi: { month: vi.fn(), savePlan: vi.fn(), preview: vi.fn(), archive: vi.fn(), saveRecord: vi.fn(), deleteRecord: vi.fn() } }))
vi.mock('@/features/space/api/spaceApi', () => ({ spaceApi: { getMembers: vi.fn() } }))
const data = (amount: number): SavingsMonth => ({ plans: [], records: [], deposits: amount, withdrawals: 0, balance: amount, balanceDate: '2026-10-18' })
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('느린 이전 월 응답이 새 월 데이터를 덮어쓰지 않는다', async () => {
  let resolveOld!: (value: SavingsMonth) => void
  vi.mocked(spaceApi.getMembers).mockResolvedValue([])
  vi.mocked(savingsApi.month).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve })).mockResolvedValueOnce(data(200))
  const hook = renderHook(({ month }) => useSavings('space', 2026, month), { initialProps: { month: 9 } })
  hook.rerender({ month: 10 })
  await waitFor(() => expect(hook.result.current.data?.deposits).toBe(200))
  await act(async () => { resolveOld(data(100)) })
  expect(hook.result.current.data?.deposits).toBe(200)
})
it('오류 재시도로 납입자 목록도 다시 불러온다', async () => {
  vi.mocked(savingsApi.month).mockResolvedValue(data(100))
  vi.mocked(spaceApi.getMembers).mockRejectedValueOnce(new Error('멤버 조회 실패')).mockResolvedValueOnce([{ email: 'a@test.com', name: '동영' }])
  const hook = renderHook(() => useSavings('space', 2026, 10))
  await waitFor(() => expect(hook.result.current.error).toBe('멤버 조회 실패'))
  await act(async () => { await hook.result.current.refetch() })
  expect(hook.result.current.error).toBe('')
  expect(hook.result.current.members).toHaveLength(1)
})
