/**
 * 测试区表格行组件
 *
 * 功能：
 * - 编辑模式：显示输入框
 * - 实时计算投资金额
 */

import { useState, useEffect } from 'react'
import type { TestZoneRow } from '../../types/testzone.types'
import type { CalculationMethod } from '../../types/testZoneSettings.types'
import './TestZoneTableRow.css'

export interface TestZoneTableRowProps {
  /** 行数据 */
  row: TestZoneRow
  /** 总收入 */
  totalIncome: number
  /** 总投资金额 */
  totalInvestment: number
  /** 保存回调 */
  onSave: (row: TestZoneRow) => void
  /** 删除回调 */
  onDelete?: () => void
  /** 是否处于编辑模式 */
  isEditing?: boolean
  /** 投资金额计算方式 */
  calculationMethod?: CalculationMethod
}

export function TestZoneTableRow({
  row,
  totalIncome,
  totalInvestment,
  onSave,
  onDelete,
  isEditing = false,
  calculationMethod = 'total-income'
}: TestZoneTableRowProps) {
  // 编辑时的临时数据
  const [tempRow, setTempRow] = useState<TestZoneRow>(row)
  const [isCustomAmount, setIsCustomAmount] = useState(false)

  // 当 row 变化时，更新临时数据
  useEffect(() => {
    setTempRow(row)
    setIsCustomAmount(false)
  }, [row.id, row.valueRangeStart, row.valueRangeEnd, row.investmentPercentage, row.actualAmount])

  // 计算投资金额 - 基于全局计算方式
  const calculatedInvestmentAmount = isCustomAmount
    ? tempRow.investmentAmount
    : ((calculationMethod === 'total-investment' ? totalInvestment : totalIncome) * tempRow.investmentPercentage) / 100

  // 当比例或计算方式变化时，自动计算投资金额
  useEffect(() => {
    if (!isCustomAmount) {
      const baseAmount = calculationMethod === 'total-investment' ? totalInvestment : totalIncome
      const calculated = (baseAmount * tempRow.investmentPercentage) / 100
      setTempRow(prev => ({ ...prev, investmentAmount: calculated }))
    }
  }, [tempRow.investmentPercentage, calculationMethod, isCustomAmount, totalIncome, totalInvestment])

  const handleSave = () => {
    onSave(tempRow)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const handleRangeStartChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setTempRow({ ...tempRow, valueRangeStart: numValue })
  }

  const handleRangeEndChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setTempRow({ ...tempRow, valueRangeEnd: numValue })
  }

  const handlePercentageChange = (value: string) => {
    let numValue = parseFloat(value) || 0
    if (numValue < 0) numValue = 0
    if (numValue > 100) numValue = 100
    setTempRow({ ...tempRow, investmentPercentage: numValue })
  }

  const handleInvestmentAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setTempRow({ ...tempRow, investmentAmount: numValue })
    setIsCustomAmount(true)
  }

  const handleActualAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setTempRow({ ...tempRow, actualAmount: numValue })
  }

  return (
    <div className="testzone-table__row">
      {/* 价值区间 */}
      <div className="testzone-table__cell testzone-table__cell--range">
        {isEditing ? (
          <>
            <input
              type="number"
              className="testzone-table__input testzone-table__input--small"
              value={tempRow.valueRangeStart}
              onChange={e => handleRangeStartChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
            />
            <span className="testzone-table__range-separator">--</span>
            <input
              type="number"
              className="testzone-table__input testzone-table__input--small"
              value={tempRow.valueRangeEnd}
              onChange={e => handleRangeEndChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
            />
          </>
        ) : (
          <span className="testzone-table__value">
            {tempRow.valueRangeStart} -- {tempRow.valueRangeEnd}
          </span>
        )}
      </div>

      {/* 投资比例 */}
      <div className="testzone-table__cell testzone-table__cell--input">
        {isEditing ? (
          <div className="testzone-table__input-wrapper">
            <input
              type="number"
              className="testzone-table__input"
              min="0"
              max="100"
              step="0.1"
              value={tempRow.investmentPercentage}
              onChange={e => handlePercentageChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="testzone-table__suffix">%</span>
          </div>
        ) : (
          <span className="testzone-table__value">
            {tempRow.investmentPercentage}%
          </span>
        )}
      </div>

      {/* 投资金额 */}
      <div className="testzone-table__cell testzone-table__cell--input">
        {isEditing ? (
          <div className="testzone-table__input-wrapper">
            <input
              type="number"
              className="testzone-table__input"
              min="0"
              step="100"
              value={Math.round(calculatedInvestmentAmount)}
              onChange={e => handleInvestmentAmountChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="testzone-table__suffix">￥</span>
          </div>
        ) : (
          <span className="testzone-table__value">
            ￥{Math.round(calculatedInvestmentAmount).toLocaleString()}
          </span>
        )}
      </div>

      {/* 实际金额 */}
      <div className="testzone-table__cell testzone-table__cell--input">
        {isEditing ? (
          <div className="testzone-table__input-wrapper">
            <input
              type="number"
              className="testzone-table__input"
              min="0"
              step="100"
              value={tempRow.actualAmount}
              onChange={e => handleActualAmountChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="testzone-table__suffix">￥</span>
          </div>
        ) : (
          <span className="testzone-table__value">
            ￥{tempRow.actualAmount.toLocaleString()}
          </span>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="testzone-table__cell testzone-table__actions">
        {isEditing ? (
          <button
            className="testzone-table__action-btn testzone-table__action-btn--save"
            onClick={handleSave}
          >
            保存
          </button>
        ) : null}
        {onDelete && (
          <button
            className="testzone-table__action-btn testzone-table__action-btn--delete"
            onClick={onDelete}
          >
            删除
          </button>
        )}
      </div>
    </div>
  )
}
