export const categoryMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
export const shiftCategoryMonth = (month: string, offset: number) => {
  const [year, number] = month.split('-').map(Number)
  return categoryMonth(new Date(year, number - 1 + offset, 1))
}
export const budgetStatus = (spent: number, budget: number | null) => {
  if (budget === null) return '예산 미설정'
  if (budget === 0 && spent === 0) return '이번 달 지출 목표 0원'
  if (spent > budget) return `${(spent - budget).toLocaleString('ko-KR')}원 초과`
  if (spent === budget) return '예산을 모두 사용했어요'
  return `${(budget - spent).toLocaleString('ko-KR')}원 남음`
}
