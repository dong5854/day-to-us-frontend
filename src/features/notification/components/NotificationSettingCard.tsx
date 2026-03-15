import { useState, type FC } from 'react'
import { useNotification } from '../hooks/useNotification'
import { useToast } from '@/shared/hooks/useToast'
import { Toast } from '@/shared/components/Toast'

export const NotificationSettingCard: FC = () => {
  const { permission, subscribed, loading, isSupported, subscribe, unsubscribe } = useNotification()
  const { toast, showToast, hideToast } = useToast()
  const [toggling, setToggling] = useState(false)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">알림 설정</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      if (subscribed) {
        await unsubscribe()
        showToast('알림이 비활성화되었습니다.', 'info')
      } else {
        await subscribe()
        showToast('알림이 활성화되었습니다.', 'success')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '알림 설정 변경에 실패했습니다.'
      showToast(message, 'error')
    } finally {
      setToggling(false)
    }
  }

  const isDenied = permission === 'denied'

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">알림 설정</h3>

      {!isSupported ? (
        <p className="text-sm text-gray-500">이 브라우저는 푸시 알림을 지원하지 않습니다.</p>
      ) : isDenied ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            알림 권한이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.
          </p>
          <p className="text-xs text-gray-400">
            설정 → 사이트 설정 → 알림 에서 변경할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">푸시 알림 받기</label>
              <p className="text-xs text-gray-400 mt-0.5">고정지출 결제일, 일정 알림을 받습니다</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={subscribed}
              onClick={handleToggle}
              disabled={toggling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                subscribed ? 'bg-[#4F46E5]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  subscribed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {subscribed && (
            <div className="bg-[#4F46E5]/5 rounded-lg p-3">
              <p className="text-xs text-[#4F46E5] font-medium">
                매일 오전 8시에 당일/다음날 고정지출 결제일과 일정을 알려드립니다.
              </p>
            </div>
          )}
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}
