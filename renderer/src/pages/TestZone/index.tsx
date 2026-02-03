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
import { TestZoneWorkspace } from '../../components/TestZone/TestZoneWorkspace'
import { TestZoneSettings } from '../../components/TestZone/TestZoneSettings'
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
            className="testzone__settings-btn"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙️ 设置
          </button>
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
    </div>
  )
}
