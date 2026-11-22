import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { draftKey, loadDraft, type TokenDraft } from '../api/personalTokenApi'
import { usePersonalTokens } from '../hooks/usePersonalTokens'

interface Props { spaceId: string; spaceName: string }
const initial: TokenDraft = { name: '', access: 'READ', days: 30 }
const action = 'min-h-11 rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-indigo-600 disabled:opacity-50'
const primary = 'min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50'
const destructive = 'min-h-11 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50'
const choice = 'flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 has-checked:border-indigo-600 has-checked:bg-indigo-50 has-checked:text-indigo-700 has-focus-visible:ring-2 has-focus-visible:ring-indigo-500'
const label = (access: string) => access === 'EDIT' ? '조회·편집' : '조회만'
const date = (value: string) => new Date(value).toLocaleString('ko-KR')

export function PersonalTokenCard({ spaceId, spaceName }: Props) {
  const { tokens, error, busy, issue, revoke, reload } = usePersonalTokens(spaceId)
  const [draft, setDraft] = useState(() => loadDraft(spaceId) ?? initial)
  const [open, setOpen] = useState(() => !!loadDraft(spaceId))
  const [secret, setSecret] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [confirm, setConfirm] = useState('')
  useEffect(() => { sessionStorage.removeItem(draftKey) }, [])
  const base = new URL(import.meta.env.VITE_API_BASE_URL || '/api', window.location.origin).href.replace(/\/$/, '')
  return <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
    <div className="flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 font-bold text-lg text-gray-900"><KeyRound size={20} className="text-indigo-600" /> API 토큰</h3>
      {!open && !secret && <button className={primary} onClick={() => setOpen(true)}>새 토큰</button>}
    </div>
    {open && <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">용도 이름<input disabled={busy} maxLength={80} value={draft.name} placeholder="예: 주간 요약"
        onChange={e => setDraft({ ...draft, name: e.target.value })} className="mt-1 block w-full rounded-lg border border-gray-300 p-3" /></label>
      <fieldset disabled={busy}>
        <legend className="mb-1 text-sm font-medium text-gray-700">권한</legend>
        <div className="grid grid-cols-2 gap-2">{(['READ', 'EDIT'] as const).map(access =>
          <label key={access} className={choice}>
            <input type="radio" className="sr-only" name="token-access" checked={draft.access === access}
              onChange={() => setDraft({ ...draft, access })} />{label(access)}
          </label>)}</div>
      </fieldset>
      <fieldset disabled={busy}>
        <legend className="mb-1 text-sm font-medium text-gray-700">만료 기간</legend>
        <div className="grid grid-cols-3 gap-2">{[7, 30, 90].map(days =>
          <label key={days} className={choice}>
            <input type="radio" className="sr-only" name="token-days" checked={draft.days === days}
              onChange={() => setDraft({ ...draft, days })} />{days}일
          </label>)}</div>
      </fieldset>
      <p className="text-sm text-gray-600">‘{spaceName}’의 공유 일정, 가계부, 고정지출, 일반 저축, 카테고리와 결제수단을 읽을 수 있어요.
        {draft.access === 'EDIT' && ' 두 사람의 기록을 추가·수정·삭제할 수 있고, 일정 변경은 연결된 Google 캘린더에도 반영될 수 있어요.'}</p>
      <p className="text-sm text-gray-500">마지막 로그인 후 10분이 지났으면 Google 로그인을 한 번 더 진행해요.</p>
      <button className={primary} disabled={busy || !draft.name.trim()} onClick={async () => {
        const value = await issue(draft)
        if (value) { setSecret(value); setCopyStatus(''); setOpen(false); setDraft(initial) }
      }}>발급하기</button>
      <button className={action} disabled={busy} onClick={() => setOpen(false)}>취소</button>
    </div>}
    {secret && <div className="space-y-2">
      <label className="block text-sm">지금 한 번만 표시돼요. 안전한 곳에 저장해 주세요.
        <input readOnly autoComplete="off" spellCheck={false} aria-label="발급된 토큰" value={secret} onFocus={e => e.target.select()}
          className="mt-2 block w-full rounded-lg bg-gray-100 p-3 font-mono text-sm" /></label>
      <button className={action} onClick={async () => {
        try { await navigator.clipboard.writeText(secret); setCopyStatus('복사했어요.') }
        catch { setCopyStatus('토큰을 직접 선택해 복사해 주세요.') }
      }}>복사</button><button className={action} onClick={() => setSecret('')}>닫기</button>
      <span role="status">{copyStatus}</span>
      <p className="text-sm">토큰을 DAYTOUS_TOKEN 환경변수에 저장한 뒤 연결을 확인하세요.</p>
      <code className="block break-all text-sm">{`curl -H "Authorization: Bearer $DAYTOUS_TOKEN" "${base}/shared-spaces/${spaceId}/schedules"`}</code>
    </div>}
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error} <button className={action} disabled={busy} onClick={reload}>새로고침</button></p>}
    {!tokens.length && !error && <p className="text-sm text-gray-500">{busy ? '불러오는 중…' : '발급한 토큰이 없어요.'}</p>}
    {tokens.map(t => <div key={t.id} className="border-t border-gray-100 pt-3">
      <strong className="break-all">{t.name}</strong>
      <p className="text-sm text-gray-600">{spaceName} · {label(t.access)} · {date(t.expiresAt)} 만료</p>
      <p className="text-sm text-gray-600">{t.lastUsedAt ? '마지막 사용 ' + date(t.lastUsedAt) : '아직 사용 전'}</p>
      {confirm === t.id ? <>
        <span className="text-sm">이 토큰의 연결을 끊을까요?</span>
        <button className={destructive} disabled={busy} onClick={() => revoke(t.id)}>폐기 확인</button>
        <button className={action} onClick={() => setConfirm('')}>취소</button>
      </> : <button className={destructive} disabled={busy} onClick={() => setConfirm(t.id)}>폐기</button>}
    </div>)}
  </section>
}
