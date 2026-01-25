/**
 * 确认弹窗组件
 *
 * 用于删除等危险操作的二次确认
 */

import { Modal } from '../common/Modal'
import './ConfirmDialog.css'

export interface ConfirmDialogProps {
  /** 是否显示弹窗 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: () => void
  /** 标题 */
  title?: string
  /** 提示内容 */
  message: string
  /** 确认按钮文字 */
  confirmText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 确认按钮类型 */
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'danger'
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`confirm-dialog__btn confirm-dialog__btn--confirm confirm-dialog__btn--${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="confirm-dialog__content">
        <div className="confirm-dialog__message">{message}</div>
      </div>
    </Modal>
  )
}
