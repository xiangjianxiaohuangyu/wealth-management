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
}

export function PortfolioCharts({ assets }: PortfolioChartsProps) {
  // 计划配置数据
  const plannedData = assets
    .filter(asset => asset.plannedAmount > 0)
    .map(asset => ({
      name: asset.name,
      value: asset.plannedAmount
    }))

  // 实际配置数据
  const actualData = assets
    .filter(asset => asset.actualAmount > 0)
    .map(asset => ({
      name: asset.name,
      value: asset.actualAmount
    }))

  const hasData = assets.length > 0

  return (
    <div className="portfolio-charts">
      <div className="portfolio-charts__container">
        {/* 计划配置环形图 */}
        <div className="portfolio-charts__chart">
          <h3 className="portfolio-charts__title">计划配置</h3>
          <PieChart
            data={plannedData}
            donut={true}
            radius={['45%', '75%']}
            height={220}
            showLegend={true}
            showPercentage={true}
            empty={!hasData}
            emptyText="暂无计划配置"
          />
        </div>

        {/* 实际配置环形图 */}
        <div className="portfolio-charts__chart">
          <h3 className="portfolio-charts__title">实际配置</h3>
          <PieChart
            data={actualData}
            donut={true}
            radius={['45%', '75%']}
            height={220}
            showLegend={true}
            showPercentage={true}
            empty={!hasData}
            emptyText="暂无实际配置"
          />
        </div>
      </div>
    </div>
  )
}
