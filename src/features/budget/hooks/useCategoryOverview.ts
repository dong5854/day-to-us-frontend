import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { categoryBudgetApi } from '../api/categoryBudgetApi'
import { expenseCategoryApi } from '../api/expenseCategoryApi'
import { budgetApi } from '../api/budgetApi'
import { shiftCategoryMonth } from '../utils/categoryBudget'
import type { CategoryMonthTotal, CategoryOverview } from '../types/categoryBudget.types'
import type { BudgetEntryResponse } from '../types/budget.types'

export const useCategoryOverview = (spaceId: string, month: string) => {
  const [data, setData] = useState<CategoryOverview | null>(null)
  const [historyCache, setHistoryCache] = useState<{ spaceId: string; rows: Record<string, CategoryMonthTotal[]> }>({ spaceId, rows: {} })
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const historyRequest = useRef(0)
  const historyBusy = useRef(false)
  const [entries, setEntries] = useState<BudgetEntryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [saving, setSaving] = useState(false)
  const sequence = useRef(0)
  const busy = useRef(false)
  const rememberHistory = useCallback((overview: CategoryOverview) => {
    setHistoryCache(previous => {
      const rows = previous.spaceId === spaceId ? { ...previous.rows } : {}
      overview.rows.forEach(row => {
        const id = row.category?.id ?? 'uncategorized'
        const months = new Map((rows[id] ?? []).map(item => [item.month, item]))
        row.history.forEach(item => { if (item.month >= '1900-01') months.set(item.month, item) })
        rows[id] = [...months.values()].sort((a, b) => a.month.localeCompare(b.month))
      })
      return { spaceId, rows }
    })
  }, [spaceId])
  const loadEarlier = async (oldestMonth: string): Promise<string | null> => {
    if (historyBusy.current || oldestMonth <= '1900-01') return null
    historyBusy.current = true
    const request = ++historyRequest.current
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const end = shiftCategoryMonth(oldestMonth, -1)
      const overview = await categoryBudgetApi.overview(spaceId, end)
      if (request !== historyRequest.current) return null
      rememberHistory(overview)
      const first = shiftCategoryMonth(end, -5)
      return first < '1900-01' ? '1900-01' : first
    } catch {
      if (request === historyRequest.current) setHistoryError('이전 월을 불러오지 못했어요. 다시 시도해주세요.')
      return null
    } finally {
      if (request === historyRequest.current) { historyBusy.current = false; setHistoryLoading(false) }
    }
  }
  useEffect(() => () => { historyRequest.current++; historyBusy.current = false }, [spaceId])
  const refresh = useCallback(async () => {
    const request = ++sequence.current
    setLoading(true)
    setError('')
    try {
      const [year, number] = month.split('-').map(Number)
      const [overview, records] = await Promise.all([categoryBudgetApi.overview(spaceId, month), budgetApi.getAll(spaceId, year, number)])
      if (request !== sequence.current) return
      rememberHistory(overview)
      setData(overview)
      setEntries(records)
    } catch {
      if (request === sequence.current) setError('지출 현황을 불러오지 못했어요. 다시 시도해주세요.')
    } finally { if (request === sequence.current) setLoading(false) }
  }, [spaceId, month, rememberHistory])
  const invalidate = useCallback(() => { sequence.current++ }, [])
  useEffect(() => {
    void refresh()
    const onVisible = () => { if (document.visibilityState === 'visible' && !busy.current) void refresh() }
    window.addEventListener('focus', onVisible)
    document.addEventListener('visibilitychange', onVisible)
    return () => { invalidate(); window.removeEventListener('focus', onVisible); document.removeEventListener('visibilitychange', onVisible) }
  }, [refresh, invalidate])
  const mutate = async (action: () => Promise<unknown>) => {
    if (busy.current) return false
    busy.current = true
    historyRequest.current++
    historyBusy.current = false
    setHistoryLoading(false)
    setSaving(true)
    setMutationError('')
    try {
      await action()
      window.dispatchEvent(new Event('categories-changed'))
      await refresh()
      return true
    } catch (error) {
      setMutationError(axios.isAxiosError(error) && typeof error.response?.data?.message === 'string' ? error.response.data.message : '저장하지 못했어요. 다시 시도해주세요.')
      return false
    } finally { busy.current = false; setSaving(false) }
  }
  return {
    data: data?.month === month ? data : null, history: historyCache.spaceId === spaceId ? historyCache.rows : {}, historyLoading, historyError, loadEarlier, entries, loading, error, mutationError, saving, refresh,
    clearMutationError: () => setMutationError(''),
    create: (name: string) => mutate(() => expenseCategoryApi.create(spaceId, { name })),
    rename: (id: string, name: string) => mutate(() => categoryBudgetApi.rename(spaceId, id, name)),
    reorder: (ids: string[]) => mutate(() => categoryBudgetApi.reorder(spaceId, ids)),
    archive: (id: string, archived: boolean) => mutate(() => categoryBudgetApi.archive(spaceId, id, archived)),
    remove: (id: string) => mutate(() => expenseCategoryApi.delete(spaceId, id)),
    budget: (id: string, amount: number | null, repeat: boolean) => mutate(() => categoryBudgetApi.budget(spaceId, id, month, amount, repeat)),
  }
}
