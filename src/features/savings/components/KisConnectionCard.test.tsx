import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { kisApi } from '../api/kisApi'
import { PensionConnections } from './PensionConnections'
import type { SavingsState } from '../hooks/useSavings'
import type { SavingsPlan } from '../types/savings.types'
vi.mock('../api/kisApi', () => ({ kisApi: { status: vi.fn(), connect: vi.fn(), sync: vi.fn(), disconnect: vi.fn() } }))
const plans: SavingsPlan[] = [{ id: 'plan', name: '내 IRP', kind: 'IRP', monthlyAmount: null, firstDate: null, autoPostFrom: null, maturityDate: null, targetAmount: null, payerEmail: 'me', payerName: '본인', memo: '', archived: false, version: 0, balance: 0, nextDate: null }]
const savings = { data: { plans }, members: [{ email: 'me', name: '본인' }], savePlan: vi.fn() } as unknown as SavingsState
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(kisApi.status).mockResolvedValue({ canConnect: true, accounts: [], connectablePlanIds: ['plan'] }) })
it('연결 폼을 닫으면 입력한 키를 지우고 화면 스크롤 잠금을 해제한다', async () => {
  render(<PensionConnections onAddAccount={vi.fn()} spaceId="space" savings={savings}/>)
  fireEvent.click(screen.getByRole('button', { name: '연결' }))
  fireEvent.click(screen.getByRole('button', { name: /한국투자증권/ }))
  await screen.findByText('한국투자증권 연결')
  fireEvent.change(screen.getByLabelText('App Secret'), { target: { value: 'private-secret' } })
  expect(document.body.style.overflow).toBe('hidden')
  fireEvent.click(screen.getByLabelText('닫기'))
  expect(document.body.style.overflow).not.toBe('hidden')
  fireEvent.click(screen.getByRole('button', { name: '연결' }))
  fireEvent.click(screen.getByRole('button', { name: /한국투자증권/ }))
  await screen.findByText('한국투자증권 연결')
  expect((screen.getByLabelText('App Secret') as HTMLInputElement).value).toBe('')
})
it('확인 후 연결만 해제하고 명의자에게만 관리 버튼을 보여준다', async () => {
  vi.mocked(kisApi.status).mockResolvedValue({ canConnect: false, connectablePlanIds: [], accounts: [{ planId: 'plan', name: '내 IRP', maskedAccount: '****5678-29', valuation: 1000000, cash: 0, lastSyncedAt: null, error: null, canManage: true }] })
  render(<PensionConnections onAddAccount={vi.fn()} spaceId="space" savings={savings}/>)
  fireEvent.click(await screen.findByText('연결 해제'))
  expect(kisApi.disconnect).not.toHaveBeenCalled()
  fireEvent.click(screen.getAllByText('연결 해제')[1])
  await waitFor(() => expect(kisApi.disconnect).toHaveBeenCalledWith('space', 'plan'))
})

it('계좌가 없어도 등록 버튼으로 진입하고 저장 후 키 입력으로 이어진다', async () => {
  vi.mocked(kisApi.status).mockResolvedValue({ canConnect: true, accounts: [], connectablePlanIds: [] })
  const empty = { ...savings, data: { ...savings.data!, plans: [] } }
  const { rerender } = render(<PensionConnections onAddAccount={vi.fn()} spaceId="space" savings={empty}/>)
  fireEvent.click(screen.getByRole('button', { name: '연결' }))
  fireEvent.click(screen.getByRole('button', { name: /한국투자증권/ }))
  await screen.findByText('한국투자증권 연결')
  expect(screen.queryByLabelText('App Key')).toBeNull()
  fireEvent.click(screen.getByText('연금 계좌 추가하고 계속'))
  expect(screen.getByText('연금 계좌 추가')).toBeTruthy()
  vi.mocked(kisApi.status).mockResolvedValue({ canConnect: true, accounts: [], connectablePlanIds: ['plan'] })
  rerender(<PensionConnections onAddAccount={vi.fn()} spaceId="space" savings={savings}/>)
  fireEvent.change(screen.getByLabelText('계좌 이름'), { target: { value: '내 IRP' } })
  fireEvent.click(screen.getByRole('button', { name: '저장' }))
  await waitFor(() => expect(savings.savePlan).toHaveBeenCalled())
  expect(await screen.findByLabelText('App Key')).toBeTruthy()
  expect(screen.getByLabelText('App Secret')).toBeTruthy()
})

it('기관 선택 전에는 업체별 폼을 숨기고 직접 추가를 지원한다', () => {
  const onAddAccount = vi.fn()
  render(<PensionConnections spaceId="space" savings={savings} onAddAccount={onAddAccount}/>)
  expect(screen.queryByText('한국투자증권')).toBeNull()
  expect(screen.queryByLabelText('App Key')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '직접 추가' }))
  expect(onAddAccount).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('button', { name: '연결' }))
  expect(screen.getByRole('heading', { name: '금융기관 선택' })).toBeTruthy()
  expect(screen.getByRole('button', { name: /한국투자증권/ })).toBeTruthy()
  expect(screen.queryByLabelText('App Key')).toBeNull()
})
