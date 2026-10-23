import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
interface Props { title: string; children: ReactNode; onClose: () => void; busy?: boolean }
export const CategoryDialog = ({ title, children, onClose, busy = false }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 md:items-center md:p-6" onClick={() => !busy && onClose()}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={e => e.stopPropagation()}
      onKeyDown={e => {
        if (e.nativeEvent.isComposing) return
        if (e.key === 'Escape' && !busy) onClose()
        if (e.key === 'Tab') {
          const elements = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, [tabindex="0"]') ?? [])]
          const first = elements[0], last = elements.at(-1)
          if (!elements.length) { e.preventDefault(); return }
          if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last?.focus() }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
        }
      }} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-5 outline-none md:rounded-2xl pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between gap-3 mb-4"><h2 id={titleId} className="text-lg font-bold">{title}</h2><button type="button" disabled={busy} onClick={onClose} aria-label="닫기" className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={20}/></button></div>
      {children}
    </div>
  </div>
}
