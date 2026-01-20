import { type FC } from 'react'

export const LoginPage: FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-[slide-up_0.5s_ease-out]">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent gradient-text mb-2">
            Day To Us
          </h1>
          <p className="text-gray-500">
            커플을 위한 특별한 공간
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-6 h-6"
            />
            <span>Google 계정으로 계속하기</span>
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          로그인하면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </div>
  )
}
