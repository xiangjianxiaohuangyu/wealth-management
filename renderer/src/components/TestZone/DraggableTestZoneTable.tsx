/**
 * 可拖拽的投资规划表格组件
 *
 * 功能：
 * - 为表格添加拖拽功能
 * - 显示拖拽手柄
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TestZoneTable as TestZoneTableType } from '../../types/testzone.types'
import { TestZoneTable } from './TestZoneTable'
import type { TestZoneTableProps } from './TestZoneTable'
import './DraggableTestZoneTable.css'

export interface DraggableTestZoneTableProps extends Omit<TestZoneTableProps, 'table'> {
  /** 表格ID（用于拖拽） */
  id: string
  /** 表格数据 */
  table: TestZoneTableType
}

export function DraggableTestZoneTable({
  id,
  table,
  ...props
}: DraggableTestZoneTableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'draggable-testzone-table--dragging' : ''}
    >
      <TestZoneTable
        table={table}
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
