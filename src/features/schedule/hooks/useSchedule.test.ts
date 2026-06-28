import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSchedule } from './useSchedule'
import { scheduleApi } from '../api/scheduleApi'

vi.mock('../api/scheduleApi', () => ({
  scheduleApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockSchedule = {
  id: '1',
  title: '데이트',
  startDateTime: '2024-01-15T10:00:00',
  endDateTime: '2024-01-15T14:00:00',
}

describe('useSchedule', () => {
  beforeEach(() => {
    vi.mocked(scheduleApi.getAll).mockResolvedValue([])
    vi.mocked(scheduleApi.create).mockResolvedValue(mockSchedule as never)
    vi.mocked(scheduleApi.update).mockResolvedValue(mockSchedule as never)
    vi.mocked(scheduleApi.delete).mockResolvedValue(undefined as never)
  })

  it('spaceId가 null이면 API를 호출하지 않는다', async () => {
    const { result } = renderHook(() => useSchedule(null))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(scheduleApi.getAll).not.toHaveBeenCalled()
    expect(result.current.schedules).toEqual([])
  })

  it('spaceId가 있으면 schedules를 로드한다', async () => {
    vi.mocked(scheduleApi.getAll).mockResolvedValue([mockSchedule] as never)

    const { result } = renderHook(() => useSchedule('space-1', 2024, 1))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.schedules).toHaveLength(1)
    expect(scheduleApi.getAll).toHaveBeenCalledWith('space-1', 2024, 1)
  })

  it('fetchSchedules 실패 시 error 상태를 설정한다', async () => {
    vi.mocked(scheduleApi.getAll).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSchedule('space-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('일정을 불러오는데 실패했습니다.')
  })

  it('createSchedule 성공 시 schedules에 새 일정을 추가한다', async () => {
    vi.mocked(scheduleApi.getAll).mockResolvedValue([])
    const newSchedule = { ...mockSchedule, id: '2', title: '영화' }
    vi.mocked(scheduleApi.create).mockResolvedValue(newSchedule as never)

    const { result } = renderHook(() => useSchedule('space-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createSchedule({
        title: '영화',
        startDateTime: '2024-01-20T18:00:00',
        endDateTime: '2024-01-20T20:00:00',
        isAllDay: false,
      })
    })

    expect(result.current.schedules).toContainEqual(newSchedule)
  })

  it('updateSchedule 성공 시 해당 일정을 업데이트한다', async () => {
    vi.mocked(scheduleApi.getAll).mockResolvedValue([mockSchedule] as never)
    const updated = { ...mockSchedule, title: '변경된 제목' }
    vi.mocked(scheduleApi.update).mockResolvedValue(updated as never)

    const { result } = renderHook(() => useSchedule('space-1'))
    await waitFor(() => expect(result.current.schedules).toHaveLength(1))

    await act(async () => {
      await result.current.updateSchedule('1', {
        title: '변경된 제목',
        startDateTime: mockSchedule.startDateTime,
        endDateTime: mockSchedule.endDateTime,
        isAllDay: false,
      })
    })

    expect(result.current.schedules[0].title).toBe('변경된 제목')
  })

  it('deleteSchedule 성공 시 schedules에서 제거한다', async () => {
    vi.mocked(scheduleApi.getAll).mockResolvedValue([mockSchedule] as never)

    const { result } = renderHook(() => useSchedule('space-1'))
    await waitFor(() => expect(result.current.schedules).toHaveLength(1))

    await act(async () => {
      await result.current.deleteSchedule('1')
    })

    expect(result.current.schedules).toHaveLength(0)
  })
})
