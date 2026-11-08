import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
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

interface Props { spaceId: string }
export function PensionPage({ spaceId }: Props) {
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
  return <div className="space-y-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
    <div className="flex items-center gap-2"><button aria-label="달력으로 돌아가기" onClick={() => navigate('/')} className="p-3"><ArrowLeft size={20}/></button><h2 className="text-xl font-bold">연금</h2></div>
    <p className="text-sm text-gray-600">연금저축·IRP·DC 계좌와 납입을 관리합니다. 계좌와 기록은 공간 멤버와 공유하고, 공제 한도는 명의자별로 계산합니다.</p>
    {savings.members.length > 0 && <div><label htmlFor="pension-owner" className="block text-sm font-medium mb-2">절세 현황을 볼 명의자</label><Select id="pension-owner" value={selectedOwner} onChange={setOwner} options={savings.members.map(m => ({ value: m.email, label: m.name }))}/></div>}
    {(annual.loading || annual.refreshing) && <p role="status" className="text-sm">연간 납입 내역을 확인하고 있어요.</p>}
    {annual.error && <p role="alert" className="text-red-700">{annual.error} <button className="underline" onClick={() => void savings.refetch()}>다시 시도</button></p>}
    {!annual.loading && !annual.error && year === PENSION_YEAR && <PensionTaxCard key={`${spaceId}:${selectedOwner}:${year}`} annual={accounts.length ? totals : undefined}/>}
    {year !== PENSION_YEAR && <p className="text-sm text-gray-600">{year}년 납입 기록입니다. 절세 계산은 세법을 확인한 {PENSION_YEAR}년에 제공됩니다.</p>}
    <SavingsList pension savings={savings} year={year} month={date.getMonth() + 1} onSelect={setSelection} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} onToday={() => setDate(new Date())}/>
    <Modal formLayout isOpen={selection !== null} onClose={() => setSelection(null)}>
      {selection && <SavingsForm pension selection={selection} savings={savings} onClose={() => setSelection(null)}/>}
    </Modal>
  </div>
}
