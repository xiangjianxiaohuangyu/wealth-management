/**
 * 历史管理服务
 * 用于实现撤销/重做功能
 */

import type { InvestmentRecordCard, InvestmentRecordRow, InvestmentRecordRowUpdate } from '../../types/investmentRecord.types'

/**
 * 命令接口
 */
export interface Command {
  /** 执行命令 */
  execute(): void
  /** 撤销命令 */
  undo(): void
  /** 命令描述 */
  description: string
}

/**
 * 添加行命令
 */
export class AddRowCommand implements Command {
  description = '添加行'

  constructor(
    private cardId: string,
    private row: InvestmentRecordRow,
    private addRowFunc: (cardId: string, row: Omit<InvestmentRecordRow, 'id' | 'createdAt' | 'updatedAt'>) => InvestmentRecordRow | null,
    private deleteRowFunc: (cardId: string, rowId: string) => void
  ) {}

  execute(): void {
    this.addRowFunc(this.cardId, {
      startPoint: this.row.startPoint,
      endPoint: this.row.endPoint,
      plannedPercentage: this.row.plannedPercentage,
      actualAmount: this.row.actualAmount
    })
  }

  undo(): void {
    this.deleteRowFunc(this.cardId, this.row.id)
  }
}

/**
 * 删除行命令
 */
export class DeleteRowCommand implements Command {
  description = '删除行'

  constructor(
    private cardId: string,
    private row: InvestmentRecordRow,
    private addRowFunc: (cardId: string, row: Omit<InvestmentRecordRow, 'id' | 'createdAt' | 'updatedAt'>) => InvestmentRecordRow | null,
    private deleteRowFunc: (cardId: string, rowId: string) => void
  ) {}

  execute(): void {
    this.deleteRowFunc(this.cardId, this.row.id)
  }

  undo(): void {
    this.addRowFunc(this.cardId, {
      startPoint: this.row.startPoint,
      endPoint: this.row.endPoint,
      plannedPercentage: this.row.plannedPercentage,
      actualAmount: this.row.actualAmount
    })
  }
}

/**
 * 更新行命令
 */
export class UpdateRowCommand implements Command {
  description = '更新行'

  constructor(
    private cardId: string,
    private rowId: string,
    private previousValue: InvestmentRecordRow,
    private newValue: InvestmentRecordRowUpdate,
    private updateRowFunc: (cardId: string, rowId: string, updates: InvestmentRecordRowUpdate) => void
  ) {}

  execute(): void {
    this.updateRowFunc(this.cardId, this.rowId, this.newValue)
  }

  undo(): void {
    this.updateRowFunc(this.cardId, this.rowId, {
      startPoint: this.previousValue.startPoint,
      endPoint: this.previousValue.endPoint,
      plannedPercentage: this.previousValue.plannedPercentage,
      actualAmount: this.previousValue.actualAmount
    })
  }
}

/**
 * 添加卡片命令
 */
export class AddCardCommand implements Command {
  description = '添加卡片'

  constructor(
    private card: InvestmentRecordCard,
    private addCardFunc: (card: Omit<InvestmentRecordCard, 'id' | 'createdAt' | 'updatedAt'>) => InvestmentRecordCard | null,
    private deleteCardFunc: (cardId: string) => void
  ) {}

  execute(): void {
    this.addCardFunc({
      name: this.card.name,
      rows: this.card.rows
    })
  }

  undo(): void {
    this.deleteCardFunc(this.card.id)
  }
}

/**
 * 删除卡片命令
 */
export class DeleteCardCommand implements Command {
  description = '删除卡片'

  constructor(
    private card: InvestmentRecordCard,
    private addCardFunc: (card: Omit<InvestmentRecordCard, 'id' | 'createdAt' | 'updatedAt'>) => InvestmentRecordCard | null,
    private deleteCardFunc: (cardId: string) => void
  ) {}

  execute(): void {
    this.deleteCardFunc(this.card.id)
  }

  undo(): void {
    this.addCardFunc({
      name: this.card.name,
      rows: this.card.rows
    })
  }
}

/**
 * 历史管理器
 */
export class HistoryManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  private maxStackSize = 50

  /**
   * 执行命令并添加到历史栈
   */
  execute(command: Command): void {
    command.execute()
    this.undoStack.push(command)

    // 限制历史栈大小
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift()
    }

    // 清空重做栈
    this.redoStack = []
  }

  /**
   * 撤销上一步操作
   */
  undo(): boolean {
    const command = this.undoStack.pop()
    if (command) {
      command.undo()
      this.redoStack.push(command)
      return true
    }
    return false
  }

  /**
   * 重做上一步撤销的操作
   */
  redo(): boolean {
    const command = this.redoStack.pop()
    if (command) {
      command.execute()
      this.undoStack.push(command)
      return true
    }
    return false
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * 获取撤销栈大小
   */
  getUndoStackSize(): number {
    return this.undoStack.length
  }

  /**
   * 获取重做栈大小
   */
  getRedoStackSize(): number {
    return this.redoStack.length
  }

  /**
   * 获取撤销历史列表
   */
  getUndoHistory(): string[] {
    return this.undoStack.map(cmd => cmd.description)
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
  }
}

// 创建全局历史管理器实例
export const historyManager = new HistoryManager()
