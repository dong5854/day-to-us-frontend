import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'
import type { ScheduleResponse } from '@/features/schedule/types/schedule.types'
import type { SavingsRecord } from '@/features/savings/types/savings.types'
import { formatCurrency } from '@/shared/utils/format'
import { EditableRecordCard } from '@/shared/components/EditableRecordCard'

interface Props {
  year: number
  month: number
  entries: BudgetEntryResponse[]
  schedules: ScheduleResponse[]
  savingsRecords: SavingsRecord[]
  loading: boolean
  onEditEntry: (entry: BudgetEntryResponse) => void
  onEditSchedule: (schedule: ScheduleResponse) => void
  onEditSavings: (record: SavingsRecord) => void
  onDeleteEntry: (id: string) => void
  onDeleteSchedule: (id: string) => void
  onDeleteSavings: (record: SavingsRecord) => void
  onAddBudget: () => void
  onAddSchedule: () => void
  onAddSavings: () => void
}

export function CalendarAllListView(props: Props) {
  const firstDay = `${props.year}-${String(props.month + 1).padStart(2, '0')}-01`
  const rows = [
    ...props.entries.map(entry => ({ key: `budget:${entry.id}`, date: entry.date, title: entry.description,
      label: entry.amount > 0 ? '수입' : '지출', detail: formatCurrency(entry.amount),
      color: entry.amount > 0 ? 'text-green-600' : 'text-rose-500', onClick: () => props.onEditEntry(entry),
      onDelete: () => props.onDeleteEntry(entry.id) })),
    ...props.schedules.map(schedule => ({ key: `schedule:${schedule.id}`, date: schedule.startDateTime.slice(0, 10) < firstDay ? firstDay : schedule.startDateTime.slice(0, 10),
      title: schedule.title, label: '일정', detail: schedule.isAllDay ? '종일' : schedule.startDateTime.slice(11, 16),
      color: 'text-violet-600', onClick: () => props.onEditSchedule(schedule),
      onDelete: () => props.onDeleteSchedule(schedule.id) })),
    ...props.savingsRecords.map(record => ({ key: `savings:${record.id}`, date: record.date, title: record.planName,
      label: `${record.kind && record.kind !== 'GENERAL' ? '연금' : '저축'} · ${record.planned ? '납입 예정' : record.amount < 0 ? '인출 기록' : '납입 기록'}`,
      detail: formatCurrency(record.amount), color: 'text-amber-700', onClick: () => props.onEditSavings(record),
      onDelete: record.planned ? undefined : () => props.onDeleteSavings(record) })),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.key.localeCompare(b.key))

  return <section aria-label="전체 내역" className="space-y-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
    <div className="grid grid-cols-3 gap-2 text-sm">
      <button onClick={props.onAddBudget} className="min-h-11 rounded-lg border border-gray-200">가계부 추가</button>
      <button onClick={props.onAddSavings} className="min-h-11 rounded-lg border border-gray-200">저축 추가</button>
      <button onClick={props.onAddSchedule} className="min-h-11 rounded-lg border border-gray-200">일정 추가</button>
    </div>
    {props.loading && <p role="status" className="text-gray-500">내역을 불러오는 중입니다</p>}
    {!props.loading && !rows.length && <p className="py-8 text-center text-gray-500">이번 달 내역이 없습니다.</p>}
    {rows.map((row, index) => <div key={row.key}>
      {(index === 0 || rows[index - 1].date !== row.date) && <h3 className="font-semibold mb-3 mt-5">{row.date}</h3>}
      <EditableRecordCard onEdit={row.onClick} onDelete={row.onDelete}>
        <div className="w-full flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-100 p-4 text-left shadow-sm">
          <div className="min-w-0"><div className="font-medium truncate">{row.title}</div><div className={`text-xs mt-1 ${row.color}`}>{row.label}</div></div>
          <span className={`font-semibold shrink-0 ${row.color}`}>{row.detail}</span>
        </div>
      </EditableRecordCard>
    </div>)}
  </section>
}
