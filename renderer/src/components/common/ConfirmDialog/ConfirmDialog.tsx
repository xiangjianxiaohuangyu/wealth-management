/**
 * 通用确认对话框组件
 */

import { useEffect } from 'react'
import { Button } from '../Button/Button'
import './ConfirmDialog.css'

export interface ConfirmDialogProps {
  /** 是否打开对话框 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: () => void
  /** 对话框标题 */
  title: string
  /** 对话框消息内容 */
  message: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 对话框类型 */
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'info'
}: ConfirmDialogProps) {
  // ESC 键关闭对话框
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 防止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div className="confirm-dialog-overlay" onClick={onClose}>
      <div
        className={`confirm-dialog confirm-dialog--${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog__header">
          <h3 className="confirm-dialog__title">{title}</h3>
        </div>

        <div className="confirm-dialog__body">
          <p className="confirm-dialog__message">{message}</p>
        </div>

        <div className="confirm-dialog__footer">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
