import apiClient from '@/shared/api/client'
import type { ExpenseCategoryRequest, ExpenseCategoryResponse } from '../types/expenseCategory.types'

export const expenseCategoryApi = {
  getAll: async (spaceId: string): Promise<ExpenseCategoryResponse[]> => {
    const response = await apiClient.get<ExpenseCategoryResponse[]>(
      `/shared-spaces/${spaceId}/expense-categories`
    )
    return response.data
  },

  create: async (spaceId: string, data: ExpenseCategoryRequest): Promise<ExpenseCategoryResponse> => {
    const response = await apiClient.post<ExpenseCategoryResponse>(
      `/shared-spaces/${spaceId}/expense-categories`,
      data
    )
    return response.data
  },

  delete: async (spaceId: string, categoryId: string): Promise<void> => {
    await apiClient.delete(`/shared-spaces/${spaceId}/expense-categories/${categoryId}`)
  },
}
