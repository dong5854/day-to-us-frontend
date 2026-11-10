import api from '@/shared/api/client'

export interface KisAccount {
  planId: string; name: string; maskedAccount: string
  valuation: number | null; cash: number | null; lastSyncedAt: string | null
  error: string | null; canManage: boolean
}
export interface KisStatus { canConnect: boolean; accounts: KisAccount[]; connectablePlanIds: string[] }
export interface KisCredentials { accountNumber: string; appKey: string; appSecret: string; shareConsent: boolean }
const base = (spaceId: string) => `/shared-spaces/${spaceId}/pension-connections`
export const kisApi = {
  status: async (spaceId: string) => (await api.get<KisStatus>(base(spaceId))).data,
  connect: async (spaceId: string, id: string, data: KisCredentials) => { await api.post(`${base(spaceId)}/${id}`, data) },
  sync: async (spaceId: string, id: string) => { await api.post(`${base(spaceId)}/${id}/sync`) },
  disconnect: async (spaceId: string, id: string) => { await api.delete(`${base(spaceId)}/${id}`) },
}
