/**
 * 图表数据处理 Hook
 */

import { useMemo } from 'react'
import type { PieDataItem, LineSeries } from '../components/charts/charts.types'
import type { Asset, Transaction } from '../types/wealth.types'

/**
 * 图表数据处理 Hook 的属性
 */
export interface UseChartDataProps {
  /** 资产数据 */
  assets?: Asset[]
  /** 交易记录 */
  transactions?: Transaction[]
  /** 货币类型 */
  currency?: string
}

/**
 * 图表数据处理 Hook 的返回值
 */
export interface UseChartDataReturn {
  /** 资产配置饼图数据 */
  assetAllocationData: PieDataItem[]
  /** 收支趋势折线图数据 */
  incomeExpenseTrendData: LineSeries[]
  /** 按类别分组的收支数据 */
  categoryDistributionData: {
    income: PieDataItem[]
    expense: PieDataItem[]
  }
}

/**
 * 资产类别标签映射
 */
const ASSET_CATEGORY_LABELS: Record<string, string> = {
  cash: '现金',
  stock: '股票',
  fund: '基金',
  bond: '债券',
  real_estate: '房产',
  crypto: '加密货币',
  other: '其他'
}

/**
 * 交易类别标签映射
 */
const TRANSACTION_CATEGORY_LABELS: Record<string, string> = {
  salary: '工资',
  bonus: '奖金',
  investment: '投资收益',
  rent: '房租',
  food: '餐饮',
  transport: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  medical: '医疗',
  education: '教育',
  other: '其他'
}

/**
 * 图表数据处理 Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { assetAllocationData, incomeExpenseTrendData } = useChartData({
 *     assets: myAssets,
 *     transactions: myTransactions
 *   })
 *
 *   return (
 *     <>
 *       <PieChart data={assetAllocationData} title="资产配置" />
 *       <LineChart data={incomeExpenseTrendData} title="收支趋势" />
 *     </>
 *   )
 * }
 * ```
 */
export function useChartData({
  assets = [],
  transactions = [],
  currency: _currency = 'CNY'
}: UseChartDataProps = {}): UseChartDataReturn {

  /**
   * 计算资产配置饼图数据
   */
  const assetAllocationData = useMemo(() => {
    if (!assets || assets.length === 0) return []

    // 按类别分组
    const categoryMap = new Map<string, number>()

    assets.forEach(asset => {
      const category = asset.category
      const currentValue = categoryMap.get(category) || 0
      categoryMap.set(category, currentValue + asset.value)
    })

    // 转换为饼图数据格式
    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      name: ASSET_CATEGORY_LABELS[category] || category,
      value
    }))
  }, [assets])

  /**
   * 计算收支趋势折线图数据
   */
  const incomeExpenseTrendData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    // 按日期分组
    const dateMap = new Map<string, { income: number; expense: number }>()

    transactions.forEach(transaction => {
      const date = transaction.date
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
  }, [transactions])

  /**
   * 计算类别分布饼图数据
   */
  const categoryDistributionData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { income: [], expense: [] }
    }

    // 按类别和类型分组
    const incomeMap = new Map<string, number>()
    const expenseMap = new Map<string, number>()

    transactions.forEach(transaction => {
      const category = transaction.category
      const map = transaction.type === 'income' ? incomeMap : expenseMap
      const current = map.get(category) || 0
      map.set(category, current + transaction.amount)
    })

    // 转换为饼图数据格式
    const incomeData = Array.from(incomeMap.entries()).map(([category, value]) => ({
      name: TRANSACTION_CATEGORY_LABELS[category] || category,
      value
    }))

    const expenseData = Array.from(expenseMap.entries()).map(([category, value]) => ({
      name: TRANSACTION_CATEGORY_LABELS[category] || category,
      value
    }))

    return { income: incomeData, expense: expenseData }
  }, [transactions])

  return {
    assetAllocationData,
    incomeExpenseTrendData,
    categoryDistributionData
  }
}
