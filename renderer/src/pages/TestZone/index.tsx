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
import { TestZoneWorkspace } from '../../components/TestZone/TestZoneWorkspace'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'
import { useNumberAnimation } from '../../hooks/useNumberAnimation'
import { eventBus } from '../../utils/eventBus'
import './TestZone.css'

export default function TestZone() {
  const [records, setRecords] = useState<MonthlyAssetRecord[]>([])
  const [forceAnimationKey, setForceAnimationKey] = useState(0)

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

  const stats = [
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

  return (
    <div className="testzone">
      <div className="testzone__header">
        <h1 className="testzone__title">测试区</h1>
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
          totalIncome={finalTotalIncome}
          totalInvestment={finalInvestment}
        />
      </div>
    </div>
  )
}
