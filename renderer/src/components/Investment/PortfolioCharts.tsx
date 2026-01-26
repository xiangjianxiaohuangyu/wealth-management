/**
 * 投资组合图表组件
 *
 * 显示两张环形图：
 * 1. 计划配置 - 基于计划金额
 * 2. 实际配置 - 基于实际金额
 */

import { PieChart } from '../charts'
import type { AssetAllocationItem } from '../../types/investment.types'
import './PortfolioCharts.css'

export interface PortfolioChartsProps {
  /** 资产列表 */
  assets: AssetAllocationItem[]
  /** 总投资金额 */
  totalAmount: number
}

export function PortfolioCharts({ assets, totalAmount }: PortfolioChartsProps) {
  // 计算所有资产的计划比例总和
  const totalPlannedPercentage = assets.reduce((sum, asset) => sum + asset.plannedPercentage, 0)

  // 计划配置数据
  const plannedData = assets
    .filter(asset => asset.plannedAmount > 0)
    .map(asset => ({
      name: asset.name,
      value: asset.plannedAmount,
      color: asset.color
    }))

  // 添加未分配部分
  if (totalPlannedPercentage < 100 && totalAmount > 0) {
    const unallocatedPercentage = 100 - totalPlannedPercentage
    const unallocatedAmount = (unallocatedPercentage * totalAmount) / 100
    plannedData.push({
      name: '未分配',
      value: unallocatedAmount,
      color: '#b2bec3' // 灰色
    })
  }

  // 实际配置数据（基于实际金额）
  const actualData = assets
    .filter(asset => asset.actualAmount > 0)
    .map(asset => ({
      name: asset.name,
      value: asset.actualAmount,
      color: asset.color
    }))

  const hasData = assets.length > 0

  return (
    <div className="portfolio-charts">
      <div className="portfolio-charts__container">
        {/* 计划配置环形图 */}
        <div className="portfolio-charts__chart">
          <PieChart
            data={plannedData}
            centerText="计划配置"
            donut={true}
            radius={['40%', '75%']}
            height={300}
            showLegend={false}
            showPercentage={true}
            empty={!hasData}
            emptyText="暂无计划配置"
          />
        </div>

        {/* 实际配置环形图 */}
        <div className="portfolio-charts__chart">
          <PieChart
            data={actualData}
            centerText="实际配置"
            donut={true}
            radius={['40%', '75%']}
            height={300}
            showLegend={false}
            showPercentage={true}
            empty={!hasData}
            emptyText="暂无实际配置"
          />
        </div>
      </div>
    </div>
  )
}
