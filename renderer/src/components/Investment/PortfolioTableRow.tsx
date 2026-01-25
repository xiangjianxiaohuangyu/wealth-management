/**
 * 投资组合表格行组件
 *
 * 功能：
 * - 查看模式：显示数据 + 编辑/删除按钮
 * - 编辑模式：显示输入框 + 保存/取消按钮
 * - 实时计算预览
 */

import { useState, useEffect, useMemo } from 'react'
import type { AssetAllocationItem } from '../../types/investment.types'
import { OperationSuggestion } from './OperationSuggestion'
import { formatCurrency } from '../../utils/format/currency'
import { updateAssetCalculations } from '../../utils/calculation/portfolioCalculation'
import { calculateTotalPercentage } from '../../utils/validation/investmentValidation'
import { CHART_COLORS } from '../../utils/constants'
import './PortfolioTableRow.css'

export interface PortfolioTableRowProps {
  /** 资产数据 */
  asset: AssetAllocationItem
  /** 是否处于编辑模式 */
  isEditing: boolean
  /** 总投资金额 */
  totalAmount: number
  /** 总实际金额（用于计算实际比例） */
  totalActualAmount: number
  /** 所有资产列表（用于校验） */
  allAssets: AssetAllocationItem[]
  /** 编辑按钮点击回调 */
  onEdit: (id: string) => void
  /** 保存回调 */
  onSave: (id: string, updates: Partial<AssetAllocationItem>) => void
  /** 取消回调 */
  onCancel: () => void
  /** 删除回调 */
  onDelete: (id: string) => void
  /** 显示提示消息 */
  onShowToast?: (message: string, type?: 'info' | 'warning' | 'error') => void
}

export function PortfolioTableRow({
  asset,
  isEditing,
  totalAmount,
  totalActualAmount,
  allAssets,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onShowToast
}: PortfolioTableRowProps) {
  // 编辑时的临时数据
  const [tempAsset, setTempAsset] = useState<AssetAllocationItem>(asset)
  const [calculatedAsset, setCalculatedAsset] = useState<AssetAllocationItem>(asset)
  const [percentageError, setPercentageError] = useState('')

  // 计算最大可用比例
  const maxPercentage = useMemo(() => {
    const otherTotal = calculateTotalPercentage(allAssets, asset.id)
    return Math.max(0, 100 - otherTotal)
  }, [allAssets, asset.id])

  // 当 asset 变化或进入/退出编辑模式时，更新临时数据
  useEffect(() => {
    setTempAsset(asset)
    setCalculatedAsset(asset)
    setPercentageError('')
  }, [asset.id, asset.plannedPercentage, asset.actualAmount, asset.name])

  // 实时计算预览（编辑模式）
  useEffect(() => {
    if (isEditing) {
      const updated = updateAssetCalculations(
        tempAsset,
        totalAmount,
        totalActualAmount
      )
      setCalculatedAsset(updated)
    }
  }, [tempAsset, totalAmount, totalActualAmount, isEditing])

  const handleSave = () => {
    onSave(asset.id, {
      name: tempAsset.name,
      plannedPercentage: tempAsset.plannedPercentage,
      actualAmount: tempAsset.actualAmount,
      color: tempAsset.color
    })
  }

  const handleCancel = () => {
    setTempAsset(asset)
    setPercentageError('')
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const handlePercentageChange = (value: string) => {
    let numValue = parseFloat(value) || 0

    // 自动调整：如果超过最大可用比例，自动设置为最大值
    if (numValue > maxPercentage) {
      numValue = maxPercentage
      setPercentageError('')
      onShowToast?.(`比例已自动调整为最大可用值 ${maxPercentage.toFixed(1)}%`, 'warning')
    } else {
      setPercentageError('')
    }

    setTempAsset({
      ...tempAsset,
      plannedPercentage: numValue
    })
  }

  const handleActualAmountChange = (value: string) => {
    let numValue = parseFloat(value) || 0

    // 如果第一位是0且长度大于1，自动去掉前面的0
    if (value.startsWith('0') && value.length > 1 && !value.startsWith('0.')) {
      numValue = parseFloat(value.replace(/^0+/, '')) || 0
    }

    setTempAsset({
      ...tempAsset,
      actualAmount: numValue
    })
  }

  if (isEditing) {
    // 编辑模式
    return (
      <div className="portfolio-table__row portfolio-table__row--editing">
        {/* 资产名称和颜色 */}
        <div className="portfolio-table__cell portfolio-table__cell--with-color">
          <input
            type="text"
            className="portfolio-table__input"
            value={tempAsset.name}
            onChange={e => setTempAsset({ ...tempAsset, name: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="资产名称"
          />
          <div className="portfolio-table__color-picker-wrapper">
            <input
              type="color"
              className="portfolio-table__color-input"
              value={tempAsset.color || CHART_COLORS[allAssets.findIndex(a => a.id === asset.id) % CHART_COLORS.length]}
              onChange={(e) => setTempAsset({ ...tempAsset, color: e.target.value })}
              title="选择颜色"
            />
            {tempAsset.color && (
              <button
                className="portfolio-table__color-clear"
                onClick={() => setTempAsset({ ...tempAsset, color: undefined })}
                title="清除颜色，使用默认"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 计划比例 */}
        <div className="portfolio-table__cell portfolio-table__cell--input">
          <div className="portfolio-table__input-wrapper">
            <input
              type="number"
              className={`portfolio-table__input ${percentageError ? 'portfolio-table__input--error' : ''}`}
              min="0"
              max="100"
              step="0.1"
              value={tempAsset.plannedPercentage}
              onChange={e => handlePercentageChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="portfolio-table__suffix">%</span>
          </div>
          {percentageError && (
            <div className="portfolio-table__error">{percentageError}</div>
          )}
        </div>

        {/* 计划金额 - 自动计算 */}
        <div className="portfolio-table__cell">
          <span className="portfolio-table__value portfolio-table__value--disabled">
            {formatCurrency(calculatedAsset.plannedAmount, 'CNY', { decimals: 0 })}
          </span>
        </div>

        {/* 实际金额 */}
        <div className="portfolio-table__cell portfolio-table__cell--input">
          <div className="portfolio-table__input-wrapper">
            <input
              type="number"
              className="portfolio-table__input"
              min="0"
              step="100"
              value={tempAsset.actualAmount}
              onChange={e => handleActualAmountChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="portfolio-table__suffix">￥</span>
          </div>
        </div>

        {/* 实际比例 - 自动计算 */}
        <div className="portfolio-table__cell">
          <span className="portfolio-table__value portfolio-table__value--disabled">
            {calculatedAsset.actualPercentage.toFixed(1)}%
          </span>
        </div>

        {/* 偏离度 - 实时计算 */}
        <div className="portfolio-table__cell">
          <OperationSuggestion
            suggestion={calculatedAsset.suggestion}
            amount={calculatedAsset.suggestionAmount}
          />
        </div>

        {/* 操作按钮 */}
        <div className="portfolio-table__cell portfolio-table__actions">
          <button
            className="portfolio-table__action-btn portfolio-table__action-btn--save"
            onClick={handleSave}
          >
            保存
          </button>
          <button
            className="portfolio-table__action-btn portfolio-table__action-btn--cancel"
            onClick={handleCancel}
          >
            取消
          </button>
        </div>
      </div>
    )
  }

  // 查看模式
  return (
    <div className="portfolio-table__row">
      {/* 资产名称 */}
      <div className="portfolio-table__cell portfolio-table__cell--name">
        <div className="portfolio-table__name-with-color">
          {asset.color && (
            <span
              className="portfolio-table__color-indicator"
              style={{ backgroundColor: asset.color }}
              title={asset.color}
            />
          )}
          <span className="portfolio-table__value">{asset.name}</span>
        </div>
      </div>

      {/* 计划比例 */}
      <div className="portfolio-table__cell">
        <span className="portfolio-table__value">{asset.plannedPercentage.toFixed(1)}%</span>
      </div>

      {/* 计划金额 */}
      <div className="portfolio-table__cell">
        <span className="portfolio-table__value">
          {formatCurrency(asset.plannedAmount, 'CNY', { decimals: 0 })}
        </span>
      </div>

      {/* 实际金额 */}
      <div className="portfolio-table__cell">
        <span className="portfolio-table__value">
          {formatCurrency(asset.actualAmount, 'CNY', { decimals: 0 })}
        </span>
      </div>

      {/* 实际比例 */}
      <div className="portfolio-table__cell">
        <span className="portfolio-table__value">{asset.actualPercentage.toFixed(1)}%</span>
      </div>

      {/* 偏离度 */}
      <div className="portfolio-table__cell">
        <OperationSuggestion suggestion={asset.suggestion} amount={asset.suggestionAmount} />
      </div>

      {/* 操作按钮 */}
      <div className="portfolio-table__cell portfolio-table__actions">
        <button
          className="portfolio-table__action-btn portfolio-table__action-btn--edit"
          onClick={() => onEdit(asset.id)}
        >
          编辑
        </button>
        <button
          className="portfolio-table__action-btn portfolio-table__action-btn--delete"
          onClick={() => onDelete(asset.id)}
        >
          删除
        </button>
      </div>
    </div>
  )
}
