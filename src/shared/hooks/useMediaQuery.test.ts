import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.mocked(window.matchMedia).mockClear()
  })

  it('초기값으로 matchMedia().matches를 반환한다', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(true)
  })

  it('matches=false인 경우 false를 반환한다', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(false)
  })

  it('addEventListener를 등록한다', () => {
    const addListener = vi.fn()
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: addListener,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList)

    renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(addListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('unmount 시 removeEventListener를 호출한다 (메모리 누수 방지)', () => {
    const removeListener = vi.fn()
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: removeListener,
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList)

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    unmount()
    expect(removeListener).toHaveBeenCalled()
  })

  it('미디어 쿼리 변경 이벤트 발생 시 matches 상태를 업데이트한다', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn((_, handler) => { changeHandler = handler }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(false)

    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current).toBe(true)
  })
})
