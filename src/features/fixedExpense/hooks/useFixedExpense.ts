import { useState, useEffect } from 'react'
import { fixedExpenseApi } from '../api/fixedExpenseApi'
import type { FixedExpenseRequest, FixedExpenseResponse } from '../types/fixedExpense.types'

export const useFixedExpense = (spaceId: string | null) => {
  const [expenses, setExpenses] = useState<FixedExpenseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
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
  }

  const createExpense = async (data: FixedExpenseRequest) => {
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
  }

  useEffect(() => {
    fetchExpenses()
  }, [spaceId])

  return {
    expenses,
    loading,
    error,
    createExpense,
    refetch: fetchExpenses,
  }
}
