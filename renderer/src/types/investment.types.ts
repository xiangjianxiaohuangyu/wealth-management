/**
 * 投资规划类型定义
 */

/**
 * 投资模式
 */
export type InvestmentMode = 'percentage' | 'amount'

/**
 * 操作建议类型
 */
export type OperationSuggestion = 'need-buy' | 'need-sell' | 'balanced'

/**
 * 资产配置项
 */
export interface AssetAllocationItem {
  /** 资产ID */
  id: string
  /** 资产名称 */
  name: string
  /** 投资模式 */
  mode: InvestmentMode
  /** 计划比例（百分比，0-100） */
  plannedPercentage: number
  /** 计划金额 */
  plannedAmount: number
  /** 实际金额 */
  actualAmount: number
  /** 实际比例（百分比，0-100） */
  actualPercentage: number
  /** 操作建议 */
  suggestion: OperationSuggestion
  /** 建议金额差异 */
  suggestionAmount: number
  /** 资产颜色（用于图表显示） */
  color?: string
}

/**
 * 投资规划状态
 */
export interface InvestmentPlanState {
  /** 总投资金额 */
  totalAmount: number
  /** 资产配置列表 */
  assets: AssetAllocationItem[]
}
