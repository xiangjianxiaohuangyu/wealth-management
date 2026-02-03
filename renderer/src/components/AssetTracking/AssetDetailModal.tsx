/**
 * 资产详情弹窗组件
 *
 * 显示资产详细信息和手动调整
 */

import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { formatCurrency } from '../../utils/format/currency'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import type { AssetAdjustment, MonthlyAssetRecord } from '../../types/assetTracking.types'
import './AssetDetailModal.css'

export interface AssetDetailModalProps {
  isOpen: boolean
  onClose: () => void
  assetType: 'total-income' | 'investment' | 'savings' | 'fixed-asset'
  records: MonthlyAssetRecord[]
  onAssetUpdated: () => void
}

const ASSET_TYPE_CONFIG = {
  'total-income': {
    title: '总收入详情',
    icon: '💵',
    color: 'info',
    description: '所有月度记录的总收入之和'
  },
  'investment': {
    title: '投资金额详情',
    icon: '📈',
    color: 'primary',
    description: '所有月度记录的投资金额总和'
  },
  'savings': {
    title: '存款详情',
    icon: '💰',
    color: 'success',
    description: '所有月度记录的存款金额总和'
  },
  'fixed-asset': {
    title: '固定资产详情',
    icon: '🏠',
    color: 'warning',
    description: '手动添加的固定资产调整记录'
  }
}

export function AssetDetailModal({
  isOpen,
  onClose,
  assetType,
  records,
  onAssetUpdated
}: AssetDetailModalProps) {
  const [adjustments, setAdjustments] = useState<AssetAdjustment[]>([])
  const [newAmount, setNewAmount] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])

  // 折叠状态
  const [collapsedSections, setCollapsedSections] = useState({
    records: false,
    adjustments: false
  })

  // 加载调整记录
  const loadAdjustments = () => {
    const allAdjustments = assetTrackingStorage.getAllAdjustments()
    const filtered = allAdjustments.filter(a => a.type === assetType)
    setAdjustments(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  // 加载调整记录
  useEffect(() => {
    if (isOpen) {
      loadAdjustments()
    }
  }, [isOpen, assetType])

  // 计算基础值（从月度记录）
  const calculateBaseValue = (): number => {
    if (assetType === 'fixed-asset') return 0

    return records.reduce((sum, record) => {
      if (assetType === 'total-income') {
        return sum + record.totalIncome
      } else if (assetType === 'investment') {
        return sum + record.investment
      } else if (assetType === 'savings') {
        return sum + record.savings
      }
      return sum
    }, 0)
  }

  // 计算调整总值
  const calculateAdjustmentTotal = (): number => {
    return adjustments.reduce((sum, adj) => sum + adj.amount, 0)
  }

  // 计算最终总值
  const calculateFinalValue = (): number => {
    return calculateBaseValue() + calculateAdjustmentTotal()
  }

  // 添加新调整
  const handleAddAdjustment = () => {
    const amount = parseFloat(newAmount)
    if (!amount || !newDate) return

    // 总收入不允许手动调整
    if (assetType === 'total-income') {
      alert('总收入由月度记录自动计算，不允许手动调整')
      return
    }

    const success = assetTrackingStorage.addAdjustment({
      type: assetType,
      amount,
      description: newDescription.trim() || '未说明',
      date: newDate
    })

    if (success) {
      setNewAmount('')
      setNewDescription('')
      loadAdjustments()
      onAssetUpdated()
      onClose() // 添加成功后关闭弹窗
    }
  }

  // 删除调整记录
  const handleDeleteAdjustment = (id: string) => {
    const success = assetTrackingStorage.deleteAdjustment(id)
    if (success) {
      loadAdjustments()
      onAssetUpdated()
    }
  }

  const config = ASSET_TYPE_CONFIG[assetType]
  const baseValue = calculateBaseValue()
  const adjustmentTotal = calculateAdjustmentTotal()
  const finalValue = calculateFinalValue()

  // 根据资产类型显示不同的标签
  const isNotTotalIncome = assetType !== 'total-income'
  const adjustmentLabel = isNotTotalIncome ? '补充记录' : '月度记录'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      className="modal--asset-detail"
      closeOnOverlayClick={false}
    >
      <div className="asset-detail-modal">
        {/* 总览卡片 */}
        <div className="asset-detail-modal__summary">
          <div className="asset-detail-modal__summary-item">
            <span className="asset-detail-modal__summary-label">基础值（月度记录来源）</span>
            <span className="asset-detail-modal__summary-value">
              {formatCurrency(baseValue, 'CNY')}
            </span>
          </div>
          <div className="asset-detail-modal__summary-item">
            <span className="asset-detail-modal__summary-label">手动调整</span>
            <span className={`asset-detail-modal__summary-value ${adjustmentTotal >= 0 ? 'positive' : 'negative'}`}>
              {adjustmentTotal >= 0 ? '+' : ''}{formatCurrency(adjustmentTotal, 'CNY')}
            </span>
          </div>
          <div className="asset-detail-modal__summary-item asset-detail-modal__summary-item--total">
            <span className="asset-detail-modal__summary-label">总计</span>
            <span className="asset-detail-modal__summary-value asset-detail-modal__summary-value--total">
              {formatCurrency(finalValue, 'CNY')}
            </span>
          </div>
        </div>

        {/* 月度记录来源 */}
        {assetType !== 'fixed-asset' && (
          <div className="asset-detail-modal__section">
            <h4
              className="asset-detail-modal__section-title asset-detail-modal__section-title--clickable"
              onClick={() => setCollapsedSections({ ...collapsedSections, records: !collapsedSections.records })}
            >
              {collapsedSections.records ? '▶' : '▼'} 月度记录来源
            </h4>
            {!collapsedSections.records && (
              <div className="asset-detail-modal__records">
              {records.length === 0 ? (
                <div className="asset-detail-modal__empty">暂无月度记录</div>
              ) : (
                <div className="asset-detail-modal__records-list">
                  {records.map(record => {
                    const recordValue = assetType === 'total-income'
                      ? record.totalIncome
                      : assetType === 'investment'
                      ? record.investment
                      : record.savings

                    return (
                      <div key={record.id} className="asset-detail-modal__record-item">
                        <span className="asset-detail-modal__record-month">
                          {record.year}年{record.month}月
                        </span>
                        <span className="asset-detail-modal__record-value">
                          {formatCurrency(recordValue, 'CNY')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {/* 月度记录 */}
        <div className="asset-detail-modal__section">
          <h4
            className="asset-detail-modal__section-title asset-detail-modal__section-title--clickable"
            onClick={() => setCollapsedSections({ ...collapsedSections, adjustments: !collapsedSections.adjustments })}
          >
            {collapsedSections.adjustments ? '▶' : '▼'} {adjustmentLabel}
          </h4>
          {!collapsedSections.adjustments && (
            <div className="asset-detail-modal__adjustments">
            {adjustments.length === 0 ? (
              <div className="asset-detail-modal__empty">暂无补充记录</div>
            ) : (
              <div className="asset-detail-modal__adjustments-list">
                {adjustments.map(adj => (
                  <div key={adj.id} className="asset-detail-modal__adjustment-item">
                    <div className="asset-detail-modal__adjustment-info">
                      <span className="asset-detail-modal__adjustment-amount">
                        {adj.amount >= 0 ? '+' : ''}{formatCurrency(adj.amount, 'CNY')}
                      </span>
                      <span className="asset-detail-modal__adjustment-description">
                        {adj.description}
                      </span>
                      <span className="asset-detail-modal__adjustment-date">
                        {adj.date}
                      </span>
                    </div>
                    <button
                      className="asset-detail-modal__delete-btn"
                      onClick={() => handleDeleteAdjustment(adj.id)}
                      title="删除此记录"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>

        {/* 添加新调整 */}
        <div className="asset-detail-modal__section">
          <h4 className="asset-detail-modal__section-title">添加{adjustmentLabel}</h4>
          <div className="asset-detail-modal__add-form">
            <div className="asset-detail-modal__form-row">
              <label className="asset-detail-modal__form-label">金额</label>
              <input
                type="number"
                className="asset-detail-modal__form-input"
                placeholder="正数增加，负数减少"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="asset-detail-modal__form-row">
              <label className="asset-detail-modal__form-label">说明（选填）</label>
              <input
                type="text"
                className="asset-detail-modal__form-input"
                placeholder="例如：购买房产、出售车辆等"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            </div>
            <div className="asset-detail-modal__form-row">
              <label className="asset-detail-modal__form-label">日期</label>
              <input
                type="date"
                className="asset-detail-modal__form-input"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
              />
            </div>
            <button
              className="asset-detail-modal__add-btn"
              onClick={handleAddAdjustment}
              disabled={!newAmount}
            >
              添加{adjustmentLabel}
            </button>
          </div>
        </div>

        {/* 说明 */}
        <div className="asset-detail-modal__hint">
          💡 提示：正数表示增加资产，负数表示减少资产
        </div>
      </div>
    </Modal>
  )
}
