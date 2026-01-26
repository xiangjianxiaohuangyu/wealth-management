/**
 * 初始化存储服务
 *
 * 用于在用户首次使用应用时加载默认数据
 */

import { investmentStorage } from './investmentStorage'
import { assetTrackingStorage } from './assetTrackingStorage'
import { calculatorStorage } from './calculatorStorage'
import type { AssetAllocationItem } from '../../types/investment.types'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'

/**
 * 默认投资规划资产
 */
const DEFAULT_INVESTMENT_ASSETS: AssetAllocationItem[] = [
  {
    id: 'stock',
    name: '股票',
    mode: 'percentage',
    plannedPercentage: 40,
    plannedAmount: 0,
    actualAmount: 0,
    actualPercentage: 0,
    suggestion: 'balanced',
    suggestionAmount: 0,
    color: '#5470c6'
  },
  {
    id: 'fund',
    name: '基金',
    mode: 'percentage',
    plannedPercentage: 30,
    plannedAmount: 0,
    actualAmount: 0,
    actualPercentage: 0,
    suggestion: 'balanced',
    suggestionAmount: 0,
    color: '#91cc75'
  },
  {
    id: 'bond',
    name: '债券',
    mode: 'percentage',
    plannedPercentage: 20,
    plannedAmount: 0,
    actualAmount: 0,
    actualPercentage: 0,
    suggestion: 'balanced',
    suggestionAmount: 0,
    color: '#fac858'
  },
  {
    id: 'cash',
    name: '现金',
    mode: 'percentage',
    plannedPercentage: 10,
    plannedAmount: 0,
    actualAmount: 0,
    actualPercentage: 0,
    suggestion: 'balanced',
    suggestionAmount: 0,
    color: '#ee6666'
  }
]

/**
 * 默认资产跟踪记录
 */
const DEFAULT_ASSET_RECORDS: MonthlyAssetRecord[] = []

/**
 * 初始化所有存储数据
 */
export const initStorage = {
  /** 是否已初始化 */
  STORAGE_KEY: 'wealth_app_initialized',

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    const storage = window.localStorage
    return storage.getItem(this.STORAGE_KEY) === 'true'
  },

  /**
   * 标记为已初始化
   */
  markAsInitialized(): void {
    const storage = window.localStorage
    storage.setItem(this.STORAGE_KEY, 'true')
  },

  /**
   * 初始化默认数据
   */
  initializeDefaultData(): void {
    // 如果已经初始化过，不再重复初始化
    if (this.isInitialized()) {
      return
    }

    try {
      // 初始化投资规划数据
      investmentStorage.saveAssets(DEFAULT_INVESTMENT_ASSETS)

      // 初始化资产跟踪数据
      assetTrackingStorage.setData({
        records: DEFAULT_ASSET_RECORDS,
        adjustments: [],
        fixedAssetAdjustments: [],
        lastUpdated: new Date().toISOString()
      })

      // 标记为已初始化
      this.markAsInitialized()

      console.log('✅ 应用数据初始化成功')
    } catch (error) {
      console.error('❌ 应用数据初始化失败:', error)
    }
  },

  /**
   * 重置为默认数据（用于测试或开发）
   */
  resetToDefault(): void {
    // 保存默认数据
    investmentStorage.saveAssets(DEFAULT_INVESTMENT_ASSETS)

    assetTrackingStorage.setData({
      records: DEFAULT_ASSET_RECORDS,
      adjustments: [],
      fixedAssetAdjustments: [],
      lastUpdated: new Date().toISOString()
    })

    // 不标记为已初始化，以便可以再次初始化
    window.localStorage.removeItem(this.STORAGE_KEY)

    console.log('🔄 数据已重置为默认值')
  }
}

/**
 * 应用启动时自动初始化
 */
export const autoInitialize = () => {
  initStorage.initializeDefaultData()
}
