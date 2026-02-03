/**
 * 测试区工作区组件
 *
 * 功能：
 * - 管理多个表格的显示
 * - 显示成功提示弹窗
 * - 支持表格拖拽排序
 */

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { TestZoneTable as TestZoneTableType } from '../../types/testzone.types'
import { DraggableTestZoneTable } from './DraggableTestZoneTable'
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

/** 暴露给父组件的方法 */
export interface TestZoneWorkspaceRef {
  addTable: () => void
}

export const TestZoneWorkspace = forwardRef<TestZoneWorkspaceRef, TestZoneWorkspaceProps>(({
  totalIncome,
  totalInvestment
}, ref) => {
  const [tables, setTables] = useState<TestZoneTableType[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    addTable: () => {
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
  }))

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor)
  )

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = tables.findIndex(t => t.id === active.id)
      const newIndex = tables.findIndex(t => t.id === over.id)

      // 重新排序表格
      const newTables = arrayMove(tables, oldIndex, newIndex)
      setTables(newTables)

      // 更新存储中的表格顺序
      testZoneStorage.reorderTables(newTables.map(t => t.id))
    }
  }

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

  const handleDeleteTable = (tableId: string) => {
    testZoneStorage.deleteTable(tableId)
    setTables(testZoneStorage.getAllTables())
  }

  return (
    <div className="testzone-workspace">
      {tables.length === 0 ? (
        <div className="testzone-workspace__empty">
          <p>暂无表格，点击上方"添加表格"按钮开始添加</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tables.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="testzone-workspace__tables">
              {tables.map(table => (
                <DraggableTestZoneTable
                  key={table.id}
                  id={table.id}
                  table={table}
                  totalIncome={totalIncome}
                  totalInvestment={totalInvestment}
                  onDeleteTable={handleDeleteTable}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 成功提示弹窗 */}
      <SuccessToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
})
