/**
 * 总投资金额输入组件
 *
 * 功能：
 * - 显示总投资金额输入
 * - 支持千分位格式化
 */

import { useState } from 'react'
import { Card } from '../common/Card'
import { TotalInvestmentInput } from './TotalInvestmentInput'
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

  // 总投资金额变化
  const handleTotalAmountChange = (value: number) => {
    setTotalAmount(value)
    onChange?.(value)
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
    </>
  )
}
