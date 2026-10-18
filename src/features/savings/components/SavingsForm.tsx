import { useRef, useState, type FormEvent } from 'react'
import { ModalHeader } from '@/shared/components/ModalHeader'
import { DatePicker } from '@/shared/components/DatePicker'
import { Select } from '@/shared/components/Select'
import { formatKoreanWon } from '@/shared/utils/format'
import { savingsError, type SavingsState } from '../hooks/useSavings'
import type { SavingsPlanRequest, SavingsPreview, SavingsSelection } from '../types/savings.types'

const inputClass = 'w-full rounded-lg border border-gray-200 p-3 min-h-12'
const koreaToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
function AmountInput({ value, onChange, id }: { value: string; onChange: (value: string) => void; id: string }) {
  return <><input id={id} className={inputClass} inputMode="numeric" type="number" min="1" max="1000000000000" step="1" required value={value} onChange={e => onChange(e.target.value)} />
    <p aria-live="polite" className="text-right text-sm text-gray-500 mt-1">{formatKoreanWon(Number(value))}</p>
    <div className="grid grid-cols-4 gap-2 mt-3">{[[1000, '+1천'], [10000, '+1만'], [50000, '+5만'], [100000, '+10만']].map(([amount, label]) => <button key={amount} type="button" className="rounded-full bg-gray-100 py-3 text-sm font-semibold" onClick={() => onChange(String(Math.min(1e12, (Number(value) || 0) + Number(amount))))}>{label}</button>)}</div>
  </>
}
interface Props { selection: SavingsSelection; savings: SavingsState; onClose: () => void }
export function SavingsForm({ selection, savings, onClose }: Props) {
  const plan = selection.plan
  const record = selection.type === 'record' ? selection.record : undefined
  const isPlan = selection.type === 'plan'
  const [name, setName] = useState(plan?.name || '')
  const [regular, setRegular] = useState(!!plan?.monthlyAmount)
  const [amount, setAmount] = useState(String(isPlan ? plan?.monthlyAmount || '' : record ? Math.abs(record.amount) : ''))
  const [withdrawal, setWithdrawal] = useState((record?.amount || 0) < 0)
  const [firstDate, setFirstDate] = useState(plan?.firstDate || koreaToday())
  const [autoPostFrom, setAutoPostFrom] = useState(plan?.autoPostFrom || koreaToday())
  const [maturityDate, setMaturityDate] = useState(plan?.maturityDate || '')
  const [target, setTarget] = useState(String(plan?.targetAmount || ''))
  const [date, setDate] = useState(record?.date || (selection.type === 'record' ? selection.date : '') || koreaToday())
  const [payer, setPayer] = useState(record?.payerEmail || plan?.payerEmail || savings.members[0]?.email || '')
  const [memo, setMemo] = useState((isPlan ? plan?.memo : record?.memo) || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [confirmation, setConfirmation] = useState<{ request: SavingsPlanRequest; preview: SavingsPreview } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const perform = async (action: () => Promise<void>, close = true) => {
    if (lock.current) return
    lock.current = true; setBusy(true); setError('')
    try { await action(); if (close) onClose() }
    catch (e) { setError(savingsError(e)) }
    finally { lock.current = false; setBusy(false) }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const payerEmail = payer || savings.members[0]?.email
    if (!payerEmail) { setError('납입자를 선택해 주세요'); return }
    if ((!isPlan || regular) && (!Number.isSafeInteger(Number(amount)) || Number(amount) <= 0 || Number(amount) > 1e12)) { setError('금액은 1원 이상 원 단위로 입력해 주세요'); return }
    if (isPlan) {
      const request: SavingsPlanRequest = { name, monthlyAmount: regular ? Number(amount) : null,
        firstDate: regular ? firstDate : null, autoPostFrom: regular ? autoPostFrom : null,
        maturityDate: maturityDate || null, targetAmount: target ? Number(target) : null,
        payerEmail, memo, version: plan?.version }
      if (plan) void perform(async () => { const preview = await savings.preview(plan.id, request); setConfirmation({ request: { ...request, reconciliationToken: preview.token }, preview }) }, false)
      else void perform(() => savings.savePlan(request))
    } else if (plan) {
      void perform(() => savings.saveRecord(plan.id, { date, amount: Number(amount) * (withdrawal ? -1 : 1), payerEmail, memo, version: record?.version }, record?.id))
    }
  }
  return <form onSubmit={submit} onKeyDown={e => {
    if (e.nativeEvent.isComposing) { if (e.key === 'Enter') e.preventDefault(); return }
  }} className="flex min-h-0 flex-col">
    <ModalHeader onClose={() => { if (!busy) onClose() }}>{isPlan ? plan ? '저축 설정' : '저축 추가' : record ? '저축 기록 수정' : '납입 / 인출 기록'}</ModalHeader>
    <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-5">
      {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
      {confirmation ? <>
        <p className="font-semibold">과거 자동 기록도 함께 변경됩니다.</p>
        <p>{confirmation.preview.added}건 추가 · {confirmation.preview.removed}건 삭제 · {confirmation.preview.updated}건 수정</p>
        <p className="text-sm text-gray-500">직접 수정·삭제한 {confirmation.preview.preserved}개 회차는 유지됩니다.</p>
        <button type="button" disabled={busy} onClick={() => void perform(() => savings.savePlan(confirmation.request, plan!.id))} className="w-full p-3 rounded-lg gradient-bg text-white">변경 적용</button>
        <button type="button" disabled={busy} className="w-full p-3" onClick={() => setConfirmation(null)}>돌아가기</button>
      </> : deleting ? <>
        <p>{isPlan ? '저축을 종료할까요? 자동 납입은 중단되고 과거 기록은 보존됩니다.' : '이 기록을 삭제할까요? 자동 생성된 회차는 다시 만들지 않습니다.'}</p>
        <button type="button" disabled={busy} className="w-full p-3 rounded-lg bg-red-600 text-white" onClick={() => void perform(() => isPlan ? savings.archive(plan!.id) : savings.deleteRecord(plan!.id, record!.id))}>{isPlan ? '저축 종료' : '기록 삭제'}</button>
        <button type="button" disabled={busy} className="w-full p-3" onClick={() => setDeleting(false)}>취소</button>
      </> : <fieldset disabled={busy} className="space-y-5">
        {isPlan ? <>
          <div><label htmlFor="savings-name" className="block font-medium mb-2">저축 이름</label><input id="savings-name" className={inputClass} maxLength={100} required value={name} onChange={e => setName(e.target.value)} placeholder="예: 청년 적금, 여행 자금"/></div>
          <div><label htmlFor="savings-mode" className="block font-medium mb-2">납입 방식</label><Select id="savings-mode" value={regular ? 'regular' : 'free'} onChange={v => setRegular(v === 'regular')} options={[{ value: 'free', label: '자유 납입' }, { value: 'regular', label: '매월 정기 납입' }]}/></div>
        </> : <><p className="font-semibold text-amber-700">{plan?.name}</p><Select value={withdrawal ? 'withdraw' : 'deposit'} onChange={v => setWithdrawal(v === 'withdraw')} options={[{ value: 'deposit', label: '납입' }, { value: 'withdraw', label: '인출' }]}/></>}
        {(!isPlan || regular) && <div><label htmlFor="savings-amount" className="block font-medium mb-2">{isPlan ? '매월 납입 금액' : '금액'}</label><AmountInput id="savings-amount" value={amount} onChange={setAmount}/></div>}
        {isPlan && regular && <>
          <div><label htmlFor="savings-first" className="block font-medium mb-2">첫 납입 예정일</label><DatePicker id="savings-first" value={firstDate} onChange={setFirstDate} required/></div>
          <div><label htmlFor="savings-auto" className="block font-medium mb-2">자동 반영 시작일</label><DatePicker id="savings-auto" value={autoPostFrom} onChange={setAutoPostFrom} required/><p className="text-xs text-gray-500 mt-2">과거 날짜이면 지난 회차도 기록합니다. 실제 은행 이체를 확인하는 기능은 아닙니다.</p></div>
        </>}
        {isPlan && <>
          <div><label htmlFor="savings-maturity" className="block font-medium mb-2">만기일 (선택)</label><DatePicker id="savings-maturity" value={maturityDate} onChange={setMaturityDate}/>{maturityDate && <button type="button" onClick={() => setMaturityDate('')} className="text-sm text-gray-600 mt-2">만기일 지우기</button>}</div>
          <div><label htmlFor="savings-target" className="block font-medium mb-2">목표 금액 (선택)</label><input id="savings-target" type="number" inputMode="numeric" min="1" max="1000000000000" step="1" className={inputClass} value={target} onChange={e => setTarget(e.target.value)}/><p className="text-right text-sm text-gray-500">{target && formatKoreanWon(Number(target))}</p></div>
        </>}
        {!isPlan && <div><label htmlFor="savings-date" className="block font-medium mb-2">날짜</label><DatePicker id="savings-date" value={date} onChange={setDate} required/></div>}
        <div><label htmlFor="savings-payer" className="block font-medium mb-2">{isPlan ? '기본 납입자' : withdrawal ? '인출자' : '납입자'}</label><Select id="savings-payer" value={payer || savings.members[0]?.email || ''} onChange={setPayer} options={savings.members.map(m => ({ value: m.email, label: m.name }))}/></div>
        <div><label htmlFor="savings-memo" className="block font-medium mb-2">메모</label><textarea id="savings-memo" className={inputClass} value={memo} maxLength={1000} onChange={e => setMemo(e.target.value)}/></div>
        <button disabled={busy || !savings.members.length} className="w-full p-3 gradient-bg text-white rounded-lg disabled:opacity-50">{busy ? '저장 중…' : '저장'}</button>
        {(isPlan ? plan && !plan.archived : record) && <button type="button" className="w-full p-3 text-red-600" onClick={() => setDeleting(true)}>{isPlan ? '저축 종료' : '기록 삭제'}</button>}
      </fieldset>}
    </div>
  </form>
}
