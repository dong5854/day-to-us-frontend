import { useState, useRef, useEffect, type FC, type ReactNode } from 'react'
import { ChevronDown, Check, Trash2 } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  /** 구분선 위에 표시되는 특수 옵션 (e.g. "+ 새로 추가") */
  isSpecial?: boolean
  /** 항목 삭제 콜백 — 지정 시 드롭다운에 × 버튼 표시 */
  onDelete?: () => void
}

interface Props {
  id?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  /** 추가적인 wrapper className */
  className?: string
  /** input size variant */
  size?: 'sm' | 'md'
}

export const Select: FC<Props> = ({
  id,
  value,
  options,
  onChange,
  disabled = false,
  placeholder,
  className = '',
  size = 'md',
}) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)
  const displayLabel: ReactNode = selectedOption?.label ?? placeholder ?? ''

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 키보드 접근성
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((v) => !v)
    }
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'ArrowDown' && !open) setOpen(true)
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
  }

  const paddingClass = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'

  const normalOptions = options.filter((o) => !o.isSpecial)
  const specialOptions = options.filter((o) => o.isSpecial)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={[
          'w-full flex items-center justify-between gap-2',
          'border rounded-lg transition-all duration-150 cursor-pointer text-left',
          'focus:outline-none focus:ring-4',
          paddingClass,
          open
            ? 'border-[#4F46E5] ring-4 ring-[#4F46E5]/10 bg-white'
            : 'border-gray-200 bg-white hover:border-gray-300',
          disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200 ring-0'
            : 'text-gray-900',
        ].join(' ')}
      >
        <span className={`truncate ${!selectedOption && placeholder ? 'text-gray-400' : ''}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`shrink-0 transition-transform duration-200 ${
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
          } ${open ? 'rotate-180' : ''} ${disabled ? 'text-gray-300' : 'text-gray-500'}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className={[
            'absolute z-50 w-full mt-1.5',
            'bg-white border border-gray-200 rounded-xl shadow-lg',
            'overflow-hidden',
            'animate-[fadeSlideDown_0.15s_ease-out]',
          ].join(' ')}
          style={{ animationFillMode: 'both' }}
        >
          <ul className="max-h-56 overflow-y-auto py-1 overscroll-contain">
            {normalOptions.map((option) => {
              const isSelected = option.value === value
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={[
                    'group flex items-center justify-between gap-2 cursor-pointer select-none',
                    'transition-colors duration-100',
                    size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm',
                    isSelected
                      ? 'text-[#4F46E5] bg-[#4F46E5]/5 font-medium'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span className="truncate flex-1">{option.label}</span>
                  {isSelected && !option.onDelete && <Check className="w-4 h-4 shrink-0 text-[#4F46E5]" />}
                  {option.onDelete && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); option.onDelete?.() }}
                      className="shrink-0 p-2 -mr-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          {/* 특수 옵션 (구분선 포함) */}
          {specialOptions.length > 0 && (
            <>
              <div className="h-px bg-gray-100 mx-2" />
              <ul className="py-1">
                {specialOptions.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelect(option.value)}
                    className={[
                      'flex items-center gap-2 cursor-pointer select-none',
                      'transition-colors duration-100',
                      size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm',
                      'text-[#4F46E5] font-medium hover:bg-[#4F46E5]/5',
                    ].join(' ')}
                  >
                    <span>{option.label}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
