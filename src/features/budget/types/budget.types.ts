import type { ExpenseCategoryResponse } from './expenseCategory.types'
import type { PaymentMethodResponse } from './paymentMethod.types'

export interface BudgetEntryRequest {
  description: string
  amount: number
  date: string // ISO 8601 format (YYYY-MM-DD)
  categoryId?: string
  paymentMethodId?: string
  fixedExpenseId?: string
}

export interface BudgetEntryResponse {
  id: string
  description: string
  amount: number
  date: string // ISO 8601 format (YYYY-MM-DD)
  category?: ExpenseCategoryResponse | null
  paymentMethod?: PaymentMethodResponse | null
  fixedExpenseId?: string
}
