/**
 * 资产跟踪页面
 *
 * 记录和追踪每月资产变化
 */

import { useState, useMemo, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { LineChart } from '../../components/charts'
import { ConfirmDialog } from '../../components/Investment/ConfirmDialog'
import { MonthlyRecordForm } from '../../components/AssetTracking/MonthlyRecordForm'
import { AssetRecordTable } from '../../components/AssetTracking/AssetRecordTable'
import { AssetStatsCards } from '../../components/AssetTracking/AssetStatsCards'
import { ChartSettingsModal } from '../../components/AssetTracking/ChartSettingsModal'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import { calculateCumulativeAssets } from '../../services/data/assetTrackingService'
import { CHART_COLORS } from '../../utils/constants'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'
import './AssetTracking.css'

export default function AssetTracking() {
  const [records, setRecords] = useState<MonthlyAssetRecord[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MonthlyAssetRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false)

  // 图表显示设置
  const [chartSettings, setChartSettings] = useState({
    totalAssets: true,
    investment: true,
    savings: true,
    fixedAssets: true
  })

  // 加载数据
  useEffect(() => {
    const loadRecords = () => {
      const allRecords = assetTrackingStorage.getAllRecords()
      setRecords(allRecords)
    }
    loadRecords()
  }, [])

  // 计算累计资产数据（用于折线图）
  const chartData = useMemo(() => {
    const cumulativeData = calculateCumulativeAssets(records)
    const allAdjustments = assetTrackingStorage.getAllAdjustments()

    // 计算固定资产补充记录
    const fixedAssetAdjustments = allAdjustments.filter(a => a.type === 'fixed-asset')

    const data: any[] = []

    // 总资产
    if (chartSettings.totalAssets) {
      data.push({
        name: '总资产',
        data: cumulativeData.map(d => {
          // 计算到当前月份为止的固定资产总和
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
    }

    // 投资金额
    if (chartSettings.investment) {
      data.push({
        name: '投资金额',
        data: cumulativeData.map(d => ({ x: d.month, y: d.cumulativeInvestment })),
        color: CHART_COLORS[0],
        smooth: true
      })
    }

    // 存款
    if (chartSettings.savings) {
      data.push({
        name: '存款',
        data: cumulativeData.map(d => ({ x: d.month, y: d.cumulativeSavings })),
        color: CHART_COLORS[2],
        smooth: true
      })
    }

    // 固定资产
    if (chartSettings.fixedAssets) {
      data.push({
        name: '固定资产',
        data: cumulativeData.map(d => {
          // 计算到当前月份为止的固定资产总和
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
    }

    return data
  }, [records, chartSettings])

  // 添加新记录
  const handleAddRecord = (data: Omit<MonthlyAssetRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: MonthlyAssetRecord = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    assetTrackingStorage.addRecord(newRecord)
    setRecords(assetTrackingStorage.getAllRecords())
    setIsFormOpen(false)
  }

  // 更新记录
  const handleUpdateRecord = (id: string, data: Partial<MonthlyAssetRecord>) => {
    assetTrackingStorage.updateRecord(id, data)
    setRecords(assetTrackingStorage.getAllRecords())
    setEditingRecord(null)
    setIsFormOpen(false)
  }

  // 资产更新后的回调（刷新数据）
  const handleAssetUpdated = () => {
    setRecords(assetTrackingStorage.getAllRecords())
  }

  // 删除记录
  const handleDeleteRecord = (id: string) => {
    setRecordToDelete(id)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = () => {
    if (recordToDelete) {
      assetTrackingStorage.deleteRecord(recordToDelete)
      setRecords(assetTrackingStorage.getAllRecords())
      setRecordToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // 编辑记录
  const handleEditRecord = (record: MonthlyAssetRecord) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }

  // 关闭表单
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingRecord(null)
  }

  return (
    <div className="asset-tracking">
      <div className="asset-tracking__header">
        <h1 className="asset-tracking__title">资产跟踪</h1>
      </div>

      {/* 统计卡片 */}
      <AssetStatsCards records={records} onAssetUpdated={handleAssetUpdated} />

      {/* 折线图 */}
      <Card
        title="资产趋势"
        className="asset-tracking__chart-card"
        extra={
          <button
            className="asset-tracking__settings-btn"
            onClick={() => setChartSettingsOpen(true)}
            title="图表设置"
          >
            ⚙️
          </button>
        }
      >
        <LineChart
          data={chartData}
          showLegend
          showArea
          showPoints
          height={400}
          yAxisFormatter={(value) => `¥${(value / 10000).toFixed(1)}万`}
        />
      </Card>

      {/* 月度记录列表 */}
      <Card
        title="月度记录"
        className="asset-tracking__table-card"
        extra={
          <Button variant="primary" onClick={() => setIsFormOpen(true)}>
            + 添加月度记录
          </Button>
        }
      >
        <AssetRecordTable
          records={records}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
        />
      </Card>

      {/* 添加/编辑表单弹窗 */}
      <MonthlyRecordForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onAdd={handleAddRecord}
        onUpdate={handleUpdateRecord}
        editingRecord={editingRecord}
        existingRecords={records}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setRecordToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        message="确定要删除这条记录吗？此操作无法撤销。"
        confirmText="删除"
        type="danger"
      />

      {/* 图表设置弹窗 */}
      <ChartSettingsModal
        isOpen={chartSettingsOpen}
        onClose={() => setChartSettingsOpen(false)}
        chartSettings={chartSettings}
        onChartSettingsChange={setChartSettings}
      />
    </div>
  )
}
