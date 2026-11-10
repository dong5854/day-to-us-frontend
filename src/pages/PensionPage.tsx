import { KisConnectionCard } from '@/features/savings/components/KisConnectionCard'
import { CalendarCategoryTabs, type CalendarFilter } from './calendar/CalendarCategoryTabs'
import { useContext, useState } from 'react'
import { Plus } from 'lucide-react'
import { createPortal } from 'react-dom'
import { LayoutSlotsContext } from '@/shared/components/LayoutSlotsContext'
import { useNavigate } from 'react-router-dom'
import { useSavings } from '@/features/savings/hooks/useSavings'
import { usePensionYear } from '@/features/savings/hooks/usePensionYear'
import { PensionTaxCard } from '@/features/savings/components/PensionTaxCard'
import { SavingsList } from '@/features/savings/components/SavingsList'
import { SavingsForm } from '@/features/savings/components/SavingsForm'
import { PENSION_YEAR } from '@/features/savings/utils/pension'
import type { SavingsSelection } from '@/features/savings/types/savings.types'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'

interface Props { spaceId: string; onOpenCategory?: (filter: CalendarFilter) => void }
export function PensionPage({ spaceId, onOpenCategory }: Props) {
  const { headerTarget } = useContext(LayoutSlotsContext)
  const navigate = useNavigate()
  const [date, setDate] = useState(() => new Date())
  const [owner, setOwner] = useState('')
  const [selection, setSelection] = useState<SavingsSelection | null>(null)
  const year = date.getFullYear()
  const savings = useSavings(spaceId, year, date.getMonth() + 1, 'pension')
  const annual = usePensionYear(spaceId, year, savings.data)
  const selectedOwner = owner || savings.members[0]?.email || ''
  const accounts = annual.accounts.filter(account => account.ownerEmail === selectedOwner)
  const totals = {
    pension: accounts.filter(a => a.kind === 'PENSION_SAVINGS').reduce((sum, a) => sum + a.confirmedDeposits, 0),
    retirement: accounts.filter(a => a.kind !== 'PENSION_SAVINGS').reduce((sum, a) => sum + a.confirmedDeposits, 0),
    unconfirmed: accounts.reduce((sum, a) => sum + a.unconfirmedCount, 0),
    review: accounts.some(a => a.hasWithdrawals),
  }
  const changeMonth = (offset: number) => setDate(new Date(year, date.getMonth() + offset, 1))
  const header = <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 px-2">
    <h1 className="text-lg font-semibold">연금</h1>
    <button type="button" onClick={() => setSelection({ type: 'plan' })} className="flex min-h-11 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium hover:bg-white/15"><Plus size={17}/>추가</button>
  </div>
  return <>
    {headerTarget ? createPortal(header, headerTarget) : header}
    <div className="max-w-2xl mx-auto space-y-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
    <CalendarCategoryTabs selected="pension" onSelect={category => {
      if (category === 'pension') return
      if (onOpenCategory) onOpenCategory(category)
      else navigate('/')
    }}/>
    {savings.members.length > 0 && <div className="flex items-center justify-between gap-3 px-1"><label htmlFor="pension-owner" className="shrink-0 text-sm text-gray-500">절세 현황</label><Select id="pension-owner" size="sm" className="w-56 max-w-[75%]" value={selectedOwner} onChange={setOwner} options={savings.members.map(m => ({ value: m.email, label: m.name }))}/></div>}
    <KisConnectionCard key={spaceId} spaceId={spaceId} plans={savings.data?.plans ?? []}/>
    <SavingsList pension savings={savings} year={year} month={date.getMonth() + 1} onSelect={setSelection} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} onToday={() => setDate(new Date())}>
    {(annual.loading || annual.refreshing) && <p role="status" className="text-sm">연간 납입 내역을 확인하고 있어요.</p>}
    {annual.error && <p role="alert" className="text-red-700">{annual.error} <button className="underline" onClick={() => void savings.refetch()}>다시 시도</button></p>}
    {!annual.loading && !annual.error && year === PENSION_YEAR && <PensionTaxCard key={`${spaceId}:${selectedOwner}:${year}`} annual={accounts.length ? totals : undefined}/>}
    {year !== PENSION_YEAR && <p className="text-sm text-gray-600">{year}년 납입 기록입니다. 절세 계산은 세법을 확인한 {PENSION_YEAR}년에 제공됩니다.</p>}
    </SavingsList>
    <Modal formLayout isOpen={selection !== null} onClose={() => setSelection(null)}>
      {selection && <SavingsForm pension selection={selection} savings={savings} onClose={() => setSelection(null)}/>}
    </Modal>
  </div></>
}
