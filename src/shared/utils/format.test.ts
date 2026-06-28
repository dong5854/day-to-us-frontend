import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatCurrency, formatDate, formatRelativeTime } from './format'

describe('formatCurrency', () => {
  it('양수 금액을 원화로 포맷한다', () => {
    expect(formatCurrency(10000)).toContain('10,000')
    expect(formatCurrency(10000)).toContain('₩')
  })

  it('0을 포맷한다', () => {
    expect(formatCurrency(0)).toContain('0')
  })

  it('음수 금액을 포맷한다', () => {
    const result = formatCurrency(-5000)
    expect(result).toContain('5,000')
  })
})

describe('formatDate', () => {
  it('Date 객체를 한국어 날짜 문자열로 포맷한다', () => {
    const date = new Date(2024, 0, 15) // 2024년 1월 15일
    const result = formatDate(date)
    expect(result).toContain('2024')
    expect(result).toContain('1')
    expect(result).toContain('15')
  })

  it('날짜 문자열을 받아도 포맷한다', () => {
    const result = formatDate('2024-06-01')
    expect(result).toContain('2024')
    expect(result).toContain('6')
    expect(result).toContain('1')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00'))
  })

  it('30초 전은 "방금 전"을 반환한다', () => {
    const date = new Date('2024-01-01T11:59:30')
    expect(formatRelativeTime(date)).toBe('방금 전')
  })

  it('5분 전은 "5분 전"을 반환한다', () => {
    const date = new Date('2024-01-01T11:55:00')
    expect(formatRelativeTime(date)).toBe('5분 전')
  })

  it('2시간 전은 "2시간 전"을 반환한다', () => {
    const date = new Date('2024-01-01T10:00:00')
    expect(formatRelativeTime(date)).toBe('2시간 전')
  })

  it('3일 전은 "3일 전"을 반환한다', () => {
    const date = new Date('2023-12-29T12:00:00')
    expect(formatRelativeTime(date)).toBe('3일 전')
  })

  it('8일 이상 지난 날짜는 날짜 문자열을 반환한다', () => {
    const date = new Date('2023-12-01T12:00:00')
    const result = formatRelativeTime(date)
    expect(result).toContain('2023')
  })
})
