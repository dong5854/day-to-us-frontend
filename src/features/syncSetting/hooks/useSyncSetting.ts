import { useState, useEffect, useCallback } from 'react'
import { syncSettingApi } from '../api/syncSettingApi'
import type {
  SyncSettingRequest,
  SyncSettingResponse,
  GoogleCalendarListEntry,
} from '../types/syncSetting.types'

export const useSyncSetting = () => {
  const [syncSetting, setSyncSetting] = useState<SyncSettingResponse | null>(null)
  const [calendars, setCalendars] = useState<GoogleCalendarListEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSyncSetting = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await syncSettingApi.get()
      setSyncSetting(data)
    } catch (err) {
      setError('동기화 설정을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchGoogleCalendars = useCallback(async () => {
    try {
      const data = await syncSettingApi.getGoogleCalendars()
      setCalendars(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Google 캘린더 목록을 불러오는데 실패했습니다.', err)
    }
  }, [])

  const updateSyncSetting = useCallback(async (data: SyncSettingRequest) => {
    try {
      setError(null)
      const updated = await syncSettingApi.update(data)
      setSyncSetting(updated)
      return updated
    } catch (err) {
      setError('동기화 설정 변경에 실패했습니다.')
      throw err
    }
  }, [])

  const syncNow = useCallback(async () => {
    try {
      setError(null)
      await syncSettingApi.syncNow()
    } catch (err) {
      setError('동기화 실행에 실패했습니다.')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchSyncSetting()
    fetchGoogleCalendars()
  }, [fetchSyncSetting, fetchGoogleCalendars])

  return {
    syncSetting,
    calendars,
    loading,
    error,
    fetchSyncSetting,
    fetchGoogleCalendars,
    updateSyncSetting,
    syncNow,
  }
}
