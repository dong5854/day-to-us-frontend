import { Calendar, List } from 'lucide-react'

export type CalendarView = 'calendar' | 'list'
export function CalendarViewTabs({ value, onChange }: { value: CalendarView; onChange: (view: CalendarView) => void }) {
  return <div aria-label="보기 방식" className="flex gap-1 bg-gray-100 p-1 rounded-lg">
    <button type="button" onClick={() => onChange('calendar')} aria-pressed={value === 'calendar'} className={`flex-1 min-h-11 rounded-md text-sm ${value === 'calendar' ? 'bg-white shadow-sm' : ''}`}><Calendar className="w-4 h-4 inline-block"/> 달력</button>
    <button type="button" onClick={() => onChange('list')} aria-pressed={value === 'list'} className={`flex-1 min-h-11 rounded-md text-sm ${value === 'list' ? 'bg-white shadow-sm' : ''}`}><List className="w-4 h-4 inline-block"/> 목록</button>
  </div>
}
