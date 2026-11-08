import { useEffect, useState } from 'react'
import { savingsApi } from '../api/savingsApi'
import { savingsError } from './useSavings'
import type { PensionAccountSummary, SavingsMonth } from '../types/savings.types'

export function usePensionYear(spaceId: string, year: number, source: SavingsMonth | null) {
  const [result, setResult] = useState<{ source: SavingsMonth | null; spaceId: string; year: number; accounts: PensionAccountSummary[]; error: string } | null>(null)
  useEffect(() => {
    if (!source) return
    let active = true
    savingsApi.pensionYear(spaceId, year).then(accounts => {
      if (active) setResult({ source, spaceId, year, accounts, error: '' })
    }).catch(error => {
      if (active) setResult({ source, spaceId, year, accounts: [], error: savingsError(error) })
    })
    return () => { active = false }
  }, [spaceId, year, source])
  const current = result?.spaceId === spaceId && result?.year === year ? result : null
  return { accounts: current?.accounts || [], error: current?.error || '', loading: source !== null && current === null, refreshing: current !== null && current.source !== source }
}
