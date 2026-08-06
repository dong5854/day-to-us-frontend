import apiClient from '@/shared/api/client'
import type { PaymentMethodRequest, PaymentMethodResponse } from '../types/paymentMethod.types'

export const paymentMethodApi = {
  getAll: async (spaceId: string): Promise<PaymentMethodResponse[]> => {
    const response = await apiClient.get<PaymentMethodResponse[]>(
      `/shared-spaces/${spaceId}/payment-methods`
    )
    return response.data
  },

  create: async (spaceId: string, data: PaymentMethodRequest): Promise<PaymentMethodResponse> => {
    const response = await apiClient.post<PaymentMethodResponse>(
      `/shared-spaces/${spaceId}/payment-methods`,
      data
    )
    return response.data
  },

  delete: async (spaceId: string, methodId: string): Promise<void> => {
    await apiClient.delete(`/shared-spaces/${spaceId}/payment-methods/${methodId}`)
  },
}
