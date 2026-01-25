/**
 * 创建资产弹窗组件
 *
 * 功能：
 * - 输入资产名称
 * - 输入计划投资比例
 * - 输入实际金额
 * - 实时预览计划金额
 * - 确定和取消按钮
 */

import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { formatCurrency } from '../../utils/format/currency'
import { CHART_COLORS } from '../../utils/constants'
import './CreateAssetModal.css'

export interface CreateAssetModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: (name: string, percentage: number, actualAmount: number, color?: string) => void
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
  const [actualAmount, setActualAmount] = useState('')
  const [error, setError] = useState('')
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)

  // 重置表单
  useEffect(() => {
    if (!isOpen) {
      setAssetName('')
      setPercentage('')
      setActualAmount('')
      setError('')
      setSelectedColor(undefined)
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

    const actualAmountValue = parseFloat(actualAmount) || 0

    onConfirm(assetName.trim(), Math.min(percentValue, maxPercentage), actualAmountValue, selectedColor)
    setAssetName('')
    setPercentage('')
    setActualAmount('')
    setError('')
    setSelectedColor(undefined)
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

    const newValue = parts.join('.')
    const numValue = parseFloat(newValue) || 0

    // 实时校验并自动调整
    if (numValue > maxPercentage) {
      // 自动设置为最大可用值
      setPercentage(maxPercentage.toString())
      setError(`比例已自动调整为最大可用值 ${maxPercentage.toFixed(1)}%`)
      // 2秒后清除错误提示
      setTimeout(() => setError(''), 2000)
    } else {
      setError('')
      setPercentage(newValue)
    }
  }

  const handleAssetNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // 跳转到比例输入框
      const percentageInput = document.querySelector('.create-asset-modal__percentage-input') as HTMLInputElement
      percentageInput?.focus()
    }
  }

  const handlePercentageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // 跳转到实际金额输入框
      const actualAmountInput = document.querySelector('.create-asset-modal__actual-amount-input') as HTMLInputElement
      actualAmountInput?.focus()
    }
  }

  const handleActualAmountChange = (value: string) => {
    // 只允许数字
    const cleaned = value.replace(/[^\d]/g, '')
    setActualAmount(cleaned)
  }

  const handleActualAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // 如果表单有效，提交表单
      if (assetName.trim() && parseFloat(percentage) > 0 && !error) {
        handleSubmit()
      }
    }
  }

  const isFormValid = assetName.trim() && parseFloat(percentage) > 0 && !error

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
            onKeyDown={handleAssetNameKeyDown}
            autoFocus
          />
        </div>

        {/* 计划比例输入 */}
        <div className="create-asset-modal__field">
          <label className="create-asset-modal__label">计划投资比例 (%)</label>
          <div className="create-asset-modal__input-wrapper">
            <input
              type="text"
              className={`create-asset-modal__input create-asset-modal__percentage-input ${error ? 'create-asset-modal__input--error' : ''}`}
              placeholder={`0-${maxPercentage.toFixed(1)}`}
              value={percentage}
              onChange={e => handlePercentageChange(e.target.value)}
              onKeyDown={handlePercentageKeyDown}
            />
            <span className="create-asset-modal__suffix">%</span>
          </div>
          {error && (
            <div className="create-asset-modal__hint create-asset-modal__hint--error">
              {error}
            </div>
          )}
        </div>

        {/* 实际金额输入 */}
        <div className="create-asset-modal__field">
          <label className="create-asset-modal__label">实际金额 (￥)</label>
          <div className="create-asset-modal__input-wrapper">
            <input
              type="text"
              className="create-asset-modal__input create-asset-modal__actual-amount-input"
              placeholder="0"
              value={actualAmount}
              onChange={e => handleActualAmountChange(e.target.value)}
              onKeyDown={handleActualAmountKeyDown}
            />
            <span className="create-asset-modal__suffix">￥</span>
          </div>
        </div>

        {/* 颜色选择 */}
        <div className="create-asset-modal__field">
          <label className="create-asset-modal__label">资产颜色</label>
          <div className="create-asset-modal__color-picker">
            {CHART_COLORS.map((color) => (
              <button
                key={color}
                className={`create-asset-modal__color-option ${selectedColor === color ? 'create-asset-modal__color-option--selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(selectedColor === color ? undefined : color)}
                title={color}
              />
            ))}
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
