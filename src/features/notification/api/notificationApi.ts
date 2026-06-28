import apiClient from '@/shared/api/client'

export const notificationApi = {
  getVapidKey: async (): Promise<string> => {
    const response = await apiClient.get('/push/vapid-key')
    return response.data.publicKey
  },

  subscribe: async (subscription: PushSubscription): Promise<void> => {
    const json = subscription.toJSON()
    await apiClient.post('/push/subscriptions', {
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      },
    })
  },

  unsubscribe: async (endpoint: string): Promise<void> => {
    await apiClient.delete('/push/subscriptions', {
      data: { endpoint },
    })
  },
}
