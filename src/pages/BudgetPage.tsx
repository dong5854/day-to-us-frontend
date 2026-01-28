import { useState, type FC } from 'react'
import { BudgetList } from '@/features/budget/components/BudgetList'
import { BudgetForm } from '@/features/budget/components/BudgetForm'
import { FixedExpenseList } from '@/features/fixedExpense/components/FixedExpenseList'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'
import { Modal } from '@/shared/components/Modal'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import type { BudgetEntryResponse } from '@/features/budget/types/budget.types'
import type { FixedExpenseRequest, FixedExpenseResponse } from '@/features/fixedExpense/types/fixedExpense.types'

type TabType = 'entries' | 'fixed'

interface Props {
  entries: BudgetEntryResponse[]
  loading: boolean
  totalIncome: number
  totalExpense: number
  balance: number
  onCreateEntry: (data: { description: string; amount: number }) => Promise<void>
  onUpdateEntry: (id: string, data: { description: string; amount: number }) => Promise<void>
  onDeleteEntry: (id: string) => Promise<void>
  fixedExpenses: FixedExpenseResponse[]
  fixedExpenseLoading: boolean
  onCreateFixedExpense: (data: FixedExpenseRequest) => Promise<void>
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
  fixedExpenses,
  fixedExpenseLoading,
  onCreateFixedExpense,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('entries')
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false)
  const [isFixedExpenseFormOpen, setIsFixedExpenseFormOpen] = useState(false)
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

  const handleAddFixedExpense = () => {
    setIsFixedExpenseFormOpen(true)
  }

  const handleSubmitFixedExpense = async (data: FixedExpenseRequest) => {
    await onCreateFixedExpense(data)
    setIsFixedExpenseFormOpen(false)
  }

  const handleAddClick = () => {
    if (activeTab === 'entries') {
      handleAddEntry()
    } else {
      handleAddFixedExpense()
    }
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('entries')}
          className={`pb-3 px-4 text-lg font-bold transition-colors ${
            activeTab === 'entries'
              ? 'text-gray-900 border-b-2 border-[#667eea]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          수입/지출 내역
        </button>
        <button
          onClick={() => setActiveTab('fixed')}
          className={`pb-3 px-4 text-lg font-bold transition-colors ${
            activeTab === 'fixed'
              ? 'text-gray-900 border-b-2 border-[#667eea]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          고정지출
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-[slide-up_0.3s_ease-out]">
        {activeTab === 'entries' ? (
          <BudgetList
            entries={entries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            loading={loading}
          />
        ) : (
          <FixedExpenseList expenses={fixedExpenses} loading={fixedExpenseLoading} />
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={handleAddClick}
        className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
        title={activeTab === 'entries' ? '항목 추가' : '고정지출 추가'}
      >
        +
      </button>

      {/* Budget Entry Form Modal */}
      <Modal isOpen={isBudgetFormOpen} onClose={() => setIsBudgetFormOpen(false)}>
        <BudgetForm
          entry={editingEntry}
          onSubmit={handleSubmitEntry}
          onCancel={() => setIsBudgetFormOpen(false)}
        />
      </Modal>

      {/* Fixed Expense Form Modal */}
      <Modal isOpen={isFixedExpenseFormOpen} onClose={() => setIsFixedExpenseFormOpen(false)}>
        <FixedExpenseForm
          onSubmit={handleSubmitFixedExpense}
          onCancel={() => setIsFixedExpenseFormOpen(false)}
        />
      </Modal>

      {/* Confirm Delete Modal */}
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
