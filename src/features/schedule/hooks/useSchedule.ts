import { useState, useEffect } from 'react'
import { scheduleApi } from '../api/scheduleApi'
import type { ScheduleRequest, ScheduleResponse } from '../types/schedule.types'

export const useSchedule = (spaceId: string | null) => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = async (year?: number, month?: number) => {
    if (!spaceId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await scheduleApi.getAll(spaceId, year, month)
      setSchedules(data)
    } catch (err) {
      setError('일정을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createSchedule = async (data: ScheduleRequest) => {
    if (!spaceId) throw new Error('Space ID is required')

    try {
      const newSchedule = await scheduleApi.create(spaceId, data)
      setSchedules((prev) => [...prev, newSchedule])
      return newSchedule
    } catch (err) {
      setError('일정 생성에 실패했습니다.')
      throw err
    }
  }

  const updateSchedule = async (scheduleId: string, data: ScheduleRequest) => {
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
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!spaceId) throw new Error('Space ID is required')

    try {
      await scheduleApi.delete(spaceId, scheduleId)
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId))
    } catch (err) {
      setError('일정 삭제에 실패했습니다.')
      throw err
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [spaceId])

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
