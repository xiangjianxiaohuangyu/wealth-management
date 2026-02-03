/**
 * 拖拽手柄组件
 *
 * 用于拖拽操作的视觉指示器
 */

import './DragHandle.css'

export interface DragHandleProps {
  /** 是否正在拖拽 */
  isDragging?: boolean
  /** 拖拽手柄类型 */
  type?: 'card' | 'row'
}

export function DragHandle({ isDragging = false, type = 'row' }: DragHandleProps) {
  return (
    <div
      className={`drag-handle drag-handle--${type} ${isDragging ? 'drag-handle--dragging' : ''}`}
      title="拖拽以重新排序"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="19" r="1" />
      </svg>
    </div>
  )
}
