/**
 * 可排序的投资规划表格行组件
 *
 * 功能：
 * - 为表格行添加拖拽功能
 * - 显示拖拽手柄
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TestZoneTableRow } from './TestZoneTableRow'
import type { TestZoneRow } from '../../types/testzone.types'
import type { TestZoneTableRowProps } from './TestZoneTableRow'
import './SortableTestZoneRow.css'

export interface SortableTestZoneRowProps extends Omit<TestZoneTableRowProps, 'row'> {
  /** 行数据 */
  row: TestZoneRow
}

export function SortableTestZoneRow({
  row,
  ...props
}: SortableTestZoneRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-testzone-row ${isDragging ? 'sortable-testzone-row--dragging' : ''}`}
    >
      <TestZoneTableRow
        row={row}
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
