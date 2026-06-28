import { useState, useEffect, useCallback } from 'react'
import { notificationApi } from '../api/notificationApi'

type PermissionState = NotificationPermission | 'unsupported'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const useNotification = () => {
  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  })
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if already subscribed on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const existing = await registration.pushManager.getSubscription()
        setSubscribed(existing !== null)
      } catch {
        // SW not available
      } finally {
        setLoading(false)
      }
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      checkSubscription()
    } else {
      setLoading(false)
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (permission === 'unsupported') throw new Error('알림을 지원하지 않는 브라우저입니다.')

    // Request permission if not yet granted
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result !== 'granted') throw new Error('알림 권한이 거부되었습니다.')

    // Get VAPID public key from backend
    const vapidKey = await notificationApi.getVapidKey()

    // Subscribe to push
    const registration = await navigator.serviceWorker.ready
    const applicationServerKey = urlBase64ToUint8Array(vapidKey)
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    })

    // Send subscription to backend
    await notificationApi.subscribe(pushSubscription)
    setSubscribed(true)
  }, [permission])

  const unsubscribe = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()

    if (existing) {
      const endpoint = existing.endpoint
      await existing.unsubscribe()
      await notificationApi.unsubscribe(endpoint)
    }

    setSubscribed(false)
  }, [])

  const isSupported = permission !== 'unsupported' && 'serviceWorker' in navigator && 'PushManager' in window

  return {
    permission,
    subscribed,
    loading,
    isSupported,
    subscribe,
    unsubscribe,
  }
}
