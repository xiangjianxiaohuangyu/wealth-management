/**
 * 批量选择上下文
 *
 * 用于管理表格行的批量选择状态
 */

import { createContext, useContext, useState, ReactNode } from 'react'

interface SelectionContextValue {
  /** 选中的行ID集合（卡片ID -> 行ID集合） */
  selectedRows: Record<string, Set<string>>
  /** 切换行的选中状态 */
  toggleRowSelection: (cardId: string, rowId: string) => void
  /** 全选/取消全选卡片的所有行 */
  toggleSelectAll: (cardId: string, rowIds: string[]) => void
  /** 清除所有选择 */
  clearSelection: () => void
  /** 检查行是否被选中 */
  isRowSelected: (cardId: string, rowId: string) => boolean
  /** 获取选中行的数量 */
  getSelectedCount: (cardId: string) => number
  /** 检查卡片是否全选 */
  isAllSelected: (cardId: string, rowIds: string[]) => boolean
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedRows, setSelectedRows] = useState<Record<string, Set<string>>>({})

  const toggleRowSelection = (cardId: string, rowId: string) => {
    setSelectedRows(prev => {
      const cardSelection = prev[cardId] || new Set()
      const newSelection = new Set(cardSelection)

      if (newSelection.has(rowId)) {
        newSelection.delete(rowId)
      } else {
        newSelection.add(rowId)
      }

      if (newSelection.size === 0) {
        const { [cardId]: _, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [cardId]: newSelection
      }
    })
  }

  const toggleSelectAll = (cardId: string, rowIds: string[]) => {
    setSelectedRows(prev => {
      const cardSelection = prev[cardId] || new Set()
      const isAllSelected = rowIds.length > 0 && rowIds.every(id => cardSelection.has(id))

      if (isAllSelected) {
        // 取消全选
        const { [cardId]: _, ...rest } = prev
        return rest
      } else {
        // 全选
        return {
          ...prev,
          [cardId]: new Set(rowIds)
        }
      }
    })
  }

  const clearSelection = () => {
    setSelectedRows({})
  }

  const isRowSelected = (cardId: string, rowId: string): boolean => {
    return selectedRows[cardId]?.has(rowId) || false
  }

  const getSelectedCount = (cardId: string): number => {
    return selectedRows[cardId]?.size || 0
  }

  const isAllSelected = (cardId: string, rowIds: string[]): boolean => {
    const cardSelection = selectedRows[cardId]
    if (!cardSelection || cardSelection.size === 0) return false
    return rowIds.every(id => cardSelection.has(id))
  }

  return (
    <SelectionContext.Provider
      value={{
        selectedRows,
        toggleRowSelection,
        toggleSelectAll,
        clearSelection,
        isRowSelected,
        getSelectedCount,
        isAllSelected
      }}
    >
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider')
  }
  return context
}
