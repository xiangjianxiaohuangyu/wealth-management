/**
 * 测试区类型定义
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
  createdAt: string
  updatedAt: string
}

/** 测试区数据 */
export interface TestZoneData {
  tables: TestZoneTable[]
  lastUpdated: string
}
