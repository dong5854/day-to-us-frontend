import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSpace } from './features/space/hooks/useSpace'
import { CalendarPage } from './pages/CalendarPage'
import { SettingsPage } from './pages/SettingsPage'
import { SpaceForm } from './features/space/components/SpaceForm'
import { LoginPage } from './features/auth/components/LoginPage'
import { Layout } from './shared/components/Layout'
import { Modal } from './shared/components/Modal'
import { Toast, type ToastType } from './shared/components/Toast'

function AppContent() {
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(new Date())

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
          <p className="text-gray-500 font-medium">로그인 처리 중...</p>
        </div>
      </div>
    )
  }

  const { space, members, createSpace, joinSpace, loading: spaceLoading, hasSpace, isUnauthorized, error: spaceError } = useSpace()

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
    } catch {
      showToast('공간 생성에 실패했습니다', 'error')
    }
  }

  const handleJoinSpace = async (code: string) => {
    try {
      const joinedSpace = await joinSpace(code)
      setIsSpaceFormOpen(false)
      showToast(`'${joinedSpace.name}' 공간에 참여했습니다!`, 'success')
      navigate('/')
    } catch {
      showToast('공간 참여에 실패했습니다', 'error')
    }
  }

  if (isUnauthorized) {
    return <LoginPage />
  }

  if (spaceLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#4F46E5] to-[#6D28D9] z-50">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="text-white animate-pulse drop-shadow-lg opacity-90">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white font-['Geist'] tracking-tight drop-shadow-md">Day To Us</h1>
        </div>
      </div>
    )
  }

  if (!hasSpace) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header
          className="bg-[#4F46E5] text-white py-6 shadow-md sticky top-0 z-50"
          style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
        >
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
              spaceId={space!.id}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          }
        />
        <Route
          path="/settings"
          element={<SettingsPage space={space} members={members} />}
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
