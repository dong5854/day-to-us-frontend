import { type FC } from 'react'
import { useSyncSetting } from '../hooks/useSyncSetting'
import type { SyncDirection } from '../types/syncSetting.types'
import { useToast } from '@/shared/hooks/useToast'
import { Toast } from '@/shared/components/Toast'

const SYNC_DIRECTION_LABELS: Record<SyncDirection, string> = {
  BIDIRECTIONAL: '양방향 동기화',
  APP_TO_GOOGLE: '앱 → Google',
  GOOGLE_TO_APP: 'Google → 앱',
}

export const SyncSettingCard: FC = () => {
  const { syncSetting, calendars, loading, updateSyncSetting, syncNow } = useSyncSetting()
  const { toast, showToast, hideToast } = useToast()

  if (loading || !syncSetting) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Google 캘린더 동기화</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  const handleToggle = async () => {
    try {
      await updateSyncSetting({
        ...syncSetting,
        syncEnabled: !syncSetting.syncEnabled,
      })
      showToast(
        syncSetting.syncEnabled ? '동기화가 비활성화되었습니다.' : '동기화가 활성화되었습니다.',
        'success'
      )
    } catch {
      showToast('동기화 설정 변경에 실패했습니다.', 'error')
    }
  }

  const handleDirectionChange = async (direction: SyncDirection) => {
    try {
      await updateSyncSetting({
        ...syncSetting,
        syncDirection: direction,
      })
      showToast('동기화 방향이 변경되었습니다.', 'success')
    } catch {
      showToast('동기화 방향 변경에 실패했습니다.', 'error')
    }
  }

  const handleCalendarChange = async (calendarId: string) => {
    try {
      await updateSyncSetting({
        ...syncSetting,
        googleCalendarId: calendarId,
      })
      showToast('대상 캘린더가 변경되었습니다.', 'success')
    } catch {
      showToast('캘린더 변경에 실패했습니다.', 'error')
    }
  }

  const handleSyncNow = async () => {
    try {
      await syncNow()
      showToast('동기화가 완료되었습니다.', 'success')
    } catch {
      showToast('동기화 실행에 실패했습니다.', 'error')
    }
  }

  const disabled = !syncSetting.syncEnabled

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Google 캘린더 동기화</h3>
        <button
          onClick={handleSyncNow}
          disabled={disabled}
          className="px-3 py-1.5 text-sm font-medium text-[#4F46E5] bg-[#4F46E5]/10 hover:bg-[#4F46E5]/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          지금 동기화
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">동기화 사용</label>
          <button
            type="button"
            role="switch"
            aria-checked={syncSetting.syncEnabled}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              syncSetting.syncEnabled ? 'bg-[#4F46E5]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                syncSetting.syncEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">동기화 방향</label>
          <select
            value={syncSetting.syncDirection}
            onChange={(e) => handleDirectionChange(e.target.value as SyncDirection)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          >
            {(Object.keys(SYNC_DIRECTION_LABELS) as SyncDirection[]).map((dir) => (
              <option key={dir} value={dir}>
                {SYNC_DIRECTION_LABELS[dir]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">대상 캘린더</label>
          <select
            value={syncSetting.googleCalendarId}
            onChange={(e) => handleCalendarChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          >
            {calendars.length === 0 && (
              <option value={syncSetting.googleCalendarId}>
                {syncSetting.googleCalendarId === 'primary' ? '기본 캘린더' : syncSetting.googleCalendarId}
              </option>
            )}
            {calendars?.map((cal) => (
              <option key={cal.id} value={cal.id}>
                {cal.summary}{cal.primary ? ' (기본)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}
