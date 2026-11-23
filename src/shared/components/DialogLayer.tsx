import { useLayoutEffect, useRef, type ReactNode } from 'react'

interface Props {
  label: string
  onDismiss: () => void
  children: ReactNode
  dismissOnBackdrop?: boolean
}

let openCount = 0
let previousOverflow = ''
const focusable = 'button, input, select, textarea, a[href], [tabindex], [contenteditable="true"]'

export function DialogLayer({ label, onDismiss, children, dismissOnBackdrop = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    const dialog = ref.current!
    const opener = document.activeElement
    if (openCount++ === 0) previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    if (!dialog.contains(document.activeElement)) dialog.focus()
    return () => {
      dialog.close()
      if (--openCount === 0) document.body.style.overflow = previousOverflow
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={ref} aria-label={label} aria-modal="true" tabIndex={-1}
    className="fixed inset-0 m-0 h-full w-full max-h-none max-w-none bg-transparent px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] open:flex items-center justify-center backdrop:bg-black/50"
    onClick={e => { if (dismissOnBackdrop && e.target === e.currentTarget) onDismiss() }}
    onCancel={e => { e.preventDefault(); onDismiss() }}
    onKeyDown={e => {
      if (e.nativeEvent.isComposing) return
      if (e.defaultPrevented || (e.target as HTMLElement).closest('dialog') !== e.currentTarget) return
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onDismiss()
      }
      if (e.key !== 'Tab') return
      const controls = [...e.currentTarget.querySelectorAll<HTMLElement>(focusable)].filter(el =>
        el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden')
      const first = controls[0]
      const last = controls.at(-1)
      const active = document.activeElement
      if (!first || (e.shiftKey ? active === first || active === e.currentTarget : active === last)) {
        e.preventDefault()
        const next = e.shiftKey ? last : first
        next?.focus()
      }
    }}>
    {children}
  </dialog>
}
