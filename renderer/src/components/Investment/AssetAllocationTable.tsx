/**
 * 总投资金额输入组件
 *
 * 功能：
 * - 显示总投资金额输入
 * - 支持千分位格式化
 * - 投资组合管理
 */

import { useState } from 'react'
import { Card } from '../common/Card'
import { TotalInvestmentInput } from './TotalInvestmentInput'
import { PortfolioCard } from './PortfolioCard'
import type { AssetAllocationItem } from '../../types/investment.types'
import './AssetAllocationTable.css'

interface TotalInvestmentProps {
  /** 初始总投资金额 */
  initialAmount?: number
  /** 金额变化回调 */
  onChange?: (amount: number) => void
}

export function AssetAllocationTable({
  initialAmount = 0,
  onChange
}: TotalInvestmentProps) {
  const [totalAmount, setTotalAmount] = useState(initialAmount)
  const [assets, setAssets] = useState<AssetAllocationItem[]>([])

  // 总投资金额变化
  const handleTotalAmountChange = (value: number) => {
    setTotalAmount(value)
    onChange?.(value)
  }

  // 资产列表变化
  const handleAssetsChange = (newAssets: AssetAllocationItem[]) => {
    setAssets(newAssets)
  }

  return (
    <>
      {/* 总投资金额卡片 */}
      <Card className="total-investment-card">
        <div className="total-investment-card__content">
          <label className="total-investment-card__label">总投资金额</label>
          <TotalInvestmentInput
            value={totalAmount}
            onChange={handleTotalAmountChange}
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
