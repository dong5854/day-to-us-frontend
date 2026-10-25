import { useState } from 'react'
import { ChevronDown, LoaderCircle, RotateCcw } from 'lucide-react'
import type { CategoryMonthTotal } from '../types/categoryBudget.types'
import { categoryMonth } from '../utils/categoryBudget'

interface Props {
  initialHistory: CategoryMonthTotal[]
  history: CategoryMonthTotal[]
  month: string
  onSelectMonth: (month: string) => void
  onLoadEarlier: (oldestMonth: string) => Promise<string | null>
  loading: boolean
  error: string
}
const money = (amount: number) => `${amount.toLocaleString('ko-KR')}원`
const monthLabel = (month: string) => `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`

export const CategoryMonthlyHistory = ({ initialHistory, history, month, onSelectMonth, onLoadEarlier, loading, error }: Props) => {
  const [start, setStart] = useState(initialHistory[0]?.month ?? month)
  const [end] = useState(initialHistory.at(-1)?.month ?? month)
  const firstMonth = start < month ? start : month
  const lastMonth = end > month ? end : month
  const months = history.filter(item => item.month >= firstMonth && item.month <= lastMonth).slice().reverse()
  const selectedIndex = Math.max(0, months.findIndex(item => item.month === month))
  const chartStart = Math.floor(selectedIndex / 6) * 6
  const chartEnd = months[chartStart]?.month ?? month
  const chart = history.filter(item => item.month <= chartEnd).slice(-6)
  const max = Math.max(1, ...chart.flatMap(item => [item.spent, item.budget ?? 0]))
  const todayMonth = categoryMonth(new Date())

  return <>
    <section aria-label="월별 지출 그래프" className="rounded-xl border border-gray-100 bg-white p-4">
      <h2 className="font-semibold">월별 지출 추이</h2>
      <p className="mt-1 text-xs text-gray-500">{chart[0]?.month.replace('-', '.')} ~ {chart.at(-1)?.month.replace('-', '.')}</p>
      <div className="flex items-end gap-2 h-36 mt-4" role="group" aria-label="월별 지출과 예산">
        {chart.map(item => <button key={item.month} type="button" aria-pressed={item.month === month}
          className="flex-1 h-full min-w-0 flex flex-col justify-end items-center gap-1 rounded-md text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => onSelectMonth(item.month)} aria-label={`${monthLabel(item.month)} 지출 ${money(item.spent)}, ${item.budget === null ? '예산 미설정' : `예산 ${money(item.budget)}`}`}>
          <span className="text-[10px] tabular-nums">{item.spent >= 100000000 ? `${+(item.spent / 100000000).toFixed(1)}억` : item.spent >= 10000 ? `${+(item.spent / 10000).toFixed(1)}만` : item.spent.toLocaleString('ko-KR')}</span>
          <div className="relative w-full h-24 flex items-end justify-center">
            <div className={`w-3/5 rounded-t ${item.month === month ? 'bg-indigo-600' : 'bg-indigo-300'}`} style={{ height: `${Math.max(item.spent > 0 ? 2 : 0, item.spent / max * 100)}%` }}/>
            {item.budget !== null && <span className="absolute inset-x-0 border-t-2 border-dashed border-gray-500" style={{ bottom: `${item.budget / max * 100}%` }}/>}
          </div>
          <span className={item.month === month ? 'font-bold text-indigo-600' : 'text-gray-500'}>{Number(item.month.slice(5))}월</span>
        </button>)}
      </div>
      <p className="text-xs text-gray-500 mt-3">막대는 지출, 점선은 월 예산이에요.</p>
    </section>
    <section aria-label="월별 사용 금액" className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <h2 className="font-semibold px-4 pt-4">월별 사용 금액</h2>
      <p className="px-4 mt-1 text-xs text-gray-500">월을 선택하면 위 요약과 아래 지출 내역이 바뀌어요.</p>
      <div className="grid grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-4 py-3 mt-2 text-xs text-gray-500" aria-hidden="true"><span>월</span><span className="text-right">사용 금액</span><span className="text-right">월 예산</span></div>
      <ul>
        {months.map(item => <li key={item.month}>
          <button type="button" onClick={() => onSelectMonth(item.month)} aria-pressed={item.month === month}
            className={`grid grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 min-h-16 w-full px-4 py-3 border-t border-gray-100 text-left ${item.month === month ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
            aria-label={`${monthLabel(item.month)} 지출 ${money(item.spent)}, ${item.budget === null ? '예산 미설정' : `예산 ${money(item.budget)}`}`}>
            <span><span className="block text-xs text-gray-500">{item.month.slice(0, 4)}년</span><span className={`block text-sm font-semibold ${item.month === month ? 'text-indigo-700' : 'text-gray-900'}`}>{Number(item.month.slice(5))}월</span>{item.month === todayMonth && <span className="block text-[10px] text-gray-500">집계 중</span>}</span>
            <span className={`text-right text-xs sm:text-sm font-semibold tabular-nums break-all ${item.budget !== null && item.spent > item.budget ? 'text-red-600' : 'text-gray-900'}`}>{money(item.spent)}{item.budget !== null && item.spent > item.budget && <span className="block text-[10px] font-normal">{money(item.spent - item.budget)} 초과</span>}</span>
            <span className="text-right text-xs sm:text-sm text-gray-500 tabular-nums break-all">{item.budget === null ? '미설정' : money(item.budget)}</span>
          </button>
        </li>)}
      </ul>
      {error && <p role="alert" className="px-4 pt-3 text-sm text-red-600">{error}</p>}
      {firstMonth > '1900-01' && <div className="border-t border-gray-100 p-3">
        <button type="button" disabled={loading} aria-busy={loading} onClick={async () => {
          const earlier = await onLoadEarlier(firstMonth)
          if (earlier) setStart(earlier)
        }} className="flex items-center justify-center gap-2 min-h-11 w-full rounded-lg bg-gray-50 px-4 text-sm font-medium text-gray-600 transition-colors enabled:hover:bg-indigo-50 enabled:hover:text-indigo-700 enabled:active:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait">
          <span>{error && !loading ? '이전 월 다시 시도' : '이전 월 더 보기'}</span>
          {loading ? <LoaderCircle size={16} className="shrink-0 text-indigo-500 motion-safe:animate-spin" aria-hidden="true"/>
            : error ? <RotateCcw size={16} className="shrink-0" aria-hidden="true"/>
            : <ChevronDown size={16} className="shrink-0 text-gray-400" aria-hidden="true"/>}
        </button>
      </div>}
      <p role="status" className="sr-only">{loading ? '이전 월 내역을 불러오고 있어요.' : ''}</p>
    </section>
  </>
}
