/**
 * 卡片组件类型定义
 */

import type { ReactNode, CSSProperties } from 'react'

/**
 * 卡片组件属性
 */
export interface CardProps {
  /** 子组件 */
  children: ReactNode
  /** 卡片标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 额外内容（通常在右上角） */
  extra?: ReactNode
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否可悬停（鼠标悬停时浮起效果） */
  hoverable?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: CSSProperties
}
