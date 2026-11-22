import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { draftKey, personalTokenApi, type TokenDraft, type TokenInfo } from '../api/personalTokenApi'

export function usePersonalTokens(space: string) {
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const locked = useRef(false)
  const reload = useCallback(async () => {
    setBusy(true)
    setError('')
    try { setTokens(await personalTokenApi.list(space)) }
    catch { setError('토큰 목록을 불러오지 못했어요.') }
    finally { setBusy(false) }
  }, [space])
  useEffect(() => { void reload() }, [reload])

  async function issue(draft: TokenDraft) {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    try {
      const result = await personalTokenApi.issue(space, draft)
      setTokens(current => [result.info, ...current])
      return result.secret
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 401) {
        sessionStorage.setItem(draftKey, JSON.stringify({ space, ...draft }))
        window.location.assign(`${import.meta.env.VITE_API_BASE_URL || '/api'}/oauth2/authorization/google`)
      } else {
        setError(isAxiosError(e) && e.response?.status === 429
          ? '요청이 많아요. 1분 후 다시 시도해 주세요.'
          : '발급 결과를 확인하지 못했어요. 목록을 새로고침해 확인해 주세요.')
      }
    } finally { locked.current = false; setBusy(false) }
  }

  async function revoke(id: string) {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    try {
      await personalTokenApi.revoke(space, id)
      setTokens(current => current.filter(t => t.id !== id))
    } catch { setError('폐기 결과를 확인하지 못했어요. 목록을 새로고침해 주세요.') }
    finally { locked.current = false; setBusy(false) }
  }
  return { tokens, error, busy, issue, revoke, reload }
}
