/**
 * 图表数据服务
 *
 * 提供图表数据的转换和计算逻辑
 */

import type { PieDataItem, LineSeries } from '../../components/charts/charts.types'
import type { Asset, Transaction, AssetCategory } from '../../types/wealth.types'
import { ASSET_CATEGORY_LABELS } from '../../utils/constants'

/**
 * 图表数据服务类
 */
class ChartDataService {
  /**
   * 将资产数据转换为饼图数据
   */
  assetsToPieData(assets: Asset[]): PieDataItem[] {
    // 按类别分组
    const categoryMap = new Map<AssetCategory, number>()

    assets.forEach(asset => {
      const current = categoryMap.get(asset.category) || 0
      categoryMap.set(asset.category, current + asset.value)
    })

    // 转换为饼图数据格式
    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      name: ASSET_CATEGORY_LABELS[category] || category,
      value
    }))
  }

  /**
   * 将交易数据转换为收支趋势折线图数据
   */
  transactionsToLineData(
    transactions: Transaction[],
    groupBy: 'day' | 'week' | 'month' = 'month'
  ): LineSeries[] {
    // 按日期分组
    const dateMap = new Map<string, { income: number; expense: number }>()

    transactions.forEach(transaction => {
      const date = this.formatDateByGroup(transaction.date, groupBy)
      const current = dateMap.get(date) || { income: 0, expense: 0 }

      if (transaction.type === 'income') {
        current.income += transaction.amount
      } else {
        current.expense += transaction.amount
      }

      dateMap.set(date, current)
    })

    // 排序日期
    const sortedDates = Array.from(dateMap.keys()).sort()

    // 构建折线图数据
    return [
      {
        name: '收入',
        data: sortedDates.map(date => ({
          x: date,
          y: dateMap.get(date)!.income
        })),
        color: '#00b894'
      },
      {
        name: '支出',
        data: sortedDates.map(date => ({
          x: date,
          y: dateMap.get(date)!.expense
        })),
        color: '#d63031'
      }
    ]
  }

  /**
   * 按类别分组交易数据
   */
  groupTransactionsByCategory(
    transactions: Transaction[],
    type: 'income' | 'expense'
  ): PieDataItem[] {
    const categoryMap = new Map<string, number>()

    transactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0
        categoryMap.set(transaction.category, current + transaction.amount)
      })

    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      name: category,
      value
    }))
  }

  /**
   * 计算资产增长趋势
   */
  calculateAssetGrowth(
    assets: Asset[],
    historicalData?: Array<{ date: string; value: number }>
  ): LineSeries {
    if (!historicalData || historicalData.length === 0) {
      return {
        name: '总资产',
        data: [{ x: '现在', y: assets.reduce((sum, a) => sum + a.value, 0) }]
      }
    }

    return {
      name: '总资产',
      data: historicalData.map(item => ({
        x: item.date,
        y: item.value
      })),
      smooth: true
    }
  }

  /**
   * 计算月度收支对比
   */
  calculateMonthlyComparison(
    transactions: Transaction[],
    months: number = 6
  ): LineSeries[] {
    const now = new Date()
    const monthlyData: Array<{ month: string; income: number; expense: number }> = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate.getFullYear() === date.getFullYear() && tDate.getMonth() === date.getMonth()
      })

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      monthlyData.push({ month: monthKey, income, expense })
    }

    return [
      {
        name: '收入',
        data: monthlyData.map(d => ({ x: d.month, y: d.income }))
      },
      {
        name: '支出',
        data: monthlyData.map(d => ({ x: d.month, y: d.expense }))
      }
    ]
  }

  /**
   * 根据分组方式格式化日期
   */
  private formatDateByGroup(date: string, groupBy: 'day' | 'week' | 'month'): string {
    const d = new Date(date)

    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0]
      case 'week':
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay())
        return weekStart.toISOString().split('T')[0]
      case 'month':
      default:
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
  }
}

/**
 * 导出单例实例
 */
export const chartDataService = new ChartDataService()
