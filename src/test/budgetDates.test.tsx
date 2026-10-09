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

  expect(screen.getByText('2026년 10월 7일')).toBeTruthy()
  fireEvent.change(container.querySelector('#description')!, { target: { value: '커피' } })
  fireEvent.change(container.querySelector('#amount')!, { target: { value: '5000' } })
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!)
  })

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    [dateField]: '2026-10-07',
  }))
  expect(screen.getByText('2026년 10월 7일')).toBeTruthy()
})
