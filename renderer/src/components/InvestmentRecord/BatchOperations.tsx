/**
 * 批量操作工具栏
 *
 * 显示批量操作按钮（当有选中行时）
 */

import { useSelection } from '../../context/SelectionContext'
import './BatchOperations.css'

export interface BatchOperationsProps {
  /** 卡片ID */
  cardId: string
  /** 总行数 */
  totalRows: number
  /** 批量删除回调 */
  onBatchDelete: (rowIds: string[]) => void
}

export function BatchOperations({ cardId, totalRows, onBatchDelete }: BatchOperationsProps) {
  const { getSelectedCount, clearSelection } = useSelection()
  const selectedCount = getSelectedCount(cardId)

  if (selectedCount === 0) {
    return null
  }

  const handleDelete = () => {
    if (window.confirm(`确定要删除选中的 ${selectedCount} 行吗？`)) {
      // 获取选中的行ID（需要从context获取）
      const selectedRows = useSelection().selectedRows[cardId]
      if (selectedRows) {
        onBatchDelete(Array.from(selectedRows))
        clearSelection()
      }
    }
  }

  return (
    <div className="batch-operations">
      <div className="batch-operations__info">
        已选择 <span className="batch-operations__count">{selectedCount}</span> / {totalRows} 行
      </div>
      <div className="batch-operations__actions">
        <button
          className="batch-operations__btn batch-operations__btn--cancel"
          onClick={clearSelection}
        >
          取消选择
        </button>
        <button
          className="batch-operations__btn batch-operations__btn--delete"
          onClick={handleDelete}
        >
          删除选中
        </button>
      </div>
    </div>
  )
}
