/**
 * 财富总览页面
 *
 * 显示：
 * 1. 四张统计卡片（总资产、投资金额、存款、固定资产）
 * 2. 资产趋势曲线图
 * 3. 两张环形图（计划配置、实际配置）
 */

import { useState, useEffect, useMemo } from 'react'
import { Card } from '../../components/common/Card'
import { LineChart } from '../../components/charts'
import { AssetStatsCards } from '../../components/AssetTracking/AssetStatsCards'
import { PortfolioCharts } from '../../components/Investment/PortfolioCharts'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import { calculateCumulativeAssets } from '../../services/data/assetTrackingService'
import { investmentStorage } from '../../services/storage/investmentStorage'
import { updateAllAssetsCalculations } from '../../utils/calculation/portfolioCalculation'
import { CHART_COLORS } from '../../utils/constants'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'
import type { AssetAllocationItem } from '../../types/investment.types'
import './Dashboard.css'

export default function Dashboard() {
  const [records, setRecords] = useState<MonthlyAssetRecord[]>([])
  const [assets, setAssets] = useState<AssetAllocationItem[]>([])

  // 加载资产跟踪数据
  useEffect(() => {
    const loadRecords = () => {
      const allRecords = assetTrackingStorage.getAllRecords()
      setRecords(allRecords)
    }
    loadRecords()
  }, [])

  // 加载投资规划数据
  useEffect(() => {
    const loadAssets = () => {
      const savedAssets = investmentStorage.getAssets()
      // 重新计算所有资产
      const recalculatedAssets = updateAllAssetsCalculations(
        savedAssets,
        investmentStorage.getTotalAmount()
      )
      setAssets(recalculatedAssets)
    }
    loadAssets()
  }, [])

  // 计算总资产金额（用于环形图）
  const totalAmount = useMemo(() => {
    const baseSavings = records.reduce((sum, r) => sum + r.savings, 0)
    const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)
    const allAdjustments = assetTrackingStorage.getAllAdjustments()

    const fixedAssetAdjustments = allAdjustments.filter(a => a.type === 'fixed-asset')
    const fixedAssets = fixedAssetAdjustments.reduce((sum, adj) => sum + adj.amount, 0)

    const investmentAdjustments = allAdjustments
      .filter(a => a.type === 'investment')
      .reduce((sum, adj) => sum + adj.amount, 0)

    const savingsAdjustments = allAdjustments
      .filter(a => a.type === 'savings')
      .reduce((sum, adj) => sum + adj.amount, 0)

    return baseSavings + savingsAdjustments + baseInvestment + investmentAdjustments + fixedAssets
  }, [records])

  // 计算累计资产数据（用于折线图）
  const chartData = useMemo(() => {
    const cumulativeData = calculateCumulativeAssets(records)
    const allAdjustments = assetTrackingStorage.getAllAdjustments()

    const fixedAssetAdjustments = allAdjustments.filter(a => a.type === 'fixed-asset')

    const data: any[] = []

    // 总资产
    data.push({
      name: '总资产',
      data: cumulativeData.map(d => {
        const totalFixedAssets = fixedAssetAdjustments
          .filter(adj => {
            const adjDate = new Date(adj.date)
            const currentDate = new Date(d.month)
            return adjDate <= currentDate
          })
          .reduce((sum, adj) => sum + adj.amount, 0)
        return { x: d.month, y: d.totalAssets + totalFixedAssets }
      }),
      color: CHART_COLORS[3],
      smooth: true
    })

    // 投资金额
    data.push({
      name: '投资金额',
      data: cumulativeData.map(d => ({ x: d.month, y: d.cumulativeInvestment })),
      color: CHART_COLORS[0],
      smooth: true
    })

    // 存款
    data.push({
      name: '存款',
      data: cumulativeData.map(d => ({ x: d.month, y: d.cumulativeSavings })),
      color: CHART_COLORS[2],
      smooth: true
    })

    // 固定资产
    data.push({
      name: '固定资产',
      data: cumulativeData.map(d => {
        const totalFixedAssets = fixedAssetAdjustments
          .filter(adj => {
            const adjDate = new Date(adj.date)
            const currentDate = new Date(d.month)
            return adjDate <= currentDate
          })
          .reduce((sum, adj) => sum + adj.amount, 0)
        return { x: d.month, y: totalFixedAssets }
      }),
      color: CHART_COLORS[1],
      smooth: true
    })

    return data
  }, [records])

  // 资产更新后的回调
  const handleAssetUpdated = () => {
    setRecords(assetTrackingStorage.getAllRecords())
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">财富总览</h1>

      {/* 四张统计卡片 */}
      <AssetStatsCards records={records} onAssetUpdated={handleAssetUpdated} showEditButton={false} />

      {/* 资产趋势曲线图 */}
      <Card title="资产趋势" className="dashboard__trend-chart">
        <LineChart
          data={chartData}
          showLegend
          showArea
          showPoints
          height={400}
          yAxisFormatter={(value) => `¥${(value / 10000).toFixed(1)}万`}
        />
      </Card>

      {/* 两张环形图 */}
      <Card title="投资配置" className="dashboard__portfolio-charts">
        <PortfolioCharts assets={assets} totalAmount={totalAmount} />
      </Card>
    </div>
  )
}
