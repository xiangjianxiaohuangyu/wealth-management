/**
 * 可拖拽卡片组件
 *
 * 包装投资记录卡片，使其可拖拽
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Transform } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

export interface DraggableCardProps {
  /** 卡片ID */
  id: string
  /** 子元素 */
  children: ReactNode
  /** 是否禁用拖拽 */
  disabled?: boolean
}

export function DraggableCard({ id, children, disabled = false }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform as Transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="draggable-card"
    >
      {/* 拖拽手柄区域 */}
      <div
        className="draggable-card__handle"
        {...attributes}
        {...listeners}
        title="拖拽以移动卡片"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="draggable-card__handle-icon"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </div>
      {children}
    </div>
  )
}
