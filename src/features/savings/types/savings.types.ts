export interface SavingsPlanRequest {
  name: string
  monthlyAmount: number | null
  firstDate: string | null
  autoPostFrom: string | null
  maturityDate: string | null
  targetAmount: number | null
  payerEmail: string
  memo: string
  version?: number
  reconciliationToken?: string
}
export interface SavingsPlan extends SavingsPlanRequest {
  id: string
  payerName: string
  archived: boolean
  version: number
  balance: number
  nextDate: string | null
}
export interface SavingsRecordRequest {
  date: string
  amount: number
  payerEmail: string
  memo: string
  version?: number
}
export interface SavingsRecord extends SavingsRecordRequest {
  id: string
  planId: string
  planName: string
  payerName: string
  automatic: boolean
  planned: boolean
  version: number
}
export interface SavingsMonth {
  plans: SavingsPlan[]
  records: SavingsRecord[]
  balanceDate: string
  deposits: number
  withdrawals: number
  balance: number
}
export interface SavingsPreview { added: number; removed: number; updated: number; preserved: number; token: string }
export type SavingsSelection = { type: 'plan'; plan?: SavingsPlan } | { type: 'record'; plan: SavingsPlan; record?: SavingsRecord; date?: string }
