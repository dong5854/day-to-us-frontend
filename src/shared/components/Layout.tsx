import { type FC, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { SharedSpaceResponse } from '@/features/space/types/space.types'

interface Props {
  children: ReactNode
  space: SharedSpaceResponse | null
  hasSpace: boolean
}

export const Layout: FC<Props> = ({ children, space, hasSpace }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isSettingsPage = location.pathname === '/settings'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="gradient-bg text-white py-6 shadow-md transition-all duration-300 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isSettingsPage && hasSpace && (
                <button
                  onClick={() => navigate('/')}
                  className="mr-1 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <span className="text-2xl">←</span>
                </button>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {isSettingsPage ? '설정' : hasSpace && space ? space.name : '달력'}
                </h1>
              </div>
            </div>

            {/* Settings Button */}
            {!isSettingsPage && hasSpace && (
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="설정"
              >
                <span className="text-2xl">⚙️</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-24">{children}</main>
    </div>
  )
}
