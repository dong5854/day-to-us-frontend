import apiClient from '@/shared/api/client'
import type { SharedSpaceRequest, SharedSpaceResponse, JoinSharedSpaceRequest, UserResponse } from '../types/space.types'

export const spaceApi = {
  getAll: async (): Promise<SharedSpaceResponse[]> => {
    const response = await apiClient.get('/shared-spaces')
    return response.data
  },

  create: async (data: SharedSpaceRequest): Promise<SharedSpaceResponse> => {
    const response = await apiClient.post('/shared-spaces', data)
    return response.data
  },

  join: async (data: JoinSharedSpaceRequest): Promise<SharedSpaceResponse> => {
    const response = await apiClient.post('/shared-spaces/join', data)
    return response.data
  },

  getMembers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get('/shared-spaces/members')
    return response.data
  },
}
