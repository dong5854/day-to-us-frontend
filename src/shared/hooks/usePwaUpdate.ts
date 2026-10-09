import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwaUpdate() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW: (_url, registered) => setRegistration(registered),
    onRegisterError: (err) => console.warn('서비스 워커 등록 실패:', err),
  })

  useEffect(() => {
    if (!registration) return
    let checking = false
    const check = async () => {
      if (document.visibilityState === 'hidden') return
      if (registration.waiting) setNeedRefresh(true)
      if (!navigator.onLine || registration.installing || checking) return
      checking = true
      try {
        await registration.update()
      } catch (err) {
        console.warn('새 버전 확인 실패:', err)
      } finally {
        checking = false
      }
    }
    void check()
    document.addEventListener('visibilitychange', check)
    window.addEventListener('online', check)
    return () => {
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('online', check)
    }
  }, [registration, setNeedRefresh])

  useEffect(() => {
    if (!updating) return
    const timer = window.setTimeout(() => {
      setUpdating(false)
      setError('업데이트가 지연되고 있습니다. 다시 시도해 주세요.')
    }, 15000)
    return () => window.clearTimeout(timer)
  }, [updating])

  const update = async () => {
    if (updating) return
    setUpdating(true)
    setError('')
    try {
      if (registration && !registration.waiting) {
        window.location.reload()
        return
      }
      await updateServiceWorker(true)
    } catch {
      setUpdating(false)
      setError('업데이트에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  return {
    needRefresh, updating, error, update,
    dismiss: () => { if (!updating) setNeedRefresh(false) },
  }
}
