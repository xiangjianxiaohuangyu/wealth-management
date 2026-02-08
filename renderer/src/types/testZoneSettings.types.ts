/**
 * 投资规划设置类型定义
 */

/** 投资金额计算方式 */
export type CalculationMethod = 'total-income' | 'total-investment'

/** 投资规划设置 */
export interface TestZoneSettings {
  /** 投资金额计算方式 */
  calculationMethod: CalculationMethod
}
