import { describe, it, expect } from 'vitest'
import { toDateString, toTimeString, buildDateStr } from './dateUtils'

describe('toDateString', () => {
  it('날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
    expect(toDateString(new Date(2024, 0, 15))).toBe('2024-01-15')
  })

  it('한 자리 월/일을 0으로 패딩한다', () => {
    expect(toDateString(new Date(2024, 2, 5))).toBe('2024-03-05')
  })

  it('12월 31일을 올바르게 포맷한다', () => {
    expect(toDateString(new Date(2024, 11, 31))).toBe('2024-12-31')
  })
})

describe('toTimeString', () => {
  it('시간을 HH:mm 형식으로 반환한다', () => {
    const date = new Date(2024, 0, 1, 14, 30)
    expect(toTimeString(date)).toBe('14:30')
  })

  it('한 자리 시/분을 0으로 패딩한다', () => {
    const date = new Date(2024, 0, 1, 9, 5)
    expect(toTimeString(date)).toBe('09:05')
  })

  it('자정을 올바르게 포맷한다', () => {
    const date = new Date(2024, 0, 1, 0, 0)
    expect(toTimeString(date)).toBe('00:00')
  })
})

describe('buildDateStr', () => {
  it('year/month(0-indexed)/day를 YYYY-MM-DD 문자열로 반환한다', () => {
    expect(buildDateStr(2024, 0, 15)).toBe('2024-01-15') // 1월
    expect(buildDateStr(2024, 11, 31)).toBe('2024-12-31') // 12월
  })

  it('한 자리 월/일을 0으로 패딩한다', () => {
    expect(buildDateStr(2024, 2, 5)).toBe('2024-03-05')
  })
})
