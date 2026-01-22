/**
 * 模态框组件 - 玻璃态设计
 */

import { useEffect } from 'react'
import type { ModalProps } from './Modal.types'
import './Modal.css'

export function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = ''
}: ModalProps) {
  // 处理 ESC 键关闭
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, closeOnEsc, onClose])

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`modal ${isOpen ? 'modal--active' : ''} ${className}`.trim()}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal__header">
            <h3 id="modal-title" className="modal__title">{title}</h3>
            {onClose && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="关闭"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {children && <div className="modal__body">{children}</div>}

        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
