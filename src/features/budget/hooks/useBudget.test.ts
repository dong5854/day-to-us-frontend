import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useBudget } from './useBudget'
import { budgetApi } from '../api/budgetApi'

vi.mock('../api/budgetApi', () => ({
  budgetApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockEntry = { id: '1', amount: 10000, date: '2024-01-15', description: '식비', category: 'food' }
const mockEntry2 = { id: '2', amount: -5000, date: '2024-01-16', description: '교통', category: 'transport' }

describe('useBudget', () => {
  beforeEach(() => {
    vi.mocked(budgetApi.getAll).mockResolvedValue([])
    vi.mocked(budgetApi.create).mockResolvedValue(mockEntry as never)
    vi.mocked(budgetApi.update).mockResolvedValue(mockEntry as never)
    vi.mocked(budgetApi.delete).mockResolvedValue(undefined as never)
  })

  it('spaceId가 null이면 entries를 빈 배열로 유지하고 API를 호출하지 않는다', async () => {
    const { result } = renderHook(() => useBudget(null))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.entries).toEqual([])
    expect(budgetApi.getAll).not.toHaveBeenCalled()
  })

  it('spaceId가 있으면 fetchEntries를 호출해 entries를 업데이트한다', async () => {
    vi.mocked(budgetApi.getAll).mockResolvedValue([mockEntry, mockEntry2] as never)

    const { result } = renderHook(() => useBudget('space-1', 2024, 1))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.entries).toHaveLength(2)
    expect(budgetApi.getAll).toHaveBeenCalledWith('space-1', 2024, 1)
  })

  it('fetchEntries 실패 시 error 상태를 설정한다', async () => {
    vi.mocked(budgetApi.getAll).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useBudget('space-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('가계부 목록을 불러오는데 실패했습니다.')
    expect(result.current.entries).toEqual([])
  })

  it('createEntry 성공 시 entries에 새 항목을 추가한다', async () => {
    vi.mocked(budgetApi.getAll).mockResolvedValue([])
    const newEntry = { id: '3', amount: 20000, date: '2024-01-17', description: '마트' }
    vi.mocked(budgetApi.create).mockResolvedValue(newEntry as never)

    const { result } = renderHook(() => useBudget('space-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createEntry({ amount: 20000, date: '2024-01-17', description: '마트' })
    })

    expect(result.current.entries).toContainEqual(newEntry)
  })

  it('deleteEntry 성공 시 entries에서 해당 항목을 제거한다', async () => {
    vi.mocked(budgetApi.getAll).mockResolvedValue([mockEntry, mockEntry2] as never)

    const { result } = renderHook(() => useBudget('space-1'))
    await waitFor(() => expect(result.current.entries).toHaveLength(2))

    await act(async () => {
      await result.current.deleteEntry('1')
    })

    expect(result.current.entries).not.toContainEqual(mockEntry)
    expect(result.current.entries).toHaveLength(1)
  })

  it('totalIncome/totalExpense/balance를 올바르게 계산한다', async () => {
    vi.mocked(budgetApi.getAll).mockResolvedValue([
      { ...mockEntry, amount: 100000 },
      { ...mockEntry2, amount: -30000 },
    ] as never)

    const { result } = renderHook(() => useBudget('space-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.totalIncome).toBe(100000)
    expect(result.current.totalExpense).toBe(30000)
    expect(result.current.balance).toBe(70000)
  })
})
