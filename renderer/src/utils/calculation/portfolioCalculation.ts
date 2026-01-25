/**
 * 投资组合计算工具
 */

import type { AssetAllocationItem, OperationSuggestion } from '../../types/investment.types'

/**
 * 计算实际持有比例
 * @param actualAmount - 实际持有金额
 * @param totalActualAmount - 所有资产实际持有总和
 * @returns 实际持有比例 (0-100)
 */
export function calculateActualPercentage(
  actualAmount: number,
  totalActualAmount: number
): number {
  if (totalActualAmount === 0) return 0
  return (actualAmount / totalActualAmount) * 100
}

/**
 * 偏离度计算结果
 */
export interface DeviationResult {
  /** 偏离类型 */
  type: OperationSuggestion
  /** 比例差异 */
  percentageDiff: number
  /** 金额差异（绝对值） */
  amountDiff: number
}

/**
 * 计算偏离度
 *
 * 计算规则（基于金额比较）：
 * - |实际金额 - 计划金额| / 计划金额 ≤ 5% → balanced (已平衡)
 * - 实际金额 < 计划金额 → need-buy (需补仓)
 * - 实际金额 > 计划金额 → need-sell (需减持)
 *
 * @param plannedPercentage - 计划比例
 * @param actualPercentage - 实际比例
 * @param plannedAmount - 计划金额
 * @param actualAmount - 实际金额
 * @param threshold - 阈值百分比（默认5%）
 * @returns 偏离状态和金额
 */
export function calculateDeviation(
  plannedPercentage: number,
  actualPercentage: number,
  plannedAmount: number,
  actualAmount: number,
  threshold: number = 5
): DeviationResult {
  // 基于金额计算差异
  const amountDiff = actualAmount - plannedAmount

  // 如果计划金额为0，认为是已平衡
  if (plannedAmount === 0) {
    return {
      type: 'balanced',
      percentageDiff: 0,
      amountDiff: 0
    }
  }

  // 计算差异百分比
  const diffPercentage = (Math.abs(amountDiff) / plannedAmount) * 100

  // 检查是否在阈值范围内
  if (diffPercentage <= threshold) {
    return {
      type: 'balanced',
      percentageDiff: 0,
      amountDiff: 0
    }
  }

  // 超过阈值，需要调整
  if (amountDiff > 0) {
    // 实际金额过多，需要减持
    return {
      type: 'need-sell',
      percentageDiff: actualPercentage - plannedPercentage,
      amountDiff: Math.abs(amountDiff)
    }
  } else {
    // 实际金额不足，需要补仓
    return {
      type: 'need-buy',
      percentageDiff: actualPercentage - plannedPercentage,
      amountDiff: Math.abs(amountDiff)
    }
  }
}

/**
 * 计算所有资产的总实际金额
 * @param assets - 资产列表
 * @returns 总实际金额
 */
export function calculateTotalActualAmount(
  assets: AssetAllocationItem[]
): number {
  return assets.reduce((sum, asset) => sum + asset.actualAmount, 0)
}

/**
 * 计算所有资产的总计划比例
 * @param assets - 资产列表
 * @param excludeId - 排除的资产ID（编辑时使用）
 * @returns 总计划比例
 */
export function calculateTotalPlannedPercentage(
  assets: AssetAllocationItem[],
  excludeId?: string
): number {
  return assets
    .filter(asset => asset.id !== excludeId)
    .reduce((sum, asset) => sum + asset.plannedPercentage, 0)
}

/**
 * 更新单个资产的计算字段
 *
 * 自动计算：
 * - 计划金额 = 计划比例 × 总投资金额 / 100
 * - 实际比例 = 实际金额 / 总实际金额 × 100
 * - 偏离度状态和金额
 *
 * @param asset - 资产对象
 * @param totalAmount - 总投资金额
 * @param totalActualAmount - 总实际金额
 * @param threshold - 偏离度阈值（默认5%）
 * @returns 更新后的资产对象
 */
export function updateAssetCalculations(
  asset: AssetAllocationItem,
  totalAmount: number,
  totalActualAmount: number,
  threshold: number = 5
): AssetAllocationItem {
  // 计算计划金额
  const plannedAmount = (asset.plannedPercentage * totalAmount) / 100

  // 计算实际比例
  const actualPercentage = calculateActualPercentage(
    asset.actualAmount,
    totalActualAmount
  )

  // 计算偏离度
  const deviation = calculateDeviation(
    asset.plannedPercentage,
    actualPercentage,
    plannedAmount,
    asset.actualAmount,
    threshold
  )

  return {
    ...asset,
    plannedAmount,
    actualPercentage,
    suggestion: deviation.type,
    suggestionAmount: deviation.amountDiff
  }
}

/**
 * 批量更新所有资产的计算字段
 *
 * 先计算总实际金额，然后逐个更新每个资产
 *
 * @param assets - 资产列表
 * @param totalAmount - 总投资金额
 * @param threshold - 偏离度阈值（默认5%）
 * @returns 更新后的资产列表
 */
export function updateAllAssetsCalculations(
  assets: AssetAllocationItem[],
  totalAmount: number,
  threshold: number = 5
): AssetAllocationItem[] {
  // 计算总实际金额
  const totalActualAmount = calculateTotalActualAmount(assets)

  // 更新每个资产
  return assets.map(asset =>
    updateAssetCalculations(asset, totalAmount, totalActualAmount, threshold)
  )
}
