/**
 * 资产计算工具函数
 *
 * 统一处理资产相关的计算逻辑，避免重复代码
 */

import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'

/**
 * 计算总投资金额（从资产跟踪数据）
 *
 * 包括：
 * - 所有月度记录的投资金额总和
 * - 类型为 'investment' 的调整记录金额总和
 *
 * @returns 总投资金额
 */
export function calculateTotalInvestment(): number {
  const records = assetTrackingStorage.getAllRecords()
  const adjustments = assetTrackingStorage.getAllAdjustments()

  // 计算基础投资金额（从月度记录）
  const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)

  // 计算投资调整金额
  const investmentAdjustments = adjustments
    .filter(a => a.type === 'investment')
    .reduce((sum, adj) => sum + adj.amount, 0)

  return baseInvestment + investmentAdjustments
}

/**
 * 计算总收入（从资产跟踪数据）
 *
 * @returns 所有月度记录的总收入之和
 */
export function calculateTotalIncome(): number {
  const records = assetTrackingStorage.getAllRecords()
  return records.reduce((sum, r) => sum + r.totalIncome, 0)
}

/**
 * 计算总存款（从资产跟踪数据）
 *
 * @returns 所有月度记录的存款金额总和
 */
export function calculateTotalSavings(): number {
  const records = assetTrackingStorage.getAllRecords()
  return records.reduce((sum, r) => sum + r.savings, 0)
}

/**
 * 计算总固定资产（从资产跟踪数据）
 *
 * 固定资产完全由调整记录管理
 *
 * @returns 总固定资产金额
 */
export function calculateTotalFixedAssets(): number {
  const adjustments = assetTrackingStorage.getAllAdjustments()

  // 计算固定资产调整金额
  const assetAdjustments = adjustments
    .filter(a => a.type === 'fixed-asset')
    .reduce((sum, adj) => sum + adj.amount, 0)

  return assetAdjustments
}

/**
 * 计算总资产（所有资产类型之和）
 *
 * @returns 总资产金额
 */
export function calculateTotalAssets(): number {
  return calculateTotalIncome() +
         calculateTotalInvestment() +
         calculateTotalSavings() +
         calculateTotalFixedAssets()
}
