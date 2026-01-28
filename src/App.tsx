import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSpace } from './features/space/hooks/useSpace'
import { useBudget } from './features/budget/hooks/useBudget'
import { useFixedExpense } from './features/fixedExpense/hooks/useFixedExpense'
import { CalendarPage } from './pages/CalendarPage'
import { SettingsPage } from './pages/SettingsPage'
import { SpaceForm } from './features/space/components/SpaceForm'
import { LoginPage } from './features/auth/components/LoginPage'
import { Layout } from './shared/components/Layout'
import { Modal } from './shared/components/Modal'
import { Toast, type ToastType } from './shared/components/Toast'

function AppContent() {
  const navigate = useNavigate()
  
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  })

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  // OAuth2 Redirect Handler
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
  const { space, members, createSpace, joinSpace, loading: spaceLoading, hasSpace, isUnauthorized, error: spaceError } = useSpace()
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
  const {
    expenses: fixedExpenses,
    loading: fixedExpenseLoading,
    createExpense: createFixedExpense,
  } = useFixedExpense(space?.id || null)

  const [isSpaceFormOpen, setIsSpaceFormOpen] = useState(false)

  useEffect(() => {
    if (spaceError) {
      showToast(spaceError, 'error')
    }
  }, [spaceError])

  const handleCreateSpace = async (name: string) => {
    try {
      const newSpace = await createSpace(name)
      setIsSpaceFormOpen(false)
      showToast(`'${newSpace.name}' 공간이 시작되었습니다!`, 'success')
      navigate('/')
    } catch (error) {
      showToast('공간 생성에 실패했습니다', 'error')
    }
  }

  const handleJoinSpace = async (code: string) => {
    try {
      const joinedSpace = await joinSpace(code)
      setIsSpaceFormOpen(false)
      showToast(`'${joinedSpace.name}' 공간에 참여했습니다!`, 'success')
      navigate('/')
    } catch (error) {
      showToast('공간 참여에 실패했습니다', 'error')
    }
  }

  const handleCreateEntry = async (data: { description: string; amount: number }) => {
    try {
      await createEntry(data)
      showToast('내역이 추가되었습니다', 'success')
    } catch (error) {
      showToast('저장에 실패했습니다', 'error')
      throw error
    }
  }

  const handleUpdateEntry = async (id: string, data: { description: string; amount: number }) => {
    try {
      await updateEntry(id, data)
      showToast('항목이 수정되었습니다', 'success')
    } catch (error) {
      showToast('저장에 실패했습니다', 'error')
      throw error
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId)
      showToast('삭제되었습니다', 'info')
    } catch (error) {
      showToast('삭제에 실패했습니다', 'error')
      throw error
    }
  }

  const handleCreateFixedExpense = async (data: any) => {
    try {
      await createFixedExpense(data)
      showToast('고정지출이 추가되었습니다', 'success')
    } catch (error) {
      showToast('저장에 실패했습니다', 'error')
      throw error
    }
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

  if (!hasSpace) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="gradient-bg text-white py-6 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Day To Us</h1>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20 animate-[slide-up_0.5s_ease-out]">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
              <div className="text-6xl mb-6">💑</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">환영합니다!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                커플을 위한 공동 공간을 만들어보세요.
                <br />
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
        </main>

        <Modal isOpen={isSpaceFormOpen} onClose={() => setIsSpaceFormOpen(false)}>
          <SpaceForm
            onSubmit={handleCreateSpace}
            onJoin={handleJoinSpace}
            onCancel={() => setIsSpaceFormOpen(false)}
          />
        </Modal>

        <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
      </div>
    )
  }

  return (
    <Layout space={space} hasSpace={hasSpace}>
      <Routes>
        <Route
          path="/"
          element={
            <CalendarPage
              entries={entries}
              loading={budgetLoading}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              onCreateEntry={handleCreateEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              fixedExpenses={fixedExpenses}
              fixedExpenseLoading={fixedExpenseLoading}
              onCreateFixedExpense={handleCreateFixedExpense}
            />
          }
        />
        <Route
          path="/settings"
          element={<SettingsPage space={space} members={members} />}
        />
        <Route
          path="/budget"
          element={
            <CalendarPage
              entries={entries}
              loading={budgetLoading}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              onCreateEntry={handleCreateEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              fixedExpenses={fixedExpenses}
              fixedExpenseLoading={fixedExpenseLoading}
              onCreateFixedExpense={handleCreateFixedExpense}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
