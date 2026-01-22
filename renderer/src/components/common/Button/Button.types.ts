/**
 * 按钮组件类型定义
 */

import type { ReactNode, CSSProperties, MouseEventHandler } from 'react'
import type { Color, ButtonSize } from '../../../types/common.types'

/**
 * 按钮变体
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'link'

/**
 * 按钮原生类型
 */
export type ButtonNativeType = 'button' | 'submit' | 'reset'

/**
 * 按钮组件属性
 */
export interface ButtonProps {
  /** 子组件 */
  children: ReactNode
  /** 按钮原生类型 */
  type?: ButtonNativeType
  /** 按钮变体 */
  variant?: ButtonVariant
  /** 按钮尺寸 */
  size?: ButtonSize
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 图标 */
  icon?: ReactNode
  /** 是否块级按钮（占满容器宽度） */
  block?: boolean
  /** 是否危险操作 */
  danger?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: CSSProperties
  /** 点击事件 */
  onClick?: MouseEventHandler<HTMLButtonElement>
}
