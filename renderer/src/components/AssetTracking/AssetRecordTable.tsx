/**
 * 资产记录表格组件
 *
 * 显示月度资产记录列表
 */

import { formatCurrency } from '../../utils/format/currency'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'
import './AssetRecordTable.css'

export interface AssetRecordTableProps {
  records: MonthlyAssetRecord[]
  onEdit: (record: MonthlyAssetRecord) => void
  onDelete: (id: string) => void
}

export function AssetRecordTable({ records, onEdit, onDelete }: AssetRecordTableProps) {
  // 按时间倒序排序
  const sortedRecords = [...records].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  if (sortedRecords.length === 0) {
    return (
      <div className="asset-record-table__empty">
        <div className="asset-record-table__empty-icon">📊</div>
        <div className="asset-record-table__empty-text">暂无记录</div>
        <div className="asset-record-table__empty-hint">点击"添加月度记录"开始跟踪您的资产</div>
      </div>
    )
  }

  return (
    <div className="asset-record-table">
      <table className="asset-record-table__table">
        <thead>
          <tr>
            <th>月份</th>
            <th>总收入</th>
            <th>消费</th>
            <th>存款</th>
            <th>投资</th>
            <th>存款率</th>
            <th>投资率</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map(record => {
            const savingsRate = record.totalIncome > 0
              ? (record.savings / record.totalIncome) * 100
              : 0
            const investmentRate = record.totalIncome > 0
              ? (record.investment / record.totalIncome) * 100
              : 0

            return (
              <tr key={record.id}>
                <td>{record.year}年{record.month}月</td>
                <td>{formatCurrency(record.totalIncome, 'CNY')}</td>
                <td>{formatCurrency(record.consumption, 'CNY')}</td>
                <td className="asset-record-table__positive">
                  {formatCurrency(record.savings, 'CNY')}
                </td>
                <td className="asset-record-table__positive">
                  {formatCurrency(record.investment, 'CNY')}
                </td>
                <td>{savingsRate.toFixed(1)}%</td>
                <td>{investmentRate.toFixed(1)}%</td>
                <td
                  className="asset-record-table__notes"
                  title={record.notes || ''}
                >
                  {record.notes || '-'}
                </td>
                <td>
                  <button
                    className="asset-record-table__btn asset-record-table__btn--edit"
                    onClick={() => onEdit(record)}
                  >
                    编辑
                  </button>
                  <button
                    className="asset-record-table__btn asset-record-table__btn--delete"
                    onClick={() => onDelete(record.id)}
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
