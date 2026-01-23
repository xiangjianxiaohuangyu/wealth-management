/**
 * 财富摘要组件
 *
 * 显示总资产、总负债和净资产的概览卡片
 */

import { Card } from '../common/Card'
import type { StatCard } from '../../pages/WealthOverview/Dashboard.types'
import { formatCurrency } from '../../utils/format/currency'
import './WealthSummary.css'

interface WealthSummaryProps {
  /** 总资产 */
  totalAssets: number
  /** 总负债 */
  totalLiabilities: number
  /** 净资产 */
  netWorth: number
  /** 货币类型 */
  currency?: string
}

export function WealthSummary({
  totalAssets,
  totalLiabilities,
  netWorth,
  currency = 'CNY'
}: WealthSummaryProps) {
  const stats: StatCard[] = [
    {
      title: '总资产',
      value: formatCurrency(totalAssets, currency as any),
      icon: '💰',
      color: 'success'
    },
    {
      title: '总负债',
      value: formatCurrency(totalLiabilities, currency as any),
      icon: '📊',
      color: 'danger'
    },
    {
      title: '净资产',
      value: formatCurrency(netWorth, currency as any),
      icon: '💎',
      color: 'primary'
    }
  ]

  return (
    <div className="wealth-summary">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`wealth-summary__card wealth-summary__card--${stat.color}`}
        >
          <div className="wealth-summary__icon">{stat.icon}</div>
          <div className="wealth-summary__content">
            <div className="wealth-summary__title">{stat.title}</div>
            <div className="wealth-summary__value">{stat.value}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
