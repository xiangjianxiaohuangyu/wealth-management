/**
 * Dashboard 页面类型定义
 */

/**
 * 统计卡片数据
 */
export interface StatCard {
  /** 标题 */
  title: string
  /** 数值 */
  value: string | number
  /** 变化百分比（可选） */
  change?: number
  /** 图标 */
  icon?: string
  /** 颜色 */
  color?: 'success' | 'danger' | 'primary' | 'warning'
}
