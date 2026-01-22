/**
 * 投资计算器组件
 *
 * 计算复利投资回报
 */

import { useState, useMemo } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import type { InvestmentCalculatorParams, InvestmentResult } from '../../types/wealth.types'
import { calculateInvestment } from '../../services/data/wealthDataService'
import { formatCurrency } from '../../utils/format/currency'
import './InvestmentCalculator.css'

export function InvestmentCalculator() {
  const [params, setParams] = useState<InvestmentCalculatorParams>({
    principal: 10000,
    monthlyContribution: 1000,
    annualReturn: 8,
    years: 10,
    compoundFrequency: 12
  })

  const [result, setResult] = useState<InvestmentResult | null>(null)

  const handleCalculate = () => {
    const calculated = calculateInvestment(params)
    setResult(calculated)
  }

  const handleReset = () => {
    setParams({
      principal: 10000,
      monthlyContribution: 1000,
      annualReturn: 8,
      years: 10,
      compoundFrequency: 12
    })
    setResult(null)
  }

  // 计算结果（初始自动计算一次）
  const calculatedResult = useMemo(() => {
    return result || calculateInvestment(params)
  }, [params, result])

  return (
    <Card title="投资计算器" className="investment-calculator">
      <div className="investment-calculator__content">
        {/* 输入表单 */}
        <div className="investment-calculator__form">
          <div className="investment-calculator__field">
            <label htmlFor="principal">初始本金</label>
            <input
              id="principal"
              type="number"
              value={params.principal}
              onChange={(e) => setParams({ ...params, principal: Number(e.target.value) })}
              min="0"
              step="1000"
            />
          </div>

          <div className="investment-calculator__field">
            <label htmlFor="monthly">每月投入</label>
            <input
              id="monthly"
              type="number"
              value={params.monthlyContribution}
              onChange={(e) => setParams({ ...params, monthlyContribution: Number(e.target.value) })}
              min="0"
              step="100"
            />
          </div>

          <div className="investment-calculator__field">
            <label htmlFor="return">年化收益率 (%)</label>
            <input
              id="return"
              type="number"
              value={params.annualReturn}
              onChange={(e) => setParams({ ...params, annualReturn: Number(e.target.value) })}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="investment-calculator__field">
            <label htmlFor="years">投资年限</label>
            <input
              id="years"
              type="number"
              value={params.years}
              onChange={(e) => setParams({ ...params, years: Number(e.target.value) })}
              min="1"
              max="50"
              step="1"
            />
          </div>

          <div className="investment-calculator__actions">
            <Button variant="primary" onClick={handleCalculate}>
              计算
            </Button>
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          </div>
        </div>

        {/* 计算结果 */}
        {calculatedResult && (
          <div className="investment-calculator__result">
            <h3>计算结果</h3>

            <div className="investment-calculator__summary">
              <div className="investment-calculator__summary-item">
                <span className="investment-calculator__summary-label">最终金额</span>
                <span className="investment-calculator__summary-value">
                  {formatCurrency(calculatedResult.finalAmount, 'CNY')}
                </span>
              </div>

              <div className="investment-calculator__summary-item">
                <span className="investment-calculator__summary-label">总本金</span>
                <span className="investment-calculator__summary-value">
                  {formatCurrency(calculatedResult.totalPrincipal, 'CNY')}
                </span>
              </div>

              <div className="investment-calculator__summary-item">
                <span className="investment-calculator__summary-label">总收益</span>
                <span className="investment-calculator__summary-value investment-calculator__summary-value--highlight">
                  {formatCurrency(calculatedResult.totalReturn, 'CNY')}
                </span>
              </div>

              <div className="investment-calculator__summary-item">
                <span className="investment-calculator__summary-label">收益率</span>
                <span className="investment-calculator__summary-value">
                  {calculatedResult.returnPercentage.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* 年度数据表格 */}
            <div className="investment-calculator__table">
              <table>
                <thead>
                  <tr>
                    <th>年份</th>
                    <th>年初金额</th>
                    <th>年度收益</th>
                    <th>年末金额</th>
                    <th>累计投入</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedResult.yearlyData.map((year) => (
                    <tr key={year.year}>
                      <td>{year.year}</td>
                      <td>{formatCurrency(year.startAmount, 'CNY')}</td>
                      <td className={year.yearReturn >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(year.yearReturn, 'CNY')}
                      </td>
                      <td>{formatCurrency(year.endAmount, 'CNY')}</td>
                      <td>{formatCurrency(year.totalContributions, 'CNY')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
