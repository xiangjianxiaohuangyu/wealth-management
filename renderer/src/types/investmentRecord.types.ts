/**
 * 投资记录类型定义
 */

/**
 * 投资记录行更新数据（不包含只读字段）
 */
export interface InvestmentRecordRowUpdate {
  /** 起始点 */
  startPoint?: number
  /** 终点 */
  endPoint?: number
  /** 规划比例（%） */
  plannedPercentage?: number
  /** 实际金额 */
  actualAmount?: number
  /** 行顺序索引（用于拖拽排序） */
  orderIndex?: number
}

/**
 * 投资记录中的单个行数据
 */
export interface InvestmentRecordRow {
  /** 行ID */
  id: string
  /** 起始点 */
  startPoint: number
  /** 终点 */
  endPoint: number
  /** 规划比例（%） */
  plannedPercentage: number
  /** 实际金额 */
  actualAmount: number
  /** 行顺序索引（用于拖拽排序） */
  orderIndex: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 投资记录卡片更新数据（不包含只读字段）
 */
export interface InvestmentRecordCardUpdate {
  /** 资产名称 */
  name?: string
  /** 股票代码（可选，用于关联股票） */
  stockCode?: string
  /** 最新价（可选，用于记录股票最新价格） */
  latestPrice?: number
}

/**
 * 投资记录卡片（一种资产）
 */
export interface InvestmentRecordCard {
  /** 卡片ID */
  id: string
  /** 资产名称 */
  name: string
  /** 股票代码（可选，用于关联股票） */
  stockCode?: string
  /** 最新价（可选，用于记录股票最新价格） */
  latestPrice?: number
  /** 记录行列表 */
  rows: InvestmentRecordRow[]
  /** 卡片顺序索引（用于拖拽排序） */
  cardOrderIndex: number
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
