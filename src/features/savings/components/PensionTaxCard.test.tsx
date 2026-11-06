import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PensionTaxCard } from './PensionTaxCard'
afterEach(() => { cleanup(); vi.useRealTimers() })
it('IRP만 한도를 채워도 완료하고 입력이 없으면 부족 경고를 만들지 않는다', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-20T00:00:00Z'))
  render(<PensionTaxCard/>)
  expect(screen.queryByText(/남았어요/)).toBeNull()
  fireEvent.click(screen.getByText('내 남은 공제 한도 계산하기'))
  fireEvent.change(screen.getByLabelText('연금저축 확인 납입액 (원)'), { target: { value: '0' } })
  fireEvent.change(screen.getByLabelText('IRP·DC 본인 추가 납입액 (원)'), { target: { value: '9000000' } })
  expect(screen.getByText('올해 일반 공제 한도를 채웠어요')).toBeTruthy()
})
it('기간 종료 후 추가 납입을 유도하지 않고 신고 확인을 안내한다', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2027-01-01T00:00:00Z'))
  render(<PensionTaxCard/>)
  expect(screen.getByText(/납입 기간 종료/)).toBeTruthy()
  fireEvent.change(screen.getByLabelText('연금저축 확인 납입액 (원)'), { target: { value: '0' } })
  fireEvent.change(screen.getByLabelText('IRP·DC 본인 추가 납입액 (원)'), { target: { value: '0' } })
  expect(screen.queryByLabelText(/마감 전 추가/)).toBeNull()
})
