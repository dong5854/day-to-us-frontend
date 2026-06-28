import { useState, useEffect, useCallback } from 'react'
import { fixedExpenseApi } from '../api/fixedExpenseApi'
import type { FixedExpenseRequest, FixedExpenseResponse } from '../types/fixedExpense.types'

export const useFixedExpense = (spaceId: string | null) => {
  const [expenses, setExpenses] = useState<FixedExpenseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!spaceId) return

    try {
      setLoading(true)
      setError(null)
      const data = await fixedExpenseApi.getAll(spaceId)
      setExpenses(data)
    } catch (err) {
      setError('고정지출 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
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

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

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
