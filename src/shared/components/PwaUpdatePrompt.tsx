import { RefreshCw } from 'lucide-react'
import { usePwaUpdate } from '@/shared/hooks/usePwaUpdate'
import { Modal } from './Modal'

export function PwaUpdatePrompt() {
  const { needRefresh, updating, error, update, dismiss } = usePwaUpdate()
  if (!needRefresh) return null

  return (
    <Modal isOpen onClose={dismiss}>
      <section role="dialog" aria-modal="true" aria-labelledby="pwa-update-title" className="p-6 pt-12">
        <RefreshCw aria-hidden="true" className="mb-4 h-8 w-8 text-[#4F46E5]" />
        <h2 id="pwa-update-title" className="text-xl font-bold text-gray-900">새 버전이 있습니다</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          업데이트하면 화면이 새로고침됩니다. 작성 중인 내용이 있다면 먼저 저장해 주세요.
        </p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={dismiss} disabled={updating} className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-700 disabled:opacity-50">
            나중에
          </button>
          <button type="button" onClick={() => void update()} disabled={updating} className="flex-1 rounded-lg bg-[#4F46E5] px-4 py-3 font-medium text-white disabled:opacity-50">
            {updating ? '업데이트 중…' : '업데이트'}
          </button>
        </div>
      </section>
    </Modal>
  )
}
