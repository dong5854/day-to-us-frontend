import { useState, useEffect, useCallback } from 'react'
import { paymentMethodApi } from '../api/paymentMethodApi'
import type { PaymentMethodResponse } from '../types/paymentMethod.types'

export const usePaymentMethods = (spaceId: string | null) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPaymentMethods = useCallback(async () => {
    if (!spaceId) {
      setPaymentMethods([])
      return
    }
    try {
      setLoading(true)
      const data = await paymentMethodApi.getAll(spaceId)
      setPaymentMethods(data)
    } catch (err) {
      console.error('Failed to fetch payment methods', err)
    } finally {
      setLoading(false)
    }
  }, [spaceId])

  const createPaymentMethod = useCallback(async (name: string) => {
    if (!spaceId) return
    const created = await paymentMethodApi.create(spaceId, { name })
    setPaymentMethods((prev) => [...prev, created])
    return created
  }, [spaceId])

  const deletePaymentMethod = useCallback(async (methodId: string) => {
    if (!spaceId) return
    await paymentMethodApi.delete(spaceId, methodId)
    setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId))
  }, [spaceId])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  return { paymentMethods, loading, createPaymentMethod, deletePaymentMethod, refetch: fetchPaymentMethods }
}
