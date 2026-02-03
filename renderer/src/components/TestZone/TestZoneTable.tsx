/**
 * 测试区表格组件
 *
 * 功能：
 * - 显示表格头和数据行
 * - 支持添加/删除行
 * - 支持删除整个表格
 */

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { TestZoneTable as TestZoneTableType } from '../../types/testzone.types'
import { SortableTestZoneRow } from './SortableTestZoneRow'
import { ConfirmDialog } from '../Investment/ConfirmDialog'
import { testZoneStorage } from '../../services/storage/testZoneStorage'
import { testZoneSettingsStorage } from '../../services/storage/testZoneSettingsStorage'
import { eventBus } from '../../utils/eventBus'
import type { CalculationMethod } from '../../types/testZoneSettings.types'
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
  /** 拖拽手柄属性 */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function TestZoneTable({
  table,
  totalIncome,
  totalInvestment,
  onDeleteTable,
  dragHandleProps
}: TestZoneTableProps) {
  const [rows, setRows] = useState(table.rows)
  const [collapsed, setCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('total-income')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [title, setTitle] = useState(table.name)

  // 加载计算方式设置
  useEffect(() => {
    setCalculationMethod(testZoneSettingsStorage.getCalculationMethod())
  }, [])

  // 监听设置变化
  useEffect(() => {
    const handleSettingsChange = () => {
      setCalculationMethod(testZoneSettingsStorage.getCalculationMethod())
    }
    eventBus.on('testzone-settings-changed', handleSettingsChange)
    return () => {
      eventBus.off('testzone-settings-changed', handleSettingsChange)
    }
  }, [])

  // 配置行拖拽传感器
  const rowSensors = useSensors(
    useSensor(PointerSensor)
  )

  // 处理行拖拽结束事件
  const handleRowDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex(r => r.id === active.id)
      const newIndex = rows.findIndex(r => r.id === over.id)

      // 重新排序行
      const newRows = arrayMove(rows, oldIndex, newIndex)
      setRows(newRows)

      // 更新存储中的行顺序
      testZoneStorage.updateTable(table.id, { rows: newRows })
    }
  }

  const handleSaveRow = (rowId: string, updatedRow: TestZoneTableType['rows'][0]) => {
    // 只更新本地状态，不持久化到存储
    // 点击"完成"按钮时才持久化所有数据
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
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    onDeleteTable(table.id)
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const toggleEditMode = () => {
    if (isEditing) {
      // 完成编辑时，保存所有行数据
      rows.forEach(row => {
        testZoneStorage.updateRow(table.id, row.id, row)
      })
      // 保存标题
      if (title.trim() && title !== table.name) {
        testZoneStorage.updateTable(table.id, { name: title.trim() })
      }
    } else {
      // 进入编辑模式时，标题变为输入框
      setTitle(table.name)
    }
    setIsEditing(!isEditing)
  }

  const handleTitleSave = () => {
    if (title.trim() && title !== table.name) {
      testZoneStorage.updateTable(table.id, { name: title.trim() })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setTitle(table.name)
      e.currentTarget.blur()
    }
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
          {isEditing ? (
            <input
              type="text"
              className="testzone-table__title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              autoFocus
            />
          ) : (
            <h3 className="testzone-table__title">
              {table.name}
            </h3>
          )}
        </div>
        <div className="testzone-table__header-actions">
          <button
            className="testzone-table__edit-btn"
            onClick={toggleEditMode}
            title={isEditing ? "完成编辑" : "编辑"}
          >
            {isEditing ? '完成' : '编辑'}
          </button>
          <button
            className="testzone-table__delete-btn"
            onClick={handleDeleteTable}
            title="删除表格"
          >
            删除表格
          </button>
          {dragHandleProps && (
            <div className="testzone-table__drag-handle" {...dragHandleProps}>
              <span className="testzone-table__drag-handle-icon">⋮⋮</span>
            </div>
          )}
        </div>
      </div>

      <div className="testzone-table__content">
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
                <DndContext
                  sensors={rowSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleRowDragEnd}
                >
                  <SortableContext
                    items={rows.map(r => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rows.map(row => (
                      <SortableTestZoneRow
                        key={row.id}
                        row={row}
                        totalIncome={totalIncome}
                        totalInvestment={totalInvestment}
                        onSave={(updatedRow) => handleSaveRow(row.id, updatedRow)}
                        onDelete={() => handleDeleteRow(row.id)}
                        isEditing={isEditing}
                        calculationMethod={calculationMethod}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* 添加行按钮 - 仅在编辑状态显示 */}
            {isEditing && (
              <button
                className="testzone-table__add-row-btn"
                onClick={handleAddRow}
              >
                + 添加行
              </button>
            )}
          </>
        )}
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="删除表格"
        message={`确定要删除表格"${table.name}"吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  )
}
