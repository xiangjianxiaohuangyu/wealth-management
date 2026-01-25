/**
 * 投资数据存储服务
 *
 * 用于保存和加载投资规划数据
 */

import { storage, STORAGE_KEYS } from './localStorage'
import type { AssetAllocationItem } from '../../types/investment.types'

/**
 * 投资数据接口
 */
export interface InvestmentData {
  /** 总投资金额 */
  totalAmount: number
  /** 资产列表 */
  assets: AssetAllocationItem[]
  /** 最后更新时间 */
  lastUpdated: string
}

/**
 * 投资数据存储服务
 */
export const investmentStorage = {
  /** 存储键 */
  STORAGE_KEY: 'wealth_investment_data',

  /**
   * 获取投资数据
   */
  getData(): InvestmentData | null {
    return storage.get<InvestmentData>(this.STORAGE_KEY)
  },

  /**
   * 保存投资数据
   */
  setData(data: InvestmentData): boolean {
    const dataToSave: InvestmentData = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    return storage.set(this.STORAGE_KEY, dataToSave)
  },

  /**
   * 保存总投资金额和资产列表
   */
  saveInvestment(totalAmount: number, assets: AssetAllocationItem[]): boolean {
    return this.setData({
      totalAmount,
      assets,
      lastUpdated: new Date().toISOString()
    })
  },

  /**
   * 获取总投资金额
   */
  getTotalAmount(): number {
    const data = this.getData()
    return data?.totalAmount || 0
  },

  /**
   * 获取资产列表
   */
  getAssets(): AssetAllocationItem[] {
    const data = this.getData()
    return data?.assets || []
  },

  /**
   * 清除投资数据
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
      const data = JSON.parse(jsonString) as InvestmentData

      // 验证数据格式
      if (typeof data.totalAmount !== 'number') {
        return { success: false, error: '数据格式错误：缺少总投资金额' }
      }

      if (!Array.isArray(data.assets)) {
        return { success: false, error: '数据格式错误：缺少资产列表' }
      }

      this.setData(data)
      return { success: true }
    } catch (error) {
      return { success: false, error: '数据格式错误' }
    }
  }
}
