import apiClient from '@/shared/api/client'
import type { FixedExpenseRequest, FixedExpenseResponse, RecurringPreview } from '../types/fixedExpense.types'

export const fixedExpenseApi = {
  preview: async (spaceId: string, expenseId: string, data: FixedExpenseRequest): Promise<RecurringPreview> => {
    const response = await apiClient.post(`/shared-spaces/${spaceId}/fixed-expenses/${expenseId}/preview`, data)
    return response.data
  },
  getAll: async (spaceId: string): Promise<FixedExpenseResponse[]> => {
    const response = await apiClient.get(`/shared-spaces/${spaceId}/fixed-expenses`)
    return response.data
  },

  create: async (spaceId: string, data: FixedExpenseRequest): Promise<FixedExpenseResponse> => {
    const response = await apiClient.post(`/shared-spaces/${spaceId}/fixed-expenses`, data)
    return response.data
  },

  update: async (spaceId: string, expenseId: string, data: FixedExpenseRequest): Promise<FixedExpenseResponse> => {
    const response = await apiClient.put(`/shared-spaces/${spaceId}/fixed-expenses/${expenseId}`, data)
    return response.data
  },

  delete: async (spaceId: string, expenseId: string): Promise<void> => {
    await apiClient.delete(`/shared-spaces/${spaceId}/fixed-expenses/${expenseId}`)
  },
}
