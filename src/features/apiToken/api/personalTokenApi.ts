import apiClient from '@/shared/api/client'

export type TokenAccess = 'READ' | 'EDIT'
export interface TokenDraft { name: string; access: TokenAccess; days: number }
export interface TokenInfo {
  id: string
  name: string
  access: TokenAccess
  expiresAt: string
  lastUsedAt: string | null
}
export interface IssuedToken { info: TokenInfo; secret: string }

const path = (space: string) => `/shared-spaces/${space}/api-tokens`
export const personalTokenApi = {
  list: (space: string) => apiClient.get<TokenInfo[]>(path(space)).then(r => r.data),
  issue: (space: string, draft: TokenDraft) => apiClient.post<IssuedToken>(path(space), draft).then(r => r.data),
  revoke: (space: string, id: string) => apiClient.delete(`${path(space)}/${id}`),
}

export const draftKey = 'personalTokenDraft'
export function loadDraft(space: string): TokenDraft | null {
  try {
    const item = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null')
    if (item?.space === space && typeof item.name === 'string' &&
        ['READ', 'EDIT'].includes(item.access) && [7, 30, 90].includes(item.days)) {
      return { name: item.name, access: item.access, days: item.days }
    }
  } catch { /* Inaccessible or stale browser storage. */ }
  return null
}
