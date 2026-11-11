import { useState } from 'react'
import { Link2, RefreshCw } from 'lucide-react'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'
import { useKisConnections } from '../hooks/useKisConnections'
import type { SavingsState } from '../hooks/useSavings'
import { SavingsForm } from './SavingsForm'

export function KisConnectionCard({ spaceId, savings }: { spaceId: string; savings: SavingsState }) {
  const plans = savings.data?.plans ?? []
  const [addingAccount, setAddingAccount] = useState(false)
  const kis = useKisConnections(spaceId)
  const [open, setOpen] = useState(false)
  const [disconnectId, setDisconnectId] = useState('')
  const [planId, setPlanId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [appKey, setAppKey] = useState('')
  const [appSecret, setAppSecret] = useState('')
  const [shareConsent, setShareConsent] = useState(false)
  const options = plans.filter(p => kis.status?.connectablePlanIds.includes(p.id)).map(p => ({ value: p.id, label: `${p.name} · ${p.kind === 'IRP' ? 'IRP (29)' : '연금저축 (22)'}` }))
  const selectedPlan = options.some(p => p.value === planId) ? planId : options[0]?.value || ''
  const close = () => { if (!kis.busy) { setOpen(false); setAddingAccount(false); setAccountNumber(''); setAppKey(''); setAppSecret(''); setShareConsent(false) } }
  if (!kis.status) return kis.error ? <p role="alert" className="text-sm text-gray-500">계좌 연결 상태를 불러오지 못했어요. <button onClick={() => void kis.refresh()} className="underline">다시 시도</button></p> : null
  if (!kis.status.canConnect && !kis.status.accounts.length) return null
  return <section className="rounded-xl border border-gray-100 bg-white p-4 space-y-3" aria-label="한국투자증권 연결">
    <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">한국투자증권</h2>
      {kis.status.canConnect && <button type="button" disabled={kis.busy} onClick={() => { void kis.refresh(); setOpen(true) }} className="flex min-h-11 items-center gap-1 text-sm text-indigo-600 disabled:opacity-50"><Link2 size={16}/>계좌 연결</button>}
    </div>
    {kis.status.accounts.map(account => <div key={account.planId} className="border-t border-gray-100 pt-3 space-y-1">
      <p className="text-sm font-medium">{account.name} <span className="font-normal text-gray-500">{account.maskedAccount}</span></p>
      <p className="text-lg font-semibold">{account.valuation === null ? '조회 대기' : `${account.valuation.toLocaleString('ko-KR')}원`}</p>
      {account.cash !== null && <p className="text-xs text-gray-500">예수금 {account.cash.toLocaleString('ko-KR')}원 포함</p>}
      <p className="text-xs text-gray-500">{account.lastSyncedAt ? `${new Date(account.lastSyncedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} 조회 · 하루 한 번 자동 갱신` : '아직 조회된 잔고가 없습니다'}</p>
      {account.error && <p role="alert" className="text-xs text-red-600">{account.error}</p>}
      {account.canManage && <div className="flex gap-4">
        <button type="button" disabled={kis.busy || !kis.status?.canConnect} onClick={() => void kis.sync(account.planId)} className="flex min-h-11 items-center gap-1 text-sm text-indigo-600 disabled:opacity-50"><RefreshCw size={14}/>새로고침</button>
        <button type="button" disabled={kis.busy} onClick={() => setDisconnectId(account.planId)} className="min-h-11 text-sm text-gray-500 disabled:opacity-50">연결 해제</button>
      </div>}
    </div>)}
    <p className="text-xs text-gray-500">API가 제공하는 자산 잔고입니다. 펀드 등 일부 자산은 조회되지 않을 수 있으며, 절세 계산에는 직접 확인한 올해 납입액을 사용합니다.</p>
    {kis.busy && <p role="status" className="text-sm text-gray-500">처리 중입니다…</p>}
    {kis.error && !open && <p role="alert" className="text-sm text-red-600">{kis.error}</p>}
    <Modal isOpen={open} onClose={close} formLayout={addingAccount}>
      {addingAccount ? <SavingsForm pension selection={{ type: 'plan' }} savings={savings} onClose={() => { setAddingAccount(false); void kis.refresh() }}/> :
      <form className="p-5 space-y-4" onSubmit={async e => {
        e.preventDefault()
        if (!selectedPlan || kis.busy) return
        if (await kis.connect(selectedPlan, { accountNumber, appKey, appSecret, shareConsent })) {
          setOpen(false); setAddingAccount(false); setAccountNumber(''); setAppKey(''); setAppSecret(''); setShareConsent(false)
        }
      }} onKeyDown={e => { if (e.nativeEvent.isComposing) { if (e.key === 'Enter') e.preventDefault(); return } }}>
        <h2 className="text-lg font-semibold pr-8">한국투자증권 연결</h2>
        <p className="text-sm text-gray-500">{options.length ? '본인 계좌의 KIS 실전투자 API 키를 입력하세요.' : '먼저 연결할 연금계좌를 등록하면 다음 단계에서 API 키를 입력할 수 있습니다.'} 키는 서버에 암호화해 저장하며, 이 서비스는 잔고 조회만 요청합니다.</p>
        {!options.length ? <div className="space-y-3"><p className="text-sm">본인 명의의 연금저축 또는 IRP를 등록해 주세요. DC 계좌는 연결할 수 없습니다.</p><button type="button" onClick={() => setAddingAccount(true)} className="min-h-11 w-full rounded-lg bg-indigo-600 p-3 text-white">연금 계좌 추가하고 계속</button></div> : <>
          <label className="block text-sm space-y-1"><span>연결할 연금계좌</span><Select value={selectedPlan} onChange={setPlanId} options={options}/></label>
          <label className="block text-sm space-y-1"><span>계좌번호 앞 8자리</span><input required type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{8}" maxLength={8} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full rounded-lg border border-gray-200 p-3"/></label>
          <a href="https://apiportal.koreainvestment.com/about-howto" target="_blank" rel="noreferrer" className="inline-block min-h-11 py-3 text-sm text-indigo-600 underline">KIS API 키 발급 안내</a>
          <label className="block text-sm space-y-1"><span>App Key</span><input required type="password" autoComplete="off" minLength={10} maxLength={256} value={appKey} onChange={e => setAppKey(e.target.value)} className="w-full rounded-lg border border-gray-200 p-3"/></label>
          <label className="block text-sm space-y-1"><span>App Secret</span><input required type="password" autoComplete="off" minLength={10} maxLength={512} value={appSecret} onChange={e => setAppSecret(e.target.value)} className="w-full rounded-lg border border-gray-200 p-3"/></label>
          <label className="flex gap-2 items-start text-sm"><input required type="checkbox" checked={shareConsent} onChange={e => setShareConsent(e.target.checked)} className="mt-1"/><span>이 공간의 멤버에게 계좌 이름, 마스킹한 번호와 조회 잔고를 공유합니다. API 키는 공유하지 않습니다.</span></label>
          <button disabled={kis.busy} type="submit" className="w-full rounded-lg bg-indigo-600 p-3 text-white disabled:opacity-50">{kis.busy ? '연결 중…' : '연결하고 잔고 조회'}</button>
        </>}
        {kis.error && <p role="alert" className="text-sm text-red-600">{kis.error}</p>}
      </form>}
    </Modal>
    <Modal isOpen={!!disconnectId} onClose={() => { if (!kis.busy) setDisconnectId('') }}>
      <div className="p-5 space-y-4"><h2 className="pr-8 text-lg font-semibold">계좌 연결을 해제할까요?</h2>
        <p className="text-sm text-gray-600">저장한 API 키와 조회 잔고를 삭제하고 자동 갱신을 멈춥니다. 직접 입력한 납입 기록은 유지됩니다. KIS에서 발급한 키 자체는 폐기되지 않습니다.</p>
        <button disabled={kis.busy} onClick={async () => { if (await kis.disconnect(disconnectId)) setDisconnectId('') }} className="min-h-11 w-full rounded-lg bg-indigo-600 text-white disabled:opacity-50">연결 해제</button>
        {kis.error && <p role="alert" className="text-sm text-red-600">{kis.error}</p>}
      </div>
    </Modal>
  </section>
}
