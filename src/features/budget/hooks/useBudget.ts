import { useState, useEffect, useCallback } from 'react'
import { budgetApi } from '../api/budgetApi'
import type { BudgetEntryResponse, BudgetEntryRequest } from '../types/budget.types'

export const useBudget = (spaceId: string | null, year?: number, month?: number) => {
  const [entries, setEntries] = useState<BudgetEntryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!spaceId) {
      setEntries([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await budgetApi.getAll(spaceId, year, month)
      if (!Array.isArray(data)) {
        throw new Error('가계부 데이터가 올바른 배열 형식이 아닙니다.')
      }
      setEntries(data)
    } catch (err) {
      setError('가계부 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [spaceId, year, month])

  const createEntry = useCallback(async (data: BudgetEntryRequest) => {
    if (!spaceId) return

    try {
      setError(null)
      const newEntry = await budgetApi.create(spaceId, data)
      setEntries((prev) => [...prev, newEntry])
      return newEntry
    } catch (err) {
      setError('항목 추가에 실패했습니다.')
      console.error(err)
      throw err
    }
  }, [spaceId])

  const updateEntry = useCallback(async (entryId: string, data: BudgetEntryRequest) => {
    if (!spaceId) return

    try {
      setError(null)
      const updatedEntry = await budgetApi.update(spaceId, entryId, data)
      setEntries((prev) => prev.map((e) => (e.id === entryId ? updatedEntry : e)))
      return updatedEntry
    } catch (err) {
      setError('항목 수정에 실패했습니다.')
      console.error(err)
      throw err
    }
  }, [spaceId])

  const deleteEntry = useCallback(async (entryId: string) => {
    if (!spaceId) return

    try {
      setError(null)
      await budgetApi.delete(spaceId, entryId)
      setEntries((prev) => prev.filter((e) => e.id !== entryId))
    } catch (err) {
      setError('항목 삭제에 실패했습니다.')
      console.error(err)
      throw err
    }
  }, [spaceId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const totalIncome = entries.filter((e) => e.amount > 0).reduce((sum, e) => sum + e.amount, 0)
  const totalExpense = entries.filter((e) => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0)
  const balance = totalIncome - totalExpense

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
    totalIncome,
    totalExpense,
    balance,
  }
}
