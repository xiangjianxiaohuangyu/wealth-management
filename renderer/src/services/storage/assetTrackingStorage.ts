/**
 * 资产跟踪数据存储服务
 *
 * 用于保存和加载资产跟踪数据
 */

import { storage } from './localStorage'
import type { MonthlyAssetRecord, AssetTrackingData, AssetAdjustment } from '../../types/assetTracking.types'
import { eventBus } from '../../utils/eventBus'

/**
 * 资产跟踪数据存储服务
 */
export const assetTrackingStorage = {
  /** 存储键 */
  STORAGE_KEY: 'wealth_asset_tracking_data',

  /**
   * 获取完整的资产跟踪数据
   */
  getData(): AssetTrackingData | null {
    const data = storage.get<AssetTrackingData>(this.STORAGE_KEY)
    // 确保向后兼容，如果旧数据没有 fixedAssetAdjustments 字段，则初始化为空数组
    if (data && !data.fixedAssetAdjustments) {
      data.fixedAssetAdjustments = []
    }
    return data
  },

  /**
   * 保存资产跟踪数据
   */
  setData(data: AssetTrackingData): boolean {
    const dataToSave: AssetTrackingData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      fixedAssetAdjustments: data.fixedAssetAdjustments || []
    }
    return storage.set(this.STORAGE_KEY, dataToSave)
  },

  /**
   * 获取所有记录
   */
  getAllRecords(): MonthlyAssetRecord[] {
    const data = this.getData()
    return data?.records || []
  },

  /**
   * 获取所有资产调整记录
   */
  getAllAdjustments(): AssetAdjustment[] {
    const data = this.getData()
    return data?.fixedAssetAdjustments || []
  },

  /**
   * 根据类型获取调整记录
   */
  getAdjustmentsByType(type: AssetAdjustment['type']): AssetAdjustment[] {
    const adjustments = this.getAllAdjustments()
    return adjustments.filter(a => a.type === type)
  },

  /**
   * 添加资产调整记录
   */
  addAdjustment(adjustment: Omit<AssetAdjustment, 'id' | 'createdAt'>): boolean {
    const data = this.getData()
    if (!data) return false

    const newAdjustment: AssetAdjustment = {
      ...adjustment,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    }

    data.fixedAssetAdjustments = data.fixedAssetAdjustments || []
    data.fixedAssetAdjustments.push(newAdjustment)

    const result = this.setData(data)
    if (result) {
      eventBus.emit('asset-tracking-changed')
    }
    return result
  },

  /**
   * 删除资产调整记录
   */
  deleteAdjustment(id: string): boolean {
    const data = this.getData()
    if (!data) return false

    const filteredAdjustments = data.fixedAssetAdjustments.filter(a => a.id !== id)
    if (filteredAdjustments.length === data.fixedAssetAdjustments.length) return false

    data.fixedAssetAdjustments = filteredAdjustments
    const result = this.setData(data)
    if (result) {
      eventBus.emit('asset-tracking-changed')
    }
    return result
  },

  /**
   * 根据年月获取记录
   */
  getRecordByYearMonth(year: number, month: number): MonthlyAssetRecord | null {
    const records = this.getAllRecords()
    return records.find(r => r.year === year && r.month === month) || null
  },

  /**
   * 添加新记录
   */
  addRecord(record: MonthlyAssetRecord): boolean {
    const data = this.getData()
    const records = data?.records || []

    // 检查是否已存在
    const existingIndex = records.findIndex(
      r => r.year === record.year && r.month === record.month
    )

    if (existingIndex >= 0) {
      // 更新现有记录
      records[existingIndex] = record
    } else {
      // 添加新记录
      records.push(record)
    }

    // 按时间排序
    records.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    const result = this.setData({
      records,
      lastUpdated: data?.lastUpdated || new Date().toISOString(),
      fixedAssetAdjustments: data?.fixedAssetAdjustments || []
    })
    if (result) {
      eventBus.emit('asset-tracking-changed')
    }
    return result
  },

  /**
   * 更新记录
   */
  updateRecord(id: string, updates: Partial<MonthlyAssetRecord>): boolean {
    const data = this.getData()
    if (!data) return false

    const index = data.records.findIndex(r => r.id === id)
    if (index < 0) return false

    data.records[index] = {
      ...data.records[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const result = this.setData(data)
    if (result) {
      eventBus.emit('asset-tracking-changed')
    }
    return result
  },

  /**
   * 删除记录
   */
  deleteRecord(id: string): boolean {
    const data = this.getData()
    if (!data) return false

    const filteredRecords = data.records.filter(r => r.id !== id)
    if (filteredRecords.length === data.records.length) return false

    const result = this.setData({
      records: filteredRecords,
      lastUpdated: data.lastUpdated,
      fixedAssetAdjustments: data.fixedAssetAdjustments
    })
    if (result) {
      eventBus.emit('asset-tracking-changed')
    }
    return result
  },

  /**
   * 清除所有数据
   */
  clearData(): boolean {
    const result = storage.remove(this.STORAGE_KEY)
    if (result) {
      eventBus.emit('asset-tracking-changed')
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
      const data = JSON.parse(jsonString) as AssetTrackingData

      // 验证数据格式
      if (!Array.isArray(data.records)) {
        return { success: false, error: '数据格式错误：缺少记录列表' }
      }

      // 验证每条记录的格式
      for (const record of data.records) {
        if (!record.id || typeof record.year !== 'number' || typeof record.month !== 'number') {
          return { success: false, error: '数据格式错误：记录字段不完整' }
        }
      }

      const result = this.setData(data)
      if (result) {
        eventBus.emit('asset-tracking-changed')
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: '数据格式错误' }
    }
  }
}
