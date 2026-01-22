/**
 * 财富数据服务
 *
 * 提供财富数据的计算和处理逻辑
 */

import type {
  Asset,
  Liability,
  Transaction,
  WealthSummary,
  NetWorthSummary,
  AssetAllocation,
  InvestmentCalculatorParams,
  InvestmentResult,
  YearlyInvestmentData
} from '../../types/wealth.types'

/**
 * 计算净资产摘要
 */
export function calculateNetWorth(
  assets: Asset[],
  liabilities: Liability[],
  currency: string = 'CNY'
): NetWorthSummary {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0)
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0)
  const netWorth = totalAssets - totalLiabilities

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    currency: currency as any,
    calculatedAt: new Date().toISOString()
  }
}

/**
 * 计算资产配置
 */
export function calculateAssetAllocation(assets: Asset[]): AssetAllocation[] {
  // 按类别分组
  const categoryMap = new Map<string, number>()

  assets.forEach(asset => {
    const currentValue = categoryMap.get(asset.category) || 0
    categoryMap.set(asset.category, currentValue + asset.value)
  })

  // 计算总资产
  const totalAssets = Array.from(categoryMap.values()).reduce((sum, value) => sum + value, 0)

  // 转换为资产配置格式
  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category: category as any,
    amount,
    percentage: totalAssets > 0 ? (amount / totalAssets) * 100 : 0,
    currency: assets[0]?.currency || ('CNY' as any)
  }))
}

/**
 * 生成财富摘要
 */
export function generateWealthSummary(
  assets: Asset[],
  liabilities: Liability[],
  transactions: Transaction[]
): WealthSummary {
  const netWorth = calculateNetWorth(assets, liabilities)
  const assetAllocation = calculateAssetAllocation(assets)

  // 获取最近的交易记录（最多10条）
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return {
    netWorth,
    assetAllocation,
    assets,
    liabilities,
    recentTransactions
  }
}

/**
 * 投资计算器
 */
export function calculateInvestment(
  params: InvestmentCalculatorParams
): InvestmentResult {
  const {
    principal,
    monthlyContribution,
    annualReturn,
    years,
    compoundFrequency = 12 // 默认每月复利
  } = params

  const yearlyData: YearlyInvestmentData[] = []
  let currentAmount = principal
  let totalContributions = principal

  // 每年计算一次
  for (let year = 1; year <= years; year++) {
    const startAmount = currentAmount

    // 每月复利计算
    for (let month = 1; month <= 12; month++) {
      const monthlyRate = annualReturn / 100 / compoundFrequency
      currentAmount = currentAmount * (1 + monthlyRate) + monthlyContribution
      totalContributions += monthlyContribution
    }

    const yearReturn = currentAmount - startAmount - (monthlyContribution * 12)

    yearlyData.push({
      year,
      startAmount,
      yearReturn,
      endAmount: currentAmount,
      totalContributions
    })
  }

  const finalAmount = currentAmount
  const totalPrincipal = totalContributions
  const totalReturn = finalAmount - totalPrincipal
  const returnPercentage = totalPrincipal > 0 ? (totalReturn / totalPrincipal) * 100 : 0

  return {
    finalAmount,
    totalPrincipal,
    totalReturn,
    returnPercentage,
    yearlyData
  }
}

/**
 * 格式化货币金额
 */
export function formatCurrency(amount: number, currency: string = 'CNY'): string {
  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    HKD: 'HK$'
  }

  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 计算月度收支统计
 */
export function calculateMonthlyStats(transactions: Transaction[], year: number, month: number) {
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getFullYear() === year && date.getMonth() === month - 1
  })

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    income,
    expense,
    net: income - expense,
    transactionCount: monthTransactions.length
  }
}
