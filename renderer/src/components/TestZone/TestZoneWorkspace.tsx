/**
 * 测试区工作区组件
 *
 * 功能：
 * - 管理多个表格的显示
 * - 提供添加表格按钮
 * - 显示成功提示弹窗
 */

import { useState, useEffect } from 'react'
import type { TestZoneTable as TestZoneTableType } from '../../types/testzone.types'
import { TestZoneTable } from './TestZoneTable'
import { SuccessToast } from './SuccessToast'
import { testZoneStorage } from '../../services/storage/testZoneStorage'
import { eventBus } from '../../utils/eventBus'
import './TestZoneWorkspace.css'

export interface TestZoneWorkspaceProps {
  /** 总收入 */
  totalIncome: number
  /** 总投资金额 */
  totalInvestment: number
}

export function TestZoneWorkspace({
  totalIncome,
  totalInvestment
}: TestZoneWorkspaceProps) {
  const [tables, setTables] = useState<TestZoneTableType[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 加载表格数据
  useEffect(() => {
    loadTables()
  }, [])

  // 监听数据变化
  useEffect(() => {
    const handleDataChange = () => {
      loadTables()
    }
    // 使用 eventBus 监听数据变化
    eventBus.on('testzone-changed', handleDataChange)
    return () => {
      eventBus.off('testzone-changed', handleDataChange)
    }
  }, [])

  const loadTables = () => {
    const data = testZoneStorage.getAllTables()
    setTables(data)
  }

  const handleAddTable = () => {
    const newTable = {
      name: `测试表格 ${tables.length + 1}`,
      rows: []
    }

    const result = testZoneStorage.addTable(newTable)
    if (result) {
      setTables(testZoneStorage.getAllTables())
      setToastMessage('添加成功')
      setShowToast(true)
    }
  }

  const handleDeleteTable = (tableId: string) => {
    testZoneStorage.deleteTable(tableId)
    setTables(testZoneStorage.getAllTables())
  }

  return (
    <div className="testzone-workspace">
      {tables.length === 0 ? (
        <div className="testzone-workspace__empty">
          <p>暂无表格，点击下方按钮开始添加</p>
        </div>
      ) : (
        <div className="testzone-workspace__tables">
          {tables.map(table => (
            <TestZoneTable
              key={table.id}
              table={table}
              totalIncome={totalIncome}
              totalInvestment={totalInvestment}
              onDeleteTable={handleDeleteTable}
            />
          ))}
        </div>
      )}

      {/* 添加表格按钮 */}
      <button
        className="testzone-workspace__add-table-btn"
        onClick={handleAddTable}
      >
        + 添加表格
      </button>

      {/* 成功提示弹窗 */}
      <SuccessToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}
