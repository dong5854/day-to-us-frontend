import { useState, type ComponentType } from 'react'
import { ChevronRight, Link2, Plus } from 'lucide-react'
import { Modal } from '@/shared/components/Modal'
import type { SavingsState } from '../hooks/useSavings'
import { KisConnectionCard } from './KisConnectionCard'

export interface PensionProviderProps {
  spaceId: string
  savings: SavingsState
  open: boolean
  onClose: () => void
}

// Each institution owns its authentication form and API calls.
const providers: { id: string; name: string; description: string; Connection: ComponentType<PensionProviderProps> }[] = [
  { id: 'kis', name: '한국투자증권', description: '연금저축 · IRP', Connection: KisConnectionCard },
]

export function PensionConnections({ spaceId, savings, onAddAccount }: { spaceId: string; savings: SavingsState; onAddAccount: () => void }) {
  const [choosing, setChoosing] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  return <>
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-bold">연금 계좌</h3>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setChoosing(true)} className="min-h-11 flex items-center gap-1 text-sm text-indigo-600"><Link2 size={16}/>연결</button>
        <button type="button" onClick={onAddAccount} className="min-h-11 flex items-center gap-1 text-sm text-gray-600"><Plus size={16}/>직접 추가</button>
      </div>
    </div>
    <Modal isOpen={choosing} onClose={() => setChoosing(false)}>
      <div className="p-5 space-y-4">
        <h2 className="pr-8 text-lg font-semibold">금융기관 선택</h2>
        <p className="text-sm text-gray-500">연금계좌가 있는 금융기관을 선택하세요.</p>
        {providers.map(provider => <button key={provider.id} type="button" onClick={() => { setChoosing(false); setSelected(provider.id) }} className="w-full flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left">
          <span><span className="block font-medium">{provider.name}</span><span className="block text-xs text-gray-500 mt-1">{provider.description}</span></span><ChevronRight size={18}/>
        </button>)}
        <p className="text-xs text-gray-500">목록에 없는 금융기관의 계좌는 직접 추가할 수 있습니다.</p>
        <button type="button" onClick={() => { setChoosing(false); onAddAccount() }} className="min-h-11 text-sm text-indigo-600">계좌 직접 추가</button>
      </div>
    </Modal>
    {providers.map(({ id, Connection }) => <Connection key={id} spaceId={spaceId} savings={savings} open={selected === id} onClose={() => setSelected(null)}/>)}
  </>
}
