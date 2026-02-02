/**
 * 投资记录页面
 *
 * 记录和管理各类投资资产的详细信息
 */

import { useEffect, useState } from 'react'
import { investmentRecordStorage } from '../../services/storage/investmentRecordStorage'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import { InvestmentRecordCard } from '../../components/InvestmentRecord/InvestmentRecordCard'
import { ConfirmDialog } from '../../components/Investment/ConfirmDialog'
import { Card } from '../../components/common/Card/Card'
import { formatCurrency } from '../../utils/format/currency'
import type { InvestmentRecordCard as InvestmentRecordCardType, InvestmentRecordRow, InvestmentRecordRowUpdate } from '../../types/investmentRecord.types'
import './InvestmentRecord.css'

export default function InvestmentRecord() {
  const [cards, setCards] = useState<InvestmentRecordCardType[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 初始化：从 localStorage 加载数据
  useEffect(() => {
    const loadedCards = investmentRecordStorage.getAllCards()
    setCards(loadedCards)
  }, [])

  // 从资产跟踪获取总投资金额
  const getTotalInvestment = (): number => {
    const records = assetTrackingStorage.getAllRecords()
    const adjustments = assetTrackingStorage.getAllAdjustments()

    const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)
    const investmentAdjustments = adjustments
      .filter(a => a.type === 'investment')
      .reduce((sum, adj) => sum + adj.amount, 0)

    return baseInvestment + investmentAdjustments
  }

  // 实时监听总投资金额变化（每秒检查一次）
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newAmount = getTotalInvestment()
      setTotalInvestment(newAmount)
    }, 1000)

    // 初始化时立即获取一次
    setTotalInvestment(getTotalInvestment())

    return () => clearInterval(intervalId)
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
      rows: []
    }

    const newCard = investmentRecordStorage.addCard(defaultCard)
    if (newCard) {
      setCards([...cards, newCard])
    }
  }

  // 更新卡片名称
  const handleNameUpdate = (cardId: string, name: string) => {
    investmentRecordStorage.updateCard(cardId, { name })
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, name } : card
    ))
  }

  // 添加行到卡片
  const handleAddRow = (cardId: string) => {
    const defaultRow: Omit<InvestmentRecordRow, 'id' | 'createdAt' | 'updatedAt'> = {
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

  return (
    <div className="investment-record">
      {/* 页面标题区 */}
      <div className="investment-record__header">
        <h1 className="investment-record__title">投资记录</h1>
        <button
          className="investment-record__add-btn"
          onClick={handleAddCard}
        >
          + 添加资产
        </button>
      </div>

      {/* 总投资金额卡片 */}
      <Card className="investment-record__total-card">
        <div className="investment-record__total-content">
          <div className="investment-record__total-icon">📈</div>
          <div className="investment-record__total-info">
            <div className="investment-record__total-label">总投资金额</div>
            <div className="investment-record__total-value">{formatCurrency(totalInvestment, 'CNY')}</div>
          </div>
        </div>
      </Card>

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
        <div className="investment-record__cards-container">
          {cards.map(card => (
            <InvestmentRecordCard
              key={card.id}
              card={card}
              totalInvestment={totalInvestment}
              onNameUpdate={handleNameUpdate}
              onAddRow={handleAddRow}
              onRowUpdate={handleRowUpdate}
              onRowDelete={handleRowDelete}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
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
    </div>
  )
}
