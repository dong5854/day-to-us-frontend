import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePwaUpdate } from './usePwaUpdate'

const mocks = vi.hoisted(() => ({
  setNeedRefresh: vi.fn(), updateServiceWorker: vi.fn(),
  registered: undefined as undefined | ((_url: string, registration: ServiceWorkerRegistration) => void),
}))
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (options: { onRegisteredSW: typeof mocks.registered }) => {
    mocks.registered = options.onRegisteredSW
    return { needRefresh: [true, mocks.setNeedRefresh], updateServiceWorker: mocks.updateServiceWorker }
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })

it('실행과 화면 복귀 시 확인하지만 사용자 선택 전에는 적용하지 않는다', async () => {
  const update = vi.fn().mockResolvedValue(undefined)
  const registration = { update, waiting: {}, installing: null } as unknown as ServiceWorkerRegistration
  const { result, unmount } = renderHook(() => usePwaUpdate())
  await act(async () => { mocks.registered?.('/sw.js', registration) })
  expect(update).toHaveBeenCalledTimes(1)
  expect(mocks.updateServiceWorker).not.toHaveBeenCalled()
  act(() => result.current.dismiss())
  expect(mocks.setNeedRefresh).toHaveBeenLastCalledWith(false)
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
  await act(async () => { document.dispatchEvent(new Event('visibilitychange')) })
  expect(update).toHaveBeenCalledTimes(1)
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  await act(async () => { document.dispatchEvent(new Event('visibilitychange')) })
  expect(update).toHaveBeenCalledTimes(2)
  expect(mocks.setNeedRefresh).toHaveBeenLastCalledWith(true)
  await act(async () => { await result.current.update() })
  expect(mocks.updateServiceWorker).toHaveBeenCalledExactlyOnceWith(true)
  unmount()
  window.dispatchEvent(new Event('online'))
  expect(update).toHaveBeenCalledTimes(2)
})

it('오프라인에서는 확인을 건너뛰고 연결 복구 시 다시 확인한다', async () => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
  const update = vi.fn().mockResolvedValue(undefined)
  renderHook(() => usePwaUpdate())
  await act(async () => { mocks.registered?.('/sw.js', { update } as unknown as ServiceWorkerRegistration) })
  expect(update).not.toHaveBeenCalled()
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
  await act(async () => { window.dispatchEvent(new Event('online')) })
  expect(update).toHaveBeenCalledTimes(1)
})

it('적용 실패와 지연 후에는 다시 시도할 수 있다', async () => {
  vi.useFakeTimers()
  mocks.updateServiceWorker.mockRejectedValueOnce(new Error('failed')).mockResolvedValue(undefined)
  const { result } = renderHook(() => usePwaUpdate())
  await act(async () => { await result.current.update() })
  expect(result.current.updating).toBe(false)
  expect(result.current.error).toContain('실패')
  await act(async () => { await result.current.update() })
  expect(result.current.updating).toBe(true)
  act(() => vi.advanceTimersByTime(15000))
  expect(result.current.updating).toBe(false)
  expect(result.current.error).toContain('지연')
})
