import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { personalTokenApi } from '../api/personalTokenApi'
import { PersonalTokenCard } from './PersonalTokenCard'

afterEach(() => { cleanup(); vi.restoreAllMocks(); sessionStorage.clear() })

it('조회 전용 토큰을 발급하고 원문을 닫은 뒤 목록에서 폐기한다', async () => {
  vi.spyOn(personalTokenApi, 'list').mockResolvedValue([])
  const info = { id: 'id', name: '주간 요약', access: 'READ' as const, expiresAt: '2026-12-01', lastUsedAt: null }
  const issue = vi.spyOn(personalTokenApi, 'issue').mockResolvedValue({ info, secret: 'one-time-secret' })
  const revoke = vi.spyOn(personalTokenApi, 'revoke').mockResolvedValue({} as Awaited<ReturnType<typeof personalTokenApi.revoke>>)
  render(<PersonalTokenCard spaceId="s" spaceName="우리집" />)
  await screen.findByText('발급한 토큰이 없어요.')
  fireEvent.click(screen.getByRole('button', { name: '새 토큰' }))
  fireEvent.change(screen.getByLabelText('용도 이름'), { target: { value: '주간 요약' } })
  fireEvent.click(screen.getByRole('button', { name: '발급하기' }))
  await screen.findByDisplayValue('one-time-secret')
  expect(issue).toHaveBeenCalledWith('s', { name: '주간 요약', access: 'READ', days: 30 })
  expect(JSON.stringify([localStorage, sessionStorage])).not.toContain('one-time-secret')
  fireEvent.click(screen.getByRole('button', { name: '닫기' }))
  expect(screen.queryByDisplayValue('one-time-secret')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '폐기' }))
  fireEvent.click(screen.getByRole('button', { name: '폐기 확인' }))
  await waitFor(() => expect(screen.queryByText('주간 요약')).toBeNull())
  expect(revoke).toHaveBeenCalledWith('s', 'id')
})
