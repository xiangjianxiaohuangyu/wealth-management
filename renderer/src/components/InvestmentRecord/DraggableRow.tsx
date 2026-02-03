/**
 * 可拖拽行组件
 *
 * 包装表格行，使其可拖拽
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Transform } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

export interface DraggableRowProps {
  /** 行ID */
  id: string
  /** 子元素 */
  children: ReactNode
  /** 是否禁用拖拽 */
  disabled?: boolean
}

export function DraggableRow({ id, children, disabled = false }: DraggableRowProps) {
  const {
    attributes,
    listeners: _listeners,
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
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  }

  return (
    <tr ref={setNodeRef} style={style} {...attributes} className="draggable-row">
      {children}
    </tr>
  )
}
