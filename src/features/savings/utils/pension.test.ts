import { describe, expect, it } from 'vitest'
import { parsePensionAmount, pensionDeadline, pensionSummary } from './pension'

describe('연금 일반 공제 한도', () => {
  it.each([[6_000_000, 3_000_000], [4_000_000, 5_000_000], [0, 9_000_000]])('연금저축 %i, 퇴직연금 %i 조합은 한도를 채운다', (pension, retirement) => {
    expect(pensionSummary(pension, retirement, 0.165)).toMatchObject({ eligible: 9_000_000, remaining: 0, credit: 1_485_000 })
  })
  it('연금저축 초과액은 공제 대상에서 제외한다', () => {
    expect(pensionSummary(9_000_000, 0, 0.132)).toMatchObject({ eligible: 6_000_000, remaining: 3_000_000, pensionRemaining: 0, retirementRemaining: 3_000_000, credit: 792_000 })
  })
  it('부분 납입의 추가 납입 조합과 공제액을 계산한다', () => {
    expect(pensionSummary(4_000_000, 2_000_000, 0.165)).toMatchObject({ pensionRemaining: 2_000_000, retirementRemaining: 1_000_000, extraCredit: 495_000 })
  })
  it('입력 전 상태와 0원을 구별하며 잘못된 금액을 거부한다', () => {
    expect(parsePensionAmount('0')).toBe(0)
    for (const value of ['', '-1', '1.5', '1e6', 'NaN', '1000000001']) expect(parsePensionAmount(value)).toBeNull()
  })
  it('한국 날짜 자정에 마감 상태를 전환한다', () => {
    expect(pensionDeadline(new Date('2026-12-31T14:59:59Z'))).toEqual({ days: 0, expired: false, urgent: true })
    expect(pensionDeadline(new Date('2026-12-31T15:00:00Z'))).toEqual({ days: -1, expired: true, urgent: false })
    expect(pensionDeadline(new Date('2026-10-01T00:00:00Z')).urgent).toBe(false)
  })
})
