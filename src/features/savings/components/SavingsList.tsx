import { ChevronLeft, ChevronRight, Plus, PiggyBank, Settings2 } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/format'
import type { SavingsState } from '../hooks/useSavings'
import type { SavingsRecord, SavingsSelection } from '../types/savings.types'

export function SavingsRecordRow({ record, onClick }: { record: SavingsRecord; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-full flex items-center justify-between gap-3 rounded-xl bg-teal-50 p-3 text-left">
    <div className="min-w-0"><div className="font-medium truncate">{record.planName}</div>
      <div className="text-xs text-gray-600 mt-1">{record.date} · {record.planned ? '납입 예정' : record.amount < 0 ? '인출 기록' : '납입 기록'} · {record.payerName}</div>
      {record.automatic && !record.planned && <div className="text-xs text-teal-700 mt-1">자동 반영</div>}
    </div><span className="text-teal-700 font-semibold shrink-0">{record.amount > 0 ? '+' : ''}{formatCurrency(record.amount)}</span>
  </button>
}

interface Props { savings: SavingsState; year: number; month: number; onSelect: (selection: SavingsSelection) => void; onPrev: () => void; onNext: () => void; onToday: () => void }
export function SavingsList({ savings, year, month, onSelect, onPrev, onNext, onToday }: Props) {
  const { data, loading, error } = savings
  return <div className="space-y-5 pb-[calc(6rem+env(safe-area-inset-bottom))]">
    <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{year}년 {month}월</h2>
      <div className="flex items-center"><button aria-label="이전 달" onClick={onPrev} className="p-3"><ChevronLeft size={20}/></button><button onClick={onToday} className="p-3 text-sm">오늘</button><button aria-label="다음 달" onClick={onNext} className="p-3"><ChevronRight size={20}/></button></div>
    </div>
    {error && <div role="alert" className="text-red-600">{error} <button onClick={() => void savings.refetch()} className="underline">다시 시도</button></div>}
    {loading && <p role="status">저축을 불러오는 중입니다</p>}
    {data && <>
      <section className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm" aria-label="월별 저축 요약">
        <div className="flex justify-between items-center gap-2"><span className="text-sm text-gray-600">기록 기준 저축액</span><strong className="text-xl text-teal-700 break-all">{formatCurrency(data.balance)}</strong></div>
        <p className="text-xs text-gray-500 mt-1">{data.balanceDate}까지 · 은행 잔액과 다를 수 있습니다</p>
        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 mt-4 pt-3"><div className="text-sm">이번 달 납입<strong className="block text-lg text-teal-700">{formatCurrency(data.deposits)}</strong></div><div className="text-sm">이번 달 인출<strong className="block text-lg">{formatCurrency(data.withdrawals)}</strong></div></div>
        <p className="text-xs text-gray-500 mt-2">납입 예정 {formatCurrency(data.records.filter(r => r.planned).reduce((sum, r) => sum + r.amount, 0))}</p>
      </section>
      <div className="flex justify-between items-center"><h3 className="font-bold">저축 항목</h3><button onClick={() => onSelect({ type: 'plan' })} className="flex items-center gap-1 p-2 text-indigo-600"><Plus size={18}/> 저축 추가</button></div>
      {!data.plans.length && <p className="text-center text-gray-500 py-8">적금이나 함께 모을 목표를 추가해 보세요.</p>}
      {data.plans.map(plan => <section key={plan.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2"><PiggyBank size={20} className="text-[#0D9488]"/><h4 className="font-semibold flex-1 break-all">{plan.name}</h4>
          {!plan.archived && <button aria-label={`${plan.name} 설정`} className="p-3" onClick={() => onSelect({ type: 'plan', plan })}><Settings2 size={18}/></button>}
        </div>
        <p className="text-xs text-gray-500">{plan.archived ? '종료 · 과거 기록 유지' : plan.monthlyAmount ? `매월 ${plan.firstDate?.slice(-2)}일 · ${formatCurrency(plan.monthlyAmount)}` : '자유 납입'}{plan.maturityDate && ` · 만기 ${plan.maturityDate}`}</p>
        {plan.nextDate && <p className="text-xs text-gray-500 mt-1">현재 기준 다음 납입: {plan.nextDate}</p>}
        <strong className="block mt-3 text-xl text-teal-700">{formatCurrency(plan.balance)}</strong>
        {plan.targetAmount && <div className="mt-2"><div className="text-xs text-gray-500 mb-1">목표 {formatCurrency(plan.targetAmount)} · {Math.round(plan.balance / plan.targetAmount * 100)}%</div><progress className="w-full h-2 accent-teal-600" value={Math.max(0, plan.balance)} max={plan.targetAmount} aria-label={`${plan.name} 목표 진행률`}/></div>}
        {!plan.archived && <button className="mt-3 w-full min-h-11 rounded-lg bg-teal-50 text-teal-700 font-medium" onClick={() => onSelect({ type: 'record', plan })}>납입 / 인출 기록</button>}
      </section>)}
      <h3 className="font-bold">이번 달 내역</h3>
      {!data.records.length && <p className="text-sm text-gray-500">이번 달 납입·인출 내역이 없습니다.</p>}
      {data.records.map(record => <SavingsRecordRow key={record.id} record={record} onClick={() => {
        const plan = data.plans.find(p => p.id === record.planId)!
        onSelect(record.planned ? { type: 'plan', plan } : { type: 'record', plan, record })
      }}/>) }
    </>}
  </div>
}
