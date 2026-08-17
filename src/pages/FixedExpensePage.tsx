import { useState, type FC } from 'react'
import { FixedExpenseList } from '@/features/fixedExpense/components/FixedExpenseList'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'
import { Modal } from '@/shared/components/Modal'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import type { FixedExpenseRequest, FixedExpenseResponse } from '@/features/fixedExpense/types/fixedExpense.types'
import type { ExpenseCategoryResponse } from '@/features/budget/types/expenseCategory.types'
import type { PaymentMethodResponse } from '@/features/budget/types/paymentMethod.types'

interface Props {
  expenses: FixedExpenseResponse[]
  loading: boolean
  categories?: ExpenseCategoryResponse[]
  paymentMethods?: PaymentMethodResponse[]
  onCreateCategory?: (name: string) => Promise<ExpenseCategoryResponse | undefined>
  onCreatePaymentMethod?: (name: string) => Promise<PaymentMethodResponse | undefined>
  onDeleteCategory?: (id: string) => Promise<void>
  onDeletePaymentMethod?: (id: string) => Promise<void>
  onCreateExpense: (data: FixedExpenseRequest) => Promise<void>
  onUpdateExpense: (id: string, data: FixedExpenseRequest) => Promise<void>
  onDeleteExpense: (id: string) => Promise<void>
}

export const FixedExpensePage: FC<Props> = ({ 
  expenses, 
  loading, 
  categories,
  paymentMethods,
  onCreateCategory,
  onCreatePaymentMethod,
  onDeleteCategory,
  onDeletePaymentMethod,
  onCreateExpense, 
  onUpdateExpense, 
  onDeleteExpense 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpenseResponse | null>(null)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    onConfirm: () => void
  }>({ isOpen: false, message: '', onConfirm: () => {} })

  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsFormOpen(true)
  }

  const handleEditExpense = (expense: FixedExpenseResponse) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const handleSubmitExpense = async (data: FixedExpenseRequest) => {
    if (editingExpense) {
      await onUpdateExpense(editingExpense.id, data)
    } else {
      await onCreateExpense(data)
    }
    setIsFormOpen(false)
    setEditingExpense(null)
  }

  const handleDeleteExpense = (expenseId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 고정지출을 삭제하시겠습니까?',
      onConfirm: async () => {
        await onDeleteExpense(expenseId)
        setConfirmState((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  return (
    <>
      <div className="animate-[slide-up_0.3s_ease-out] pb-28">
        <FixedExpenseList 
          expenses={expenses} 
          loading={loading} 
          categories={categories}
          paymentMethods={paymentMethods}
          onEdit={handleEditExpense} 
          onDelete={handleDeleteExpense} 
        />
      </div>

      <button
        onClick={handleAddExpense}
        className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
        title="고정지출 추가"
      >
        +
      </button>

      <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingExpense(null) }}>
        <FixedExpenseForm 
          expense={editingExpense} 
          categories={categories}
          paymentMethods={paymentMethods}
          onCreateCategory={onCreateCategory}
          onCreatePaymentMethod={onCreatePaymentMethod}
          onDeleteCategory={onDeleteCategory}
          onDeletePaymentMethod={onDeletePaymentMethod}
          onSubmit={handleSubmitExpense} 
          onCancel={() => { setIsFormOpen(false); setEditingExpense(null) }} 
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
