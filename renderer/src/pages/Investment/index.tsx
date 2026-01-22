/**
 * 投资规划页面
 */

import { useMemo } from 'react'
import { PortfolioList } from '../../components/Investment/PortfolioList'
import { InvestmentCalculator } from '../../components/Investment/InvestmentCalculator'
import type { InvestmentProps, PortfolioItem } from './Investment.types'
import './Investment.css'

// 示例投资组合数据
const mockPortfolios: PortfolioItem[] = [
  {
    id: '1',
    name: '稳健型组合',
    description: '以债券和货币基金为主，风险较低',
    totalValue: 150000,
    returnRate: 5.2,
    assetCount: 5
  },
  {
    id: '2',
    name: '成长型组合',
    description: '以股票和指数基金为主，追求长期增值',
    totalValue: 280000,
    returnRate: 12.8,
    assetCount: 8
  },
  {
    id: '3',
    name: '激进型组合',
    description: '包含加密货币等高波动资产',
    totalValue: 80000,
    returnRate: -3.5,
    assetCount: 4
  }
]

export default function Investment({ portfolios }: InvestmentProps) {
  const portfolioData = useMemo(() => {
    return portfolios || mockPortfolios
  }, [portfolios])

  const handlePortfolioClick = (portfolio: PortfolioItem) => {
    console.log('点击投资组合:', portfolio)
    // TODO: 打开投资组合详情
  }

  return (
    <div className="investment">
      <h1 className="investment__title">投资规划</h1>

      {/* 投资组合列表 */}
      <PortfolioList
        portfolios={portfolioData}
        onPortfolioClick={handlePortfolioClick}
      />

      {/* 投资计算器 */}
      <InvestmentCalculator />
    </div>
  )
}
