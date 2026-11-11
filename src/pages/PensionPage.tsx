import { KisConnectionCard } from '@/features/savings/components/KisConnectionCard'
import { CalendarCategoryTabs, type CalendarFilter } from './calendar/CalendarCategoryTabs'
import { useState } from 'react'
import { CalendarViewTabs, type CalendarView } from './calendar/CalendarViewTabs'
import { CalendarGridView } from './calendar/CalendarGridView'
import { buildDateStr } from '@/shared/utils/dateUtils'
import { useSwipe } from '@/shared/hooks/useSwipe'
import { useNavigate } from 'react-router-dom'
import { useSavings } from '@/features/savings/hooks/useSavings'
import { usePensionYear } from '@/features/savings/hooks/usePensionYear'
import { PensionTaxCard } from '@/features/savings/components/PensionTaxCard'
import { SavingsList, SavingsRecordRow } from '@/features/savings/components/SavingsList'
import { SavingsForm } from '@/features/savings/components/SavingsForm'
import { PENSION_YEAR } from '@/features/savings/utils/pension'
import type { SavingsSelection } from '@/features/savings/types/savings.types'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'

interface Props {
  spaceId: string
  onOpenCategory?: (filter: CalendarFilter) => void
  currentDate?: Date
  onDateChange?: (date: Date) => void
  activeView?: CalendarView
  onViewChange?: (view: CalendarView) => void
}
export function PensionPage({ spaceId, onOpenCategory, currentDate, onDateChange, activeView, onViewChange }: Props) {
  const navigate = useNavigate()
  const [localDate, setLocalDate] = useState(() => new Date())
  const date = currentDate ?? localDate
  const setDate = (value: Date) => { setLocalDate(value); onDateChange?.(value) }
  const [localView, setLocalView] = useState<CalendarView>('calendar')
  const view = activeView ?? localView
  const setView = (value: CalendarView) => { setLocalView(value); onViewChange?.(value) }
  const [selectedDay, setSelectedDay] = useState('')
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
  const swipeHandlers = useSwipe({ onSwipeLeft: () => changeMonth(1), onSwipeRight: () => changeMonth(-1) })
  return <div className="flex flex-col min-h-full">
    <div className="mb-4 space-y-3">
    <CalendarViewTabs value={view} onChange={setView}/>
    <CalendarCategoryTabs selected="pension" onSelect={category => {
      if (category === 'pension') return
      if (onOpenCategory) onOpenCategory(category)
      else navigate('/')
    }}/>
    </div>
    {view === 'calendar' ? <div {...swipeHandlers} className="flex-1 flex flex-col touch-pan-y">
      {savings.error && <p role="alert" className="text-sm text-red-600">{savings.error} <button onClick={() => void savings.refetch()} className="underline">다시 시도</button></p>}
      <CalendarGridView currentDate={date} year={year} month={date.getMonth()}
        daysInMonth={new Date(year, date.getMonth() + 1, 0).getDate()} startingDayOfWeek={new Date(year, date.getMonth(), 1).getDay()}
        filterType="savings" savingsLabel="연금" savingsRecords={savings.data?.records ?? []} entries={[]} schedules={[]} eventBars={[]}
        onDateClick={(y, m, d) => setSelectedDay(buildDateStr(y, m, d))} onEditEntry={() => {}} onEditSchedule={() => {}}
        onPrevMonth={() => changeMonth(-1)} onNextMonth={() => changeMonth(1)} onToday={() => setDate(new Date())}/>
    </div> : <SavingsList pension savings={savings} year={year} month={date.getMonth() + 1} onSelect={setSelection} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} onToday={() => setDate(new Date())}>
    {savings.members.length > 0 && <div className="flex items-center justify-between gap-3 px-1"><label htmlFor="pension-owner" className="shrink-0 text-sm text-gray-500">절세 현황</label><Select id="pension-owner" size="sm" className="w-56 max-w-[75%]" value={selectedOwner} onChange={setOwner} options={savings.members.map(m => ({ value: m.email, label: m.name }))}/></div>}
    {(annual.loading || annual.refreshing) && <p role="status" className="text-sm">연간 납입 내역을 확인하고 있어요.</p>}
    {annual.error && <p role="alert" className="text-red-700">{annual.error} <button className="underline" onClick={() => void savings.refetch()}>다시 시도</button></p>}
    {!annual.loading && !annual.error && year === PENSION_YEAR && <PensionTaxCard key={`${spaceId}:${selectedOwner}:${year}`} annual={accounts.length ? totals : undefined}/>}
    {year !== PENSION_YEAR && <p className="text-sm text-gray-600">{year}년 납입 기록입니다. 절세 계산은 세법을 확인한 {PENSION_YEAR}년에 제공됩니다.</p>}
    <KisConnectionCard key={spaceId} spaceId={spaceId} savings={savings}/>
    </SavingsList>}
    <Modal isOpen={!!selectedDay} onClose={() => setSelectedDay('')}>
      <div className="p-5 space-y-3">
        <h2 className="pr-8 text-lg font-semibold">{selectedDay} 연금 내역</h2>
        {(savings.data?.records ?? []).filter(record => record.date === selectedDay).map(record => <SavingsRecordRow key={record.id} record={record} onClick={() => {
          const plan = savings.data?.plans.find(p => p.id === record.planId)
          if (!plan) return
          setSelectedDay(''); setSelection(record.planned ? { type: 'plan', plan } : { type: 'record', plan, record })
        }}/>) }
        {!savings.data?.records.some(record => record.date === selectedDay) && <p className="text-sm text-gray-500">납입·인출 내역이 없습니다.</p>}
        <button type="button" className="min-h-11 w-full rounded-lg bg-indigo-50 text-indigo-700" onClick={() => { setSelectedDay(''); setView('list') }}>연금 계좌와 절세 현황 보기</button>
      </div>
    </Modal>
    <Modal formLayout isOpen={selection !== null} onClose={() => setSelection(null)}>
      {selection && <SavingsForm pension selection={selection} savings={savings} onClose={() => setSelection(null)}/>}
    </Modal>
  </div>
}
