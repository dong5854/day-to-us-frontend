import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { useCalendarView } from './useCalendarView'

afterEach(() => localStorage.clear())

it('설정에서 선택한 보기를 복원하고 화면에서 임시로 바꾼 보기는 저장하지 않는다', () => {
  const first = renderHook(useCalendarView)
  expect(first.result.current.view).toBe('calendar')
  act(() => first.result.current.saveDefaultView('list'))
  expect(first.result.current.view).toBe('list')
  act(() => first.result.current.setView('calendar'))
  expect(first.result.current.defaultView).toBe('list')
  first.unmount()
  const reopened = renderHook(useCalendarView)
  expect(reopened.result.current.view).toBe('list')
  act(() => reopened.result.current.saveDefaultView('calendar'))
  reopened.unmount()
  expect(renderHook(useCalendarView).result.current.view).toBe('calendar')
})
