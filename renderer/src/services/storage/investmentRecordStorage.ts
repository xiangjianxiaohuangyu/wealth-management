/**
 * 投资记录数据存储服务
 *
 * 用于保存和加载投资记录数据
 */

import { storage } from './localStorage'
import type { InvestmentRecordData, InvestmentRecordCard, InvestmentRecordRow, InvestmentRecordRowUpdate } from '../../types/investmentRecord.types'

/**
 * 投资记录数据存储服务
 */
export const investmentRecordStorage = {
  /** 存储键 */
  STORAGE_KEY: 'wealth_investment_record_data',

  /**
   * 获取投资记录数据
   */
  getData(): InvestmentRecordData | null {
    return storage.get<InvestmentRecordData>(this.STORAGE_KEY)
  },

  /**
   * 保存投资记录数据
   */
  setData(data: InvestmentRecordData): boolean {
    const dataToSave: InvestmentRecordData = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    return storage.set(this.STORAGE_KEY, dataToSave)
  },

  /**
   * 获取所有卡片
   */
  getAllCards(): InvestmentRecordCard[] {
    const data = this.getData()
    const cards = data?.cards || []

    // 数据迁移：为旧数据添加 orderIndex 和 cardOrderIndex
    let needsSave = false
    const migratedCards = cards.map((card, cardIndex) => {
      let updatedCard = { ...card }

      // 添加卡片顺序索引
      if (typeof updatedCard.cardOrderIndex !== 'number') {
        updatedCard = { ...updatedCard, cardOrderIndex: cardIndex }
        needsSave = true
      }

      // 添加行顺序索引
      const rows = updatedCard.rows.map((row, rowIndex) => {
        if (typeof row.orderIndex !== 'number') {
          needsSave = true
          return { ...row, orderIndex: rowIndex }
        }
        return row
      })

      if (rows !== updatedCard.rows) {
        updatedCard = { ...updatedCard, rows }
      }

      return updatedCard
    })

    // 如果有数据迁移，自动保存
    if (needsSave) {
      this.saveCards(migratedCards)
    }

    // 按 cardOrderIndex 排序后返回
    return migratedCards.sort((a, b) => a.cardOrderIndex - b.cardOrderIndex)
  },

  /**
   * 保存所有卡片
   */
  saveCards(cards: InvestmentRecordCard[]): boolean {
    return this.setData({
      cards,
      lastUpdated: new Date().toISOString()
    })
  },

  /**
   * 添加卡片
   */
  addCard(card: Omit<InvestmentRecordCard, 'id' | 'createdAt' | 'updatedAt' | 'cardOrderIndex'>): InvestmentRecordCard | null {
    const cards = this.getAllCards()
    const now = new Date().toISOString()
    const maxOrderIndex = cards.length > 0 ? Math.max(...cards.map(c => c.cardOrderIndex ?? -1)) : -1
    const newCard: InvestmentRecordCard = {
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cardOrderIndex: maxOrderIndex + 1,
      createdAt: now,
      updatedAt: now
    }

    cards.push(newCard)
    const success = this.saveCards(cards)
    return success ? newCard : null
  },

  /**
   * 更新卡片
   */
  updateCard(cardId: string, updates: Partial<Omit<InvestmentRecordCard, 'id' | 'createdAt'>>): boolean {
    const cards = this.getAllCards()
    const index = cards.findIndex(c => c.id === cardId)

    if (index === -1) {
      return false
    }

    cards[index] = {
      ...cards[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return this.saveCards(cards)
  },

  /**
   * 删除卡片
   */
  deleteCard(cardId: string): boolean {
    const cards = this.getAllCards()
    const filteredCards = cards.filter(c => c.id !== cardId)

    if (filteredCards.length === cards.length) {
      return false // 没有找到要删除的卡片
    }

    return this.saveCards(filteredCards)
  },

  /**
   * 添加行到卡片
   */
  addRow(cardId: string, row: Omit<InvestmentRecordRow, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex'>): InvestmentRecordRow | null {
    const cards = this.getAllCards()
    const cardIndex = cards.findIndex(c => c.id === cardId)

    if (cardIndex === -1) {
      return null
    }

    const now = new Date().toISOString()
    const maxOrderIndex = cards[cardIndex].rows.length > 0
      ? Math.max(...cards[cardIndex].rows.map(r => r.orderIndex ?? -1))
      : -1
    const newRow: InvestmentRecordRow = {
      ...row,
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderIndex: maxOrderIndex + 1,
      createdAt: now,
      updatedAt: now
    }

    cards[cardIndex].rows.push(newRow)
    cards[cardIndex].updatedAt = now

    const success = this.saveCards(cards)
    return success ? newRow : null
  },

  /**
   * 更新卡片中的行
   */
  updateRow(cardId: string, rowId: string, updates: InvestmentRecordRowUpdate): boolean {
    const cards = this.getAllCards()
    const cardIndex = cards.findIndex(c => c.id === cardId)

    if (cardIndex === -1) {
      return false
    }

    const rowIndex = cards[cardIndex].rows.findIndex(r => r.id === rowId)

    if (rowIndex === -1) {
      return false
    }

    cards[cardIndex].rows[rowIndex] = {
      ...cards[cardIndex].rows[rowIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    cards[cardIndex].updatedAt = new Date().toISOString()

    return this.saveCards(cards)
  },

  /**
   * 删除卡片中的行
   */
  deleteRow(cardId: string, rowId: string): boolean {
    const cards = this.getAllCards()
    const cardIndex = cards.findIndex(c => c.id === cardId)

    if (cardIndex === -1) {
      return false
    }

    const originalLength = cards[cardIndex].rows.length
    cards[cardIndex].rows = cards[cardIndex].rows.filter(r => r.id !== rowId)

    if (cards[cardIndex].rows.length === originalLength) {
      return false // 没有找到要删除的行
    }

    cards[cardIndex].updatedAt = new Date().toISOString()

    return this.saveCards(cards)
  },

  /**
   * 清除所有数据
   */
  clearData(): boolean {
    return storage.remove(this.STORAGE_KEY)
  },

  /**
   * 导出数据为JSON字符串
   */
  exportData(): string {
    const data = this.getData()
    return JSON.stringify(data, null, 2)
  },

  /**
   * 从JSON字符串导入数据
   */
  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString) as InvestmentRecordData

      // 验证数据格式
      if (!Array.isArray(data.cards)) {
        return { success: false, error: '数据格式错误：缺少卡片列表' }
      }

      // 验证每个卡片的格式
      for (const card of data.cards) {
        if (typeof card.id !== 'string' || typeof card.name !== 'string') {
          return { success: false, error: '数据格式错误：卡片数据不完整' }
        }

        if (!Array.isArray(card.rows)) {
          return { success: false, error: '数据格式错误：卡片缺少记录行' }
        }
      }

      this.setData(data)
      return { success: true }
    } catch (error) {
      return { success: false, error: '数据格式错误' }
    }
  },

  /**
   * 重新排序卡片
   */
  reorderCards(oldIndex: number, newIndex: number): boolean {
    const cards = this.getAllCards()
    const reorderedCards = [...cards]
    const [movedCard] = reorderedCards.splice(oldIndex, 1)
    reorderedCards.splice(newIndex, 0, movedCard)

    // 更新 cardOrderIndex
    reorderedCards.forEach((card, index) => {
      card.cardOrderIndex = index
      card.updatedAt = new Date().toISOString()
    })

    return this.saveCards(reorderedCards)
  },

  /**
   * 重新排序卡片中的行
   */
  reorderRows(cardId: string, oldIndex: number, newIndex: number): boolean {
    const cards = this.getAllCards()
    const cardIndex = cards.findIndex(c => c.id === cardId)

    if (cardIndex === -1) {
      return false
    }

    const rows = [...cards[cardIndex].rows]
    const [movedRow] = rows.splice(oldIndex, 1)
    rows.splice(newIndex, 0, movedRow)

    // 更新 orderIndex
    rows.forEach((row, index) => {
      row.orderIndex = index
      row.updatedAt = new Date().toISOString()
    })

    cards[cardIndex].rows = rows
    cards[cardIndex].updatedAt = new Date().toISOString()

    return this.saveCards(cards)
  },

  /**
   * 确保卡片有正确的 cardOrderIndex
   * (用于修复旧数据)
   */
  ensureCardOrderIndices(): boolean {
    const data = this.getData()
    if (!data?.cards) return false

    const hasOldCards = data.cards.some(card => typeof card.cardOrderIndex !== 'number')
    if (!hasOldCards) return false

    // 为所有卡片分配索引
    const cards = data.cards.map((card, index) => ({
      ...card,
      cardOrderIndex: typeof card.cardOrderIndex === 'number' ? card.cardOrderIndex : index
    }))

    return this.saveCards(cards)
  }
}
