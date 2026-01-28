export type Frequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface FixedExpenseRequest {
  description: string
  amount: number
  frequency: Frequency
  startDate: string // ISO 8601 format (YYYY-MM-DD)
}

export interface FixedExpenseResponse {
  id: string
  description: string
  amount: number
  frequency: Frequency
  startDate: string
}
