import { useState, useEffect, useCallback } from 'react'
import { scheduleApi } from '../api/scheduleApi'
import type { ScheduleRequest, ScheduleResponse } from '../types/schedule.types'

export const useSchedule = (spaceId: string | null, year?: number, month?: number) => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = useCallback(async () => {
    if (!spaceId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await scheduleApi.getAll(spaceId, year, month)
      if (!Array.isArray(data)) {
        throw new Error('일정 데이터가 올바른 배열 형식이 아닙니다.')
      }
      setSchedules(data)
    } catch (err) {
      setError('일정을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [spaceId, year, month])

  const createSchedule = useCallback(async (data: ScheduleRequest) => {
    if (!spaceId) throw new Error('Space ID is required')

    try {
      const newSchedule = await scheduleApi.create(spaceId, data)
      setSchedules((prev) => [...prev, newSchedule])
      return newSchedule
    } catch (err) {
      setError('일정 생성에 실패했습니다.')
      throw err
    }
  }, [spaceId])

  const updateSchedule = useCallback(async (scheduleId: string, data: ScheduleRequest) => {
    if (!spaceId) throw new Error('Space ID is required')

    try {
      const updatedSchedule = await scheduleApi.update(spaceId, scheduleId, data)
      setSchedules((prev) =>
        prev.map((schedule) => (schedule.id === scheduleId ? updatedSchedule : schedule))
      )
      return updatedSchedule
    } catch (err) {
      setError('일정 수정에 실패했습니다.')
      throw err
    }
  }, [spaceId])

  const deleteSchedule = useCallback(async (scheduleId: string) => {
    if (!spaceId) throw new Error('Space ID is required')

    try {
      await scheduleApi.delete(spaceId, scheduleId)
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId))
    } catch (err) {
      setError('일정 삭제에 실패했습니다.')
      throw err
    }
  }, [spaceId])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}
