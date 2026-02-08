/**
 * 投资规划类型定义
 */

/** 价值区间 */
export interface ValueRange {
  start: number
  end: number
}

/** 表格行数据 */
export interface TestZoneRow {
  id: string
  valueRangeStart: number
  valueRangeEnd: number
  investmentPercentage: number
  investmentAmount: number
  actualAmount: number
  useTotalInvestment: boolean // true=使用总投资计算, false=使用总收入计算
}

/** 单个表格 */
export interface TestZoneTable {
  id: string
  name: string
  rows: TestZoneRow[]
  /** 股票代码（可选）如：sh600000、hk00700 */
  stockCode?: string
  /** 最新价格缓存 */
  latestPrice?: number
  /** 涨跌幅缓存（%） */
  changePercent?: number
  /** 股票数据更新时间 */
  stockDataUpdateTime?: string
  createdAt: string
  updatedAt: string
}

/** 投资规划数据 */
export interface TestZoneData {
  tables: TestZoneTable[]
  lastUpdated: string
}
