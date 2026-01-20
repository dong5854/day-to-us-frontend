export interface BudgetEntryRequest {
  description: string
  amount: number
}

export interface BudgetEntryResponse {
  id: string
  description: string
  amount: number
}
