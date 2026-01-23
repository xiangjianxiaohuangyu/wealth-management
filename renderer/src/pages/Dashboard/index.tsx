/**
 * 财富总览页面
 */

import { useMemo } from 'react'
import { WealthSummary } from '../../components/Dashboard/WealthSummary'
import { AssetAllocation } from '../../components/Dashboard/AssetAllocation'
import { RecentTransactions } from '../../components/Dashboard/RecentTransactions'
import { LineChart } from '../../components/charts'
import type { DashboardProps } from './Dashboard.types'
import { generateWealthSummary } from '../../services/data/wealthDataService'
import { CHART_COLORS } from '../../utils/constants'
import './Dashboard.css'

// 示例数据（实际应用中应从存储或 API 获取）
const mockAssets = [
  { id: '1', name: '现金', category: 'cash' as const, value: 50000, currency: 'CNY' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: '股票投资', category: 'stock' as const, value: 150000, currency: 'CNY' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: '基金', category: 'fund' as const, value: 80000, currency: 'CNY' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: '加密货币', category: 'crypto' as const, value: 30000, currency: 'CNY' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

const mockLiabilities = [
  { id: '1', name: '房贷', category: 'mortgage' as const, amount: 500000, currency: 'CNY' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: '信用卡', category: 'credit_card' as const, amount: 10000, currency: 'CNY' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

const mockTransactions = [
  { id: '1', type: 'income' as const, category: 'salary' as const, amount: 15000, currency: 'CNY' as const, date: '2024-01-15', description: '1月工资', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: '2', type: 'expense' as const, category: 'food' as const, amount: 2000, currency: 'CNY' as const, date: '2024-01-14', description: '餐饮支出', createdAt: '2024-01-14', updatedAt: '2024-01-14' },
  { id: '3', type: 'expense' as const, category: 'shopping' as const, amount: 3000, currency: 'CNY' as const, date: '2024-01-13', description: '购物', createdAt: '2024-01-13', updatedAt: '2024-01-13' },
  { id: '4', type: 'income' as const, category: 'bonus' as const, amount: 5000, currency: 'CNY' as const, date: '2024-01-10', description: '项目奖金', createdAt: '2024-01-10', updatedAt: '2024-01-10' },
  { id: '5', type: 'expense' as const, category: 'transport' as const, amount: 500, currency: 'CNY' as const, date: '2024-01-09', description: '交通费', createdAt: '2024-01-09', updatedAt: '2024-01-09' }
]

export default function Dashboard({ wealthSummary }: DashboardProps) {
  // 使用示例数据生成财富摘要
  const summary = useMemo(() => {
    return wealthSummary || generateWealthSummary(mockAssets, mockLiabilities, mockTransactions)
  }, [wealthSummary])

  // 模拟收支趋势数据
  const trendData = useMemo(() => {
    return [
      {
        name: '收入',
        data: [
          { x: '2024-07', y: 15000 },
          { x: '2024-08', y: 15500 },
          { x: '2024-09', y: 16000 },
          { x: '2024-10', y: 15000 },
          { x: '2024-11', y: 16500 },
          { x: '2024-12', y: 17000 }
        ],
        color: CHART_COLORS[1]
      },
      {
        name: '支出',
        data: [
          { x: '2024-07', y: 8000 },
          { x: '2024-08', y: 8500 },
          { x: '2024-09', y: 9000 },
          { x: '2024-10', y: 7500 },
          { x: '2024-11', y: 9500 },
          { x: '2024-12', y: 10000 }
        ],
        color: CHART_COLORS[3]
      }
    ]
  }, [])

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">财富总览</h1>

      {/* 财富摘要卡片 */}
      <WealthSummary
        totalAssets={summary.netWorth.totalAssets}
        totalLiabilities={summary.netWorth.totalLiabilities}
        netWorth={summary.netWorth.netWorth}
        currency={summary.netWorth.currency}
      />

      {/* 资产配置和收支趋势 */}
      <div className="dashboard__grid">
        <AssetAllocation data={summary.assetAllocation} />

        <div className="dashboard__chart">
          <LineChart
            data={trendData}
            title="收支趋势-更新框修改测试41"
            showLegend
            showArea
            height={300}
          />
        </div>
      </div>

      {/* 最近交易 */}
      <RecentTransactions transactions={summary.recentTransactions} />
    </div>
  )
}
