import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FixedExpenseForm } from './FixedExpenseForm'
import { FixedExpenseList } from './FixedExpenseList'

afterEach(cleanup)

it('고정수입을 등록하고 수정 창에서 유형을 유지한다', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const view = render(<FixedExpenseForm onSubmit={onSubmit} onCancel={() => {}} />)
  fireEvent.click(screen.getByRole('combobox', { name: '유형' }))
  fireEvent.click(screen.getByRole('option', { name: '고정수입' }))
  fireEvent.change(view.container.querySelector('#description')!, { target: { value: '급여' } })
  fireEvent.change(view.container.querySelector('#amount')!, { target: { value: '3000000' } })
  fireEvent.submit(view.container.querySelector('form')!)
  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'INCOME', amount: 3000000 })))
  view.rerender(<FixedExpenseForm expense={{ id: 'salary', description: '급여', amount: 3000000, type: 'INCOME', frequency: 'MONTHLY', startDate: '2026-10-10' }} onSubmit={onSubmit} onCancel={() => {}} />)
  expect(screen.getByText('고정수입 수정')).toBeDefined()
  expect(screen.getByText('첫 입금 예정일')).toBeDefined()
})

it('기존 데이터는 고정지출로 유지하고 고정수입 필터로 구분한다', () => {
  render(<FixedExpenseList loading={false} expenses={[
    { id: 'rent', description: '월세', amount: 500000, frequency: 'MONTHLY', startDate: '2026-10-10' },
    { id: 'salary', description: '급여', amount: 3000000, frequency: 'MONTHLY', startDate: '2026-10-10', type: 'INCOME' },
  ]} />)
  fireEvent.click(screen.getAllByRole('combobox')[0])
  fireEvent.click(screen.getByRole('option', { name: '고정수입' }))
  expect(screen.getByText('급여')).toBeDefined()
  expect(screen.queryByText('월세')).toBeNull()
  fireEvent.click(screen.getAllByRole('combobox')[0])
  fireEvent.click(screen.getByRole('option', { name: '고정지출' }))
  expect(screen.getByText('월세')).toBeDefined()
  expect(screen.queryByText('급여')).toBeNull()
})
