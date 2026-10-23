export interface ExpenseCategoryRequest {
  name: string
}

export interface ExpenseCategoryResponse {
  id: string
  name: string
  sortOrder?: number
  archived?: boolean
}
