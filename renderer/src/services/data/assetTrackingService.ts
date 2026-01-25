/**
 * 资产跟踪业务逻辑服务
 *
 * 提供资产跟踪数据的计算和处理逻辑
 */

import type {
  MonthlyAssetRecord,
  CumulativeAssetData,
  MonthlySummary,
  AssetTrendAnalysis
} from '../../types/assetTracking.types'

/**
 * 计算累计资产数据
 */
export function calculateCumulativeAssets(
  records: MonthlyAssetRecord[]
): CumulativeAssetData[] {
  // 按时间排序
  const sortedRecords = [...records].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  let cumulativeSavings = 0
  let cumulativeInvestment = 0

  return sortedRecords.map(record => {
    cumulativeSavings += record.savings
    cumulativeInvestment += record.investment

    return {
      month: `${record.year}-${String(record.month).padStart(2, '0')}`,
      cumulativeSavings,
      cumulativeInvestment,
      totalAssets: cumulativeSavings + cumulativeInvestment
    }
  })
}

/**
 * 生成月度摘要
 */
export function generateMonthlySummaries(
  records: MonthlyAssetRecord[]
): MonthlySummary[] {
  return records.map(record => {
    const savingsRate = record.totalIncome > 0
      ? (record.savings / record.totalIncome) * 100
      : 0
    const investmentRate = record.totalIncome > 0
      ? (record.investment / record.totalIncome) * 100
      : 0

    return {
      month: `${record.year}-${String(record.month).padStart(2, '0')}`,
      income: record.totalIncome,
      consumption: record.consumption,
      savings: record.savings,
      investment: record.investment,
      savingsRate,
      investmentRate
    }
  })
}

/**
 * 分析资产趋势
 */
export function analyzeAssetTrend(
  records: MonthlyAssetRecord[]
): AssetTrendAnalysis | null {
  if (records.length === 0) return null

  const monthlySummaries = generateMonthlySummaries(records)

  // 计算平均存款率和投资率
  const avgSavingsRate = monthlySummaries.reduce((sum, m) => sum + m.savingsRate, 0) / monthlySummaries.length
  const avgInvestmentRate = monthlySummaries.reduce((sum, m) => sum + m.investmentRate, 0) / monthlySummaries.length

  // 计算总资产增长
  const cumulativeData = calculateCumulativeAssets(records)
  const firstAsset = cumulativeData[0]?.totalAssets || 0
  const lastAsset = cumulativeData[cumulativeData.length - 1]?.totalAssets || 0
  const totalAssetGrowth = lastAsset - firstAsset

  // 计算月均增长
  const monthlyAvgGrowth = records.length > 1 ? totalAssetGrowth / (records.length - 1) : 0

  return {
    monthlyData: monthlySummaries,
    avgSavingsRate,
    avgInvestmentRate,
    totalAssetGrowth,
    monthlyAvgGrowth
  }
}

/**
 * 验证月度记录数据
 */
export function validateMonthlyRecord(data: {
  totalIncome: number
  consumption: number
  savings: number
  investment: number
}): { valid: boolean; error?: string } {
  if (data.totalIncome < 0) {
    return { valid: false, error: '总收入不能为负数' }
  }

  if (data.consumption < 0) {
    return { valid: false, error: '消费金额不能为负数' }
  }

  if (data.savings < 0) {
    return { valid: false, error: '存款金额不能为负数' }
  }

  if (data.investment < 0) {
    return { valid: false, error: '投资金额不能为负数' }
  }

  const totalAllocation = data.consumption + data.savings + data.investment

  if (totalAllocation > data.totalIncome) {
    return {
      valid: false,
      error: `消费+存款+投资的总和（¥${totalAllocation.toFixed(2)}）不能超过总收入（¥${data.totalIncome.toFixed(2)}）`
    }
  }

  return { valid: true }
}
