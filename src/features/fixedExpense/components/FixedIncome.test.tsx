import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FixedExpenseForm } from './FixedExpenseForm'
import { FixedExpenseList } from './FixedExpenseList'
import { Modal } from '@/shared/components/Modal'

afterEach(cleanup)

it.each(['INCOME', 'EXPENSE'] as const)('%s 수정 시 금액 버튼과 첫 예정일 변경을 저장한다', async type => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onClose = vi.fn()
  const { container } = render(<Modal isOpen onClose={onClose}>
    <FixedExpenseForm expense={{ id: 'fixed', description: '고정 항목', amount: 3260000,
      type, frequency: 'MONTHLY', startDate: '2026-09-25', autoPostFrom: '2026-09-25',
    }} onSubmit={onSubmit} onCancel={onClose} />
  </Modal>)
  expect(screen.getByText('326만원')).toBeDefined()
  for (const amount of ['1,000', '10,000', '50,000', '100,000']) {
    fireEvent.click(screen.getByRole('button', { name: `${amount}원 더하기` }))
  }
  expect(screen.getByText('342만 1,000원')).toBeDefined()
  expect(onSubmit).not.toHaveBeenCalled()
  fireEvent.click(container.querySelector('#startDate')!)
  fireEvent.click(screen.getByRole('button', { name: /^26$/ }))
  expect(onClose).not.toHaveBeenCalled()
  expect(container.querySelector('#startDate')?.textContent).toContain('2026년 9월 26일')
  fireEvent.click(screen.getByRole('button', { name: '수정하기' }))
  await waitFor(() => expect(onSubmit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    type, amount: 3421000, startDate: '2026-09-26', autoPostFrom: '2026-09-25',
  })))
})

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
