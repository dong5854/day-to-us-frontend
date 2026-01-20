import { useState, type FC } from 'react'
import { BudgetList } from '@/features/budget/components/BudgetList'
import { BudgetForm } from '@/features/budget/components/BudgetForm'
import { Modal } from '@/shared/components/Modal'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'

interface Props {
  entries: BudgetEntryResponse[]
  loading: boolean
  totalIncome: number
  totalExpense: number
  balance: number
  onCreateEntry: (data: { description: string; amount: number }) => Promise<void>
  onUpdateEntry: (id: string, data: { description: string; amount: number }) => Promise<void>
  onDeleteEntry: (id: string) => Promise<void>
}

export const BudgetPage: FC<Props> = ({
  entries,
  loading,
  totalIncome,
  totalExpense,
  balance,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BudgetEntryResponse | null>(null)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  })

  const handleAddEntry = () => {
    setEditingEntry(null)
    setIsBudgetFormOpen(true)
  }

  const handleEditEntry = (entry: BudgetEntryResponse) => {
    setEditingEntry(entry)
    setIsBudgetFormOpen(true)
  }

  const handleSubmitEntry = async (data: { description: string; amount: number }) => {
    if (editingEntry) {
      await onUpdateEntry(editingEntry.id, data)
    } else {
      await onCreateEntry(data)
    }
    setIsBudgetFormOpen(false)
    setEditingEntry(null)
  }

  const handleDeleteEntry = (entryId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 내역을 삭제하시겠습니까?',
      onConfirm: async () => {
        await onDeleteEntry(entryId)
        setConfirmState((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  return (
    <>
      <div className="animate-[slide-up_0.3s_ease-out]">
        <BudgetList
          entries={entries}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          loading={loading}
        />
      </div>

      <button
        onClick={handleAddEntry}
        className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
        title="항목 추가"
      >
        +
      </button>

      <Modal isOpen={isBudgetFormOpen} onClose={() => setIsBudgetFormOpen(false)}>
        <BudgetForm
          entry={editingEntry}
          onSubmit={handleSubmitEntry}
          onCancel={() => setIsBudgetFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="삭제 확인"
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        confirmText="삭제"
        isDangerous
      />
    </>
  )
}
