/**
 * 投资验证工具
 * 用于验证和计算投资规划相关的数据
 */

import type { AssetAllocationItem } from '../../types/investment.types'

/**
 * 计算当前比例总和
 * @param assets - 资产配置列表
 * @param excludeId - 排除的资产ID（用于编辑时）
 * @returns 总比例（0-100）
 *
 * @example
 * ```ts
 * calculateTotalPercentage([
 *   { plannedPercentage: 30 },
 *   { plannedPercentage: 20 }
 * ]) // 50
 * ```
 */
export function calculateTotalPercentage(
  assets: AssetAllocationItem[],
  excludeId?: string
): number {
  return assets
    .filter(asset => asset.id !== excludeId)
    .reduce((sum, asset) => sum + asset.plannedPercentage, 0)
}

/**
 * 计算当前计划金额总和
 * @param assets - 资产配置列表
 * @param excludeId - 排除的资产ID（用于编辑时）
 * @returns 总金额
 */
export function calculateTotalPlannedAmount(
  assets: AssetAllocationItem[],
  excludeId?: string
): number {
  return assets
    .filter(asset => asset.id !== excludeId)
    .reduce((sum, asset) => sum + asset.plannedAmount, 0)
}

/**
 * 计算操作建议
 * @param plannedAmount - 计划金额
 * @param actualAmount - 实际金额
 * @param tolerance - 容差比例（默认1%）
 * @returns 操作建议类型和差异金额
 *
 * @example
 * ```ts
 * calculateSuggestion(1000, 800) // { type: 'need-buy', amount: 200 }
 * calculateSuggestion(1000, 1200) // { type: 'need-sell', amount: 200 }
 * calculateSuggestion(1000, 995) // { type: 'balanced', amount: 0 }
 * ```
 */
export function calculateSuggestion(
  plannedAmount: number,
  actualAmount: number,
  tolerance: number = 0.01
): { type: 'need-buy' | 'need-sell' | 'balanced'; amount: number } {
  const diff = plannedAmount - actualAmount

  // 容差范围检查
  if (Math.abs(diff) <= plannedAmount * tolerance) {
    return { type: 'balanced', amount: 0 }
  }

  if (diff > 0) {
    return { type: 'need-buy', amount: diff }
  }

  return { type: 'need-sell', amount: Math.abs(diff) }
}

/**
 * 根据投资模式自动计算金额或比例
 * @param mode - 投资模式（百分比或金额）
 * @param value - 输入值
 * @param totalAmount - 总投资金额
 * @returns 计算后的百分比和金额
 *
 * @example
 * ```ts
 * // 固定百分比模式
 * calculateAssetValue('percentage', 30, 10000)
 * // { percentage: 30, amount: 3000 }
 *
 * // 固定金额模式
 * calculateAssetValue('amount', 3000, 10000)
 * // { percentage: 30, amount: 3000 }
 * ```
 */
export function calculateAssetValue(
  mode: 'percentage' | 'amount',
  value: number,
  totalAmount: number
): { percentage: number; amount: number } {
  if (mode === 'percentage') {
    // 限制百分比不超过100%
    const percentage = Math.min(Math.max(value, 0), 100)
    const amount = (totalAmount * percentage) / 100
    return { percentage, amount }
  } else {
    // 限制金额不超过总金额
    const amount = Math.min(Math.max(value, 0), totalAmount)
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    return { percentage, amount }
  }
}

/**
 * 获取比例的最大允许值
 * @param assets - 资产配置列表
 * @param currentId - 当前编辑的资产ID
 * @returns 最大允许的比例值（0-100）
 */
export function getMaxPercentage(
  assets: AssetAllocationItem[],
  currentId: string
): number {
  const otherTotal = calculateTotalPercentage(assets, currentId)
  return Math.max(0, 100 - otherTotal)
}

/**
 * 获取金额的最大允许值
 * @param assets - 资产配置列表
 * @param currentId - 当前编辑的资产ID
 * @param totalAmount - 总投资金额
 * @returns 最大允许的金额值
 */
export function getMaxAmount(
  assets: AssetAllocationItem[],
  currentId: string,
  totalAmount: number
): number {
  const otherTotal = calculateTotalPlannedAmount(assets, currentId)
  return Math.max(0, totalAmount - otherTotal)
}

/**
 * 验证比例总和是否超过100%
 * @param assets - 资产配置列表
 * @param excludeId - 排除的资产ID（用于编辑时）
 * @returns 是否有效
 */
export function validateTotalPercentage(
  assets: AssetAllocationItem[],
  excludeId?: string
): boolean {
  const total = calculateTotalPercentage(assets, excludeId)
  return total <= 100
}

/**
 * 验证计划金额是否超过总投资
 * @param assets - 资产配置列表
 * @param totalAmount - 总投资金额
 * @param excludeId - 排除的资产ID（用于编辑时）
 * @returns 是否有效
 */
export function validateTotalAmount(
  assets: AssetAllocationItem[],
  totalAmount: number,
  excludeId?: string
): boolean {
  const total = calculateTotalPlannedAmount(assets, excludeId)
  return total <= totalAmount
}
