import apiClient from '@/shared/api/client'
import type {
  SyncSettingRequest,
  SyncSettingResponse,
  GoogleCalendarListEntry,
} from '../types/syncSetting.types'

export const syncSettingApi = {
  get: async (): Promise<SyncSettingResponse> => {
    const response = await apiClient.get<SyncSettingResponse>('/sync-settings')
    return response.data
  },

  update: async (data: SyncSettingRequest): Promise<SyncSettingResponse> => {
    const response = await apiClient.put<SyncSettingResponse>('/sync-settings', data)
    return response.data
  },

  getGoogleCalendars: async (): Promise<GoogleCalendarListEntry[]> => {
    const response = await apiClient.get<GoogleCalendarListEntry[]>(
      '/sync-settings/google-calendars'
    )
    return response.data
  },

  syncNow: async (): Promise<void> => {
    await apiClient.post('/sync-settings/sync-now')
  },
}
