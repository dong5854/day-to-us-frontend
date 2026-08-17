import { useState, useEffect, useRef, useCallback, type FC } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

interface Props {
  value: string          // YYYY-MM-DD
  onChange: (date: string) => void
  id?: string
  required?: boolean
  hasError?: boolean
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function parseDate(str: string): { y: number; m: number; d: number } | null {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return null
  return { y, m: m - 1, d } // m: 0-indexed
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export const DatePicker: FC<Props> = ({ value, onChange, id, required, hasError }) => {
  const parsed = parseDate(value)
  const todayRaw = new Date()
  const todayY = todayRaw.getFullYear()
  const todayM = todayRaw.getMonth()
  const todayD = todayRaw.getDate()

  const [open, setOpen] = useState(false)
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })
  const [viewYear, setViewYear] = useState(parsed?.y ?? todayY)
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? todayM)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // 팝오버 위치 계산
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popoverHeight = 340
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow >= popoverHeight
      ? rect.bottom + 8
      : rect.top - popoverHeight - 8
    setPopoverStyle({ top, left: rect.left, width: rect.width })
  }, [])

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    calcPosition()
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, calcPosition])

  // value 바뀌면 뷰도 이동
  useEffect(() => {
    const p = parseDate(value)
    if (p) { setViewYear(p.y); setViewMonth(p.m) }
  }, [value])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startDow = new Date(viewYear, viewMonth, 1).getDay()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (day: number) => {
    onChange(toDateStr(viewYear, viewMonth, day))
    setOpen(false)
  }

  const displayValue = parsed
    ? `${parsed.y}년 ${parsed.m + 1}월 ${parsed.d}일`
    : '날짜 선택'

  const popover = open ? (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: popoverStyle.top,
        left: popoverStyle.left,
        width: popoverStyle.width,
        zIndex: 9999,
      }}
      className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-[fade-in_0.15s_ease-out]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-bold text-gray-900">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Grid */}
      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-semibold py-1 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dow = (startDow + i) % 7
            const dateStr = toDateStr(viewYear, viewMonth, day)
            const isSelected = dateStr === value
            const isToday = day === todayD && viewMonth === todayM && viewYear === todayY

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${isSelected
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : isToday
                    ? 'bg-indigo-50 text-[#4F46E5] font-bold'
                    : dow === 0
                    ? 'text-red-500 hover:bg-red-50'
                    : dow === 6
                    ? 'text-blue-500 hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Today shortcut */}
        <button
          type="button"
          onClick={() => {
            onChange(toDateStr(todayY, todayM, todayD))
            setOpen(false)
          }}
          className="mt-3 w-full py-2 text-xs font-semibold text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
        >
          오늘
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="w-full">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-4 ${
          hasError
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
            : open
            ? 'border-[#4F46E5] ring-4 ring-[#4F46E5]/10'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        aria-required={required}
      >
        <span className={parsed ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue}
        </span>
        <CalendarDays className="w-5 h-5 text-gray-400 shrink-0" />
      </button>

      {/* Portal로 body에 직접 렌더링 → overflow clip 우회 */}
      {createPortal(popover, document.body)}
    </div>
  )
}
