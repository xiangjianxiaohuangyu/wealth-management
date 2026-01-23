/**
 * 状态标签组件
 * 用于显示功能状态（即将推出、已完成、计划中）
 */

import './StatusBadge.css'

export type StatusType = 'coming-soon' | 'completed' | 'planned'

interface StatusBadgeProps {
  /** 状态类型 */
  status: StatusType
  /** 状态文本 */
  children: string
  /** 自定义类名 */
  className?: string
}

export function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${status} ${className}`}>
      {children}
    </span>
  )
}
