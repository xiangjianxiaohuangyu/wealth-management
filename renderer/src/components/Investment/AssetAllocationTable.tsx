/**
 * 总投资金额输入组件
 *
 * 功能：
 * - 显示总投资金额（从资产跟踪中获取）
 * - 投资组合管理
 * - 数据持久化
 */

import { useState, useEffect, useMemo } from 'react'
import { Card } from '../common/Card'
import { TotalInvestmentInput } from './TotalInvestmentInput'
import { PortfolioCard } from './PortfolioCard'
import type { AssetAllocationItem } from '../../types/investment.types'
import { investmentStorage } from '../../services/storage/investmentStorage'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import './AssetAllocationTable.css'

interface TotalInvestmentProps {
  /** 金额变化回调 */
  onChange?: (amount: number) => void
}

export function AssetAllocationTable({
  onChange
}: TotalInvestmentProps) {
  const [assets, setAssets] = useState<AssetAllocationItem[]>([])

  // 从资产跟踪计算总投资金额
  const totalAmount = useMemo(() => {
    const records = assetTrackingStorage.getAllRecords()
    const allAdjustments = assetTrackingStorage.getAllAdjustments()

    // 计算基础投资金额
    const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)

    // 计算投资调整金额
    const investmentAdjustments = allAdjustments
      .filter(a => a.type === 'investment')
      .reduce((sum, adj) => sum + adj.amount, 0)

    return baseInvestment + investmentAdjustments
  }, [])

  // 初始化：从localStorage加载资产配置
  useEffect(() => {
    const savedAssets = investmentStorage.getAssets()
    if (savedAssets.length > 0) {
      setAssets(savedAssets)
    }
  }, [])

  // 保存资产配置到localStorage（不包含总金额）
  useEffect(() => {
    if (assets.length > 0) {
      investmentStorage.saveAssets(assets)
    }
  }, [assets])

  // 资产列表变化
  const handleAssetsChange = (newAssets: AssetAllocationItem[]) => {
    setAssets(newAssets)
    onChange?.(totalAmount)
  }

  return (
    <>
      {/* 总投资金额卡片 - 只读显示 */}
      <Card className="total-investment-card">
        <div className="total-investment-card__content">
          <label className="total-investment-card__label">
            总投资金额
            <span className="total-investment-card__label-hint">（来自资产跟踪）</span>
          </label>
          <TotalInvestmentInput
            value={totalAmount}
            onChange={() => {}}
            disabled={true}
          />
        </div>
      </Card>

      {/* 投资组合卡片 */}
      <PortfolioCard
        totalAmount={totalAmount}
        assets={assets}
        onAssetsChange={handleAssetsChange}
      />
    </>
  )
}
