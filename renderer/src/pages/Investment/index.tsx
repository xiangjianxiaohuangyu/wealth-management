/**
 * 投资规划页面
 *
 * 功能：
 * - 总投资金额显示（从资产跟踪获取）
 * - 投资计算器
 */

import { AssetAllocationTable } from '../../components/Investment/AssetAllocationTable'
import { InvestmentCalculator } from '../../components/Investment/InvestmentCalculator'
import './Investment.css'

export default function Investment() {
  const handleAmountChange = (amount: number) => {
    console.log('投资金额:', amount)
  }

  return (
    <div className="investment">
      <h1 className="investment__title">投资规划</h1>

      {/* 总投资金额显示（只读，来自资产跟踪） */}
      <AssetAllocationTable onChange={handleAmountChange} />

      {/* 投资计算器 */}
      <InvestmentCalculator />
    </div>
  )
}
