/**
 * 验证提醒组件
 *
 * 功能：
 * - 右上角弹出式提醒
 * - 支持错误和警告两种类型
 * - 3秒后自动淡出
 */

import { useEffect } from 'react'
import './ValidationToast.css'

export interface ValidationToastProps {
  /** 是否显示 */
  show: boolean
  /** 提示消息 */
  message: string
  /** 类型 */
  type?: 'error' | 'warning'
  /** 自动关闭延迟（毫秒），默认3000ms */
  duration?: number
  /** 关闭回调 */
  onClose?: () => void
}

export function ValidationToast({
  show,
  message,
  type = 'error',
  duration = 3000,
  onClose
}: ValidationToastProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  return (
    <div className={`validation-toast validation-toast--${type} ${show ? 'show' : ''}`}>
      <div className="validation-toast__icon">
        {type === 'error' ? '⚠️' : 'ℹ️'}
      </div>
      <div className="validation-toast__message">{message}</div>
    </div>
  )
}
