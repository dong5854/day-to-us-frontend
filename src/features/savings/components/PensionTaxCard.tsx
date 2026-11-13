import { useEffect, useState, type ReactNode } from 'react'
import { ChevronDown, CircleAlert, CircleCheck } from 'lucide-react'
import { Select } from '@/shared/components/Select'
import { formatCurrency } from '@/shared/utils/format'
import { PENSION_SOURCE, PENSION_YEAR, parsePensionAmount, pensionDeadline, pensionSummary } from '../utils/pension'

interface Props { ownerControl?: ReactNode; annual?: { pension: number; retirement: number; unconfirmed: number; review: boolean } }
export function PensionTaxCard({ annual, ownerControl }: Props) {
  const [now, setNow] = useState(() => new Date())
  const [pension, setPension] = useState('')
  const [retirement, setRetirement] = useState('')
  const [rate, setRate] = useState('unknown')
  const [planned, setPlanned] = useState('')
  useEffect(() => {
    const update = () => setNow(new Date())
    const timer = window.setInterval(update, 60_000)
    window.addEventListener('focus', update)
    return () => { clearInterval(timer); window.removeEventListener('focus', update) }
  }, [])
  const deadline = pensionDeadline(now)
  const pensionAmount = annual?.pension ?? parsePensionAmount(pension)
  const retirementAmount = annual?.retirement ?? parsePensionAmount(retirement)
  const plannedAmount = parsePensionAmount(planned)
  const summary = !annual?.review && pensionAmount !== null && retirementAmount !== null
    ? pensionSummary(pensionAmount, retirementAmount, Number.parseFloat(rate) || 0) : null
  const complete = summary?.remaining === 0
  const onTrack = summary && plannedAmount !== null && plannedAmount >= summary.remaining
  const urgent = summary && !complete && !onTrack && deadline.urgent
  const StatusIcon = complete ? CircleCheck : CircleAlert
  const inputClass = 'mt-1 w-full min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900'
  return <section className="rounded-xl border border-gray-100 bg-white px-3 py-2 space-y-1" aria-label="2026년 연금 절세">
    <div className="flex min-h-11 items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{PENSION_YEAR}년 절세</h3>
        <p className="mt-0.5 text-xs text-gray-500">{deadline.expired ? '납입 기간 종료 · 공제 반영 확인' : deadline.days === 0 ? '오늘 납입 기한 · 금융회사 마감 확인' : `12.31까지 · ${deadline.days}일 남음`}</p>
      </div>
      {ownerControl}
    </div>
    {summary && <div className="space-y-3" aria-live="polite">
      <div className={`flex gap-2 items-start ${complete ? 'text-green-700' : urgent ? 'text-red-700' : 'text-indigo-800'}`}>
        <StatusIcon size={20} className="shrink-0 mt-0.5"/>
        <p className="font-semibold">{complete ? '올해 일반 공제 한도를 채웠어요' : deadline.expired ? `일반 공제 한도 중 ${formatCurrency(summary.remaining)} 미사용` : onTrack ? '예정대로 납입하면 일반 공제 한도에 도달해요' : `일반 공제 한도까지 ${formatCurrency(summary.remaining)} 남았어요`}</p>
      </div>
      <p className="text-sm">공제 대상 납입액 <strong>{formatCurrency(summary.eligible)} / 900만 원</strong></p>
      <progress className="w-full h-2 accent-indigo-600" value={summary.eligible} max={9_000_000} aria-label="일반 연금 세액공제 납입 한도 진행률"/>
      {rate !== 'unknown' && <p className="text-sm">현재 납입 기준 예상 공제액 최대 <strong>{formatCurrency(summary.credit)}</strong>{!deadline.expired && !complete && <> · 한도까지 추가 납입 시 최대 {formatCurrency(summary.extraCredit)} 증가</>}</p>}

    </div>}
    {annual && <div className="text-sm space-y-1"><p>확인된 납입 · 연금저축 {formatCurrency(annual.pension)} / IRP·DC {formatCurrency(annual.retirement)}</p>
      {annual.unconfirmed > 0 && <p className="text-amber-800">확인이 필요한 기록 {annual.unconfirmed}건 · 해당 월 내역에서 실제 납입을 확인해 주세요.</p>}
      {annual.review && <p role="status" className="text-amber-800">올해 인출 기록이 있어 자동 공제 계산을 보류합니다. 금융기관에서 공제 대상 납입액을 확인하세요.</p>}
    </div>}
    <details className="group border-t border-gray-100">
      <summary className="cursor-pointer min-h-11 flex items-center justify-between gap-2 text-sm font-medium text-indigo-700">계산·공제 안내<ChevronDown size={16} aria-hidden="true" className="group-open:rotate-180"/></summary>
      {annual ? <p className="text-sm text-gray-600 mb-3">등록한 계좌에서 실제 납입을 확인한 기록만 합산합니다. 모든 금융기관 계좌와 납입액을 등록해 주세요. 소득 구간과 추가 납입 시뮬레이션은 이 화면에서만 사용합니다.</p> : <p className="text-sm text-gray-600 mb-3">본인 명의 모든 금융기관의 올해 납입액을 입력하세요. 화면을 벗어나면 직접 입력한 계산값이 초기화됩니다.</p>}
      <div className="space-y-3">
        {!annual && <>
          <label className="block text-sm">연금저축 확인 납입액 (원)<input value={pension} onChange={e => setPension(e.target.value)} type="text" inputMode="numeric" maxLength={10} className={inputClass} placeholder="예: 4000000"/></label>
          <label className="block text-sm">IRP·DC 본인 추가 납입액 (원)<input value={retirement} onChange={e => setRetirement(e.target.value)} type="text" inputMode="numeric" maxLength={10} className={inputClass} placeholder="예: 2000000"/></label>
        </>}
        <p className="text-xs text-gray-600">퇴직금·회사 부담금·계좌 이전액은 제외하세요. 인출·취소가 있으면 금융기관의 공제 대상 납입액을 확인하세요. ISA 만기 전환 추가 한도는 별도입니다.</p>
        {((pension !== '' && pensionAmount === null) || (retirement !== '' && retirementAmount === null)) && <p role="alert" className="text-sm text-red-700">납입액은 0원부터 10억 원까지 정수로 입력해 주세요.</p>}
        <label htmlFor="pension-rate" className="block text-sm">올해 소득 구간</label>
        <Select id="pension-rate" value={rate} onChange={setRate} options={[
          { value: 'unknown', label: '모름 · 한도만 확인' },
          { value: '0.165', label: '근로소득만 · 총급여 5,500만 원 이하' },
          { value: '0.132', label: '근로소득만 · 총급여 5,500만 원 초과' },
          { value: '0.165-other', label: '그 외 · 종합소득금액 4,500만 원 이하' },
          { value: '0.132-other', label: '그 외 · 종합소득금액 4,500만 원 초과' },
        ]}/>
      </div>
      {summary && !deadline.expired && !complete && <div className="space-y-3 mt-3">
        <p className="text-sm">600/300 기본 계획을 따른다면 연금저축 {formatCurrency(summary.pensionRemaining)}, IRP·DC 본인 추가 납입 {formatCurrency(summary.retirementRemaining)}으로 남은 한도를 채울 수 있어요.</p>
        <label className="block text-sm">마감 전 추가 납입 예정액 (공제 대상, 원)<input className={inputClass} value={planned} onChange={e => setPlanned(e.target.value)} type="text" inputMode="numeric" maxLength={10} placeholder="예: 3000000"/></label>
        {planned !== '' && plannedAmount === null && <p role="alert" className="text-sm text-red-700">예정액은 0원부터 10억 원까지 정수로 입력해 주세요.</p>}
        {plannedAmount !== null && <p className="text-sm">예정액 반영 후 남은 한도 {formatCurrency(Math.max(0, summary.remaining - plannedAmount))}. 실제 납입 후 납입 내역을 확인해 주세요.</p>}
      </div>}
    <details className="group border-t border-gray-100 pt-1 mt-3">
      <summary className="cursor-pointer min-h-11 flex items-center justify-between gap-2 text-xs text-gray-500">공제 기준·납입 기한 안내<ChevronDown size={16} aria-hidden="true" className="group-open:rotate-180"/></summary>
      <div className="space-y-2">
        <p className="text-xs text-gray-600">공제 대상 납입 기간은 2026.1.1~12.31이며 2027년 연말정산에 반영됩니다. 금융회사별 입금 마감은 더 빠를 수 있습니다.</p>
        <p className="text-xs text-gray-600">2026년 전용 금융회사 마감 공지 미확인 · 조사 기준 2026.11.7</p>
        <p className="text-xs text-gray-600">계좌와 납입 기록은 공간 멤버와 공유하고, 공제 한도는 명의자별로 계산합니다.</p>
        <p className="text-xs text-gray-600">600/300은 기본 계획이며 IRP만 900만 원 등 다른 조합도 가능합니다. 공제액은 지방소득세 효과 포함 계산값으로, 실제 적용 가능한 세금에 따라 줄어듭니다. 생활비와 비상자금을 고려하고 중도 인출·해지 조건을 확인하세요.</p>
        <a href={PENSION_SOURCE} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-3 text-sm text-indigo-700 underline">국세청 공제 기준 확인</a>
      </div>
    </details>
    </details>
  </section>
}
