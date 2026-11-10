import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { kisApi } from '../api/kisApi'
import { useKisConnections } from './useKisConnections'
vi.mock('../api/kisApi', () => ({ kisApi: { status: vi.fn(), connect: vi.fn(), sync: vi.fn(), disconnect: vi.fn() } }))
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(kisApi.status).mockResolvedValue({ canConnect: true, accounts: [], connectablePlanIds: [] }) })
it('연결 요청이 처리되는 동안 중복 제출하지 않는다', async () => {
  let finish!: () => void
  vi.mocked(kisApi.connect).mockImplementation(() => new Promise(resolve => { finish = resolve }))
  const { result } = renderHook(() => useKisConnections('space'))
  await waitFor(() => expect(result.current.status).not.toBeNull())
  const credentials = { accountNumber: '12345678', appKey: 'key', appSecret: 'secret', shareConsent: true }
  let first!: Promise<boolean>
  await act(async () => {
    first = result.current.connect('plan', credentials)
    expect(await result.current.connect('plan', credentials)).toBe(false)
  })
  expect(kisApi.connect).toHaveBeenCalledTimes(1)
  await act(async () => { finish(); await first })
  expect(result.current.busy).toBe(false)
})
it('조회 실패 시 기존 잔고를 유지하고 오류를 알린다', async () => {
  const { result } = renderHook(() => useKisConnections('space'))
  await waitFor(() => expect(result.current.status).not.toBeNull())
  const previous = result.current.status
  vi.mocked(kisApi.sync).mockRejectedValue(new Error('조회 실패'))
  await act(async () => { expect(await result.current.sync('plan')).toBe(false) })
  expect(result.current.status).toBe(previous)
  expect(result.current.error).toBe('조회 실패')
})
it('공간이 바뀌면 이전 공간의 늦은 응답을 버린다', async () => {
  let finish!: (value: Awaited<ReturnType<typeof kisApi.status>>) => void
  vi.mocked(kisApi.status).mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const { result, rerender } = renderHook(({ space }) => useKisConnections(space), { initialProps: { space: 'old' } })
  rerender({ space: 'new' })
  await waitFor(() => expect(result.current.status).not.toBeNull())
  await act(async () => { finish({ canConnect: false, accounts: [], connectablePlanIds: ['old-private-plan'] }) })
  expect(result.current.status?.connectablePlanIds).toEqual([])
})
