import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryBudgetPage } from './CategoryBudgetPage'
import type { CategoryOverview } from '@/features/budget/types/categoryBudget.types'
import { categoryBudgetApi } from '@/features/budget/api/categoryBudgetApi'
import { budgetApi } from '@/features/budget/api/budgetApi'
import { budgetStatus, shiftCategoryMonth } from '@/features/budget/utils/categoryBudget'

vi.mock('@/features/budget/api/categoryBudgetApi', () => ({ categoryBudgetApi: { overview: vi.fn(), budget: vi.fn(), reorder: vi.fn(), archive: vi.fn(), rename: vi.fn() } }))
vi.mock('@/features/budget/api/budgetApi', () => ({ budgetApi: { getAll: vi.fn() } }))
vi.mock('@/features/fixedExpense/hooks/useFixedExpense', () => ({ useFixedExpense: () => ({ expenses: [], loading: false }) }))
vi.mock('@/features/budget/hooks/usePaymentMethods', () => ({ usePaymentMethods: () => ({ paymentMethods: [] }) }))
const data: CategoryOverview = {
  month: '2026-10', totalSpent: 13000,
  rows: [
    { category: { id: 'food', name: '식비' }, used: true, fixedExpenseIds: [], history: [{ month: '2026-10', spent: 10000, budget: 20000 }] },
    { category: { id: 'travel', name: '교통' }, used: false, fixedExpenseIds: [], history: [{ month: '2026-10', spent: 0, budget: null }] },
    { category: null, used: false, fixedExpenseIds: [], history: [{ month: '2026-10', spent: 3000, budget: null }] },
  ],
}
beforeEach(() => {
  vi.mocked(categoryBudgetApi.overview).mockResolvedValue(structuredClone(data))
  vi.mocked(budgetApi.getAll).mockResolvedValue([{ id: 'entry', description: '점심', amount: -10000, date: '2026-10-03', category: { id: 'food', name: '식비' } }])
})
afterEach(() => { cleanup(); vi.clearAllMocks() })
const open = () => render(<MemoryRouter initialEntries={['/categories?month=2026-10']}><CategoryBudgetPage spaceId="space"/></MemoryRouter>)

it('미지정 지출을 포함하고 카테고리 상세에서 예산과 내역을 확인한다', async () => {
  open()
  expect(await screen.findByText('13,000원')).toBeDefined()
  expect(screen.getByText('카테고리 없음')).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: /식비 10,000원/ }))
  expect(screen.getByText('점심')).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: /월 예산 20,000원/ }))
  const dialog = screen.getByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText('2026년 10월 예산 (원)'), { target: { value: '0' } })
  fireEvent.click(within(dialog).getByRole('button', { name: '저장' }))
  await waitFor(() => expect(categoryBudgetApi.budget).toHaveBeenCalledWith('space', 'food', '2026-10', 0, false))
})

it('순서 편집을 취소하면 저장하지 않고 다시 편집해 저장하면 공통 순서를 전송한다', async () => {
  open()
  await screen.findByText('13,000원')
  fireEvent.click(screen.getByRole('button', { name: '관리' }))
  fireEvent.click(screen.getByRole('button', { name: '순서 변경' }))
  fireEvent.click(screen.getByRole('button', { name: '교통 위로' }))
  fireEvent.click(screen.getByRole('button', { name: '취소' }))
  expect(categoryBudgetApi.reorder).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '순서 변경' }))
  fireEvent.click(screen.getByRole('button', { name: '교통 위로' }))
  fireEvent.click(screen.getByRole('button', { name: '순서 저장' }))
  await waitFor(() => expect(categoryBudgetApi.reorder).toHaveBeenCalledWith('space', ['travel', 'food']))
})

it('저장이 실패하면 입력값을 유지하고 중복 저장을 막는다', async () => {
  open()
  await screen.findByText('13,000원')
  fireEvent.click(screen.getByRole('button', { name: /식비 10,000원/ }))
  fireEvent.click(screen.getByRole('button', { name: /월 예산 20,000원/ }))
  const input = screen.getByLabelText('2026년 10월 예산 (원)') as HTMLInputElement
  fireEvent.change(input, { target: { value: '35000' } })
  vi.mocked(categoryBudgetApi.budget).mockRejectedValueOnce(new Error('offline'))
  fireEvent.click(screen.getByRole('button', { name: '저장' }))
  await screen.findByRole('alert')
  expect(input.value).toBe('35000')
  expect(screen.getByRole('dialog')).toBeDefined()
})

it('조회 실패를 빈 목록으로 표시하지 않는다', async () => {
  vi.mocked(categoryBudgetApi.overview).mockRejectedValueOnce(new Error('offline'))
  open()
  expect(await screen.findByRole('alert')).toBeDefined()
  expect(screen.queryByText('0원')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
  expect(await screen.findByText('13,000원')).toBeDefined()
})

it('예산 없음과 0원 초과를 구분하고 연도 경계를 이동한다', () => {
  expect(budgetStatus(0, null)).toBe('예산 미설정')
  expect(budgetStatus(1000, 0)).toBe('1,000원 초과')
  expect(shiftCategoryMonth('2026-01', -1)).toBe('2025-12')
})

const monthlyOverview = (month: string) => {
  const result = structuredClone(data)
  result.month = month
  result.rows[0].history = Array.from({ length: 6 }, (_, index) => ({
    month: shiftCategoryMonth(month, index - 5),
    spent: (index + 1) * 1000,
    budget: index === 0 ? null : index === 1 ? 0 : 20000,
  }))
  return result
}

it('정확한 월별 금액과 예산을 나열하고 이전 월을 선택해도 펼친 목록과 그래프 범위를 유지한다', async () => {
  vi.mocked(categoryBudgetApi.overview).mockImplementation(async (_space, month) => monthlyOverview(month))
  open()
  await screen.findByText('13,000원')
  fireEvent.click(screen.getByRole('button', { name: /식비 6,000원/ }))
  const list = screen.getByRole('region', { name: '월별 사용 금액' })
  expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  expect(within(list).getByRole('button', { name: '2026년 5월 지출 1,000원, 예산 미설정' })).toBeDefined()
  expect(within(list).getByRole('button', { name: '2026년 6월 지출 2,000원, 예산 0원' })).toBeDefined()
  fireEvent.click(within(list).getByRole('button', { name: /2026년 9월 지출/ }))
  await waitFor(() => expect(budgetApi.getAll).toHaveBeenCalledWith('space', 2026, 9))
  await waitFor(() => expect(within(list).getByRole('button', { name: /2026년 9월 지출/ }).getAttribute('aria-pressed')).toBe('true'))
  expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  expect(within(screen.getByRole('region', { name: '월별 지출 그래프' })).getByText('2026.05 ~ 2026.10')).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: '이전 월 더 보기' }))
  await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(12))
  expect(categoryBudgetApi.overview).toHaveBeenCalledWith('space', '2026-04')
  fireEvent.click(within(list).getByRole('button', { name: /2026년 3월 지출/ }))
  await waitFor(() => expect(budgetApi.getAll).toHaveBeenCalledWith('space', 2026, 3))
  await waitFor(() => expect(within(list).getByRole('button', { name: /2026년 3월 지출/ }).getAttribute('aria-pressed')).toBe('true'))
  expect(within(list).getAllByRole('listitem')).toHaveLength(12)
  expect(within(screen.getByRole('region', { name: '월별 지출 그래프' })).getByText('2025.11 ~ 2026.04')).toBeDefined()
  const entries = screen.getByText(/2026년 03월 지출 내역/).closest('details')!
  expect(entries.open).toBe(false)
})

it('이전 월 조회가 실패해도 기존 목록과 선택 월을 유지하고 같은 구간을 재시도한다', async () => {
  let fail = true
  vi.mocked(categoryBudgetApi.overview).mockImplementation(async (_space, month) => {
    if (month === '2026-04' && fail) throw new Error('offline')
    return monthlyOverview(month)
  })
  open()
  await screen.findByText('13,000원')
  fireEvent.click(screen.getByRole('button', { name: /식비 6,000원/ }))
  const list = screen.getByRole('region', { name: '월별 사용 금액' })
  fireEvent.click(screen.getByRole('button', { name: '이전 월 더 보기' }))
  expect(await within(list).findByRole('alert')).toBeDefined()
  expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  expect(within(list).getByRole('button', { name: /2026년 10월 지출/ }).getAttribute('aria-pressed')).toBe('true')
  fail = false
  fireEvent.click(screen.getByRole('button', { name: '이전 월 다시 시도' }))
  await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(12))
  expect(within(list).queryByRole('alert')).toBeNull()
})

it('이전 월 조회 중 버튼과 기존 내역을 유지하고 중복 조회를 막는다', async () => {
  let resolveEarlier!: (value: CategoryOverview) => void
  const pending = new Promise<CategoryOverview>(resolve => { resolveEarlier = resolve })
  vi.mocked(categoryBudgetApi.overview).mockImplementation(async (_space, month) => month === '2026-04' ? pending : monthlyOverview(month))
  open()
  await screen.findByText('13,000원')
  fireEvent.click(screen.getByRole('button', { name: /식비 6,000원/ }))
  const list = screen.getByRole('region', { name: '월별 사용 금액' })
  const more = within(list).getByRole('button', { name: '이전 월 더 보기' }) as HTMLButtonElement
  fireEvent.click(more)
  expect(more.disabled).toBe(true)
  expect(more.getAttribute('aria-busy')).toBe('true')
  expect(within(list).getByRole('status').textContent).toBe('이전 월 내역을 불러오고 있어요.')
  expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  fireEvent.click(more)
  expect(vi.mocked(categoryBudgetApi.overview).mock.calls.filter(([, month]) => month === '2026-04')).toHaveLength(1)
  resolveEarlier(monthlyOverview('2026-04'))
  await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(12))
  expect(more.disabled).toBe(false)
  expect(more.getAttribute('aria-busy')).toBe('false')
  expect(within(list).getByRole('status').textContent).toBe('')
})
