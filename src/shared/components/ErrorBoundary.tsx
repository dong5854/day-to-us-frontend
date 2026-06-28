import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 p-8 text-center">
          <p className="text-2xl">⚠️</p>
          <p className="text-gray-700 font-medium">문제가 발생했습니다</p>
          <p className="text-gray-400 text-xs max-w-xs">
            {this.state.error?.message ?? '알 수 없는 오류'}
          </p>
          <button
            onClick={this.reset}
            className="mt-2 px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
