import { useContext, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Archive, ChevronLeft, ChevronRight, GripVertical, Pencil, Plus, RotateCcw, Settings2, Trash2 } from 'lucide-react'
import { useCategoryOverview } from '@/features/budget/hooks/useCategoryOverview'
import { useFixedExpense } from '@/features/fixedExpense/hooks/useFixedExpense'
import { usePaymentMethods } from '@/features/budget/hooks/usePaymentMethods'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'
import { Modal } from '@/shared/components/Modal'
import { CategoryMonthlyHistory } from '@/features/budget/components/CategoryMonthlyHistory'
import { CategoryDialog } from '@/features/budget/components/CategoryDialog'
import { LayoutSlotsContext } from '@/shared/components/LayoutSlotsContext'
import type { CategoryOverviewRow } from '@/features/budget/types/categoryBudget.types'
import type { FixedExpenseResponse } from '@/features/fixedExpense/types/fixedExpense.types'
import { categoryMonth, shiftCategoryMonth, budgetStatus } from '@/features/budget/utils/categoryBudget'

const money = (value: number) => `${value.toLocaleString('ko-KR')}원`
const button = 'min-h-11 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-40'
const primary = 'min-h-11 px-4 rounded-lg bg-[#4F46E5] text-white text-sm font-semibold disabled:opacity-40'
interface Props { spaceId: string }
type Editor = { kind: 'name'; id?: string } | { kind: 'budget'; id: string } | { kind: 'archive'; row: CategoryOverviewRow }

export const CategoryBudgetPage = ({ spaceId }: Props) => {
  const { headerTarget, contentRef } = useContext(LayoutSlotsContext)
  const listScrollTop = useRef(0)
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useSearchParams()
  const requestedMonth = search.get('month') ?? ''
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) && +requestedMonth.slice(0, 4) >= 1900 ? requestedMonth : categoryMonth(new Date())
  const todayMonth = categoryMonth(new Date())
  const overview = useCategoryOverview(spaceId, month)
  const fixed = useFixedExpense(spaceId)
  const payments = usePaymentMethods(spaceId)
  const [managing, setManaging] = useState(false)
  const [order, setOrder] = useState<string[] | null>(null)
  const [selectedRow, setSelectedRow] = useState<CategoryOverviewRow | null>(null)
  const selected = selectedRow ? selectedRow.category?.id ?? 'uncategorized' : null
  useLayoutEffect(() => {
    if (contentRef?.current) contentRef.current.scrollTop = selected !== null || managing ? 0 : listScrollTop.current
  }, [selected, managing, contentRef])
  const [editor, setEditor] = useState<Editor | null>(null)
  const [value, setValue] = useState('')
  const [repeat, setRepeat] = useState(false)
  const [notice, setNotice] = useState('')
  const [editingFixed, setEditingFixed] = useState<FixedExpenseResponse | null>(null)
  const dragging = useRef<string | null>(null)
  const rows = overview.data?.rows ?? []
  const categories = rows.flatMap(row => row.category ? [row.category] : [])
  const active = rows.filter(row => row.category && !row.category.archived)
  const ordered = order ? order.map(id => active.find(row => row.category?.id === id)).filter((row): row is CategoryOverviewRow => !!row) : active
  const detail = selected === null ? null : rows.find(row => (row.category?.id ?? 'uncategorized') === selected)
  const total = detail?.history.at(-1)
  const setMonth = (next: string) => { setSearch({ month: next }, { replace: true, state: location.state }); setNotice('') }
  const open = (next: Editor, initial = '') => { overview.clearMutationError(); setValue(initial); setRepeat(false); setEditor(next) }
  const move = (id: string, target: number) => setOrder(current => {
    if (!current || target < 0 || target >= current.length) return current
    const next = current.filter(item => item !== id); next.splice(target, 0, id); return next
  })
  const closeEditor = () => { if (!overview.saving) setEditor(null) }
  const submit = async () => {
    if (!editor || overview.saving) return
    let ok = false
    if (editor.kind === 'name' && value.trim().length > 0 && value.trim().length <= 20) ok = editor.id ? await overview.rename(editor.id, value.trim()) : await overview.create(value.trim())
    if (editor.kind === 'budget' && /^\d{1,12}$/.test(value)) ok = await overview.budget(editor.id, Number(value), repeat)
    if (ok) { setEditor(null); setNotice('저장했어요.') }
  }
  const back = () => {
    if (selected !== null) { setSelectedRow(null); return }
    if (managing) { setManaging(false); setOrder(null); return }
    if (location.state?.categoryOrigin) navigate(-1)
    else navigate('/')
  }
  const header = <div className="max-w-2xl mx-auto grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center gap-1">
    <button type="button" onClick={back} aria-label={selected !== null || managing ? '카테고리 목록으로 돌아가기' : '이전 화면으로 돌아가기'} className="flex size-11 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
      <ChevronLeft size={24} aria-hidden="true"/>
    </button>
    <h1 className="text-center text-lg font-semibold truncate" title={selectedRow ? (detail ?? selectedRow).category?.name ?? '카테고리 없음' : undefined}>{selectedRow ? (detail ?? selectedRow).category?.name ?? '카테고리 없음' : managing ? '카테고리 관리' : '카테고리·예산'}</h1>
    {selected === null && !managing ? <button type="button" onClick={() => { listScrollTop.current = contentRef?.current?.scrollTop ?? 0; setManaging(true); setNotice('') }} className="flex min-h-11 items-center justify-center gap-1 rounded-lg text-sm font-medium hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"><Settings2 size={17} aria-hidden="true"/>관리</button> : <span/>}
  </div>
  return <>
    {headerTarget ? createPortal(header, headerTarget) : header}
    <div className="max-w-2xl mx-auto space-y-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
    {!managing && <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-2">
      <button disabled={month === '1900-01'} onClick={() => setMonth(shiftCategoryMonth(month, -1))} aria-label="이전 달" className={button}><ChevronLeft size={20}/></button>
      <div className="text-center"><p className="font-semibold">{month.replace('-', '년 ')}월</p><button onClick={() => setMonth(todayMonth)} className="text-xs text-gray-500 min-h-8">{month === todayMonth ? '이번 달 · 집계 중' : '이번 달로'}</button></div>
      <button disabled={month === '9999-12'} onClick={() => setMonth(shiftCategoryMonth(month, 1))} aria-label="다음 달" className={button}><ChevronRight size={20}/></button>
    </div>}
    {notice && <p role="status" className="text-sm text-[#4F46E5]">{notice}</p>}
    {overview.error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm">{overview.error}<button onClick={() => void overview.refresh()} className={`${button} underline`}>다시 시도</button></div>}
    {overview.loading && !overview.data && <div role="status" aria-label="지출 현황을 불러오고 있어요" className="space-y-4">
      <span className="sr-only">지출 현황을 불러오고 있어요.</span>
      <div aria-hidden="true" className="rounded-xl border border-gray-100 bg-white p-5 space-y-3 motion-safe:animate-pulse">
        <div className="h-4 w-24 rounded bg-gray-100"/><div className="h-9 w-44 rounded bg-gray-100"/><div className="h-3 w-32 rounded bg-gray-100"/>
      </div>
      {selected === null && <div aria-hidden="true" className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100 motion-safe:animate-pulse">{[0, 1, 2, 3].map(index => <div key={index} className="p-4 space-y-3"><div className="flex justify-between gap-4"><div className="h-4 w-20 rounded bg-gray-100"/><div className="h-4 w-24 rounded bg-gray-100"/></div><div className="h-3 w-28 rounded bg-gray-100"/></div>)}</div>}
    </div>}
    {overview.data && !overview.error && (managing ? <>
      <p className="text-sm text-gray-500">이 공간의 멤버가 함께 사용하는 카테고리예요.</p>
      <div className="flex justify-between gap-2">
        {order ? <><button disabled={overview.saving} onClick={() => setOrder(null)} className={button}>취소</button><button disabled={overview.saving} className={primary} onClick={async () => { if (await overview.reorder(order)) { setOrder(null); setNotice('순서를 저장했어요.') } }}>순서 저장</button></> : <><button className={`${button} flex items-center gap-1`} onClick={() => open({ kind: 'name' })}><Plus size={18}/>카테고리 추가</button><button disabled={active.length < 2} className={button} onClick={() => { overview.clearMutationError(); setOrder(active.map(row => row.category!.id)) }}>순서 변경</button></>}
      </div>
      {overview.mutationError && !editor && <p role="alert" className="text-sm text-red-600">{overview.mutationError}</p>}
      <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100">
        {ordered.map((row, index) => <div key={row.category!.id} data-order-id={row.category!.id} className="flex items-center gap-1 px-3 py-2">
          {order && <button aria-label={`${row.category!.name} 끌어서 이동`} className={`${button} touch-none cursor-grab`} disabled={overview.saving}
            onPointerDown={e => { if (!e.isPrimary || e.button !== 0) return; dragging.current = row.category!.id; e.currentTarget.setPointerCapture(e.pointerId) }}
            onPointerMove={e => { if (!dragging.current) return; const id = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-order-id]')?.getAttribute('data-order-id'); if (id && order.includes(id)) move(dragging.current, order.indexOf(id)) }}
            onPointerUp={() => { dragging.current = null }} onPointerCancel={() => { dragging.current = null }}><GripVertical size={18}/></button>}
          <span className="flex-1 min-w-0 break-words text-sm font-medium">{row.category!.name}</span>
          {order ? <><button disabled={index === 0 || overview.saving} aria-label={`${row.category!.name} 위로`} onClick={() => move(row.category!.id, index - 1)} className={button}><ArrowUp size={18}/></button><button disabled={index === ordered.length - 1 || overview.saving} aria-label={`${row.category!.name} 아래로`} onClick={() => move(row.category!.id, index + 1)} className={button}><ArrowDown size={18}/></button></> : <><button aria-label={`${row.category!.name} 이름 수정`} onClick={() => open({ kind: 'name', id: row.category!.id }, row.category!.name)} className={button}><Pencil size={17}/></button><button aria-label={`${row.category!.name} ${row.used || row.fixedExpenseIds.length ? '보관' : '삭제'}`} className={button} onClick={() => open({ kind: 'archive', row })}>{row.used || row.fixedExpenseIds.length ? <Archive size={17}/> : <Trash2 size={17}/>}</button></>}
        </div>)}
        {active.length === 0 && <p className="p-8 text-center text-sm text-gray-500">첫 카테고리를 만들어보세요.</p>}
      </div>
      {!order && <details className="text-sm"><summary className="cursor-pointer min-h-11 py-3 text-gray-500">보관한 카테고리 ({categories.filter(c => c.archived).length})</summary>{categories.filter(c => c.archived).map(category => <div key={category.id} className="flex items-center justify-between p-2"><span>{category.name}</span><button disabled={overview.saving} className={`${button} flex items-center gap-1`} onClick={async () => { if (await overview.archive(category.id, false)) setNotice('카테고리를 복원했어요.') }}><RotateCcw size={16}/>복원</button></div>)}</details>}
    </> : detail && total ? <>
      <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
        <p className="text-sm text-gray-500">{month.slice(5)}월 사용 금액{detail.category?.archived ? ' · 보관된 카테고리' : ''}</p><p className="text-3xl font-bold tabular-nums">{money(total.spent)}</p>
        <p className={total.budget !== null && total.spent > total.budget ? 'text-sm text-red-600' : 'text-sm text-gray-600'}>{budgetStatus(total.spent, total.budget)}</p>
        {detail.category && !detail.category.archived && <button className={`${button} text-[#4F46E5] bg-indigo-50`} onClick={() => open({ kind: 'budget', id: detail.category!.id }, total.budget?.toString() ?? '')}>{total.budget === null ? '월 예산 설정' : `월 예산 ${money(total.budget)} · 변경`}</button>}
      </section>
    </> : <>
      <div className="px-2 py-3"><p className="text-sm text-gray-500">{month.slice(5)}월 전체 지출</p><p className="text-3xl font-bold mt-1 tabular-nums">{money(overview.data.totalSpent)}</p></div>
      <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100">{rows.filter(row => !row.category?.archived || row.history.at(-1)!.spent > 0).filter(row => row.category || row.history.at(-1)!.spent > 0).map(row => {
        const current = row.history.at(-1)!
        return <button key={row.category?.id ?? 'uncategorized'} onClick={() => { listScrollTop.current = contentRef?.current?.scrollTop ?? 0; setSelectedRow(row) }} className="w-full p-4 text-left hover:bg-gray-50">
          <div className="flex justify-between gap-3 text-sm"><span className="font-semibold break-words">{row.category?.name ?? '카테고리 없음'}{row.category?.archived && <span className="ml-2 text-xs text-gray-400">보관됨</span>}</span><span className="font-semibold shrink-0 tabular-nums">{money(current.spent)}</span></div>
          <p className={`mt-2 text-xs ${current.budget !== null && current.spent > current.budget ? 'text-red-600' : 'text-gray-500'}`}>{current.budget !== null ? `월 예산 ${money(current.budget)} · ${budgetStatus(current.spent, current.budget)}` : '예산 미설정'}</p>
          {current.budget !== null && <div className="h-1.5 rounded-full bg-gray-100 mt-3 overflow-hidden" role="progressbar" aria-label={`${row.category?.name} 예산 사용률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={current.budget > 0 ? Math.min(100, Math.round(current.spent / current.budget * 100)) : current.spent > 0 ? 100 : 0}><div className={`h-full rounded-full ${current.spent > current.budget ? 'bg-red-400' : 'bg-indigo-400'}`} style={{ width: `${current.budget > 0 ? Math.min(100, current.spent / current.budget * 100) : current.spent > 0 ? 100 : 0}%` }}/></div>}
        </button>
      })}</div>
      {!categories.some(c => !c.archived) && <div className="py-5 text-center text-sm text-gray-500"><p>카테고리를 만들면 지출과 예산을 함께 볼 수 있어요.</p><button className={`${button} mt-2 text-[#4F46E5]`} onClick={() => open({ kind: 'name' })}>카테고리 추가</button></div>}
    </>)}
    {selectedRow && selected !== null && <CategoryMonthlyHistory
      key={`${spaceId}:${selected}`} initialHistory={selectedRow.history}
      history={overview.history[selected] ?? selectedRow.history} month={month}
      onSelectMonth={setMonth} onLoadEarlier={overview.loadEarlier}
      loading={overview.historyLoading} error={overview.historyError}
    />}
    {detail && total && overview.data && !overview.error && <details key={month} className="rounded-xl border border-gray-100 bg-white p-4">
      <summary className="cursor-pointer min-h-11 py-3 font-semibold">{month.replace('-', '년 ')}월 지출 내역 <span className="text-sm font-normal text-gray-500">({overview.entries.filter(entry => entry.amount < 0 && (entry.category?.id ?? 'uncategorized') === selected).length}건)</span></summary>
      {overview.entries.filter(entry => entry.amount < 0 && (entry.category?.id ?? 'uncategorized') === selected).sort((a, b) => b.date.localeCompare(a.date)).map(entry => <div key={entry.id} className="flex justify-between gap-3 py-3 border-b border-gray-100 last:border-0"><div className="min-w-0"><p className="text-sm break-words">{entry.description}</p><p className="text-xs text-gray-500 mt-1">{entry.date}</p></div><p className="shrink-0 text-sm font-medium tabular-nums">{money(-entry.amount)}</p></div>)}
      {total.spent === 0 && <p className="py-6 text-center text-sm text-gray-500">이 달의 지출 내역이 없어요.</p>}
    </details>}
    {editor && <CategoryDialog title={editor.kind === 'name' ? editor.id ? '카테고리 이름 수정' : '카테고리 추가' : editor.kind === 'budget' ? '월 예산 설정' : '카테고리 정리'} busy={overview.saving} onClose={closeEditor}>
      {editor.kind !== 'archive' ? <form onSubmit={e => { e.preventDefault(); void submit() }}>
        <label htmlFor="category-input" className="text-sm font-medium">{editor.kind === 'name' ? '카테고리 이름' : `${month.replace('-', '년 ')}월 예산 (원)`}</label>
        <input id="category-input" className="mt-2 w-full border border-gray-200 rounded-lg p-3 text-base" value={value} maxLength={editor.kind === 'name' ? 20 : 12} inputMode={editor.kind === 'budget' ? 'numeric' : 'text'} onChange={e => setValue(editor.kind === 'budget' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)} onKeyDown={e => { if (e.nativeEvent.isComposing) { if (e.key === 'Enter') e.preventDefault(); return } }} disabled={overview.saving}/>
        {editor.kind === 'name' && editor.id && <p className="text-xs text-gray-500 mt-3">기존 기록에도 바뀐 이름이 표시돼요.</p>}
        {editor.kind === 'budget' && <><p className="text-xs text-gray-500 mt-3">0원은 이번 달 지출하지 않겠다는 목표예요.</p>{month >= todayMonth && <label className="flex items-center gap-2 py-4 text-sm"><input type="checkbox" checked={repeat} onChange={e => setRepeat(e.target.checked)} disabled={overview.saving}/>다음 달부터도 같은 금액 사용</label>}<p className="text-sm text-gray-600 mt-3">{month} {repeat ? '부터 매월 적용해요. 이후 월에 따로 설정한 예산은 유지돼요.' : '에만 적용해요.'}</p></>}
        {overview.mutationError && <p role="alert" className="text-sm text-red-600 mt-3">{overview.mutationError}</p>}
        <div className="flex justify-between gap-3 mt-5">{editor.kind === 'budget' ? <button type="button" disabled={overview.saving} className={button} onClick={async () => { if (await overview.budget(editor.id, null, repeat)) { setEditor(null); setNotice('예산을 해제했어요.') } }}>예산 해제</button> : <button type="button" disabled={overview.saving} className={button} onClick={closeEditor}>취소</button>}<button disabled={overview.saving || !value.trim()} className={primary}>{overview.saving ? '저장 중...' : '저장'}</button></div>
      </form> : <>
        <p className="text-sm text-gray-600">{editor.row.fixedExpenseIds.length > 0 ? '연결된 고정 수입·지출의 카테고리를 변경한 뒤 보관할 수 있어요.' : editor.row.used ? `'${editor.row.category!.name}'을 보관할까요? 기존 기록과 통계는 유지되고 새 기록의 선택 목록에서 숨겨져요.` : `'${editor.row.category!.name}'을 삭제할까요?`}</p>
        {editor.row.fixedExpenseIds.length > 0 && <div className="mt-3">{fixed.error && <p role="alert">{fixed.error}<button onClick={() => void fixed.refetch()} className={button}>다시 시도</button></p>}{fixed.loading && <p>연결된 항목을 불러오는 중...</p>}{fixed.expenses.filter(item => editor.row.fixedExpenseIds.includes(item.id)).map(item => <button key={item.id} className={`${button} w-full text-left text-[#4F46E5]`} onClick={() => { setEditor(null); setEditingFixed(item) }}>{item.description} · 수정</button>)}</div>}
        {overview.mutationError && <p role="alert" className="text-sm text-red-600 mt-3">{overview.mutationError}</p>}
        <div className="flex justify-end gap-3 mt-5"><button disabled={overview.saving} className={button} onClick={closeEditor}>취소</button>{editor.row.fixedExpenseIds.length === 0 && <button disabled={overview.saving} className={primary} onClick={async () => { const ok = editor.row.used ? await overview.archive(editor.row.category!.id, true) : await overview.remove(editor.row.category!.id); if (ok) { setEditor(null); setNotice(editor.row.used ? '보관했어요.' : '삭제했어요.') } }}>{editor.row.used ? '보관' : '삭제'}</button>}</div>
      </>}
    </CategoryDialog>}
    <Modal formLayout isOpen={editingFixed !== null} onClose={() => setEditingFixed(null)}>{editingFixed && <FixedExpenseForm spaceId={spaceId} expense={editingFixed} categories={categories} paymentMethods={payments.paymentMethods} onSubmit={async data => { await fixed.updateExpense(editingFixed.id, data); setEditingFixed(null); await overview.refresh(); window.dispatchEvent(new Event('categories-changed')) }} onCancel={() => setEditingFixed(null)}/>}</Modal>
  </div></>
}
