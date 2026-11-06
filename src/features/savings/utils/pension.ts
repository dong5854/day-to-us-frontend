export const PENSION_YEAR = 2026
export const PENSION_SOURCE = 'https://i.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6439'

export function pensionSummary(pension: number, retirement: number, rate: number) {
  const eligible = Math.min(9_000_000, Math.min(pension, 6_000_000) + retirement)
  const remaining = 9_000_000 - eligible
  const pensionRemaining = Math.min(remaining, Math.max(0, 6_000_000 - pension))
  return { eligible, remaining, pensionRemaining, retirementRemaining: remaining - pensionRemaining,
    credit: Math.round(eligible * rate), extraCredit: Math.round(remaining * rate) }
}

export function pensionDeadline(now: Date) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const days = Math.round((Date.parse(`${PENSION_YEAR}-12-31T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)
  return { days, expired: days < 0, urgent: days >= 0 && days <= 60 }
}

export function parsePensionAmount(value: string) {
  if (!/^\d+$/.test(value)) return null
  const amount = Number(value)
  return Number.isSafeInteger(amount) && amount <= 1_000_000_000 ? amount : null
}
