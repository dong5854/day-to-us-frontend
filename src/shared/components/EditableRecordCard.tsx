import type { ReactNode } from 'react'
import { SwipeableCard } from './SwipeableCard'

interface Props {
  children: ReactNode
  onEdit: () => void
  onDelete?: () => void
}

export function EditableRecordCard({ children, onEdit, onDelete }: Props) {
  const button = (
    <button type="button" className="block w-full text-left" onClick={event => {
      // The swipe handler processes pointer taps. Native keyboard and assistive clicks have no click count.
      if (!onDelete || event.detail === 0) onEdit()
    }}>
      {children}
    </button>
  )
  return onDelete ? <SwipeableCard onEdit={onEdit} onDelete={onDelete}>{button}</SwipeableCard> : button
}
