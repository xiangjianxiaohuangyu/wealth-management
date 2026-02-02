/**
 * 投资记录卡片组件
 *
 * 显示单个资产卡片及其记录行
 */

import { useState, useMemo } from 'react'
import { Card } from '../common/Card/Card'
import { InvestmentRecordTable } from './InvestmentRecordTable'
import type { InvestmentRecordCard as InvestmentRecordCardType, InvestmentRecordRowUpdate } from '../../types/investmentRecord.types'
import './InvestmentRecordCard.css'

export interface InvestmentRecordCardProps {
  /** 卡片数据 */
  card: InvestmentRecordCardType
  /** 总收入（用于计算规划金额） */
  totalInvestment: number
  /** 更新卡片名称 */
  onNameUpdate: (cardId: string, name: string) => void
  /** 添加行 */
  onAddRow: (cardId: string) => void
  /** 更新行 */
  onRowUpdate: (cardId: string, rowId: string, updates: InvestmentRecordRowUpdate) => void
  /** 删除行 */
  onRowDelete: (cardId: string, rowId: string) => void
  /** 删除卡片 */
  onDelete: (cardId: string) => void
}

export function InvestmentRecordCard({
  card,
  totalInvestment,
  onNameUpdate,
  onAddRow,
  onRowUpdate,
  onRowDelete,
  onDelete
}: InvestmentRecordCardProps) {

  const [cardName, setCardName] = useState(card.name)

  // 计算卡片完成度
  const cardProgress = useMemo(() => {
    // 计算总规划金额（总收入 × 规划比例）
    const totalPlanned = card.rows.reduce((sum, row) => {
      return sum + (totalInvestment * row.plannedPercentage / 100)
    }, 0)

    // 计算总实际金额
    const totalActual = card.rows.reduce((sum, row) => sum + row.actualAmount, 0)

    // 计算完成百分比
    const percentage = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0

    return {
      totalPlanned,
      totalActual,
      percentage: Math.min(percentage, 100)
    }
  }, [card.rows, totalInvestment])

  // 确定进度颜色
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#00b894' // 绿色
    if (percentage >= 80) return '#fdcb6e'  // 黄色
    return '#0984e3'                        // 蓝色
  }

  const handleNameBlur = () => {
    if (cardName.trim() && cardName !== card.name) {
      onNameUpdate(card.id, cardName.trim())
    } else {
      setCardName(card.name) // 恢复原名称
    }
  }

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur()
    }
  }

  const handleAddRow = () => {
    onAddRow(card.id)
  }

  const handleRowUpdate = (rowId: string, updates: InvestmentRecordRowUpdate) => {
    onRowUpdate(card.id, rowId, updates)
  }

  const handleRowDelete = (rowId: string) => {
    onRowDelete(card.id, rowId)
  }

  const handleDelete = () => {
    onDelete(card.id)
  }

  return (
    <Card className="investment-record-card">
      {/* 卡片头部 */}
      <div className="investment-record-card__header">
        <div className="investment-record-card__title-section">
          <input
            type="text"
            className="investment-record-card__name-input"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyPress}
            placeholder="输入资产名称"
          />
          {/* 进度指示器 */}
          {cardProgress.totalPlanned > 0 && (
            <div
              className="investment-record-card__progress-badge"
              style={{ backgroundColor: getProgressColor(cardProgress.percentage) }}
            >
              {cardProgress.percentage.toFixed(0)}%
            </div>
          )}
        </div>
        <div className="investment-record-card__actions">
          <button
            className="investment-record-card__btn investment-record-card__btn--add"
            onClick={handleAddRow}
          >
            + 添加行
          </button>
          <button
            className="investment-record-card__btn investment-record-card__btn--delete"
            onClick={handleDelete}
          >
            删除
          </button>
        </div>
      </div>

      {/* 表格区域 */}
      <InvestmentRecordTable
        rows={card.rows}
        totalInvestment={totalInvestment}
        onRowUpdate={handleRowUpdate}
        onRowDelete={handleRowDelete}
      />
    </Card>
  )
}
