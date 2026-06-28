import { useEffect, type FC } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

/**
 * OAuth2 소셜 로그인 후 백엔드가 리다이렉트하는 페이지.
 * URL의 ?token= 파라미터를 읽어 localStorage에 저장한 뒤 홈으로 이동합니다.
 *
 * 예시 리다이렉트 URL: /oauth2/redirect?token=eyJhbGciOi...
 */
export const OAuth2RedirectPage: FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('accessToken', token)
    }
    // 토큰 유무와 관계없이 홈으로 이동 (토큰 없으면 로그인 페이지로 리다이렉트됨)
    navigate('/', { replace: true })
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]" />
        <p className="text-gray-500 font-medium">로그인 처리 중...</p>
      </div>
    </div>
  )
}
