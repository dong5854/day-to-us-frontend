export interface BudgetEntryRequest {
  description: string
  amount: number
  date: string // ISO 8601 format (YYYY-MM-DD)
  fixedExpenseId?: string
}

export interface BudgetEntryResponse {
  id: string
  description: string
  amount: number
  date: string // ISO 8601 format (YYYY-MM-DD)
  fixedExpenseId?: string
}
