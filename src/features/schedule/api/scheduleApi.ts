import apiClient from '@/shared/api/client'
import type { ScheduleRequest, ScheduleResponse } from '../types/schedule.types'

const BASE_PATH = '/shared-spaces'

export const scheduleApi = {
  getAll: async (spaceId: string, year?: number, month?: number): Promise<ScheduleResponse[]> => {
    const params = new URLSearchParams()
    if (year !== undefined) params.append('year', year.toString())
    if (month !== undefined) params.append('month', month.toString())
    
    const queryString = params.toString()
    const url = `${BASE_PATH}/${spaceId}/schedules${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<ScheduleResponse[]>(url)
    return response.data
  },

  getById: async (spaceId: string, scheduleId: string): Promise<ScheduleResponse> => {
    const response = await apiClient.get<ScheduleResponse>(
      `${BASE_PATH}/${spaceId}/schedules/${scheduleId}`
    )
    return response.data
  },

  create: async (spaceId: string, data: ScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiClient.post<ScheduleResponse>(
      `${BASE_PATH}/${spaceId}/schedules`,
      data
    )
    return response.data
  },

  update: async (
    spaceId: string,
    scheduleId: string,
    data: ScheduleRequest
  ): Promise<ScheduleResponse> => {
    const response = await apiClient.put<ScheduleResponse>(
      `${BASE_PATH}/${spaceId}/schedules/${scheduleId}`,
      data
    )
    return response.data
  },

  delete: async (spaceId: string, scheduleId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${spaceId}/schedules/${scheduleId}`)
  },
}
