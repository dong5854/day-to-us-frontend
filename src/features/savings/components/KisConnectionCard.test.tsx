import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { kisApi } from '../api/kisApi'
import { KisConnectionCard } from './KisConnectionCard'
import type { SavingsPlan } from '../types/savings.types'
vi.mock('../api/kisApi', () => ({ kisApi: { status: vi.fn(), connect: vi.fn(), sync: vi.fn(), disconnect: vi.fn() } }))
const plans: SavingsPlan[] = [{ id: 'plan', name: '내 IRP', kind: 'IRP', monthlyAmount: null, firstDate: null, autoPostFrom: null, maturityDate: null, targetAmount: null, payerEmail: 'me', payerName: '본인', memo: '', archived: false, version: 0, balance: 0, nextDate: null }]
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(kisApi.status).mockResolvedValue({ canConnect: true, accounts: [], connectablePlanIds: ['plan'] }) })
it('연결 폼을 닫으면 입력한 키를 지우고 화면 스크롤 잠금을 해제한다', async () => {
  render(<KisConnectionCard spaceId="space" plans={plans}/>)
  fireEvent.click(await screen.findByText('계좌 연결'))
  fireEvent.change(screen.getByLabelText('App Secret'), { target: { value: 'private-secret' } })
  expect(document.body.style.overflow).toBe('hidden')
  fireEvent.click(screen.getByLabelText('닫기'))
  expect(document.body.style.overflow).not.toBe('hidden')
  fireEvent.click(screen.getByText('계좌 연결'))
  expect((screen.getByLabelText('App Secret') as HTMLInputElement).value).toBe('')
})
it('확인 후 연결만 해제하고 명의자에게만 관리 버튼을 보여준다', async () => {
  vi.mocked(kisApi.status).mockResolvedValue({ canConnect: false, connectablePlanIds: [], accounts: [{ planId: 'plan', name: '내 IRP', maskedAccount: '****5678-29', valuation: 1000000, cash: 0, lastSyncedAt: null, error: null, canManage: true }] })
  render(<KisConnectionCard spaceId="space" plans={plans}/>)
  fireEvent.click(await screen.findByText('연결 해제'))
  expect(kisApi.disconnect).not.toHaveBeenCalled()
  fireEvent.click(screen.getAllByText('연결 해제')[1])
  await waitFor(() => expect(kisApi.disconnect).toHaveBeenCalledWith('space', 'plan'))
})
