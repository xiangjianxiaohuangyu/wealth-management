/**
 * 测试区表格组件
 *
 * 功能：
 * - 显示表格头和数据行
 * - 支持添加/删除行
 * - 支持删除整个表格
 */

import { useState } from 'react'
import type { TestZoneTable as TestZoneTableType } from '../../types/testzone.types'
import { TestZoneTableRow } from './TestZoneTableRow'
import { testZoneStorage } from '../../services/storage/testZoneStorage'
import './TestZoneTable.css'

export interface TestZoneTableProps {
  /** 表格数据 */
  table: TestZoneTableType
  /** 总收入 */
  totalIncome: number
  /** 总投资金额 */
  totalInvestment: number
  /** 删除表格回调 */
  onDeleteTable: (tableId: string) => void
}

export function TestZoneTable({
  table,
  totalIncome,
  totalInvestment,
  onDeleteTable
}: TestZoneTableProps) {
  const [rows, setRows] = useState(table.rows)
  const [collapsed, setCollapsed] = useState(false)

  const handleSaveRow = (rowId: string, updatedRow: TestZoneTableType['rows'][0]) => {
    testZoneStorage.updateRow(table.id, rowId, updatedRow)
    // 更新本地状态
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, ...updatedRow } : r))
  }

  const handleDeleteRow = (rowId: string) => {
    testZoneStorage.deleteRow(table.id, rowId)
    setRows(prev => prev.filter(r => r.id !== rowId))
  }

  const handleAddRow = () => {
    const newRow = {
      valueRangeStart: 0,
      valueRangeEnd: 0,
      investmentPercentage: 0,
      investmentAmount: 0,
      actualAmount: 0,
      useTotalInvestment: false
    }
    testZoneStorage.addRow(table.id, newRow)
    // 重新加载表格数据
    const updatedTable = testZoneStorage.getTableById(table.id)
    if (updatedTable) {
      setRows(updatedTable.rows)
    }
  }

  const handleDeleteTable = () => {
    if (confirm(`确定要删除表格"${table.name}"吗？`)) {
      onDeleteTable(table.id)
    }
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  return (
    <div className={`testzone-table ${collapsed ? 'testzone-table--collapsed' : ''}`}>
      <div className="testzone-table__header-row">
        <div className="testzone-table__title-row">
          <button
            className="testzone-table__collapse-btn"
            onClick={toggleCollapse}
            title={collapsed ? "展开" : "折叠"}
          >
            {collapsed ? '▶' : '▼'}
          </button>
          <h3 className="testzone-table__title">{table.name}</h3>
        </div>
        <button
          className="testzone-table__delete-btn"
          onClick={handleDeleteTable}
          title="删除表格"
        >
          删除表格
        </button>
      </div>

      {!collapsed && (
        <>
          {/* 表头 */}
          <div className="testzone-table__header">
            <div>价值区间</div>
            <div>投资比例(%)</div>
            <div>投资金额(￥)</div>
            <div>实际金额(￥)</div>
            <div>操作</div>
          </div>

          {/* 数据行 */}
          <div className="testzone-table__body">
            {rows.length === 0 ? (
              <div className="testzone-table__empty">
                <p>暂无数据，点击下方"添加行"按钮开始添加</p>
              </div>
            ) : (
              rows.map(row => (
                <TestZoneTableRow
                  key={row.id}
                  row={row}
                  totalIncome={totalIncome}
                  totalInvestment={totalInvestment}
                  onSave={(updatedRow) => handleSaveRow(row.id, updatedRow)}
                  onDelete={() => handleDeleteRow(row.id)}
                />
              ))
            )}
          </div>

          {/* 添加行按钮 */}
          <button
            className="testzone-table__add-row-btn"
            onClick={handleAddRow}
          >
            + 添加行
          </button>
        </>
      )}
    </div>
  )
}
