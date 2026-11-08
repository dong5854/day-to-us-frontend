import { Calendar, Landmark, PiggyBank, Wallet } from 'lucide-react'

export type CalendarFilter = 'all' | 'budget' | 'savings' | 'schedule'
export type CalendarCategory = CalendarFilter | 'pension'
interface Props {
  selected: CalendarCategory
  onSelect: (category: CalendarCategory) => void
  showPension?: boolean
}
export function CalendarCategoryTabs({ selected, onSelect, showPension = true }: Props) {
  const categories = [
    { value: 'all', label: '전체', icon: null },
    { value: 'budget', label: '가계부', icon: Wallet },
    { value: 'savings', label: '저축', icon: PiggyBank },
    { value: 'schedule', label: '일정', icon: Calendar },
    { value: 'pension', label: '연금', icon: Landmark },
  ] as const
  return <nav aria-label="항목 필터" className="flex gap-1.5">
    {categories.filter(category => showPension || category.value !== 'pension').map(({ value, label, icon: Icon }) =>
      <button key={value} type="button" aria-pressed={selected === value} onClick={() => onSelect(value)}
        className={`flex-1 min-h-11 flex justify-center items-center gap-1 rounded-full text-sm font-medium ${selected === value ? 'bg-[#4F46E5] text-white' : 'bg-gray-100 text-gray-600'}`}>
        {Icon && <Icon size={16} aria-hidden="true"/>}{label}
      </button>)}
  </nav>
}
