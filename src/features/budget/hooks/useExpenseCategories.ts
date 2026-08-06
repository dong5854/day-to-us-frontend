import { useState, useEffect, useCallback } from 'react'
import { expenseCategoryApi } from '../api/expenseCategoryApi'
import type { ExpenseCategoryResponse } from '../types/expenseCategory.types'

export const useExpenseCategories = (spaceId: string | null) => {
  const [categories, setCategories] = useState<ExpenseCategoryResponse[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    if (!spaceId) {
      setCategories([])
      return
    }
    try {
      setLoading(true)
      const data = await expenseCategoryApi.getAll(spaceId)
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      setLoading(false)
    }
  }, [spaceId])

  const createCategory = useCallback(async (name: string) => {
    if (!spaceId) return
    const created = await expenseCategoryApi.create(spaceId, { name })
    setCategories((prev) => [...prev, created])
    return created
  }, [spaceId])

  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!spaceId) return
    await expenseCategoryApi.delete(spaceId, categoryId)
    setCategories((prev) => prev.filter((c) => c.id !== categoryId))
  }, [spaceId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, createCategory, deleteCategory, refetch: fetchCategories }
}
