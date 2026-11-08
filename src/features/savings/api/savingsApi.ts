import api from '@/shared/api/client'
import type { SavingsMonth, SavingsPlanRequest, SavingsRecordRequest, SavingsPreview, PensionAccountSummary } from '../types/savings.types'
const base = (spaceId: string) => `/shared-spaces/${spaceId}/savings`
export const savingsApi = {
  pensionYear: async (spaceId: string, year: number) => (await api.get<PensionAccountSummary[]>(`${base(spaceId)}/pension-year`, { params: { year } })).data,
  month: async (spaceId: string, year: number, month: number, group?: 'general' | 'pension') =>
    (await api.get<SavingsMonth>(base(spaceId), { params: { year, month, group } })).data,
  savePlan: async (spaceId: string, data: SavingsPlanRequest, id?: string) => {
    if (id) await api.put(`${base(spaceId)}/${id}`, data)
    else await api.post(base(spaceId), data)
  },
  preview: async (spaceId: string, id: string, data: SavingsPlanRequest) =>
    (await api.post<SavingsPreview>(`${base(spaceId)}/${id}/preview`, data)).data,
  archive: async (spaceId: string, id: string) => { await api.delete(`${base(spaceId)}/${id}`) },
  saveRecord: async (spaceId: string, planId: string, data: SavingsRecordRequest, id?: string) => {
    const url = `${base(spaceId)}/${planId}/records`
    if (id) await api.put(`${url}/${id}`, data)
    else await api.post(url, data)
  },
  deleteRecord: async (spaceId: string, planId: string, id: string) => { await api.delete(`${base(spaceId)}/${planId}/records/${id}`) },
}
