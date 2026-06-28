import { useState, useEffect } from 'react'
import { spaceApi } from '../api/spaceApi'
import type { SharedSpaceResponse, UserResponse } from '../types/space.types'

export const useSpace = () => {
  const [space, setSpace] = useState<SharedSpaceResponse | null>(null)
  const [members, setMembers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnauthorized, setIsUnauthorized] = useState(false)

  const fetchSpace = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsUnauthorized(true)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsUnauthorized(false)
      const data = await spaceApi.getAll()
      if (!Array.isArray(data)) {
        throw new Error('공간 데이터가 올바른 배열 형식이 아닙니다.')
      }
      if (data.length > 0) {
        setSpace(data[0])
        const membersData = await spaceApi.getMembers()
        if (!Array.isArray(membersData)) {
          throw new Error('멤버 데이터가 올바른 배열 형식이 아닙니다.')
        }
        setMembers(membersData)
      } else {
        setSpace(null)
        setMembers([])
      }
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
      const membersData = await spaceApi.getMembers()
      if (!Array.isArray(membersData)) {
        throw new Error('멤버 데이터가 올바른 배열 형식이 아닙니다.')
      }
      setMembers(membersData)
      return newSpace
    } catch (err) {
      setError('공간 생성에 실패했습니다.')
      console.error(err)
      throw err
    }
  }

  const joinSpace = async (inviteCode: string) => {
    if (space) throw new Error('이미 공간이 존재합니다.')

    try {
      setError(null)
      const joinedSpace = await spaceApi.join({ inviteCode })
      setSpace(joinedSpace)
      const membersData = await spaceApi.getMembers()
      if (!Array.isArray(membersData)) {
        throw new Error('멤버 데이터가 올바른 배열 형식이 아닙니다.')
      }
      setMembers(membersData)
      return joinedSpace
    } catch (err) {
      setError('공간 참여에 실패했습니다. 초대 코드를 확인해주세요.')
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchSpace()
  }, [])

  return {
    space,
    members,
    loading,
    error,
    createSpace,
    joinSpace,
    refetch: fetchSpace,
    hasSpace: !!space,
    isUnauthorized
  }
}
