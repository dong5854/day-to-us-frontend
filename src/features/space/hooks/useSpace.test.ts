import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSpace } from './useSpace'
import { spaceApi } from '../api/spaceApi'

vi.mock('../api/spaceApi', () => ({
  spaceApi: {
    getAll: vi.fn(),
    getMembers: vi.fn(),
    create: vi.fn(),
    join: vi.fn(),
  },
}))

const mockSpace = { id: 'space-1', name: '우리 공간', inviteCode: 'ABC123' }
const mockMembers = [{ id: 'user-1', name: '유저1' }, { id: 'user-2', name: '유저2' }]

describe('useSpace', () => {
  beforeEach(() => {
    vi.mocked(spaceApi.getAll).mockResolvedValue([mockSpace] as never)
    vi.mocked(spaceApi.getMembers).mockResolvedValue(mockMembers as never)
    vi.mocked(spaceApi.create).mockResolvedValue(mockSpace as never)
    vi.mocked(spaceApi.join).mockResolvedValue(mockSpace as never)
  })

  it('초기 로딩 상태가 true이다', () => {
    const { result } = renderHook(() => useSpace())
    expect(result.current.loading).toBe(true)
  })

  it('스페이스가 있을 때 space와 members를 설정한다', async () => {
    const { result } = renderHook(() => useSpace())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.space).toEqual(mockSpace)
    expect(result.current.members).toEqual(mockMembers)
    expect(result.current.hasSpace).toBe(true)
  })

  it('스페이스가 없을 때 space가 null이고 hasSpace가 false이다', async () => {
    vi.mocked(spaceApi.getAll).mockResolvedValue([] as never)

    const { result } = renderHook(() => useSpace())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.space).toBeNull()
    expect(result.current.members).toEqual([])
    expect(result.current.hasSpace).toBe(false)
  })

  it('401 응답 시 isUnauthorized를 true로 설정한다', async () => {
    vi.mocked(spaceApi.getAll).mockRejectedValue({ response: { status: 401 } })

    const { result } = renderHook(() => useSpace())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isUnauthorized).toBe(true)
    expect(result.current.space).toBeNull()
  })

  it('401 외 에러 시 error 상태를 설정한다', async () => {
    vi.mocked(spaceApi.getAll).mockRejectedValue({ response: { status: 500 } })

    const { result } = renderHook(() => useSpace())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('공간 정보를 불러오는데 실패했습니다.')
    expect(result.current.isUnauthorized).toBe(false)
  })

  it('createSpace 성공 시 space를 설정한다', async () => {
    vi.mocked(spaceApi.getAll).mockResolvedValue([] as never)

    const { result } = renderHook(() => useSpace())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createSpace('새 공간')
    })

    expect(result.current.space).toEqual(mockSpace)
    expect(spaceApi.create).toHaveBeenCalledWith({ name: '새 공간' })
  })

  it('joinSpace 성공 시 space를 설정한다', async () => {
    vi.mocked(spaceApi.getAll).mockResolvedValue([] as never)

    const { result } = renderHook(() => useSpace())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.joinSpace('INVITE123')
    })

    expect(result.current.space).toEqual(mockSpace)
    expect(spaceApi.join).toHaveBeenCalledWith({ inviteCode: 'INVITE123' })
  })
})
