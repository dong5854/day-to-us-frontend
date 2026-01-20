import { useState, useEffect } from 'react'
import { useSpace } from './features/space/hooks/useSpace'
import { useBudget } from './features/budget/hooks/useBudget'
import { BudgetList } from './features/budget/components/BudgetList'
import { BudgetForm } from './features/budget/components/BudgetForm'
import { SpaceForm } from './features/space/components/SpaceForm'
import { SpaceDashboard } from './features/space/components/SpaceDashboard'
import { LoginPage } from './features/auth/components/LoginPage'
import { Modal } from './shared/components/Modal'
import { ConfirmModal } from './shared/components/ConfirmModal'
import { Toast, type ToastType } from './shared/components/Toast'
import type { BudgetEntryResponse } from './features/budget/types/budget.types'

type ModuleType = 'dashboard' | 'budget'

function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard')

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  })

  // ... (keep toast functions)

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/oauth2/redirect') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      if (token) {
        localStorage.setItem('accessToken', token)
        window.location.replace('/')
      }
    }
  }, [])

  if (window.location.pathname === '/oauth2/redirect') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#667eea]"></div>
          <p className="text-gray-500 font-medium">로그인 처리 중...</p>
        </div>
      </div>
    )
  }

  // Data Hooks

  const { space, createSpace, loading: spaceLoading, hasSpace, isUnauthorized, error: spaceError } = useSpace()
  const {
    entries,
    loading: budgetLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    totalIncome,
    totalExpense,
    balance,
  } = useBudget(space?.id || null)

  useEffect(() => {
    if (spaceError) {
      showToast(spaceError, 'error')
    }
  }, [spaceError])

  // ... Rest of state

  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false)
  const [isSpaceFormOpen, setIsSpaceFormOpen] = useState(false)
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

  const handleCreateSpace = async (name: string) => {
    try {
      const newSpace = await createSpace(name)
      setIsSpaceFormOpen(false)
      showToast(`'${newSpace.name}' 공간이 시작되었습니다!`, 'success')
      setCurrentModule('dashboard')
    } catch (error) {
      showToast('공간 생성에 실패했습니다', 'error')
    }
  }

  const handleAddEntry = () => {
    setEditingEntry(null)
    setIsBudgetFormOpen(true)
  }

  const handleEditEntry = (entry: BudgetEntryResponse) => {
    setEditingEntry(entry)
    setIsBudgetFormOpen(true)
  }

  const handleSubmitEntry = async (data: { description: string; amount: number }) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, data)
        showToast('항목이 수정되었습니다', 'success')
      } else {
        await createEntry(data)
        showToast('내역이 추가되었습니다', 'success')
      }
      setIsBudgetFormOpen(false)
      setEditingEntry(null)
    } catch (error) {
      showToast('저장에 실패했습니다', 'error')
    }
  }

  const handleDeleteEntry = (entryId: string) => {
    setConfirmState({
      isOpen: true,
      message: '정말 이 내역을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await deleteEntry(entryId)
          showToast('삭제되었습니다', 'info')
        } catch (error) {
          showToast('삭제에 실패했습니다', 'error')
        } finally {
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  if (isUnauthorized) {
    return <LoginPage />
  }

  if (spaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#667eea]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="gradient-bg text-white py-6 shadow-md transition-all duration-300 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentModule !== 'dashboard' && hasSpace && (
                <button 
                  onClick={() => setCurrentModule('dashboard')}
                  className="mr-1 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <span className="text-2xl">←</span>
                </button>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {currentModule === 'budget' ? '가계부' : 'Day To Us'}
                </h1>
                {hasSpace && space && currentModule === 'dashboard' && (
                  <span className="text-sm opacity-90 font-medium flex items-center gap-1 mt-1">
                    🏠 {space.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        {!hasSpace ? (
          <div className="flex flex-col items-center justify-center py-20 animate-[slide-up_0.5s_ease-out]">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
              <div className="text-6xl mb-6">💑</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">환영합니다!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                커플을 위한 공동 공간을 만들어보세요.<br/>
                가계부, 일정, 앨범을 한 곳에서 관리합니다.
              </p>
              <button
                onClick={() => setIsSpaceFormOpen(true)}
                className="w-full py-4 gradient-bg text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                시작하기
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentModule === 'dashboard' ? (
              <SpaceDashboard onNavigate={setCurrentModule} />
            ) : (
              <>
                <div className="animate-[slide-up_0.3s_ease-out]">
                  <BudgetList
                    entries={entries}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                    balance={balance}
                    loading={budgetLoading}
                  />
                </div>

                <button
                  onClick={handleAddEntry}
                  className="fixed bottom-8 right-8 w-16 h-16 md:w-14 md:h-14 rounded-full gradient-bg text-white text-4xl md:text-3xl font-light shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-50 flex items-center justify-center pb-1"
                  title="항목 추가"
                >
                  +
                </button>
              </>
            )}
          </>
        )}
      </main>

      <Modal isOpen={isBudgetFormOpen} onClose={() => setIsBudgetFormOpen(false)}>
        <BudgetForm
          entry={editingEntry}
          onSubmit={handleSubmitEntry}
          onCancel={() => setIsBudgetFormOpen(false)}
        />
      </Modal>

      <Modal isOpen={isSpaceFormOpen} onClose={() => setIsSpaceFormOpen(false)}>
        <SpaceForm
          onSubmit={handleCreateSpace}
          onCancel={() => setIsSpaceFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="삭제 확인"
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        confirmText="삭제"
        isDangerous
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}

export default App
