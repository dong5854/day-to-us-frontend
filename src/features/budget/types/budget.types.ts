export interface BudgetEntryRequest {
  description: string
  amount: number
  fixedExpenseId?: string
}

export interface BudgetEntryResponse {
  id: string
  description: string
  amount: number
  fixedExpenseId?: string
}
