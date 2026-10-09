import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SettingsPage } from './SettingsPage'

vi.mock('@/features/syncSetting/components/SyncSettingCard', () => ({ SyncSettingCard: () => null }))
vi.mock('@/features/notification/components/NotificationSettingCard', () => ({ NotificationSettingCard: () => null }))

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

it('로그아웃 버튼을 누르면 인증 토큰을 지우고 앱을 다시 열어 로그인 상태를 초기화한다', () => {
  localStorage.setItem('accessToken', 'test-token')
  localStorage.setItem('unrelated-preference', 'keep')
  const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {})
  render(<SettingsPage space={null} members={[]} />)

  fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))

  expect(localStorage.getItem('accessToken')).toBeNull()
  expect(localStorage.getItem('unrelated-preference')).toBe('keep')
  expect(replace).toHaveBeenCalledWith('/')
})
