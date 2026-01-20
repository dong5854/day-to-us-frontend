import { useState, useEffect } from 'react'
import { spaceApi } from '../api/spaceApi'
import type { SharedSpaceResponse } from '../types/space.types'

export const useSpace = () => {
  const [space, setSpace] = useState<SharedSpaceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnauthorized, setIsUnauthorized] = useState(false)

  const fetchSpace = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsUnauthorized(false)
      const data = await spaceApi.getAll()
      setSpace(data.length > 0 ? data[0] : null)
    } catch (err: any) {
      if (err.response?.status === 401) {
        setIsUnauthorized(true)
        setLoading(false)
        return
      }
      setError('공간 정보를 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createSpace = async (name: string) => {
    if (space) throw new Error('이미 공간이 존재합니다.')

    try {
      setError(null)
      const newSpace = await spaceApi.create({ name })
      setSpace(newSpace)
      return newSpace
    } catch (err) {
      setError('공간 생성에 실패했습니다.')
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchSpace()
  }, [])

  return {
    space,
    loading,
    error,
    createSpace,
    refetch: fetchSpace,
    hasSpace: !!space,
    isUnauthorized
  }
}
