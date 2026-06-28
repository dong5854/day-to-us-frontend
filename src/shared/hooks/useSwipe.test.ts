import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSwipe } from './useSwipe'

const makeTouchEvent = (clientX: number) =>
  ({ targetTouches: [{ clientX }] }) as unknown as React.TouchEvent

describe('useSwipe', () => {
  it('threshold 이상 좌측 스와이프 시 onSwipeLeft를 호출한다', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, threshold: 50 }))

    // state 의존 호출은 각각 별도 act()로 실행해야 이전 렌더의 클로저를 피할 수 있음
    act(() => { result.current.onTouchStart(makeTouchEvent(200)) })
    act(() => { result.current.onTouchMove(makeTouchEvent(100)) })
    act(() => { result.current.onTouchEnd() })

    expect(onSwipeLeft).toHaveBeenCalledOnce()
  })

  it('threshold 이상 우측 스와이프 시 onSwipeRight를 호출한다', () => {
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeRight, threshold: 50 }))

    act(() => { result.current.onTouchStart(makeTouchEvent(100)) })
    act(() => { result.current.onTouchMove(makeTouchEvent(200)) })
    act(() => { result.current.onTouchEnd() })

    expect(onSwipeRight).toHaveBeenCalledOnce()
  })

  it('threshold 미만 이동 시 콜백을 호출하지 않는다', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, onSwipeRight, threshold: 50 }))

    act(() => { result.current.onTouchStart(makeTouchEvent(100)) })
    act(() => { result.current.onTouchMove(makeTouchEvent(70)) }) // 30px만 이동
    act(() => { result.current.onTouchEnd() })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('touchStart 없이 onTouchEnd 호출 시 아무것도 하지 않는다', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeLeft }))

    act(() => { result.current.onTouchEnd() })

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('기본 threshold(50)를 사용한다', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeLeft }))

    act(() => { result.current.onTouchStart(makeTouchEvent(200)) })
    act(() => { result.current.onTouchMove(makeTouchEvent(149)) }) // 51px 이동
    act(() => { result.current.onTouchEnd() })

    expect(onSwipeLeft).toHaveBeenCalledOnce()
  })
})
