import { useState, type FC } from 'react'
import { FixedExpenseList } from '@/features/fixedExpense/components/FixedExpenseList'
import { FixedExpenseForm } from '@/features/fixedExpense/components/FixedExpenseForm'
import { Modal } from '@/shared/components/Modal'
import type { FixedExpenseRequest } from '@/features/fixedExpense/types/fixedExpense.types'

interface Props {
  expenses: any[]
  loading: boolean
  onCreateExpense: (data: FixedExpenseRequest) => Promise<void>
}

export const FixedExpensePage: FC<Props> = ({ expenses, loading, onCreateExpense }) => {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleAddExpense = () => {
    setIsFormOpen(true)
  }

  const handleSubmitExpense = async (data: FixedExpenseRequest) => {
    await onCreateExpense(data)
    setIsFormOpen(false)
  }

  return (
    <>
      <div className="animate-[slide-up_0.3s_ease-out]">
        <FixedExpenseList expenses={expenses} loading={loading} />
      </div>

      <button
        onClick={handleAddExpense}
        className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
        title="고정지출 추가"
      >
        +
      </button>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <FixedExpenseForm onSubmit={handleSubmitExpense} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </>
  )
}
