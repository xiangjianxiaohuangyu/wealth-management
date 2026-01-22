/**
 * 模态框组件类型定义
 */

import type { ReactNode, CSSProperties } from 'react'

/**
 * 模态框组件属性
 */
export interface ModalProps {
  /** 是否打开 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 标题 */
  title?: string
  /** 子组件 */
  children?: ReactNode
  /** 底部内容 */
  footer?: ReactNode
  /** 点击遮罩层是否关闭 */
  closeOnOverlayClick?: boolean
  /** 按 ESC 键是否关闭 */
  closeOnEsc?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: CSSProperties
}
