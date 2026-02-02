/**
 * 投资记录统计面板组件
 *
 * 显示整体投资状况的统计信息
 */

import type { InvestmentRecordData } from '../../types/investmentRecord.types'
import { formatCurrency } from '../../utils/format/currency'
import './StatisticsPanel.css'

export interface StatisticsPanelProps {
  /** 投资记录数据 */
  data: InvestmentRecordData
  /** 总投资金额（来自资产跟踪） */
  totalInvestment: number
  /** 总收入（用于计算规划金额） */
  totalIncome: number
}

export function StatisticsPanel({ data, totalInvestment, totalIncome }: StatisticsPanelProps) {
  // 计算统计数据
  const stats = {
    // 已投入金额（所有卡片中所有行的实际投入总和）
    totalActualAmount: data.cards.reduce((sum, card) => {
      return sum + card.rows.reduce((rowSum, row) => rowSum + row.actualAmount, 0)
    }, 0),

    // 总规划金额（总收入 × 各行规划比例之和）
    totalPlannedAmount: data.cards.reduce((sum, card) => {
      return sum + card.rows.reduce((rowSum, row) => {
        return rowSum + (totalIncome * row.plannedPercentage / 100)
      }, 0)
    }, 0),

    // 记录行总数
    totalRows: data.cards.reduce((sum, card) => sum + card.rows.length, 0),

    // 已填写的行数（至少有一个字段不为0）
    filledRows: data.cards.reduce((sum, card) => {
      return sum + card.rows.filter(row =>
        row.startPoint > 0 ||
        row.endPoint > 0 ||
        row.plannedPercentage > 0 ||
        row.actualAmount > 0
      ).length
    }, 0)
  }

  // 计算资金使用率（已投入金额 / 总投资金额）
  const fundUsageRate = totalInvestment > 0
    ? (stats.totalActualAmount / totalInvestment) * 100
    : 0

  // 计算数据完整度
  const dataCompleteness = stats.totalRows > 0
    ? (stats.filledRows / stats.totalRows) * 100
    : 100

  // 确定进度条颜色
  const getProgressColor = (rate: number): string => {
    if (rate >= 100) return '#00b894' // 绿色 - 已达标或超额
    if (rate >= 80) return '#fdcb6e'  // 黄色 - 接近目标
    return '#0984e3'                   // 蓝色 - 进行中
  }

  return (
    <div className="statistics-panel">
      {/* 主要统计信息 */}
      <div className="statistics-panel__main">
        <div className="statistics-panel__item">
          <span className="statistics-panel__label">总投资金额</span>
          <span className="statistics-panel__value">
            {formatCurrency(totalInvestment, 'CNY')}
          </span>
        </div>

        <div className="statistics-panel__item">
          <span className="statistics-panel__label">已投入</span>
          <span className="statistics-panel__value">
            {formatCurrency(stats.totalActualAmount, 'CNY')}
          </span>
        </div>

        <div className="statistics-panel__item">
          <span className="statistics-panel__label">资金使用率</span>
          <span className="statistics-panel__value">
            {fundUsageRate.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="statistics-panel__progress-container">
        <div
          className="statistics-panel__progress-bar"
          style={{
            width: `${Math.min(fundUsageRate, 100)}%`,
            backgroundColor: getProgressColor(fundUsageRate)
          }}
        />
      </div>

      {/* 次要统计信息 */}
      <div className="statistics-panel__secondary">
        <div className="statistics-panel__stat">
          <span className="statistics-panel__stat-label">记录总数</span>
          <span className="statistics-panel__stat-value">{stats.totalRows}</span>
        </div>

        <div className="statistics-panel__stat">
          <span className="statistics-panel__stat-label">数据完整度</span>
          <span className={`statistics-panel__stat-value ${dataCompleteness >= 90 ? 'statistics-panel__stat-value--good' : ''}`}>
            {dataCompleteness.toFixed(0)}%
          </span>
          {dataCompleteness >= 90 && (
            <span className="statistics-panel__checkmark">✓</span>
          )}
        </div>
      </div>
    </div>
  )
}
