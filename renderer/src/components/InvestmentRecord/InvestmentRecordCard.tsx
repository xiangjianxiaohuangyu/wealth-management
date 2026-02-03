/**
 * 投资记录卡片组件
 *
 * 显示单个资产卡片及其记录行
 * 支持编辑模式、折叠、批量添加行、拖拽
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { Card } from '../common/Card/Card'
import { InvestmentRecordTable } from './InvestmentRecordTable'
import { BatchAddDialog } from './BatchAddDialog'
import { DragHandle } from './DragHandle'
import { formatCurrency } from '../../utils/format/currency'
import type { InvestmentRecordCard as InvestmentRecordCardType, InvestmentRecordRowUpdate, InvestmentRecordCardUpdate } from '../../types/investmentRecord.types'
import './InvestmentRecordCard.css'

export interface InvestmentRecordCardProps {
  /** 卡片数据 */
  card: InvestmentRecordCardType
  /** 总收入（用于计算规划金额） */
  totalInvestment: number
  /** 更新卡片字段 */
  onCardUpdate: (cardId: string, updates: InvestmentRecordCardUpdate) => void
  /** 添加行 */
  onAddRow: (cardId: string) => void
  /** 批量添加行 */
  onBatchAddRows?: (cardId: string, rowCount: number, startPercentage: number, increment: number) => void
  /** 更新行 */
  onRowUpdate: (cardId: string, rowId: string, updates: InvestmentRecordRowUpdate) => void
  /** 删除行 */
  onRowDelete: (cardId: string, rowId: string) => void
  /** 行重新排序 */
  onRowReorder?: (oldIndex: number, newIndex: number) => void
  /** 删除卡片 */
  onDelete: (cardId: string) => void
}

function InvestmentRecordCard({
  card,
  totalInvestment,
  onCardUpdate,
  onAddRow,
  onBatchAddRows,
  onRowUpdate,
  onRowDelete,
  onRowReorder,
  onDelete
}: InvestmentRecordCardProps) {

  const [cardName, setCardName] = useState(card.name)
  const [stockCode, setStockCode] = useState(card.stockCode || '')
  const [latestPrice, setLatestPrice] = useState(card.latestPrice || 0)
  const [isEditing, setIsEditing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showBatchAddDialog, setShowBatchAddDialog] = useState(false)

  // 同步 props 变化到本地状态
  useEffect(() => {
    setCardName(card.name)
    setStockCode(card.stockCode || '')
    setLatestPrice(card.latestPrice || 0)
  }, [card.name, card.stockCode, card.latestPrice])

  // 集成拖拽功能
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  // 计算卡片完成度
  const cardProgress = useMemo(() => {
    // 计算总规划金额（总收入 × 规划比例）
    const totalPlanned = card.rows.reduce((sum, row) => {
      return sum + (totalInvestment * row.plannedPercentage / 100)
    }, 0)

    // 计算总实际金额
    const totalActual = card.rows.reduce((sum, row) => sum + row.actualAmount, 0)

    // 计算完成百分比
    const percentage = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0

    return {
      totalPlanned,
      totalActual,
      percentage: Math.min(percentage, 100)
    }
  }, [card.rows, totalInvestment])

  // 确定进度颜色
  const getProgressColor = useCallback((percentage: number): string => {
    if (percentage >= 100) return '#00b894' // 绿色
    if (percentage >= 80) return '#fdcb6e'  // 黄色
    return '#0984e3'                        // 蓝色
  }, [])

  // 进入编辑模式
  const handleEditClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  // 保存并退出编辑模式
  const handleSaveClick = useCallback(() => {
    if (cardName.trim() && cardName !== card.name) {
      onCardUpdate(card.id, { name: cardName.trim() })
    }
    if (stockCode !== (card.stockCode || '')) {
      onCardUpdate(card.id, { stockCode: stockCode.trim() })
    }
    onCardUpdate(card.id, { latestPrice })
    setIsEditing(false)
  }, [card.id, card.name, card.stockCode, cardName, stockCode, latestPrice, onCardUpdate])

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setCardName(card.name)
    setStockCode(card.stockCode || '')
    setLatestPrice(card.latestPrice || 0)
    setIsEditing(false)
  }, [card.name, card.stockCode, card.latestPrice])

  const handleNameBlur = useCallback(() => {
    // 编辑模式下，失焦不保存，需要点击保存按钮
  }, [])

  const handleNameKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }, [])

  const handleAddRow = useCallback(() => {
    onAddRow(card.id)
  }, [card.id, onAddRow])

  const handleBatchAdd = useCallback(() => {
    setShowBatchAddDialog(true)
  }, [])

  const handleBatchAddConfirm = useCallback((rowCount: number, startPercentage: number, increment: number) => {
    onBatchAddRows?.(card.id, rowCount, startPercentage, increment)
  }, [card.id, onBatchAddRows])

  const handleRowUpdate = useCallback((rowId: string, updates: InvestmentRecordRowUpdate) => {
    onRowUpdate(card.id, rowId, updates)
  }, [card.id, onRowUpdate])

  const handleRowReorder = useCallback((oldIndex: number, newIndex: number) => {
    onRowReorder?.(oldIndex, newIndex)
  }, [onRowReorder])

  const handleRowDelete = useCallback((rowId: string) => {
    onRowDelete(card.id, rowId)
  }, [card.id, onRowDelete])

  const handleDelete = useCallback(() => {
    onDelete(card.id)
  }, [card.id, onDelete])

  // 清空所有行
  const handleClearRows = useCallback(() => {
    if (window.confirm(`确定要清空"${card.name}"的所有记录行吗？此操作不可撤销。`)) {
      card.rows.forEach(row => {
        onRowDelete(card.id, row.id)
      })
    }
  }, [card.id, card.name, card.rows, onRowDelete])

  // 复制卡片
  const handleCopyCard = useCallback(() => {
    // 这里需要父组件支持复制功能
    // 暂时使用 alert 提示
    alert('复制卡片功能需要在父组件中实现，请告知开发者添加 onCopyCard 回调')
  }, [])

  // 切换折叠状态
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault()
          handleSaveClick()
        } else if (e.key === 'Escape') {
          handleCancelEdit()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, handleSaveClick, handleCancelEdit])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="investment-record-card-wrapper"
    >
      <Card className={`investment-record-card ${isCollapsed ? 'investment-record-card--collapsed' : ''}`}>
        {/* 卡片头部 */}
        <div className={`investment-record-card__header ${isCollapsed ? 'investment-record-card__header--collapsed' : ''}`}>
          {/* 标题行：拖拽手柄、折叠按钮、名称、股票信息、进度 */}
          <div className="investment-record-card__title-row">
            <div className="investment-record-card__title-left">
              {/* 拖拽手柄 */}
              <div
                className="investment-record-card__drag-handle"
                {...attributes}
                {...listeners}
                title="拖拽以移动卡片"
              >
                <DragHandle type="card" />
              </div>

              {/* 折叠按钮（折叠时不显示） */}
              {!isCollapsed && (
                <button
                  className="investment-record-card__collapse-btn"
                  onClick={toggleCollapse}
                  title="折叠"
                >
                  ▼
                </button>
              )}

              {/* 资产名称 */}
              {isEditing ? (
                <input
                  type="text"
                  className="investment-record-card__name-input investment-record-card__name-input--editing"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyPress}
                  placeholder="输入资产名称"
                  autoFocus
                />
              ) : (
                <span className="investment-record-card__name-text">{card.name}</span>
              )}

              {/* 股票代码和最新价 - 紧跟在名称后面 */}
              {!isEditing && (stockCode || latestPrice > 0) && (
                <span className="investment-record-card__stock-inline">
                  {stockCode && (
                    <>
                      <span className="investment-record-card__stock-code">{stockCode}</span>
                      {latestPrice > 0 && <span className="investment-record-card__separator">·</span>}
                    </>
                  )}
                  {latestPrice > 0 && (
                    <span className={`investment-record-card__latest-price ${latestPrice > 0 ? 'positive' : ''}`}>
                      ¥{latestPrice.toFixed(2)}
                    </span>
                  )}
                </span>
              )}

              {/* 编辑模式下的股票代码和最新价输入 */}
              {isEditing && (
                <div className="investment-record-card__stock-edit">
                  <input
                    type="text"
                    className="investment-record-card__stock-input"
                    value={stockCode}
                    onChange={(e) => setStockCode(e.target.value)}
                    placeholder="股票代码"
                  />
                  <input
                    type="number"
                    className="investment-record-card__price-input"
                    value={latestPrice}
                    onChange={(e) => setLatestPrice(parseFloat(e.target.value) || 0)}
                    placeholder="最新价"
                    step="0.01"
                  />
                </div>
              )}

              {/* 进度指示器 */}
              {cardProgress.totalPlanned > 0 && (
                <div
                  className="investment-record-card__progress-badge"
                  style={{ backgroundColor: getProgressColor(cardProgress.percentage) }}
                >
                  {cardProgress.percentage.toFixed(0)}%
                </div>
              )}
            </div>

            {/* 右侧操作区域 */}
            <div className="investment-record-card__header-right">
              {/* 统计信息 - 仅非折叠且非编辑状态显示 */}
              {!isCollapsed && !isEditing && cardProgress.totalPlanned > 0 && (
                <div className="investment-record-card__stats-inline">
                  <span className="investment-record-card__stat-item-inline">
                    <span className="stat-label">规划:</span>
                    <span className="stat-value">{formatCurrency(cardProgress.totalPlanned, 'CNY')}</span>
                  </span>
                  <span className="investment-record-card__stat-item-inline">
                    <span className="stat-label">实际:</span>
                    <span className="stat-value">{formatCurrency(cardProgress.totalActual, 'CNY')}</span>
                  </span>
                  <span className={`investment-record-card__stat-item-inline ${cardProgress.totalActual >= cardProgress.totalPlanned ? 'profit' : 'loss'}`}>
                    <span className="stat-label">盈亏:</span>
                    <span className="stat-value">
                      {cardProgress.totalActual >= cardProgress.totalPlanned ? '+' : ''}
                      {formatCurrency(cardProgress.totalActual - cardProgress.totalPlanned, 'CNY')}
                    </span>
                  </span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="investment-record-card__actions">
                {isEditing ? (
                  <>
                    {/* 编辑模式：所有按钮在一行 */}
                    <button className="investment-record-card__btn investment-record-card__btn--save" onClick={handleSaveClick} title="Ctrl+S">保存</button>
                    <button className="investment-record-card__btn investment-record-card__btn--cancel" onClick={handleCancelEdit} title="ESC">取消</button>
                    <button className="investment-record-card__btn investment-record-card__btn--add" onClick={handleAddRow}>+ 添加行</button>
                    <button className="investment-record-card__btn investment-record-card__btn--batch" onClick={handleBatchAdd}>批量</button>
                    <button className="investment-record-card__btn investment-record-card__btn--clear" onClick={handleClearRows} title="清空所有行">清空</button>
                    <button className="investment-record-card__btn investment-record-card__btn--copy" onClick={handleCopyCard} title="复制卡片">复制</button>
                    <button className="investment-record-card__btn investment-record-card__btn--delete" onClick={handleDelete}>删除</button>
                  </>
                ) : (
                  /* 非编辑模式且非折叠状态：只显示编辑按钮 */
                  !isCollapsed && (
                    <button className="investment-record-card__btn investment-record-card__btn--edit" onClick={handleEditClick}>
                      编辑
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 表格区域 - 折叠时隐藏 */}
        {!isCollapsed && (
          <div className="investment-record-card__content">
            <InvestmentRecordTable
              rows={card.rows}
              totalInvestment={totalInvestment}
              onRowUpdate={handleRowUpdate}
              onRowDelete={handleRowDelete}
              onRowReorder={handleRowReorder}
              editing={isEditing}
            />
          </div>
        )}

        {/* 批量添加对话框 */}
        <BatchAddDialog
          isOpen={showBatchAddDialog}
          onClose={() => setShowBatchAddDialog(false)}
          onConfirm={handleBatchAddConfirm}
        />
      </Card>
    </div>
  )
}

// 使用 React.memo 优化，仅在 props 变化时重新渲染
const MemoizedInvestmentRecordCard = React.memo(InvestmentRecordCard, (prevProps, nextProps) => {
  // 自定义比较函数：仅当关键 props 变化时才重新渲染
  return (
    prevProps.card === nextProps.card &&
    prevProps.totalInvestment === nextProps.totalInvestment &&
    prevProps.onCardUpdate === nextProps.onCardUpdate &&
    prevProps.onAddRow === nextProps.onAddRow &&
    prevProps.onRowUpdate === nextProps.onRowUpdate &&
    prevProps.onRowDelete === nextProps.onRowDelete &&
    prevProps.onDelete === nextProps.onDelete
  )
})

MemoizedInvestmentRecordCard.displayName = 'InvestmentRecordCard'

export { MemoizedInvestmentRecordCard as InvestmentRecordCard }
