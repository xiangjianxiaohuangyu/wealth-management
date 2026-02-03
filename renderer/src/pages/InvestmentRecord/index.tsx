/**
 * 投资记录页面
 *
 * 记录和管理各类投资资产的详细信息
 * 支持卡片拖拽、批量添加行、行拖拽排序
 */

import { useEffect, useState, useMemo } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { investmentRecordStorage } from '../../services/storage/investmentRecordStorage'
import { InvestmentRecordCard } from '../../components/InvestmentRecord/InvestmentRecordCard'
import { StatisticsPanel } from '../../components/InvestmentRecord/StatisticsPanel'
import { ImportDialog } from '../../components/InvestmentRecord/ImportDialog'
import { ConfirmDialog } from '../../components/Investment/ConfirmDialog'
import { Card } from '../../components/common/Card/Card'
import { formatCurrency } from '../../utils/format/currency'
import { eventBus } from '../../utils/eventBus'
import { calculateTotalIncome, calculateTotalInvestment } from '../../utils/calculation/assetCalculation'
import type { InvestmentRecordCard as InvestmentRecordCardType, InvestmentRecordRow, InvestmentRecordRowUpdate, InvestmentRecordData } from '../../types/investmentRecord.types'
import './InvestmentRecord.css'

export default function InvestmentRecord() {
  const [cards, setCards] = useState<InvestmentRecordCardType[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  // 初始化：从 localStorage 加载数据
  useEffect(() => {
    const loadedCards = investmentRecordStorage.getAllCards()
    setCards(loadedCards)
  }, [])

  // 监听资产跟踪数据变化（使用事件总线替代轮询）
  useEffect(() => {
    // 更新数据的函数
    const updateData = () => {
      setTotalIncome(calculateTotalIncome())
      setTotalInvestment(calculateTotalInvestment())
    }

    // 初始化时立即获取一次
    updateData()

    // 监听资产跟踪数据变化事件
    eventBus.on('asset-tracking-changed', updateData)

    // 清理函数
    return () => {
      eventBus.off('asset-tracking-changed', updateData)
    }
  }, [])

  // 数据持久化
  useEffect(() => {
    if (cards.length > 0) {
      investmentRecordStorage.saveCards(cards)
    }
  }, [cards])

  // 添加卡片
  const handleAddCard = () => {
    const defaultCard: Omit<InvestmentRecordCardType, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `资产 ${cards.length + 1}`,
      stockCode: '',
      latestPrice: 0,
      rows: [],
      cardOrderIndex: cards.length
    }

    const newCard = investmentRecordStorage.addCard(defaultCard)
    if (newCard) {
      setCards([...cards, newCard])
    }
  }

  // 更新卡片字段（名称、股票代码、最新价等）
  const handleCardUpdate = (cardId: string, updates: { name?: string; stockCode?: string; latestPrice?: number }) => {
    investmentRecordStorage.updateCard(cardId, updates)
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    ))
  }

  // 添加行到卡片
  const handleAddRow = (cardId: string) => {
    const defaultRow: Omit<InvestmentRecordRow, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex'> = {
      startPoint: 0,
      endPoint: 0,
      plannedPercentage: 0,
      actualAmount: 0
    }

    const newRow = investmentRecordStorage.addRow(cardId, defaultRow)
    if (newRow) {
      setCards(cards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            rows: [...card.rows, newRow],
            updatedAt: new Date().toISOString()
          }
        }
        return card
      }))
    }
  }

  // 批量添加行到卡片
  const handleBatchAddRows = (
    cardId: string,
    rowCount: number,
    startPercentage: number,
    increment: number
  ) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newRows: InvestmentRecordRow[] = []

        for (let i = 0; i < rowCount; i++) {
          const newRow: Omit<InvestmentRecordRow, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex'> = {
            startPoint: 0,
            endPoint: 0,
            plannedPercentage: startPercentage + (i * increment),
            actualAmount: 0
          }
          const addedRow = investmentRecordStorage.addRow(cardId, newRow)
          if (addedRow) {
            newRows.push(addedRow)
          }
        }

        // 重新加载卡片数据以获取正确的 orderIndex
        const updatedCard = investmentRecordStorage.getAllCards().find(c => c.id === cardId)
        return updatedCard || card
      }
      return card
    }))
  }

  // 行重新排序
  const handleRowReorder = (cardId: string, oldIndex: number, newIndex: number) => {
    investmentRecordStorage.reorderRows(cardId, oldIndex, newIndex)
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const reorderedRows = [...card.rows]
        const [movedRow] = reorderedRows.splice(oldIndex, 1)
        reorderedRows.splice(newIndex, 0, movedRow)

        // 更新 orderIndex
        const updatedRows = reorderedRows.map((row, index) => ({
          ...row,
          orderIndex: index
        }))

        return {
          ...card,
          rows: updatedRows,
          updatedAt: new Date().toISOString()
        }
      }
      return card
    }))
  }

  // 卡片重新排序
  const handleCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = cards.findIndex(card => card.id === active.id)
    const newIndex = cards.findIndex(card => card.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      investmentRecordStorage.reorderCards(oldIndex, newIndex)

      const reorderedCards = [...cards]
      const [movedCard] = reorderedCards.splice(oldIndex, 1)
      reorderedCards.splice(newIndex, 0, movedCard)

      // 更新 cardOrderIndex
      const updatedCards = reorderedCards.map((card, index) => ({
        ...card,
        cardOrderIndex: index
      }))

      setCards(updatedCards)
    }
  }

  // 更新行
  const handleRowUpdate = (cardId: string, rowId: string, updates: InvestmentRecordRowUpdate) => {
    investmentRecordStorage.updateRow(cardId, rowId, updates)
    setCards(cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          rows: card.rows.map(row =>
            row.id === rowId ? { ...row, ...updates, updatedAt: new Date().toISOString() } : row
          ),
          updatedAt: new Date().toISOString()
        }
      }
      return card
    }))
  }

  // 删除行
  const handleRowDelete = (cardId: string, rowId: string) => {
    investmentRecordStorage.deleteRow(cardId, rowId)
    setCards(cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          rows: card.rows.filter(row => row.id !== rowId),
          updatedAt: new Date().toISOString()
        }
      }
      return card
    }))
  }

  // 显示删除确认对话框
  const handleDeleteClick = (cardId: string) => {
    setDeleteCardId(cardId)
    setShowDeleteDialog(true)
  }

  // 确认删除卡片
  const handleConfirmDelete = () => {
    if (deleteCardId) {
      investmentRecordStorage.deleteCard(deleteCardId)
      setCards(cards.filter(card => card.id !== deleteCardId))
      setDeleteCardId(null)
      setShowDeleteDialog(false)
    }
  }

  // 取消删除
  const handleCancelDelete = () => {
    setDeleteCardId(null)
    setShowDeleteDialog(false)
  }

  // 导入数据
  const handleImport = (data: InvestmentRecordData) => {
    investmentRecordStorage.setData(data)
    setCards(data.cards)
    console.log('✅ 数据导入成功！')
  }

  // 导出数据
  const handleExport = () => {
    const data = investmentRecordStorage.getData()
    if (!data) {
      alert('没有数据可导出')
      return
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investment-record-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 构造投资记录数据（用于统计面板）
  const investmentRecordData = useMemo(() => ({
    cards,
    lastUpdated: new Date().toISOString()
  }), [cards])

  // 按 cardOrderIndex 排序卡片（卡片已由存储服务排序，这里确保显示顺序一致）
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => a.cardOrderIndex - b.cardOrderIndex)
  }, [cards])

  return (
    <div className="investment-record">
      {/* 页面标题区 */}
      <div className="investment-record__header">
        <h1 className="investment-record__title">投资记录</h1>
        <div className="investment-record__actions">
          <button
            className="investment-record__action-btn investment-record__action-btn--import"
            onClick={() => setShowImportDialog(true)}
          >
            📥 导入
          </button>
          <button
            className="investment-record__action-btn investment-record__action-btn--export"
            onClick={handleExport}
          >
            📤 导出
          </button>
          <button
            className="investment-record__add-btn"
            onClick={handleAddCard}
          >
            + 添加资产
          </button>
        </div>
      </div>

      {/* 总收入卡片 */}
      <Card className="investment-record__total-card">
        <div className="investment-record__total-content">
          <div className="investment-record__total-icon">💵</div>
          <div className="investment-record__total-info">
            <div className="investment-record__total-label">总收入</div>
            <div className="investment-record__total-value">{formatCurrency(totalIncome, 'CNY')}</div>
          </div>
        </div>
      </Card>

      {/* 统计面板 */}
      {cards.length > 0 && (
        <StatisticsPanel
          data={investmentRecordData}
          totalInvestment={totalInvestment}
          totalIncome={totalIncome}
        />
      )}

      {/* 卡片容器 */}
      {cards.length === 0 ? (
        <div className="investment-record__empty">
          <div className="investment-record__empty-icon">📝</div>
          <div className="investment-record__empty-text">暂无投资记录</div>
          <div className="investment-record__empty-hint">
            点击"添加资产"开始记录您的投资
          </div>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleCardDragEnd}>
          <SortableContext
            items={sortedCards.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="investment-record__cards-container">
              {sortedCards.map(card => (
                <InvestmentRecordCard
                  key={card.id}
                  card={card}
                  totalInvestment={totalIncome}
                  onCardUpdate={handleCardUpdate}
                  onAddRow={handleAddRow}
                  onBatchAddRows={(cardId, rowCount, startPercentage, increment) =>
                    handleBatchAddRows(cardId, rowCount, startPercentage, increment)
                  }
                  onRowUpdate={handleRowUpdate}
                  onRowDelete={(rowId) => handleRowDelete(card.id, rowId)}
                  onRowReorder={(oldIndex, newIndex) => handleRowReorder(card.id, oldIndex, newIndex)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="确认删除"
        message="确定要删除这个资产卡片吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />

      {/* 导入对话框 */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />
    </div>
  )
}
