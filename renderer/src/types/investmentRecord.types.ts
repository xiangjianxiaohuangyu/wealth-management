/**
 * 投资记录类型定义
 */

/**
 * 投资记录行更新数据（不包含只读字段）
 */
export interface InvestmentRecordRowUpdate {
  /** 点数/价格 */
  price?: number
  /** 规划比例（%） */
  plannedPercentage?: number
  /** 实际金额 */
  actualAmount?: number
}

/**
 * 投资记录中的单个行数据
 */
export interface InvestmentRecordRow {
  /** 行ID */
  id: string
  /** 点数/价格 */
  price: number
  /** 规划比例（%） */
  plannedPercentage: number
  /** 实际金额 */
  actualAmount: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 投资记录卡片（一种资产）
 */
export interface InvestmentRecordCard {
  /** 卡片ID */
  id: string
  /** 资产名称 */
  name: string
  /** 记录行列表 */
  rows: InvestmentRecordRow[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 投资记录数据（存储格式）
 */
export interface InvestmentRecordData {
  /** 卡片列表 */
  cards: InvestmentRecordCard[]
  /** 最后更新时间 */
  lastUpdated: string
}
