import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useSpace } from './features/space/hooks/useSpace'
import { CalendarPage } from './pages/CalendarPage'
import { SettingsPage } from './pages/SettingsPage'
import { SpaceForm } from './features/space/components/SpaceForm'
import { LoginPage } from './features/auth/components/LoginPage'
import { OAuth2RedirectPage } from './features/auth/components/OAuth2RedirectPage'
import { Layout } from './shared/components/Layout'
import { Modal } from './shared/components/Modal'
import { Toast } from './shared/components/Toast'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { useToast } from './shared/hooks/useToast'

function AppContent() {
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(new Date())

  const { toast, showToast, hideToast } = useToast()

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
      <div className="fixed inset-0 h-[100dvh] w-screen flex flex-col items-center justify-center bg-[#4F46E5] z-50">
        <div className="flex flex-col items-center animate-fade-in">
          <img 
            src="/pwa-512x512.svg" 
            alt="Day To Us Logo" 
            className="w-24 h-24 sm:w-32 sm:h-32 animate-pulse drop-shadow-2xl" 
          />
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
              <div className="flex justify-center mb-6">
                <Heart className="w-16 h-16 text-[#4F46E5] fill-[#4F46E5]/20" />
              </div>
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
            <ErrorBoundary>
              <CalendarPage
                spaceId={space!.id}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            </ErrorBoundary>
          }
        />
        <Route
          path="/settings"
          element={
            <ErrorBoundary>
              <SettingsPage space={space} members={members} />
            </ErrorBoundary>
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
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
