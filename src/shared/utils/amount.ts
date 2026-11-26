export const amountIncrements = [
  { value: 1_000, label: '+1천' },
  { value: 10_000, label: '+1만' },
  { value: 50_000, label: '+5만' },
  { value: 100_000, label: '+10만' },
] as const

export function addAmount(current: string, increment: number): string {
  const next = Math.max(0, Number(current) || 0) + increment
  return Number.isSafeInteger(next) ? String(next) : current
}
