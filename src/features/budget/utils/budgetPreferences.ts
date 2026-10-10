interface BudgetPreferences {
  isIncome: boolean
  categoryId: string
  paymentMethodId: string
}

export function readBudgetPreferences(spaceId?: string): BudgetPreferences {
  const defaults = { isIncome: true, categoryId: '', paymentMethodId: '' }
  if (!spaceId) return defaults
  try {
    const saved = JSON.parse(localStorage.getItem(`budget-preferences:${spaceId}`) || 'null')
    return {
      isIncome: typeof saved?.isIncome === 'boolean' ? saved.isIncome : true,
      categoryId: typeof saved?.categoryId === 'string' ? saved.categoryId : '',
      paymentMethodId: typeof saved?.paymentMethodId === 'string' ? saved.paymentMethodId : '',
    }
  } catch {
    return defaults
  }
}

export function rememberBudgetPreferences(spaceId: string | undefined, changes: Partial<BudgetPreferences>) {
  if (!spaceId) return
  try {
    localStorage.setItem(`budget-preferences:${spaceId}`, JSON.stringify({ ...readBudgetPreferences(spaceId), ...changes }))
  } catch {
    // Storage may be unavailable; the form must still work.
  }
}
