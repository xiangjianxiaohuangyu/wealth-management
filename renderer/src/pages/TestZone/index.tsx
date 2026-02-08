/**
 * 测试区页面
 *
 * 功能：
 * - 显示总收入和总投资金额统计卡片
 * - 提供工作区用于管理表格
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card } from '../../components/common/Card'
import { formatCurrency } from '../../utils/format/currency'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import { testZoneSettingsStorage } from '../../services/storage/testZoneSettingsStorage'
import { testZoneStorage } from '../../services/storage/testZoneStorage'
import { TestZoneWorkspace } from '../../components/TestZone/TestZoneWorkspace'
import { TestZoneSettings } from '../../components/TestZone/TestZoneSettings'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { exportTestData, importTestData, downloadJsonFile, readJsonFile } from '../../utils/testZoneImportExport'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'
import type { CalculationMethod } from '../../types/testZoneSettings.types'
import { useNumberAnimation } from '../../hooks/useNumberAnimation'
import { eventBus } from '../../utils/eventBus'
import type { TestZoneWorkspaceRef } from '../../components/TestZone/TestZoneWorkspace'
import './TestZone.css'

export default function TestZone() {
  const [records, setRecords] = useState<MonthlyAssetRecord[]>([])
  const [forceAnimationKey, setForceAnimationKey] = useState(0)
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('total-income')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workspaceRef = useRef<TestZoneWorkspaceRef>(null)

  // 监听 records 变化
  const prevRecordsHashRef = useRef<string>('')

  // 计算 records 的哈希值来检测内容变化
  const recordsHash = useMemo(() => {
    return JSON.stringify(records)
  }, [records])

  useEffect(() => {
    // 加载资产跟踪数据
    const loadData = () => {
      setRecords(assetTrackingStorage.getAllRecords())
    }

    loadData()

    // 监听资产跟踪数据变化
    eventBus.on('asset-tracking-changed', loadData)

    return () => {
      eventBus.off('asset-tracking-changed', loadData)
    }
  }, [])

  // 加载测试区设置
  useEffect(() => {
    const loadSettings = () => {
      setCalculationMethod(testZoneSettingsStorage.getCalculationMethod())
    }

    loadSettings()

    // 监听设置变化
    const handleSettingsChange = () => {
      loadSettings()
    }
    eventBus.on('testzone-settings-changed', handleSettingsChange)

    return () => {
      eventBus.off('testzone-settings-changed', handleSettingsChange)
    }
  }, [])

  useEffect(() => {
    // 如果 records 内容发生变化，触发动画
    if (recordsHash !== prevRecordsHashRef.current) {
      prevRecordsHashRef.current = recordsHash
      setForceAnimationKey(prev => prev + 1)
    }
  }, [recordsHash])

  // 计算总收入（所有月度记录的总收入之和）
  const baseTotalIncome = records.reduce((sum, r) => sum + r.totalIncome, 0)

  // 计算总投资金额（基础值）
  const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)

  // 获取所有调整记录
  const allAdjustments = assetTrackingStorage.getAllAdjustments()

  // 计算投资的调整值
  const investmentAdjustments = allAdjustments
    .filter(a => a.type === 'investment')
    .reduce((sum, adj) => sum + adj.amount, 0)

  // 最终显示值
  const finalTotalIncome = baseTotalIncome
  const finalInvestment = baseInvestment + investmentAdjustments

  // 应用数字动画
  const animatedTotalIncome = useNumberAnimation(finalTotalIncome, 1500, forceAnimationKey > 0)
  const animatedInvestment = useNumberAnimation(finalInvestment, 1500, forceAnimationKey > 0)

  // 根据计算方式过滤显示的卡片
  const allStats = [
    {
      key: 'total-income',
      title: '总收入',
      value: formatCurrency(animatedTotalIncome, 'CNY'),
      icon: '💵',
      color: 'info'
    },
    {
      key: 'investment',
      title: '总投资金额',
      value: formatCurrency(animatedInvestment, 'CNY'),
      icon: '📈',
      color: 'primary'
    }
  ]

  const stats = allStats.filter(stat => {
    // 如果选择"根据总收入计算"，只显示总收入卡片
    if (calculationMethod === 'total-income' && stat.key === 'investment') return false
    // 如果选择"根据总投资金额计算"，只显示总投资金额卡片
    if (calculationMethod === 'total-investment' && stat.key === 'total-income') return false
    return true
  })

  // 处理导出数据
  const handleExport = () => {
    const data = testZoneStorage.getData()
    if (!data) {
      setImportError('暂无数据可导出')
      return
    }
    const jsonString = exportTestData(data)
    const filename = `testzone-data-${new Date().toISOString().split('T')[0]}.json`
    downloadJsonFile(jsonString, filename)
  }

  // 处理导入按钮点击
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const jsonString = await readJsonFile(file)
      setShowImportConfirm(true)
      // 临时存储导入的数据
      ;(window as any).__tempImportData = jsonString
    } catch (error) {
      setImportError('文件读取失败')
    }

    // 清空input以允许重复选择同一文件
    e.target.value = ''
  }

  // 确认导入
  const handleConfirmImport = () => {
    const jsonString = (window as any).__tempImportData
    if (!jsonString) {
      setImportError('导入数据丢失')
      return
    }

    const result = importTestData(jsonString)
    if (result.success && result.data) {
      testZoneStorage.setData(result.data)
      setShowImportConfirm(false)
      delete (window as any).__tempImportData
      setImportError(null)
    } else {
      setImportError(result.error || '导入失败')
      setShowImportConfirm(false)
    }
  }

  return (
    <div className="testzone">
      <div className="testzone__header">
        <h1 className="testzone__title">测试区</h1>
        <div className="testzone__header-actions">
          <button
            className="testzone__add-table-btn"
            onClick={() => workspaceRef.current?.addTable()}
          >
            + 添加表格
          </button>
          <button
            className="testzone__import-btn"
            onClick={handleImportClick}
          >
            📥 导入
          </button>
          <button
            className="testzone__export-btn"
            onClick={handleExport}
          >
            📤 导出
          </button>
          <button
            className="testzone__settings-btn"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙️ 设置
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="testzone__stats">
        {stats.map(stat => (
          <Card
            key={stat.key}
            className={`testzone-stat-card testzone-stat-card--${stat.color}`}
          >
            <div className="testzone-stat-card__icon">{stat.icon}</div>
            <div className="testzone-stat-card__content">
              <div className="testzone-stat-card__title">{stat.title}</div>
              <div className="testzone-stat-card__value">
                {stat.value}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 工作区 */}
      <div className="testzone__workspace">
        <TestZoneWorkspace
          ref={workspaceRef}
          totalIncome={finalTotalIncome}
          totalInvestment={finalInvestment}
        />
      </div>

      {/* 设置弹窗 */}
      <TestZoneSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentMethod={calculationMethod}
        onMethodChange={(method) => {
          setCalculationMethod(method)
          testZoneSettingsStorage.setCalculationMethod(method)
        }}
      />

      {/* 导入确认弹窗 */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        onConfirm={handleConfirmImport}
        title="导入数据"
        message="导入数据将覆盖当前所有测试区数据，确定要继续吗？此操作不可恢复。"
        confirmText="导入"
        cancelText="取消"
        type="danger"
      />

      {/* 错误提示弹窗 */}
      <ConfirmDialog
        isOpen={!!importError}
        onClose={() => setImportError(null)}
        onConfirm={() => setImportError(null)}
        title="提示"
        message={importError || ''}
        confirmText="确定"
        type="info"
      />
    </div>
  )
}
