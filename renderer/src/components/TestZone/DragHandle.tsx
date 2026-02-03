/**
 * 拖拽手柄组件
 *
 * 功能：
 * - 显示拖拽手柄图标
 * - 用于拖拽表格和表格行
 */

import './DragHandle.css'

export interface DragHandleProps {
  /** 是否处于拖拽状态 */
  isDragging?: boolean
}

export function DragHandle({ isDragging = false }: DragHandleProps) {
  return (
    <div className={`drag-handle ${isDragging ? 'drag-handle--dragging' : ''}`}>
      <span className="drag-handle__dots">⋮⋮</span>
    </div>
  )
}
