/**
 * 投资规划页面
 *
 * 功能：
 * - 总投资金额输入
 * - 投资计算器
 */

import { AssetAllocationTable } from '../../components/Investment/AssetAllocationTable'
import { InvestmentCalculator } from '../../components/Investment/InvestmentCalculator'
import './Investment.css'

export default function Investment() {
  const handleAmountChange = (amount: number) => {
    console.log('总投资金额变化:', amount)
    // TODO: 保存到本地存储或发送到后端
  }

  return (
    <div className="investment">
      <h1 className="investment__title">投资规划</h1>

      {/* 总投资金额输入 */}
      <AssetAllocationTable onChange={handleAmountChange} />

      {/* 投资计算器 */}
      <InvestmentCalculator />
    </div>
  )
}
