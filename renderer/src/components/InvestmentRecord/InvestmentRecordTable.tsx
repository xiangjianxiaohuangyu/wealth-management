/**
 * 投资记录表格组件
 *
 * 显示单个资产卡片中的记录行列表
 */

import { formatCurrency } from '../../utils/format/currency'
import type { InvestmentRecordRow, InvestmentRecordRowUpdate } from '../../types/investmentRecord.types'
import './InvestmentRecordTable.css'

export interface InvestmentRecordTableProps {
  /** 记录行列表 */
  rows: InvestmentRecordRow[]
  /** 总投资金额 */
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

  const handleStartPointChange = (rowId: string, value: string) => {
    const startPoint = parseFloat(value) || 0
    if (startPoint >= 0) {
      onRowUpdate(rowId, { startPoint })
    }
  }

  const handleEndPointChange = (rowId: string, value: string) => {
    const endPoint = parseFloat(value) || 0
    if (endPoint >= 0) {
      onRowUpdate(rowId, { endPoint })
    }
  }

  const handlePercentageChange = (rowId: string, value: string) => {
    const percentage = parseFloat(value) || 0
    if (percentage >= 0 && percentage <= 100) {
      onRowUpdate(rowId, { plannedPercentage: percentage })
    }
  }

  const handleActualAmountChange = (rowId: string, value: string) => {
    const amount = parseFloat(value) || 0
    if (amount >= 0) {
      onRowUpdate(rowId, { actualAmount: amount })
    }
  }

  const calculatePlannedAmount = (percentage: number): number => {
    return totalInvestment * (percentage / 100)
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
          {rows.map(row => {
            const plannedAmount = calculatePlannedAmount(row.plannedPercentage)

            return (
              <tr key={row.id}>
                <td>
                  <input
                    type="number"
                    className="investment-record-table__input"
                    value={row.startPoint || ''}
                    onChange={(e) => handleStartPointChange(row.id, e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="investment-record-table__input"
                    value={row.endPoint || ''}
                    onChange={(e) => handleEndPointChange(row.id, e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="investment-record-table__input"
                    value={row.plannedPercentage || ''}
                    onChange={(e) => handlePercentageChange(row.id, e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </td>
                <td className="investment-record-table__planned-amount">
                  {formatCurrency(plannedAmount, 'CNY')}
                </td>
                <td>
                  <input
                    type="number"
                    className="investment-record-table__input"
                    value={row.actualAmount || ''}
                    onChange={(e) => handleActualAmountChange(row.id, e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
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
