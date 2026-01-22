/**
 * Dashboard 页面类型定义
 */

import type { WealthSummary } from '../../types/wealth.types'

/**
 * Dashboard 页面属性
 */
export interface DashboardProps {
  /** 财富摘要数据 */
  wealthSummary?: WealthSummary
}

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
