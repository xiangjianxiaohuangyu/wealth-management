/**
 * 创建资产弹窗组件
 *
 * 功能：
 * - 输入资产名称
 * - 输入计划投资比例
 * - 实时预览计划金额
 * - 确定和取消按钮
 */

import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { formatCurrency } from '../../utils/format/currency'
import './CreateAssetModal.css'

export interface CreateAssetModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: (name: string, percentage: number) => void
  /** 总投资金额 */
  totalAmount: number
  /** 最大可用比例 */
  maxPercentage: number
}

export function CreateAssetModal({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  maxPercentage
}: CreateAssetModalProps) {
  const [assetName, setAssetName] = useState('')
  const [percentage, setPercentage] = useState('')

  // 重置表单
  useEffect(() => {
    if (!isOpen) {
      setAssetName('')
      setPercentage('')
    }
  }, [isOpen])

  const handleSubmit = () => {
    if (!assetName.trim()) {
      return
    }

    const percentValue = parseFloat(percentage) || 0
    if (percentValue <= 0) {
      return
    }

    onConfirm(assetName.trim(), Math.min(percentValue, maxPercentage))
    setAssetName('')
    setPercentage('')
  }

  const plannedAmount = percentage
    ? (Math.min(parseFloat(percentage) || 0, maxPercentage) * totalAmount) / 100
    : 0

  const handlePercentageChange = (value: string) => {
    // 只允许数字和小数点
    const cleaned = value.replace(/[^\d.]/g, '')

    // 限制小数点后一位
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return
    }
    if (parts[1] && parts[1].length > 1) {
      parts[1] = parts[1].slice(0, 1)
    }

    setPercentage(parts.join('.'))
  }

  const isFormValid = assetName.trim() && parseFloat(percentage) > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="创建新资产"
      footer={
        <>
          <button className="create-asset-modal__btn create-asset-modal__btn--cancel" onClick={onClose}>
            取消
          </button>
          <button
            className={`create-asset-modal__btn create-asset-modal__btn--confirm ${
              !isFormValid ? 'create-asset-modal__btn--disabled' : ''
            }`}
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            确定
          </button>
        </>
      }
    >
      <div className="create-asset-modal__form">
        {/* 资产名称输入 */}
        <div className="create-asset-modal__field">
          <label className="create-asset-modal__label">资产名称</label>
          <input
            type="text"
            className="create-asset-modal__input"
            placeholder="例如：股票、基金、债券"
            value={assetName}
            onChange={e => setAssetName(e.target.value)}
            autoFocus
          />
        </div>

        {/* 计划比例输入 */}
        <div className="create-asset-modal__field">
          <label className="create-asset-modal__label">计划投资比例 (%)</label>
          <div className="create-asset-modal__input-wrapper">
            <input
              type="text"
              className="create-asset-modal__input"
              placeholder={`0-${maxPercentage.toFixed(1)}`}
              value={percentage}
              onChange={e => handlePercentageChange(e.target.value)}
            />
            <span className="create-asset-modal__suffix">%</span>
          </div>
          <div className="create-asset-modal__hint">
            当前可用比例: <span className="create-asset-modal__hint-value">{maxPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* 预览 */}
        {parseFloat(percentage) > 0 && (
          <div className="create-asset-modal__preview">
            <div className="create-asset-modal__preview-label">计划金额</div>
            <div className="create-asset-modal__preview-value">
              {formatCurrency(plannedAmount, 'CNY', { decimals: 0 })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
