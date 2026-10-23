import apiClient from '@/shared/api/client'
import type { CategoryOverview } from '../types/categoryBudget.types'
const path = (spaceId: string) => `/shared-spaces/${spaceId}/expense-categories`
export const categoryBudgetApi = {
  overview: async (spaceId: string, month: string) => (await apiClient.get<CategoryOverview>(`${path(spaceId)}/overview`, { params: { month } })).data,
  rename: (spaceId: string, id: string, name: string) => apiClient.patch(`${path(spaceId)}/${id}`, { name }),
  reorder: (spaceId: string, ids: string[]) => apiClient.put(`${path(spaceId)}/order`, { ids }),
  archive: (spaceId: string, id: string, archived: boolean) => apiClient.put(`${path(spaceId)}/${id}/archive`, { archived }),
  budget: (spaceId: string, id: string, month: string, amount: number | null, repeat: boolean) => apiClient.put(`${path(spaceId)}/${id}/budgets/${month}`, { amount, repeat }),
}
