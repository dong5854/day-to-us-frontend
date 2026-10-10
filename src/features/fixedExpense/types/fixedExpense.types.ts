export type Frequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface FixedExpenseRequest {
  type?: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  frequency: Frequency
  startDate: string // ISO 8601 format (YYYY-MM-DD)
  autoPostFrom: string
  categoryId?: string
  paymentMethodId?: string
}

export interface FixedExpenseResponse {
  id: string
  type?: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  frequency: Frequency
  startDate: string
  autoPostFrom?: string
  categoryId?: string
  paymentMethodId?: string
}
