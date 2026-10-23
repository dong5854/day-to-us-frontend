import { useState, useEffect, useCallback, useRef } from 'react'
import { expenseCategoryApi } from '../api/expenseCategoryApi'
import type { ExpenseCategoryResponse } from '../types/expenseCategory.types'

export const useExpenseCategories = (spaceId: string | null) => {
  const [categories, setCategories] = useState<ExpenseCategoryResponse[]>([])
  const sequence = useRef(0)
  const [loading, setLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    if (!spaceId) {
      setCategories([])
      return
    }
    const request = ++sequence.current
    try {
      setLoading(true)
      const data = await expenseCategoryApi.getAll(spaceId)
      if (request === sequence.current) setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      if (request === sequence.current) setLoading(false)
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

  const invalidate = useCallback(() => { sequence.current++ }, [])
  useEffect(() => {
    void fetchCategories()
    const refresh = () => { if (document.visibilityState === 'visible') void fetchCategories() }
    window.addEventListener('categories-changed', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => { invalidate(); window.removeEventListener('categories-changed', refresh); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [fetchCategories, invalidate])

  return { categories, loading, createCategory, deleteCategory, refetch: fetchCategories }
}
