/**
 * 财富相关类型定义
 */

import type { DateString, Currency } from './common.types'

/**
 * 资产类别
 */
export type AssetCategory =
  | 'cash'
  | 'stock'
  | 'fund'
  | 'bond'
  | 'real_estate'
  | 'crypto'
  | 'other'

/**
 * 资产项
 */
export interface Asset {
  /** 资产 ID */
  id: string
  /** 资产名称 */
  name: string
  /** 资产类别 */
  category: AssetCategory
  /** 当前价值 */
  value: number
  /** 货币类型 */
  currency: Currency
  /** 持有数量 */
  quantity?: number
  /** 单位成本 */
  unitCost?: number
  /** 购买日期 */
  purchaseDate?: DateString
  /** 备注 */
  notes?: string
  /** 创建时间 */
  createdAt: DateString
  /** 更新时间 */
  updatedAt: DateString
}

/**
 * 负债类别
 */
export type LiabilityCategory =
  | 'loan'
  | 'credit_card'
  | 'mortgage'
  | 'other'

/**
 * 负债项
 */
export interface Liability {
  /** 负债 ID */
  id: string
  /** 负债名称 */
  name: string
  /** 负债类别 */
  category: LiabilityCategory
  /** 当前金额 */
  amount: number
  /** 货币类型 */
  currency: Currency
  /** 利率 (%) */
  interestRate?: number
  /** 到期日期 */
  dueDate?: DateString
  /** 备注 */
  notes?: string
  /** 创建时间 */
  createdAt: DateString
  /** 更新时间 */
  updatedAt: DateString
}

/**
 * 收支类别
 */
export type TransactionCategory =
  | 'salary'
  | 'bonus'
  | 'investment'
  | 'rent'
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'medical'
  | 'education'
  | 'other'

/**
 * 收支类型
 */
export type TransactionType = 'income' | 'expense'

/**
 * 收支记录
 */
export interface Transaction {
  /** 记录 ID */
  id: string
  /** 收支类型 */
  type: TransactionType
  /** 类别 */
  category: TransactionCategory
  /** 金额 */
  amount: number
  /** 货币类型 */
  currency: Currency
  /** 日期 */
  date: DateString
  /** 描述 */
  description?: string
  /** 备注 */
  notes?: string
  /** 创建时间 */
  createdAt: DateString
  /** 更新时间 */
  updatedAt: DateString
}

/**
 * 投资组合
 */
export interface Portfolio {
  /** 组合 ID */
  id: string
  /** 组合名称 */
  name: string
  /** 描述 */
  description?: string
  /** 资产列表 */
  assets: Asset[]
  /** 创建时间 */
  createdAt: DateString
  /** 更新时间 */
  updatedAt: DateString
}

/**
 * 净资产摘要
 */
export interface NetWorthSummary {
  /** 总资产 */
  totalAssets: number
  /** 总负债 */
  totalLiabilities: number
  /** 净资产 */
  netWorth: number
  /** 货币类型 */
  currency: Currency
  /** 计算日期 */
  calculatedAt: DateString
}

/**
 * 资产配置
 */
export interface AssetAllocation {
  /** 资产类别 */
  category: AssetCategory
  /** 金额 */
  amount: number
  /** 占比 */
  percentage: number
  /** 货币类型 */
  currency: Currency
}

/**
 * 财富摘要
 */
export interface WealthSummary {
  /** 净资产摘要 */
  netWorth: NetWorthSummary
  /** 资产配置 */
  assetAllocation: AssetAllocation[]
  /** 资产列表 */
  assets: Asset[]
  /** 负债列表 */
  liabilities: Liability[]
  /** 最近收支 */
  recentTransactions: Transaction[]
}

/**
 * 投资计算器参数
 */
export interface InvestmentCalculatorParams {
  /** 初始本金 */
  principal: number
  /** 每月投入 */
  monthlyContribution: number
  /** 年化收益率 (%) */
  annualReturn: number
  /** 投资年限 */
  years: number
  /** 复利频率 (每年复利次数) */
  compoundFrequency?: number
}

/**
 * 投资计算结果
 */
export interface InvestmentResult {
  /** 最终金额 */
  finalAmount: number
  /** 总本金 */
  totalPrincipal: number
  /** 总收益 */
  totalReturn: number
  /** 收益率 (%) */
  returnPercentage: number
  /** 每年数据 */
  yearlyData: YearlyInvestmentData[]
}

/**
 * 年度投资数据
 */
export interface YearlyInvestmentData {
  /** 年份 */
  year: number
  /** 年初金额 */
  startAmount: number
  /** 年度收益 */
  yearReturn: number
  /** 年末金额 */
  endAmount: number
  /** 累计投入 */
  totalContributions: number
}

/**
 * 收支趋势数据点
 */
export interface TrendDataPoint {
  /** 日期 */
  date: DateString
  /** 收入 */
  income: number
  /** 支出 */
  expense: number
  /** 净收支 */
  net: number
}
