import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BudgetForm } from './BudgetForm'
import { readBudgetPreferences, rememberBudgetPreferences } from '../utils/budgetPreferences'

const props = {
  spaceId: 'space-a',
  categories: [{ id: 'food', name: '식비' }],
  paymentMethods: [{ id: 'card', name: '카드' }],
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

it('선택 후 저장하지 않고 닫아도 새 창에서 유형, 카테고리, 결제 수단을 복원한다', () => {
  const form = render(<BudgetForm {...props} />)
  fireEvent.click(screen.getByRole('button', { name: '지출' }))
  fireEvent.click(screen.getByText('카테고리 없음'))
  fireEvent.click(screen.getByRole('option', { name: '식비' }))
  fireEvent.click(screen.getByText('결제 수단 없음'))
  fireEvent.click(screen.getByRole('option', { name: '카드' }))
  form.unmount()

  render(<BudgetForm {...props} />)
  expect(screen.getByRole('button', { name: '지출' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByText('식비')).toBeDefined()
  expect(screen.getByText('카드')).toBeDefined()
  expect(readBudgetPreferences('space-b')).toEqual({ isIncome: true, categoryId: '', paymentMethodId: '' })
})

it('수정 창은 기억한 기본값 대신 기존 항목을 표시하고 열기만 해서는 기본값을 덮어쓰지 않는다', () => {
  rememberBudgetPreferences('space-a', { isIncome: false, categoryId: 'food', paymentMethodId: 'card' })
  render(<BudgetForm {...props} entry={{ id: 'entry', description: '월급', amount: 100, date: '2026-10-10' }} />)
  expect(screen.getByRole('button', { name: '수입' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByText('카테고리 없음')).toBeDefined()
  expect(readBudgetPreferences('space-a').isIncome).toBe(false)
})

it('늦게 로딩된 선택지를 복원하고 삭제된 선택지는 전송하지 않는다', async () => {
  rememberBudgetPreferences('space-a', { isIncome: false, categoryId: 'food', paymentMethodId: 'card' })
  const form = render(<BudgetForm {...props} categories={[]} paymentMethods={[]} />)
  form.rerender(<BudgetForm {...props} />)
  expect(screen.getByText('식비')).toBeDefined()
  expect(screen.getByText('카드')).toBeDefined()
  form.rerender(<BudgetForm {...props} categories={[]} paymentMethods={[]} />)
  fireEvent.change(screen.getByLabelText('내용'), { target: { value: '점심' } })
  fireEvent.change(screen.getByLabelText('금액'), { target: { value: '1000' } })
  fireEvent.click(screen.getByRole('button', { name: '추가' }))
  await waitFor(() => expect(props.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amount: -1000, categoryId: undefined, paymentMethodId: undefined })))
  expect(screen.getByRole('button', { name: '지출' }).getAttribute('aria-pressed')).toBe('true')
})

it('잘못된 저장값이나 저장소 오류가 있어도 기본값으로 입력을 계속한다', () => {
  localStorage.setItem('budget-preferences:space-a', '{broken')
  expect(readBudgetPreferences('space-a').isIncome).toBe(true)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('unavailable') })
  render(<BudgetForm {...props} />)
  fireEvent.click(screen.getByRole('button', { name: '지출' }))
  expect(screen.getByRole('button', { name: '지출' }).getAttribute('aria-pressed')).toBe('true')
})
