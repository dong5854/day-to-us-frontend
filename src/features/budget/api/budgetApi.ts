import apiClient from '@/shared/api/client'
import type {
  BudgetEntryRequest,
  BudgetEntryResponse,
} from '../types/budget.types'

export const budgetApi = {
  getAll: async (spaceId: string, year?: number, month?: number): Promise<BudgetEntryResponse[]> => {
    const params = new URLSearchParams()
    if (year !== undefined) params.append('year', year.toString())
    if (month !== undefined) params.append('month', month.toString())
    
    const queryString = params.toString()
    const url = `/shared-spaces/${spaceId}/budget-entries${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<BudgetEntryResponse[]>(url)
    return response.data
  },

  getById: async (spaceId: string, entryId: string): Promise<BudgetEntryResponse> => {
    const response = await apiClient.get(`/shared-spaces/${spaceId}/budget-entries/${entryId}`)
    return response.data
  },

  create: async (spaceId: string, data: BudgetEntryRequest): Promise<BudgetEntryResponse> => {
    const response = await apiClient.post(`/shared-spaces/${spaceId}/budget-entries`, data)
    return response.data
  },

  update: async (
    spaceId: string,
    entryId: string,
    data: BudgetEntryRequest
  ): Promise<BudgetEntryResponse> => {
    const response = await apiClient.put(`/shared-spaces/${spaceId}/budget-entries/${entryId}`, data)
    return response.data
  },

  delete: async (spaceId: string, entryId: string): Promise<void> => {
    await apiClient.delete(`/shared-spaces/${spaceId}/budget-entries/${entryId}`)
  },
}
