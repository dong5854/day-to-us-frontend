import apiClient from '@/shared/api/client'
import type { FixedExpenseRequest, FixedExpenseResponse } from '../types/fixedExpense.types'

export const fixedExpenseApi = {
  getAll: async (spaceId: string): Promise<FixedExpenseResponse[]> => {
    const response = await apiClient.get(`/shared-spaces/${spaceId}/fixed-expenses`)
    return response.data
  },

  create: async (spaceId: string, data: FixedExpenseRequest): Promise<FixedExpenseResponse> => {
    const response = await apiClient.post(`/shared-spaces/${spaceId}/fixed-expenses`, data)
    return response.data
  },
}
