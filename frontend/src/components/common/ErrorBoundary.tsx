import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    this.setState({
      errorInfo
    })
    
    // Gọi callback nếu có
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Sử dụng fallback nếu có
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                Đã có lỗi xảy ra
              </h1>
              
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-md text-left">
                  <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-700 dark:text-red-400 cursor-pointer">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Thử lại
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Tải lại trang
                </button>
              </div>

              <div className="mt-4">
                <a
                  href="/"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Về trang chủ
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
