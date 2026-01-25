/**
 * 投资计算器组件
 *
 * 计算复利投资回报
 */

import { useState, useMemo, useEffect } from 'react'
import { Card } from '../common/Card'
import { LineChart } from '../charts'
import type { InvestmentCalculatorParams } from '../../types/wealth.types'
import type { LineSeries } from '../charts/charts.types'
import { calculateInvestment } from '../../services/data/wealthDataService'
import { calculatorStorage } from '../../services/storage/calculatorStorage'
import { formatCurrency } from '../../utils/format/currency'
import './InvestmentCalculator.css'

export function InvestmentCalculator() {
  // 从存储加载初始参数
  const [params, setParams] = useState<InvestmentCalculatorParams>(() => {
    return calculatorStorage.getParams()
  })

  // 当参数变化时保存到存储
  useEffect(() => {
    calculatorStorage.saveParams(params)
  }, [params])

  // 实时计算结果
  const calculatedResult = useMemo(() => {
    return calculateInvestment(params)
  }, [params])

  // 准备线性图数据
  const lineChartData = useMemo((): LineSeries[] => {
    if (!calculatedResult) return []

    const principalData: LineSeries = {
      name: '累计本金',
      data: calculatedResult.yearlyData.map((year) => ({
        x: `第${year.year}年`,
        y: year.totalContributions
      })),
      color: '#5470c6',
      smooth: true
    }

    const totalAmountData: LineSeries = {
      name: '总金额',
      data: calculatedResult.yearlyData.map((year) => ({
        x: `第${year.year}年`,
        y: year.endAmount
      })),
      color: '#91cc75',
      smooth: true
    }

    return [principalData, totalAmountData]
  }, [calculatedResult])

  // 自定义 tooltip 格式化器
  const tooltipFormatter = ((params: any) => {
    let result = `${params[0].axisValue}<br/>`

    // 找到累计本金和总金额
    let principalValue = 0
    let totalAmountValue = 0

    params.forEach((param: any) => {
      const formattedValue = formatCurrency(param.value, 'CNY')
      result += `${param.marker}${param.seriesName}: ${formattedValue}<br/>`

      if (param.seriesName === '累计本金') {
        principalValue = param.value
      } else if (param.seriesName === '总金额') {
        totalAmountValue = param.value
      }
    })

    // 计算并显示投资收益
    const investmentReturn = totalAmountValue - principalValue
    const returnFormatted = formatCurrency(investmentReturn, 'CNY')
    result += `<span style="color: ${investmentReturn >= 0 ? '#00b894' : '#d63031'}">● 投资收益: ${returnFormatted}</span>`

    return result
  })

  return (
    <Card title="投资计算器 - 慢慢变富" className="investment-calculator">
      <div className="investment-calculator__content">
        {/* 输入表单 - 四个输入框在同一行 */}
        <div className="investment-calculator__form">
          <div className="investment-calculator__row">
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
          </div>
        </div>

        {/* 线性图表 - 占据一整行 */}
        {calculatedResult && (
          <div className="investment-calculator__chart">
            <LineChart
              data={lineChartData}
              height={350}
              showLegend={true}
              showArea={false}
              showPoints={true}
              title="本金与总金额趋势"
              tooltipFormatter={tooltipFormatter}
            />
          </div>
        )}

        {/* 计算结果 - 占据一整行 */}
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
