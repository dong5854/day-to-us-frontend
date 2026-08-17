export type Frequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface FixedExpenseRequest {
  description: string
  amount: number
  frequency: Frequency
  startDate: string // ISO 8601 format (YYYY-MM-DD)
  categoryId?: string
  paymentMethodId?: string
}

export interface FixedExpenseResponse {
  id: string
  description: string
  amount: number
  frequency: Frequency
  startDate: string
  categoryId?: string
  paymentMethodId?: string
}
