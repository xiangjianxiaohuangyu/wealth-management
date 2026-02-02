/**
 * 投资记录表格组件
 *
 * 显示单个资产卡片中的记录行列表
 */

import { useState } from 'react'
import { formatCurrency } from '../../utils/format/currency'
import type { InvestmentRecordRow, InvestmentRecordRowUpdate } from '../../types/investmentRecord.types'
import {
  validateStartEndPoint,
  validatePercentage,
  validateAmount
} from '../../utils/validation/investmentRecordValidation'
import './InvestmentRecordTable.css'

export interface InvestmentRecordTableProps {
  /** 记录行列表 */
  rows: InvestmentRecordRow[]
  /** 总收入（用于计算规划金额） */
  totalInvestment: number
  /** 更新行数据 */
  onRowUpdate: (rowId: string, updates: InvestmentRecordRowUpdate) => void
  /** 删除行 */
  onRowDelete: (rowId: string) => void
}

export function InvestmentRecordTable({
  rows,
  totalInvestment,
  onRowUpdate,
  onRowDelete
}: InvestmentRecordTableProps) {
  // 管理每行的错误状态
  const [rowErrors, setRowErrors] = useState<Record<string, Record<string, string>>>({})

  // 计算每行的错误信息
  const computeRowErrors = (row: InvestmentRecordRow) => {
    const errors: Record<string, string> = {}

    // 验证起始点和终点
    const endPointResult = validateStartEndPoint(row)
    if (!endPointResult.valid) {
      endPointResult.errors.forEach(err => {
        errors[err.field] = err.message
      })
    }

    // 验证规划比例
    const percentageResult = validatePercentage(row.plannedPercentage)
    if (!percentageResult.valid) {
      percentageResult.errors.forEach(err => {
        errors[err.field] = err.message
      })
    }

    // 验证实际金额
    const amountResult = validateAmount(row.actualAmount, 'actualAmount')
    if (!amountResult.valid) {
      amountResult.errors.forEach(err => {
        errors[err.field] = err.message
      })
    }

    return errors
  }

  // 更新行的错误状态
  const updateRowErrors = (row: InvestmentRecordRow) => {
    const errors = computeRowErrors(row)
    setRowErrors(prev => {
      if (Object.keys(errors).length === 0) {
        const { [row.id]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [row.id]: errors
      }
    })
  }

  const handleStartPointChange = (row: InvestmentRecordRow, value: string) => {
    const startPoint = parseFloat(value) || 0
    onRowUpdate(row.id, { startPoint })

    // 验证并更新错误状态
    const updatedRow = { ...row, startPoint }
    updateRowErrors(updatedRow)
  }

  const handleEndPointChange = (row: InvestmentRecordRow, value: string) => {
    const endPoint = parseFloat(value) || 0
    onRowUpdate(row.id, { endPoint })

    // 验证并更新错误状态
    const updatedRow = { ...row, endPoint }
    updateRowErrors(updatedRow)
  }

  const handlePercentageChange = (row: InvestmentRecordRow, value: string) => {
    const percentage = parseFloat(value) || 0
    onRowUpdate(row.id, { plannedPercentage: percentage })

    // 验证并更新错误状态
    const updatedRow = { ...row, plannedPercentage: percentage }
    updateRowErrors(updatedRow)
  }

  const handleActualAmountChange = (row: InvestmentRecordRow, value: string) => {
    const amount = parseFloat(value) || 0
    onRowUpdate(row.id, { actualAmount: amount })

    // 验证并更新错误状态
    const updatedRow = { ...row, actualAmount: amount }
    updateRowErrors(updatedRow)
  }

  // 获取输入框的错误类名
  const getInputErrorClass = (rowId: string, field: string): string => {
    const hasError = rowErrors[rowId]?.[field]
    return hasError ? 'investment-record-table__input--error' : ''
  }

  // 获取字段的错误消息
  const getFieldError = (rowId: string, field: string): string => {
    return rowErrors[rowId]?.[field] || ''
  }

  // 计算规划金额（总收入 × 规划比例）
  const calculatePlannedAmount = (percentage: number): number => {
    return totalInvestment * (percentage / 100)
  }

  // 键盘导航处理
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    rowId: string,
    field: string,
    rowIndex: number
  ) => {
    // Tab键：默认行为即可移动焦点
    if (event.key === 'Tab') {
      return
    }

    // Enter键：移动到下一行的同字段
    if (event.key === 'Enter') {
      event.preventDefault()
      const nextRowIndex = rowIndex + 1
      if (nextRowIndex < rows.length) {
        const nextRowId = rows[nextRowIndex].id
        const nextInput = document.querySelector(
          `input[data-row-id="${nextRowId}"][data-field="${field}"]`
        ) as HTMLInputElement
        nextInput?.focus()
        nextInput?.select()
      }
    }

    // Escape键：取消编辑
    if (event.key === 'Escape') {
      event.preventDefault()
      event.currentTarget.blur()
    }

    // Delete键：删除当前行
    if (event.key === 'Delete' && window.confirm('确定要删除这一行吗？')) {
      event.preventDefault()
      onRowDelete(rowId)
    }
  }

  if (rows.length === 0) {
    return (
      <div className="investment-record-table__empty">
        <div className="investment-record-table__empty-text">暂无记录</div>
        <div className="investment-record-table__empty-hint">点击"添加行"开始记录</div>
      </div>
    )
  }

  return (
    <div className="investment-record-table">
      <table className="investment-record-table__table">
        <thead>
          <tr>
            <th>起始点</th>
            <th>终点</th>
            <th>规划比例%</th>
            <th>规划金额</th>
            <th>实际金额</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const plannedAmount = calculatePlannedAmount(row.plannedPercentage)
            const startPointError = getFieldError(row.id, 'startPoint')
            const endPointError = getFieldError(row.id, 'endPoint')
            const percentageError = getFieldError(row.id, 'plannedPercentage')
            const actualAmountError = getFieldError(row.id, 'actualAmount')

            // 计算行进度
            const rowProgress = plannedAmount > 0
              ? Math.min((row.actualAmount / plannedAmount) * 100, 100)
              : 0

            return (
              <tr key={row.id}>
                <td>
                  <input
                    type="number"
                    className={`investment-record-table__input ${getInputErrorClass(row.id, 'startPoint')}`}
                    value={row.startPoint || ''}
                    onChange={(e) => handleStartPointChange(row, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, row.id, 'startPoint', rowIndex)}
                    data-row-id={row.id}
                    data-field="startPoint"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {startPointError && (
                    <div className="investment-record-table__error-message">{startPointError}</div>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    className={`investment-record-table__input ${getInputErrorClass(row.id, 'endPoint')}`}
                    value={row.endPoint || ''}
                    onChange={(e) => handleEndPointChange(row, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, row.id, 'endPoint', rowIndex)}
                    data-row-id={row.id}
                    data-field="endPoint"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {endPointError && (
                    <div className="investment-record-table__error-message">{endPointError}</div>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    className={`investment-record-table__input ${getInputErrorClass(row.id, 'plannedPercentage')}`}
                    value={row.plannedPercentage || ''}
                    onChange={(e) => handlePercentageChange(row, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, row.id, 'plannedPercentage', rowIndex)}
                    data-row-id={row.id}
                    data-field="plannedPercentage"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  {percentageError && (
                    <div className="investment-record-table__error-message">{percentageError}</div>
                  )}
                </td>
                <td className="investment-record-table__planned-amount">
                  {formatCurrency(plannedAmount, 'CNY')}
                </td>
                <td>
                  <div className="investment-record-table__amount-with-progress">
                    <input
                      type="number"
                      className={`investment-record-table__input ${getInputErrorClass(row.id, 'actualAmount')}`}
                      value={row.actualAmount || ''}
                      onChange={(e) => handleActualAmountChange(row, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, 'actualAmount', rowIndex)}
                      data-row-id={row.id}
                      data-field="actualAmount"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {plannedAmount > 0 && (
                      <div className="investment-record-table__row-progress">
                        <div
                          className="investment-record-table__row-progress-bar"
                          style={{
                            width: `${rowProgress}%`,
                            backgroundColor: rowProgress >= 100 ? '#00b894' : rowProgress >= 80 ? '#fdcb6e' : '#0984e3'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {actualAmountError && (
                    <div className="investment-record-table__error-message">{actualAmountError}</div>
                  )}
                </td>
                <td>
                  <button
                    className="investment-record-table__btn investment-record-table__btn--delete"
                    onClick={() => onRowDelete(row.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
