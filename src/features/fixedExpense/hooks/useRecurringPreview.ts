import { useState } from 'react'
import { fixedExpenseApi } from '../api/fixedExpenseApi'
import type { FixedExpenseRequest } from '../types/fixedExpense.types'

export const useRecurringPreview = (spaceId?: string) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const preview = async (expenseId: string, data: FixedExpenseRequest) => {
    setError('')
    setLoading(true)
    try {
      if (!spaceId) throw new Error('공간 ID가 필요합니다.')
      return await fixedExpenseApi.preview(spaceId, expenseId, data)
    } catch (error) {
      setError('변경 내용을 불러오지 못했습니다. 다시 시도해 주세요.')
      throw error
    } finally {
      setLoading(false)
    }
  }
  return { preview, error, loading }
}
