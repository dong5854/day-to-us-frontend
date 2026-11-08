import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { savingsApi } from '../api/savingsApi'
import { spaceApi } from '@/features/space/api/spaceApi'
import type { UserResponse } from '@/features/space/types/space.types'
import type { SavingsMonth, SavingsPlanRequest, SavingsRecordRequest } from '../types/savings.types'

export const savingsError = (error: unknown) => isAxiosError(error)
  ? error.response?.data?.message || '저축 처리에 실패했습니다. 다시 시도해 주세요.'
  : error instanceof Error ? error.message : '저축 처리에 실패했습니다.'

export function useSavings(spaceId: string, year: number, month: number, group?: 'general' | 'pension') {
  const [data, setData] = useState<SavingsMonth | null>(null)
  const [members, setMembers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const sequence = useRef(0)
  const refetch = useCallback(async () => {
    const request = ++sequence.current
    try {
      const [result, people] = await Promise.all([savingsApi.month(spaceId, year, month, group), spaceApi.getMembers()])
      if (sequence.current === request) { setData(result); setMembers(people); setError('') }
    } catch (e) {
      if (sequence.current === request) setError(savingsError(e))
    } finally { if (sequence.current === request) setLoading(false) }
  }, [spaceId, year, month, group])
  const refreshAfterSave = async () => {
    await refetch()
    window.dispatchEvent(new CustomEvent('savings-changed', { detail: { spaceId, group } }))
  }
  const invalidate = useCallback(() => { sequence.current++ }, [])
  useEffect(() => {
    setData(null); setMembers([]); setLoading(true)
    void refetch()
    const refresh = () => { if (document.visibilityState === 'visible') void refetch() }
    const changed = (event: Event) => {
      const detail = (event as CustomEvent<{ spaceId: string; group?: string }>).detail
      if (detail.spaceId === spaceId && detail.group !== group) void refetch()
    }
    window.addEventListener('savings-changed', changed)
    const timer = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => { window.removeEventListener('savings-changed', changed); invalidate(); clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [refetch, invalidate, spaceId, group])
  return {
    data, members, error, loading, refetch,
    savePlan: async (request: SavingsPlanRequest, id?: string) => { await savingsApi.savePlan(spaceId, request, id); await refreshAfterSave() },
    preview: (id: string, request: SavingsPlanRequest) => savingsApi.preview(spaceId, id, request),
    archive: async (id: string) => { await savingsApi.archive(spaceId, id); await refreshAfterSave() },
    saveRecord: async (planId: string, request: SavingsRecordRequest, id?: string) => { await savingsApi.saveRecord(spaceId, planId, request, id); await refreshAfterSave() },
    deleteRecord: async (planId: string, id: string) => { await savingsApi.deleteRecord(spaceId, planId, id); await refreshAfterSave() },
  }
}
export type SavingsState = ReturnType<typeof useSavings>
