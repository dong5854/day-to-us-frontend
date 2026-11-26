import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'
import api from '@/shared/api/client'
import { categoryBudgetApi } from '@/features/budget/api/categoryBudgetApi'
import { budgetApi } from '@/features/budget/api/budgetApi'
import { expenseCategoryApi } from '@/features/budget/api/expenseCategoryApi'

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear() })

it('화면을 오간 뒤 이름을 수정하면 달력 내역과 카테고리 선택지가 한 번씩 갱신된다', async () => {
  localStorage.setItem('accessToken', 'test-token')
  let category = { id: 'food', name: '식비' }
  vi.spyOn(api, 'get').mockImplementation(async url => {
    if (url === '/shared-spaces') return { data: [{ id: 'space', name: '우리 공간', inviteCode: 'test' }] }
    if (url.endsWith('/savings')) return { data: { plans: [], records: [], balance: 0 } }
    return { data: [] }
  })
  const categories = vi.spyOn(expenseCategoryApi, 'getAll').mockImplementation(async () => [category])
  const entries = vi.spyOn(budgetApi, 'getAll').mockImplementation(async () => [
    { id: 'entry', description: '점심', amount: -1000, date: '2026-10-10', category },
  ])
  vi.spyOn(categoryBudgetApi, 'overview').mockImplementation(async (_, month) => ({
    month, totalSpent: 1000, rows: [{ category, used: true, fixedExpenseIds: [], history: [{ month, spent: 1000, budget: null }] }],
  }))
  vi.spyOn(api, 'patch').mockImplementation(async (url, data) => {
    expect(url).toBe('/shared-spaces/space/expense-categories/food')
    expect(data).toEqual({ name: '외식비' })
    category = { ...category, name: '외식비' }
    return { data: category }
  })

  render(<App />)
  fireEvent.click(await screen.findByRole('button', { name: '연금' }))
  expect(window.location.pathname).toBe('/pensions')
  expect(screen.getByRole('button', { name: '연금' }).getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: '가계부' }))
  expect(window.location.pathname).toBe('/')
  fireEvent.click(screen.getByTitle('설정'))
  expect(await screen.findByRole('heading', { name: '설정', level: 2 })).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: /카테고리·예산 관리/ }))
  await screen.findByRole('button', { name: /식비 1,000원/ })
  fireEvent.click(screen.getByRole('button', { name: '관리' }))
  fireEvent.click(screen.getByRole('button', { name: '식비 이름 수정' }))
  fireEvent.change(screen.getByLabelText('카테고리 이름'), { target: { value: '외식비' } })
  categories.mockClear()
  entries.mockClear()
  fireEvent.click(screen.getByRole('button', { name: '저장' }))
  await screen.findByText('저장했어요.')
  expect(categories).toHaveBeenCalledTimes(1)
  // 달력 구독과 카테고리 상세의 저장 후 새로고침이 각각 한 번 조회한다.
  expect(entries).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByRole('button', { name: '카테고리 목록으로 돌아가기' }))
  fireEvent.click(screen.getByRole('button', { name: '이전 화면으로 돌아가기' }))
  await screen.findByRole('heading', { name: '설정', level: 2 })
  fireEvent.click(within(screen.getByRole('banner')).getByRole('button'))
  await waitFor(() => expect(window.location.pathname).toBe('/'))
  fireEvent.click(screen.getByRole('combobox', { name: '보기 방식' }))
  fireEvent.click(screen.getByRole('option', { name: '목록' }))
  expect(screen.getByText('외식비')).toBeDefined()
  fireEvent.click(screen.getByTitle('항목 추가'))
  expect(await screen.findByRole('dialog')).toBeDefined()
  fireEvent.click(within(screen.getByRole('dialog')).getByText('카테고리 없음'))
  expect(screen.getByRole('option', { name: '외식비' })).toBeDefined()
})
