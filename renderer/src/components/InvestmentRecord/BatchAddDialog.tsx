/**
 * 批量添加行对话框组件
 *
 * 支持自定义行数、起始比例和递增值
 */

import { useState } from 'react'
import { Modal } from '../common/Modal/Modal'
import './BatchAddDialog.css'

export interface BatchAddDialogProps {
  /** 是否打开对话框 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 (行数, 起始比例, 递增值) */
  onConfirm: (rowCount: number, startPercentage: number, increment: number) => void
}

export function BatchAddDialog({ isOpen, onClose, onConfirm }: BatchAddDialogProps) {
  const [rowCount, setRowCount] = useState(5)
  const [startPercentage, setStartPercentage] = useState(10)
  const [percentageIncrement, setPercentageIncrement] = useState(5)

  // 重置表单
  const resetForm = () => {
    setRowCount(5)
    setStartPercentage(10)
    setPercentageIncrement(5)
  }

  // 处理确认
  const handleConfirm = () => {
    onConfirm(rowCount, startPercentage, percentageIncrement)
    resetForm()
  }

  // 处理关闭
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // 生成预览数据
  const previewData = Array.from({ length: Math.min(rowCount, 5) }, (_, i) => {
    return (startPercentage + i * percentageIncrement).toFixed(1)
  })

  // 计算总比例
  const totalPercentage = Array.from({ length: rowCount }, (_, i) => {
    return startPercentage + i * percentageIncrement
  }).reduce((sum, val) => sum + val, 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="批量添加行"
      footer={
        <>
          <button
            className="batch-add-dialog__btn batch-add-dialog__btn--cancel"
            onClick={handleClose}
          >
            取消
          </button>
          <button
            className="batch-add-dialog__btn batch-add-dialog__btn--confirm"
            onClick={handleConfirm}
          >
            确认添加
          </button>
        </>
      }
    >
      <div className="batch-add-dialog__content">
        {/* 添加行数 */}
        <div className="batch-add-dialog__field">
          <label htmlFor="rowCount">添加行数</label>
          <input
            id="rowCount"
            type="number"
            min="1"
            max="50"
            value={rowCount}
            onChange={(e) => setRowCount(Number(e.target.value) || 1)}
          />
        </div>

        {/* 起始比例 */}
        <div className="batch-add-dialog__field">
          <label htmlFor="startPercentage">起始比例（%）</label>
          <input
            id="startPercentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={startPercentage}
            onChange={(e) => setStartPercentage(Number(e.target.value) || 0)}
          />
        </div>

        {/* 比例递增值 */}
        <div className="batch-add-dialog__field">
          <label htmlFor="percentageIncrement">比例递增值（%）</label>
          <input
            id="percentageIncrement"
            type="number"
            min="0.1"
            max="50"
            step="0.1"
            value={percentageIncrement}
            onChange={(e) => setPercentageIncrement(Number(e.target.value) || 0)}
          />
        </div>

        {/* 预览区域 */}
        <div className="batch-add-dialog__preview">
          <p className="batch-add-dialog__preview-title">预览：</p>
          <p className="batch-add-dialog__preview-desc">
            将添加 <strong>{rowCount}</strong> 行，比例分别为
          </p>
          <p className="batch-add-dialog__preview-values">
            {previewData.join('%, ')}%
            {rowCount > 5 && '...'}
          </p>
          <p className={`batch-add-dialog__total ${totalPercentage > 100 ? 'batch-add-dialog__total--warning' : ''}`}>
            总比例：{totalPercentage.toFixed(1)}%
            {totalPercentage > 100 && ' ⚠️ 超过100%'}
          </p>
        </div>
      </div>
    </Modal>
  )
}
