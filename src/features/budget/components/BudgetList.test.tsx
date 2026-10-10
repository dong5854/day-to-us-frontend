import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { BudgetList } from './BudgetList'
import { formatCurrency } from '@/shared/utils/format'

afterEach(cleanup)

it('맨 왼쪽 유형 필터가 다른 필터와 함께 목록과 요약 금액에 적용된다', () => {
  const food = { id: 'food', name: '식비' }
  const card = { id: 'card', name: '카드' }
  render(<BudgetList
    entries={[
      { id: '1', description: '급여', amount: 10000, date: '2026-10-10', category: food, paymentMethod: card },
      { id: '2', description: '점심', amount: -3000, fixedExpenseId: 'recurring-1', date: '2026-10-10', category: food, paymentMethod: card },
      { id: '3', description: '현금 식사', amount: -1000, date: '2026-10-10', category: food },
      { id: '4', description: '교통', amount: -2000, date: '2026-10-10' },
    ]}
    categories={[food]} paymentMethods={[card]} loading={false} onEdit={vi.fn()} onDelete={vi.fn()}
  />)
  const select = (index: number, name: string) => {
    fireEvent.click(screen.getAllByRole('combobox')[index])
    fireEvent.click(screen.getByRole('option', { name }))
  }
  expect(screen.getAllByRole('combobox')[0].textContent).toContain('전체 유형')
  select(0, '지출')
  expect(screen.queryByText('급여')).toBeNull()
  expect(screen.getByText('교통')).toBeDefined()
  select(1, '식비')
  expect(screen.queryByText('교통')).toBeNull()
  select(2, '카드')
  expect(screen.queryByText('현금 식사')).toBeNull()
  expect(screen.getByText('점심')).toBeDefined()
  expect(screen.getByText(`고정 ${formatCurrency(3000)} 포함`)).toBeDefined()
  expect(within(screen.getByLabelText('가계부 요약')).getByText(formatCurrency(-3000))).toBeDefined()
  select(0, '수입')
  expect(screen.getByText('급여')).toBeDefined()
  expect(screen.queryByText('점심')).toBeNull()
  select(0, '전체 유형')
  expect(screen.getByText('급여')).toBeDefined()
  expect(screen.getByText('점심')).toBeDefined()
})
