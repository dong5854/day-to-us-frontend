import { useLoginExchange } from '../hooks/useLoginExchange'
import { LoginPage } from './LoginPage'

export function OAuth2RedirectPage() {
  const failed = useLoginExchange()
  if (failed) return <><p role="alert" className="p-3 text-center">로그인 요청이 만료되었어요. 다시 로그인해 주세요.</p><LoginPage /></>
  return <p role="status" className="p-6 text-center">로그인 처리 중…</p>
}
