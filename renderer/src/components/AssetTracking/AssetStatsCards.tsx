/**
 * 资产统计卡片组件
 *
 * 显示资产跟踪的关键指标
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card } from '../common/Card'
import { formatCurrency } from '../../utils/format/currency'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import { AssetDetailModal } from './AssetDetailModal'
import { useNumberAnimation } from '../../hooks/useNumberAnimation'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'
import './AssetStatsCards.css'

export interface AssetStatsCardsProps {
  records: MonthlyAssetRecord[]
  onAssetUpdated: () => void
  /** 是否显示编辑按钮，默认为 true */
  showEditButton?: boolean
}

export function AssetStatsCards({ records, onAssetUpdated, showEditButton = true }: AssetStatsCardsProps) {
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedAssetType, setSelectedAssetType] = useState<'total-income' | 'investment' | 'savings' | 'fixed-asset'>('total-income')
  const [forceAnimationKey, setForceAnimationKey] = useState(0)

  // 监听 records 变化，当添加/编辑/删除月度记录时触发动画
  const prevRecordsHashRef = useRef<string>('')

  // 计算 records 的哈希值来检测内容变化
  const recordsHash = useMemo(() => {
    return JSON.stringify(records)
  }, [records])

  useEffect(() => {
    // 如果 records 内容发生变化，触发动画
    if (recordsHash !== prevRecordsHashRef.current) {
      prevRecordsHashRef.current = recordsHash
      setForceAnimationKey(prev => prev + 1)
    }
  }, [recordsHash])

  // 计算总收入（所有月度记录的总收入之和）
  const baseTotalIncome = records.reduce((sum, r) => sum + r.totalIncome, 0)

  // 计算总存款金额（基础值）
  const baseSavings = records.reduce((sum, r) => sum + r.savings, 0)

  // 计算总投资金额（基础值）
  const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)

  // 获取所有调整记录
  const allAdjustments = assetTrackingStorage.getAllAdjustments()

  // 计算固定资产（只有手动调整）
  const fixedAssetAdjustments = allAdjustments.filter(a => a.type === 'fixed-asset')
  const fixedAssets = fixedAssetAdjustments.reduce((sum, adj) => sum + adj.amount, 0)

  // 计算各项资产的调整值
  const investmentAdjustments = allAdjustments
    .filter(a => a.type === 'investment')
    .reduce((sum, adj) => sum + adj.amount, 0)

  const savingsAdjustments = allAdjustments
    .filter(a => a.type === 'savings')
    .reduce((sum, adj) => sum + adj.amount, 0)

  // 最终显示值
  // 总收入 = 所有月度记录的总收入之和
  const finalTotalIncome = baseTotalIncome
  const finalInvestment = baseInvestment + investmentAdjustments
  const finalSavings = baseSavings + savingsAdjustments

  // 应用数字动画 - 使用 forceAnimationKey 来强制触发动画
  const animatedTotalIncome = useNumberAnimation(finalTotalIncome, 1500, forceAnimationKey > 0)
  const animatedInvestment = useNumberAnimation(finalInvestment, 1500, forceAnimationKey > 0)
  const animatedSavings = useNumberAnimation(finalSavings, 1500, forceAnimationKey > 0)
  const animatedFixedAssets = useNumberAnimation(fixedAssets, 1500, forceAnimationKey > 0)

  const stats = [
    {
      key: 'total-income',
      title: '总收入',
      value: formatCurrency(animatedTotalIncome, 'CNY'),
      icon: '💵',
      color: 'info',
      baseValue: baseTotalIncome,
      adjustments: 0
    },
    {
      key: 'investment',
      title: '投资金额',
      value: formatCurrency(animatedInvestment, 'CNY'),
      icon: '📈',
      color: 'primary',
      baseValue: baseInvestment,
      adjustments: investmentAdjustments
    },
    {
      key: 'savings',
      title: '存款',
      value: formatCurrency(animatedSavings, 'CNY'),
      icon: '💰',
      color: 'success',
      baseValue: baseSavings,
      adjustments: savingsAdjustments
    },
    {
      key: 'fixed-asset',
      title: '固定资产',
      value: formatCurrency(animatedFixedAssets, 'CNY'),
      icon: '🏠',
      color: 'warning',
      baseValue: 0,
      adjustments: fixedAssets
    }
  ]

  const handleOpenDetail = (assetType: typeof selectedAssetType) => {
    setSelectedAssetType(assetType)
    setDetailModalOpen(true)
  }

  // 数据更新时重新触发动画
  const handleAssetUpdatedWithAnimation = () => {
    setForceAnimationKey(prev => prev + 1)
    onAssetUpdated()
  }

  return (
    <>
      <div className="asset-stats-cards">
        {stats.map(stat => (
          <Card
            key={stat.key}
            className={`asset-stats-card asset-stats-card--${stat.color}`}
          >
            <div className="asset-stats-card__icon">{stat.icon}</div>
            <div className="asset-stats-card__content">
              <div className="asset-stats-card__title">{stat.title}</div>
              <div className="asset-stats-card__value">
                {stat.value}
                {showEditButton && stat.key !== 'total-income' && (
                  <button
                    className="asset-stats-card__edit-btn"
                    onClick={() => handleOpenDetail(stat.key as typeof selectedAssetType)}
                    title="修改信息"
                  >
                    ✏️
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AssetDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        assetType={selectedAssetType}
        records={records}
        onAssetUpdated={handleAssetUpdatedWithAnimation}
      />
    </>
  )
}
