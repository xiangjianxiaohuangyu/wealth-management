/**
 * 投资记录表格组件
 *
 * 显示单个资产卡片中的记录行列表
 * 支持拖拽排序、可编辑单元格、股票代码和点数字段
 */

import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { formatCurrency } from '../../utils/format/currency'
import { EditableCell } from './EditableCell'
import { DraggableRow } from './DraggableRow'
import { DragHandle } from './DragHandle'
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
  /** 行重新排序 */
  onRowReorder?: (oldIndex: number, newIndex: number) => void
  /** 是否处于编辑模式 */
  editing?: boolean
}

export function InvestmentRecordTable({
  rows,
  totalInvestment,
  onRowUpdate,
  onRowDelete,
  onRowReorder,
  editing = false
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
    return hasError ? 'investment-record-table__cell--error' : ''
  }

  // 获取字段的错误消息
  const getFieldError = (rowId: string, field: string): string => {
    return rowErrors[rowId]?.[field] || ''
  }

  // 计算规划金额（总收入 × 规划比例）
  const calculatePlannedAmount = (percentage: number): number => {
    return totalInvestment * (percentage / 100)
  }

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = rows.findIndex(row => row.id === active.id)
    const newIndex = rows.findIndex(row => row.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onRowReorder?.(oldIndex, newIndex)
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
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={rows.map(r => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <table className="investment-record-table__table">
            <thead>
              <tr>
                <th className="investment-record-table__th--drag"></th>
                <th>价值区间</th>
                <th>规划比例%</th>
                <th>规划金额</th>
                <th>实际金额</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, _rowIndex) => {
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
                  <DraggableRow key={row.id} id={row.id}>
                    {/* 拖拽手柄列 - 仅编辑模式显示 */}
                    {editing && (
                      <td className="investment-record-table__td--drag">
                        <DragHandle type="row" />
                      </td>
                    )}

                    {/* 价值区间 - 合并起始点和终点 */}
                    <td className={getInputErrorClass(row.id, 'startPoint') || getInputErrorClass(row.id, 'endPoint') ? 'investment-record-table__cell--error' : ''}>
                      <div className="investment-record-table__value-range">
                        <EditableCell
                          type="number"
                          value={row.startPoint}
                          onChange={(value) => handleStartPointChange(row, value)}
                          placeholder="0.00"
                          min={0}
                          step={0.01}
                          data-row-id={row.id}
                          data-field="startPoint"
                        />
                        <span className="investment-record-table__range-separator">--</span>
                        <EditableCell
                          type="number"
                          value={row.endPoint}
                          onChange={(value) => handleEndPointChange(row, value)}
                          placeholder="0.00"
                          min={0}
                          step={0.01}
                          data-row-id={row.id}
                          data-field="endPoint"
                        />
                      </div>
                      {(startPointError || endPointError) && (
                        <div className="investment-record-table__error-message">
                          {startPointError || endPointError}
                        </div>
                      )}
                    </td>

                    {/* 规划比例 */}
                    <td className={getInputErrorClass(row.id, 'plannedPercentage')}>
                      <EditableCell
                        type="number"
                        value={row.plannedPercentage}
                        onChange={(value) => handlePercentageChange(row, value)}
                        placeholder="0"
                        min={0}
                        max={100}
                        step={0.1}
                        data-row-id={row.id}
                        data-field="plannedPercentage"
                      />
                      {percentageError && (
                        <div className="investment-record-table__error-message">{percentageError}</div>
                      )}
                    </td>

                    {/* 规划金额（只读） */}
                    <td className="investment-record-table__planned-amount">
                      {formatCurrency(plannedAmount, 'CNY')}
                    </td>

                    {/* 实际金额 */}
                    <td className={getInputErrorClass(row.id, 'actualAmount')}>
                      <div className="investment-record-table__amount-with-progress">
                        <EditableCell
                          type="number"
                          value={row.actualAmount}
                          onChange={(value) => handleActualAmountChange(row, value)}
                          placeholder="0.00"
                          min={0}
                          step={0.01}
                          data-row-id={row.id}
                          data-field="actualAmount"
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

                    {/* 操作按钮 - 仅编辑模式显示 */}
                    {editing && (
                      <td>
                        <button
                          className="investment-record-table__btn investment-record-table__btn--delete"
                          onClick={() => onRowDelete(row.id)}
                        >
                          删除
                        </button>
                      </td>
                    )}
                  </DraggableRow>
                )
              })}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  )
}
