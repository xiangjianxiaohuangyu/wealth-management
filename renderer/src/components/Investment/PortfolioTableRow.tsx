/**
 * 投资组合表格行组件
 *
 * 功能：
 * - 查看模式：显示数据 + 编辑/删除按钮
 * - 编辑模式：显示输入框 + 保存/取消按钮
 * - 实时计算预览
 */

import { useState, useEffect } from 'react'
import type { AssetAllocationItem } from '../../types/investment.types'
import { OperationSuggestion } from './OperationSuggestion'
import { formatCurrency } from '../../utils/format/currency'
import { updateAssetCalculations } from '../../utils/calculation/portfolioCalculation'
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
  /** 编辑按钮点击回调 */
  onEdit: (id: string) => void
  /** 保存回调 */
  onSave: (id: string, updates: Partial<AssetAllocationItem>) => void
  /** 取消回调 */
  onCancel: () => void
  /** 删除回调 */
  onDelete: (id: string) => void
}

export function PortfolioTableRow({
  asset,
  isEditing,
  totalAmount,
  totalActualAmount,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: PortfolioTableRowProps) {
  // 编辑时的临时数据
  const [tempAsset, setTempAsset] = useState<AssetAllocationItem>(asset)
  const [calculatedAsset, setCalculatedAsset] = useState<AssetAllocationItem>(asset)

  // 当 asset 变化或进入/退出编辑模式时，更新临时数据
  useEffect(() => {
    setTempAsset(asset)
    setCalculatedAsset(asset)
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
      actualAmount: tempAsset.actualAmount
    })
  }

  const handleCancel = () => {
    setTempAsset(asset)
    onCancel()
  }

  if (isEditing) {
    // 编辑模式
    return (
      <div className="portfolio-table__row portfolio-table__row--editing">
        {/* 资产名称 */}
        <div className="portfolio-table__cell">
          <input
            type="text"
            className="portfolio-table__input"
            value={tempAsset.name}
            onChange={e => setTempAsset({ ...tempAsset, name: e.target.value })}
            placeholder="资产名称"
          />
        </div>

        {/* 计划比例 */}
        <div className="portfolio-table__cell portfolio-table__cell--input">
          <div className="portfolio-table__input-wrapper">
            <input
              type="number"
              className="portfolio-table__input"
              min="0"
              max="100"
              step="0.1"
              value={tempAsset.plannedPercentage}
              onChange={e =>
                setTempAsset({
                  ...tempAsset,
                  plannedPercentage: parseFloat(e.target.value) || 0
                })
              }
            />
            <span className="portfolio-table__suffix">%</span>
          </div>
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
              onChange={e =>
                setTempAsset({
                  ...tempAsset,
                  actualAmount: parseFloat(e.target.value) || 0
                })
              }
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
        <span className="portfolio-table__value">{asset.name}</span>
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
