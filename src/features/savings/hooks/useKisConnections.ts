import { useCallback, useEffect, useRef, useState } from 'react'
import { kisApi, type KisCredentials, type KisStatus } from '../api/kisApi'
import { savingsError } from './useSavings'

export function useKisConnections(spaceId: string) {
  const [status, setStatus] = useState<KisStatus | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const locked = useRef(false)
  const sequence = useRef(0)
  const refresh = useCallback(async () => {
    const request = ++sequence.current
    try {
      const result = await kisApi.status(spaceId)
      if (request === sequence.current) { setStatus(result); setError('') }
    } catch (e) { if (request === sequence.current) setError(savingsError(e)) }
  }, [spaceId])
  const invalidate = useCallback(() => { sequence.current++ }, [])
  useEffect(() => {
    setStatus(null); setError('')
    void refresh()
    window.addEventListener('focus', refresh)
    return () => { invalidate(); window.removeEventListener('focus', refresh) }
  }, [refresh, invalidate])
  const mutate = async (action: () => Promise<void>) => {
    if (locked.current) return false
    locked.current = true; setBusy(true); setError('')
    try { await action(); await refresh(); return true }
    catch (e) { setError(savingsError(e)); return false }
    finally { locked.current = false; setBusy(false) }
  }
  return { status, error, busy, refresh,
    connect: (id: string, data: KisCredentials) => mutate(() => kisApi.connect(spaceId, id, data)),
    sync: (id: string) => mutate(() => kisApi.sync(spaceId, id)),
    disconnect: (id: string) => mutate(() => kisApi.disconnect(spaceId, id)),
  }
}
