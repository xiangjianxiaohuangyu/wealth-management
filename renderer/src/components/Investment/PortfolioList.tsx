/**
 * 投资组合列表组件
 */

import { Card } from '../common/Card'
import type { PortfolioItem } from '../../pages/Investment/Investment.types'
import { formatCurrency, formatPercentage, formatGrowth } from '../../utils/format/currency'
import './PortfolioList.css'

interface PortfolioListProps {
  /** 投资组合数据 */
  portfolios: PortfolioItem[]
  /** 点击组合的回调 */
  onPortfolioClick?: (portfolio: PortfolioItem) => void
}

export function PortfolioList({ portfolios, onPortfolioClick }: PortfolioListProps) {
  if (portfolios.length === 0) {
    return (
      <Card title="投资组合" className="portfolio-list">
        <p className="portfolio-list__empty">暂无投资组合</p>
      </Card>
    )
  }

  return (
    <Card title="投资组合" className="portfolio-list">
      <div className="portfolio-list__items">
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className="portfolio-list__item"
            onClick={() => onPortfolioClick?.(portfolio)}
            role="button"
            tabIndex={0}
          >
            <div className="portfolio-list__header">
              <div className="portfolio-list__name">{portfolio.name}</div>
              <div
                className={`portfolio-list__return portfolio-list__return--${
                  portfolio.returnRate >= 0 ? 'positive' : 'negative'
                }`}
              >
                {formatGrowth(0, 1 + portfolio.returnRate / 100)}
              </div>
            </div>

            {portfolio.description && (
              <div className="portfolio-list__description">{portfolio.description}</div>
            )}

            <div className="portfolio-list__details">
              <div className="portfolio-list__detail">
                <span className="portfolio-list__label">总价值</span>
                <span className="portfolio-list__value">
                  {formatCurrency(portfolio.totalValue, 'CNY')}
                </span>
              </div>
              <div className="portfolio-list__detail">
                <span className="portfolio-list__label">资产数量</span>
                <span className="portfolio-list__value">{portfolio.assetCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
