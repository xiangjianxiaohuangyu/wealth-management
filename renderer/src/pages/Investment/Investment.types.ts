/**
 * Investment 页面类型定义
 */

/**
 * 投资页面属性
 */
export interface InvestmentProps {
  /** 投资组合数据 */
  portfolios?: PortfolioItem[]
}

/**
 * 投资组合项数据
 */
export interface PortfolioItem {
  /** 组合 ID */
  id: string
  /** 组合名称 */
  name: string
  /** 描述 */
  description?: string
  /** 总价值 */
  totalValue: number
  /** 收益率 */
  returnRate: number
  /** 资产数量 */
  assetCount: number
}
