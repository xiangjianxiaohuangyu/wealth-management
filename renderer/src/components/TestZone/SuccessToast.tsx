/**
 * 成功提示组件
 *
 * 功能：
 * - 右上角弹出式成功提醒
 * - 3秒后自动淡出
 */

import { useEffect, useState } from 'react'
import './SuccessToast.css'

export interface SuccessToastProps {
  /** 是否显示 */
  show: boolean
  /** 提示消息 */
  message: string
  /** 自动关闭延迟（毫秒），默认3000ms */
  duration?: number
  /** 关闭回调 */
  onClose?: () => void
}

export function SuccessToast({
  show,
  message,
  duration = 3000,
  onClose
}: SuccessToastProps) {
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    if (show) {
      setIsHiding(false)

      if (duration > 0) {
        const hideTimer = setTimeout(() => {
          setIsHiding(true)
        }, duration)

        return () => clearTimeout(hideTimer)
      }
    }
  }, [show, duration])

  useEffect(() => {
    if (isHiding) {
      const closeTimer = setTimeout(() => {
        onClose?.()
      }, 300) // 等待淡出动画完成

      return () => clearTimeout(closeTimer)
    }
  }, [isHiding, onClose])

  if (!show && !isHiding) return null

  return (
    <div className={`success-toast ${show && !isHiding ? 'show' : ''} ${isHiding ? 'hiding' : ''}`}>
      <div className="success-toast__icon">✓</div>
      <div className="success-toast__message">{message}</div>
    </div>
  )
}
