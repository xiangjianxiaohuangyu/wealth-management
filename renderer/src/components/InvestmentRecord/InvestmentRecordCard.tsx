/**
 * 投资记录卡片组件
 *
 * 显示单个资产卡片及其记录行
 */

import { useState } from 'react'
import { Card } from '../common/Card/Card'
import { InvestmentRecordTable } from './InvestmentRecordTable'
import type { InvestmentRecordCard as InvestmentRecordCardType, InvestmentRecordRowUpdate } from '../../types/investmentRecord.types'
import './InvestmentRecordCard.css'

export interface InvestmentRecordCardProps {
  /** 卡片数据 */
  card: InvestmentRecordCardType
  /** 总投资金额 */
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
        <input
          type="text"
          className="investment-record-card__name-input"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyPress}
          placeholder="输入资产名称"
        />
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
