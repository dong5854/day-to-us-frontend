import apiClient from '@/shared/api/client'
import type { SharedSpaceRequest, SharedSpaceResponse } from '../types/space.types'

export const spaceApi = {
  getAll: async (): Promise<SharedSpaceResponse[]> => {
    const response = await apiClient.get('/shared-spaces')
    return response.data
  },

  create: async (data: SharedSpaceRequest): Promise<SharedSpaceResponse> => {
    const response = await apiClient.post('/shared-spaces', data)
    return response.data
  },
}
