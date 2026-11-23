import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'
import { spaceApi } from './features/space/api/spaceApi'

vi.mock('./features/space/api/spaceApi')
vi.mock('./pages/CalendarPage', () => ({ CalendarPage: () => <div>공유 달력</div> }))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  localStorage.clear()
})

it.each([true, false])('공간 조회 장애 후 재시도 결과에 맞는 화면을 표시한다 (공간 보유 %s)', async hasSpace => {
  localStorage.setItem('accessToken', 'test-token')
  vi.mocked(spaceApi.getAll)
    .mockRejectedValueOnce({ response: { status: 503 } })
    .mockResolvedValueOnce(hasSpace ? [{ id: '1', name: '우리 공간', inviteCode: 'test' }] : [])
  vi.mocked(spaceApi.getMembers).mockResolvedValue([])

  render(<App />)
  const retry = await screen.findByRole('button', { name: '다시 시도' })
  expect(screen.queryByRole('button', { name: '시작하기' })).toBeNull()
  fireEvent.click(retry)

  expect(await screen.findByText(hasSpace ? '공유 달력' : '시작하기')).toBeTruthy()
  expect(screen.queryByRole('button', { name: '다시 시도' })).toBeNull()
  expect(spaceApi.getAll).toHaveBeenCalledTimes(2)
})
