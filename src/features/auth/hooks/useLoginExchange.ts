import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/shared/api/client'
import { draftKey } from '@/features/apiToken/api/personalTokenApi'

export function useLoginExchange() {
  const navigate = useNavigate()
  const [code] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('code'))
  const [failed, setFailed] = useState(false)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    window.history.replaceState(null, '', window.location.pathname)
    if (!code) return
    apiClient.post<{ accessToken: string }>('/auth/login/exchange', { code }, { withCredentials: true })
      .then(({ data }) => {
        localStorage.setItem('accessToken', data.accessToken)
        navigate(sessionStorage.getItem(draftKey) ? '/settings' : '/', { replace: true })
      })
      .catch(() => setFailed(true))
  }, [code, navigate])
  return !code || failed
}
