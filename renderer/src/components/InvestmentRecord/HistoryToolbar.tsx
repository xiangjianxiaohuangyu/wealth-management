/**
 * 历史工具栏组件
 *
 * 显示撤销/重做按钮
 */

import { historyManager } from '../../services/history/HistoryManager'
import './HistoryToolbar.css'

export interface HistoryToolbarProps {
  /** 撤销回调 */
  onUndo: () => void
  /** 重做回调 */
  onRedo: () => void
}

export function HistoryToolbar({ onUndo, onRedo }: HistoryToolbarProps) {
  const canUndo = historyManager.canUndo()
  const canRedo = historyManager.canRedo()

  const handleUndo = () => {
    if (canUndo) {
      onUndo()
    }
  }

  const handleRedo = () => {
    if (canRedo) {
      onRedo()
    }
  }

  return (
    <div className="history-toolbar">
      <div className="history-toolbar__buttons">
        <button
          className="history-toolbar__btn"
          onClick={handleUndo}
          disabled={!canUndo}
          title="撤销 (Ctrl+Z)"
        >
          <span className="history-toolbar__btn-icon">↶</span>
          <span className="history-toolbar__btn-text">撤销</span>
        </button>

        <button
          className="history-toolbar__btn"
          onClick={handleRedo}
          disabled={!canRedo}
          title="重做 (Ctrl+Shift+Z)"
        >
          <span className="history-toolbar__btn-icon">↷</span>
          <span className="history-toolbar__btn-text">重做</span>
        </button>
      </div>
    </div>
  )
}
