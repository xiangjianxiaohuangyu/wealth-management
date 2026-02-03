/**
 * 测试区数据存储服务
 *
 * 用于保存和加载测试区数据
 */

import { storage } from './localStorage'
import type { TestZoneData, TestZoneTable, TestZoneRow } from '../../types/testzone.types'
import { eventBus } from '../../utils/eventBus'

/**
 * 测试区数据存储服务
 */
export const testZoneStorage = {
  /** 存储键 */
  STORAGE_KEY: 'wealth_testzone_data',

  /**
   * 获取完整的测试区数据
   */
  getData(): TestZoneData | null {
    const data = storage.get<TestZoneData>(this.STORAGE_KEY)
    return data
  },

  /**
   * 保存测试区数据
   */
  setData(data: TestZoneData): boolean {
    const dataToSave: TestZoneData = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    return storage.set(this.STORAGE_KEY, dataToSave)
  },

  /**
   * 获取所有表格
   */
  getAllTables(): TestZoneTable[] {
    const data = this.getData()
    return data?.tables || []
  },

  /**
   * 根据ID获取表格
   */
  getTableById(id: string): TestZoneTable | null {
    const tables = this.getAllTables()
    return tables.find(t => t.id === id) || null
  },

  /**
   * 添加新表格
   */
  addTable(table: Omit<TestZoneTable, 'id' | 'createdAt' | 'updatedAt'>): TestZoneTable | null {
    const data = this.getData() || { tables: [], lastUpdated: new Date().toISOString() }

    const newTable: TestZoneTable = {
      ...table,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    data.tables.push(newTable)

    const result = this.setData(data)
    if (result) {
      eventBus.emit('testzone-changed')
      return newTable
    }
    return null
  },

  /**
   * 更新表格
   */
  updateTable(id: string, updates: Partial<Omit<TestZoneTable, 'id' | 'createdAt'>>): boolean {
    const data = this.getData()
    if (!data) return false

    const index = data.tables.findIndex(t => t.id === id)
    if (index < 0) return false

    data.tables[index] = {
      ...data.tables[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const result = this.setData(data)
    if (result) {
      eventBus.emit('testzone-changed')
    }
    return result
  },

  /**
   * 删除表格
   */
  deleteTable(id: string): boolean {
    const data = this.getData()
    if (!data) return false

    const filteredTables = data.tables.filter(t => t.id !== id)
    if (filteredTables.length === data.tables.length) return false

    data.tables = filteredTables
    const result = this.setData(data)
    if (result) {
      eventBus.emit('testzone-changed')
    }
    return result
  },

  /**
   * 添加表格行
   */
  addRow(tableId: string, row: Omit<TestZoneRow, 'id'>): boolean {
    const data = this.getData()
    if (!data) return false

    const table = data.tables.find(t => t.id === tableId)
    if (!table) return false

    const newRow: TestZoneRow = {
      ...row,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }

    table.rows.push(newRow)
    table.updatedAt = new Date().toISOString()

    const result = this.setData(data)
    if (result) {
      eventBus.emit('testzone-changed')
    }
    return result
  },

  /**
   * 更新表格行
   */
  updateRow(tableId: string, rowId: string, updates: Partial<TestZoneRow>): boolean {
    const data = this.getData()
    if (!data) return false

    const table = data.tables.find(t => t.id === tableId)
    if (!table) return false

    const rowIndex = table.rows.findIndex(r => r.id === rowId)
    if (rowIndex < 0) return false

    table.rows[rowIndex] = {
      ...table.rows[rowIndex],
      ...updates
    }
    table.updatedAt = new Date().toISOString()

    const result = this.setData(data)
    if (result) {
      eventBus.emit('testzone-changed')
    }
    return result
  },

  /**
   * 删除表格行
   */
  deleteRow(tableId: string, rowId: string): boolean {
    const data = this.getData()
    if (!data) return false

    const table = data.tables.find(t => t.id === tableId)
    if (!table) return false

    const filteredRows = table.rows.filter(r => r.id !== rowId)
    if (filteredRows.length === table.rows.length) return false

    table.rows = filteredRows
    table.updatedAt = new Date().toISOString()

    const result = this.setData(data)
    if (result) {
      eventBus.emit('testzone-changed')
    }
    return result
  },

  /**
   * 清除所有数据
   */
  clearData(): boolean {
    const result = storage.remove(this.STORAGE_KEY)
    if (result) {
      eventBus.emit('testzone-changed')
    }
    return result
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
      const data = JSON.parse(jsonString) as TestZoneData

      // 验证数据格式
      if (!Array.isArray(data.tables)) {
        return { success: false, error: '数据格式错误：缺少表格列表' }
      }

      // 验证每个表格的格式
      for (const table of data.tables) {
        if (!table.id || !table.name || !Array.isArray(table.rows)) {
          return { success: false, error: '数据格式错误：表格字段不完整' }
        }
      }

      const result = this.setData(data)
      if (result) {
        eventBus.emit('testzone-changed')
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: '数据格式错误' }
    }
  }
}
