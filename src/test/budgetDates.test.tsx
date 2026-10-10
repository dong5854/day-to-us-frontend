import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { BudgetForm } from '@/features/budget/components/BudgetForm'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it.each([
  { name: '가계부', Form: BudgetForm, dateField: 'date' },
  { name: '고정지출', Form: FixedExpenseForm, dateField: 'startDate' },
])('$name 기본 날짜와 저장 날짜는 현지 날짜를 유지한다', async ({ Form, dateField }) => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 7, 8, 0))
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const { container } = render(<Form onSubmit={onSubmit} onCancel={() => {}} />)

  expect(container.querySelector(`#${dateField}`)?.textContent).toContain('2026년 10월 7일')
  fireEvent.change(container.querySelector('#description')!, { target: { value: '커피' } })
  fireEvent.change(container.querySelector('#amount')!, { target: { value: '5000' } })
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!)
  })

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    [dateField]: '2026-10-07',
    ...(dateField === 'startDate' ? { autoPostFrom: '2026-10-07' } : {}),
  }))
  expect(container.querySelector(`#${dateField}`)?.textContent).toContain('2026년 10월 7일')
})

it('고정 항목의 자동 반영 시작일을 별도로 선택하고 저장한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 10, 8, 0))
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const { container } = render(<FixedExpenseForm onSubmit={onSubmit} onCancel={() => {}} />)
  fireEvent.click(screen.getByLabelText('자동 반영 시작일'))
  fireEvent.click(screen.getByRole('button', { name: /^8$/ }))
  fireEvent.change(container.querySelector('#description')!, { target: { value: '월세' } })
  fireEvent.change(container.querySelector('#amount')!, { target: { value: '500000' } })
  await act(async () => { fireEvent.submit(container.querySelector('form')!) })
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    startDate: '2026-10-10', autoPostFrom: '2026-10-08',
  }))
})

it('고정 항목 수정 화면은 저장된 자동 반영 시작일을 유지한다', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const { container } = render(<FixedExpenseForm expense={{
    id: 'recurring-1', description: '급여', amount: 1000, type: 'INCOME',
    frequency: 'MONTHLY', startDate: '2026-01-08', autoPostFrom: '2026-09-01',
  }} onSubmit={onSubmit} onCancel={() => {}} />)
  expect(screen.queryByLabelText('자동 반영 시작일')).toBeNull()
  await act(async () => { fireEvent.submit(container.querySelector('form')!) })
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ autoPostFrom: '2026-09-01' }))
})
