export type Frequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface FixedExpenseRequest {
  type?: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  frequency: Frequency
  startDate: string // ISO 8601 format (YYYY-MM-DD)
  autoPostFrom: string
  reconciliationToken?: string
  categoryId?: string
  paymentMethodId?: string
}

export interface RecurringPreview {
  added: number
  deleted: number
  preserved: number
  token: string
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
