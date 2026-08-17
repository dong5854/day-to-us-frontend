import { useState, useEffect, useCallback, useRef } from 'react'
import { fixedExpenseApi } from '../api/fixedExpenseApi'
import type { FixedExpenseRequest, FixedExpenseResponse } from '../types/fixedExpense.types'

const POLL_INTERVAL_MS = 10_000

export const useFixedExpense = (spaceId: string | null) => {
  const [expenses, setExpenses] = useState<FixedExpenseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 최초 로딩용 — loading 스피너 표시
  const fetchExpenses = useCallback(async () => {
    if (!spaceId) return

    try {
      setLoading(true)
      setError(null)
      const data = await fixedExpenseApi.getAll(spaceId)
      if (!Array.isArray(data)) {
        throw new Error('고정지출 데이터가 올바른 배열 형식이 아닙니다.')
      }
      setExpenses(data)
    } catch (err) {
      setError('고정지출 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [spaceId])

  // 폴링용 — UI 깜빡임 없이 조용히 동기화
  const silentFetch = useCallback(async () => {
    if (!spaceId) return

    try {
      const data = await fixedExpenseApi.getAll(spaceId)
      if (Array.isArray(data)) {
        setExpenses(data)
      }
    } catch (err) {
      console.error('고정지출 폴링 실패:', err)
    }
  }, [spaceId])

  const createExpense = useCallback(async (data: FixedExpenseRequest) => {
    if (!spaceId) throw new Error('공간 ID가 필요합니다.')

    try {
      setError(null)
      const newExpense = await fixedExpenseApi.create(spaceId, data)
      setExpenses((prev) => [...prev, newExpense])
      return newExpense
    } catch (err) {
      setError('고정지출 추가에 실패했습니다.')
      console.error(err)
      throw err
    }
  }, [spaceId])

  const updateExpense = useCallback(async (expenseId: string, data: FixedExpenseRequest) => {
    if (!spaceId) throw new Error('공간 ID가 필요합니다.')

    try {
      setError(null)
      const updated = await fixedExpenseApi.update(spaceId, expenseId, data)
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)))
      return updated
    } catch (err) {
      setError('고정지출 수정에 실패했습니다.')
      console.error(err)
      throw err
    }
  }, [spaceId])

  const deleteExpense = useCallback(async (expenseId: string) => {
    if (!spaceId) throw new Error('공간 ID가 필요합니다.')

    try {
      setError(null)
      await fixedExpenseApi.delete(spaceId, expenseId)
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
    } catch (err) {
      setError('고정지출 삭제에 실패했습니다.')
      console.error(err)
      throw err
    }
  }, [spaceId])

  // 최초 fetch
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // 30초 폴링 — 상대방 변경사항 자동 동기화
  useEffect(() => {
    if (!spaceId) return

    pollingRef.current = setInterval(silentFetch, POLL_INTERVAL_MS)

    return () => {
      if (pollingRef.current !== null) {
        clearInterval(pollingRef.current)
      }
    }
  }, [spaceId, silentFetch])

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}
