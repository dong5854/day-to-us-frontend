import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SavingsForm } from './SavingsForm'
import { SavingsList } from './SavingsList'
import type { SavingsState } from '../hooks/useSavings'
import type { SavingsPlan, SavingsRecord } from '../types/savings.types'
const plan: SavingsPlan = { id: 'p1', name: '여행 자금', monthlyAmount: null, firstDate: null, autoPostFrom: null, maturityDate: null, targetAmount: 1000000, payerEmail: 'a@test.com', payerName: '동영', memo: '', archived: false, version: 0, balance: 10000, nextDate: null }
const record: SavingsRecord = { id: 'r1', planId: 'p1', planName: plan.name, date: '2026-10-01', amount: 10000, payerEmail: plan.payerEmail, payerName: '동영', memo: '', automatic: true, planned: false, version: 0 }
function state(): SavingsState { return { data: { plans: [plan], records: [record], deposits: 10000, withdrawals: 0, balance: 10000, balanceDate: '2026-10-18' }, members: [{ name: '동영', email: plan.payerEmail }], error: '', loading: false, refetch: vi.fn().mockResolvedValue(undefined), savePlan: vi.fn().mockResolvedValue(undefined), preview: vi.fn().mockResolvedValue({ added: 1, removed: 2, updated: 0, preserved: 1, token: 'confirmed' }), archive: vi.fn().mockResolvedValue(undefined), saveRecord: vi.fn().mockResolvedValue(undefined), deleteRecord: vi.fn().mockResolvedValue(undefined) } }
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('금액 버튼이 누적되고 읽기 쉬운 금액을 표시하며 중복 제출하지 않는다', async () => {
  const savings = state()
  render(<SavingsForm selection={{ type: 'record', plan }} savings={savings} onClose={vi.fn()}/> )
  fireEvent.click(screen.getByRole('button', { name: '+1천' }))
  fireEvent.click(screen.getByRole('button', { name: '+1만' }))
  expect(screen.getByText('1만 1,000원')).toBeDefined()
  expect(savings.saveRecord).not.toHaveBeenCalled()
  const button = screen.getByRole('button', { name: '저장' })
  fireEvent.click(button); fireEvent.click(button)
  await waitFor(() => expect(savings.saveRecord).toHaveBeenCalledTimes(1))
  expect(savings.saveRecord).toHaveBeenCalledWith(plan.id, expect.objectContaining({ amount: 11000 }), undefined)
})
it('설정 수정은 영향 미리보기를 확인한 후에만 저장한다', async () => {
  const savings = state()
  render(<SavingsForm selection={{ type: 'plan', plan }} savings={savings} onClose={vi.fn()}/> )
  fireEvent.click(screen.getByRole('button', { name: '저장' }))
  await screen.findByText('1건 추가 · 2건 삭제 · 0건 수정')
  expect(savings.savePlan).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '변경 적용' }))
  await waitFor(() => expect(savings.savePlan).toHaveBeenCalledWith(expect.objectContaining({ name: '여행 자금', version: 0 }), 'p1'))
})
it('실패하면 입력을 유지하고 오류를 표시한다', async () => {
  const savings = state(); vi.mocked(savings.saveRecord).mockRejectedValue(new Error('다시 시도하세요'))
  const close = vi.fn()
  render(<SavingsForm selection={{ type: 'record', plan, record }} savings={savings} onClose={close}/> )
  fireEvent.click(screen.getByRole('button', { name: '저장' }))
  await screen.findByText('다시 시도하세요')
  expect(close).not.toHaveBeenCalled()
  expect((screen.getByLabelText('금액') as HTMLInputElement).value).toBe('10000')
})
it('소수 금액은 전송하지 않고 인출은 음수로 전송한다', async () => {
  const savings = state()
  render(<SavingsForm selection={{ type: 'record', plan, record }} savings={savings} onClose={vi.fn()}/> )
  fireEvent.change(screen.getByLabelText('금액'), { target: { value: '1.5' } })
  fireEvent.submit(screen.getByRole('button', { name: '저장' }).closest('form')!)
  expect(savings.saveRecord).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('금액'), { target: { value: '3000' } })
  fireEvent.click(screen.getByText('납입'))
  fireEvent.click(screen.getByRole('option', { name: '인출' }))
  fireEvent.click(screen.getByRole('button', { name: '저장' }))
  await waitFor(() => expect(savings.saveRecord).toHaveBeenCalledWith(plan.id, expect.objectContaining({ amount: -3000 }), record.id))
})
it('예정 항목은 설정으로 실제 기록은 수정으로 연결한다', () => {
  const savings = state(); const planned = { ...record, id: 'future', planned: true }
  savings.data!.records.push(planned)
  const select = vi.fn()
  render(<SavingsList savings={savings} year={2026} month={10} onSelect={select} onPrev={vi.fn()} onNext={vi.fn()} onToday={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button', { name: /납입 예정/ }))
  expect(select).toHaveBeenLastCalledWith({ type: 'plan', plan })
  fireEvent.click(screen.getByRole('button', { name: /납입 기록/ }))
  expect(select).toHaveBeenLastCalledWith({ type: 'record', plan, record })
})
