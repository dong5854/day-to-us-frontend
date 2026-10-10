export const formatKoreanWon = (amount: number): string => {
  if (!Number.isSafeInteger(amount) || amount < 0) return ''
  if (amount === 0) return '0원'
  let remaining = amount
  const parts: string[] = []
  for (const [value, unit] of [[1e12, '조'], [1e8, '억'], [1e4, '만'], [1, '']] as const) {
    const count = Math.floor(remaining / value)
    if (count) parts.push(`${count.toLocaleString('ko-KR')}${unit}`)
    remaining %= value
  }
  return `${parts.join(' ')}원`
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
  
  return formatDate(d)
}
