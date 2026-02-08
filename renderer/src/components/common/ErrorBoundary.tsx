/**
 * 错误边界组件
 *
 * 捕获子组件树中的 JavaScript 错误，记录错误日志，并显示备用 UI
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '../../utils/logger'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: ReactNode
  /** 自定义错误展示 UI */
  fallback?: ReactNode
  /** 发生错误时的回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 可以将错误日志上报给服务器
    logger.error('ErrorBoundary caught an error:', error)
    logger.error('Error Info:', errorInfo)

    // 调用自定义错误回调
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误 UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">⚠️</div>
            <h2 className="error-boundary__title">出错了</h2>
            <p className="error-boundary__message">
              应用遇到了一些问题，请刷新页面重试
            </p>
            {this.state.error && (
              <details className="error-boundary__details">
                <summary>错误详情</summary>
                <pre className="error-boundary__stack">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              className="error-boundary__button"
              onClick={this.handleReset}
            >
              重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 函数式错误边界 Hook（用于函数组件）
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const handleError = useCallback((error: Error) => {
 *     // 处理错误
 *   }, [])
 *
 *   return (
 *     <WithErrorBoundary onError={handleError}>
 *       <YourComponent />
 *     </WithErrorBoundary>
 *   )
 * }
 * ```
 */
export function WithErrorBoundary({
  children,
  fallback,
  onError
}: ErrorBoundaryProps): ReactNode {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  )
}
