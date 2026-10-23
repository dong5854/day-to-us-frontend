import type { ExpenseCategoryResponse } from './expenseCategory.types'
export interface CategoryMonthTotal { month: string; spent: number; budget: number | null }
export interface CategoryOverviewRow {
  category: ExpenseCategoryResponse | null
  history: CategoryMonthTotal[]
  used: boolean
  fixedExpenseIds: string[]
}
export interface CategoryOverview { month: string; totalSpent: number; rows: CategoryOverviewRow[] }
