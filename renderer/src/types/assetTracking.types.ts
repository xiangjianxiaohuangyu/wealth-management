/**
 * 资产跟踪类型定义
 */

import type { Currency } from './common.types'

/**
 * 月度资产记录
 */
export interface MonthlyAssetRecord {
  /** 记录ID */
  id: string
  /** 年份 */
  year: number
  /** 月份 */
  month: number
  /** 月总收入 */
  totalIncome: number
  /** 消费金额 */
  consumption: number
  /** 存款金额 */
  savings: number
  /** 投资金额 */
  investment: number
  /** 货币类型 */
  currency: Currency
  /** 备注 */
  notes?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 累计资产数据（用于图表展示）
 */
export interface CumulativeAssetData {
  /** 月份标签 (YYYY-MM) */
  month: string
  /** 累计存款 */
  cumulativeSavings: number
  /** 累计投资 */
  cumulativeInvestment: number
  /** 总资产（存款+投资） */
  totalAssets: number
}

/**
 * 月度统计摘要
 */
export interface MonthlySummary {
  /** 月份标签 */
  month: string
  /** 收入 */
  income: number
  /** 消费 */
  consumption: number
  /** 存款 */
  savings: number
  /** 投资 */
  investment: number
  /** 存款率 (%) */
  savingsRate: number
  /** 投资率 (%) */
  investmentRate: number
}

/**
 * 资产趋势分析
 */
export interface AssetTrendAnalysis {
  /** 月度数据列表 */
  monthlyData: MonthlySummary[]
  /** 平均存款率 (%) */
  avgSavingsRate: number
  /** 平均投资率 (%) */
  avgInvestmentRate: number
  /** 总资产增长 */
  totalAssetGrowth: number
  /** 月均增长 */
  monthlyAvgGrowth: number
}

/**
 * 预算配置
 */
export interface BudgetConfig {
  /** 最大消费率 (0-1) */
  maxConsumptionRate: number
  /** 最小存款率 (0-1) */
  minSavingsRate: number
  /** 最小投资率 (0-1) */
  minInvestmentRate: number
}

/**
 * 资产跟踪数据（存储格式）
 */
export interface AssetTrackingData {
  /** 月度记录列表 */
  records: MonthlyAssetRecord[]
  /** 最后更新时间 */
  lastUpdated: string
  /** 固定资产手动调整记录 */
  fixedAssetAdjustments: AssetAdjustment[]
}

/**
 * 资产手动调整记录
 */
export interface AssetAdjustment {
  /** 调整ID */
  id: string
  /** 调整类型 */
  type: 'fixed-asset' | 'total-asset' | 'investment' | 'savings'
  /** 调整金额（正数为增加，负数为减少） */
  amount: number
  /** 调整说明 */
  description: string
  /** 调整日期 */
  date: string
  /** 创建时间 */
  createdAt: string
}

/**
 * 图表设置
 */
export interface ChartSettings {
  /** 是否显示总资产 */
  totalAssets: boolean
  /** 是否显示投资金额 */
  investment: boolean
  /** 是否显示存款 */
  savings: boolean
  /** 是否显示固定资产 */
  fixedAssets: boolean
}
