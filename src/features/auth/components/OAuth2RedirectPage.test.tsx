import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import apiClient from '@/shared/api/client'
import { OAuth2RedirectPage } from './OAuth2RedirectPage'

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear() })

it('일회용 코드를 한 번 교환하고 토큰 발급 설정으로 돌아간다', async () => {
  window.history.replaceState(null, '', '/oauth2/redirect#code=one-time-code')
  sessionStorage.setItem('personalTokenDraft', '{"space":"s"}')
  const exchange = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { accessToken: 'login-token' } })
  render(<StrictMode><BrowserRouter><Routes>
    <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
    <Route path="/settings" element={<p>설정</p>} />
  </Routes></BrowserRouter></StrictMode>)
  await screen.findByText('설정')
  expect(exchange).toHaveBeenCalledTimes(1)
  expect(exchange).toHaveBeenCalledWith('/auth/login/exchange', { code: 'one-time-code' }, { withCredentials: true })
  expect(localStorage.getItem('accessToken')).toBe('login-token')
  expect(window.location.hash).toBe('')
})
