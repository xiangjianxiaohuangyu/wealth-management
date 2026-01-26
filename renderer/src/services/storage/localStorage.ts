/**
 * LocalStorage 封装服务
 *
 * 提供类型安全的 localStorage 操作
 */

import type { Theme, Language, Currency } from '../../types/common.types'
import { assetTrackingStorage } from './assetTrackingStorage'
import { investmentStorage } from './investmentStorage'
import { calculatorStorage } from './calculatorStorage'
import { APP_INFO } from '../../utils/constants'

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  /** 主题设置 */
  THEME: 'wealth_theme',
  /** 语言设置 */
  LANGUAGE: 'wealth_language',
  /** 货币设置 */
  CURRENCY: 'wealth_currency',
  /** 用户数据 */
  USER_DATA: 'wealth_user_data',
  /** 应用设置 */
  SETTINGS: 'wealth_settings'
} as const

/**
 * LocalStorage 服务类
 */
class LocalStorageService {
  /**
   * 获取数据
   */
  get<T = any>(key: string): T | null {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error)
      return null
    }
  }

  /**
   * 设置数据
   */
  set<T = any>(key: string, value: T): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting item to localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * 删除数据
   */
  remove(key: string): boolean {
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * 清空所有数据
   */
  clear(): boolean {
    try {
      window.localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage', error)
      return false
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    return window.localStorage.getItem(key) !== null
  }
}

/**
 * 导出单例实例
 */
export const storage = new LocalStorageService()

/**
 * 设置相关操作
 */
export const settingsStorage = {
  /** 获取主题设置 */
  getTheme(): Theme {
    return storage.get<Theme>(STORAGE_KEYS.THEME) || 'light'
  },

  /** 设置主题 */
  setTheme(theme: Theme): boolean {
    return storage.set(STORAGE_KEYS.THEME, theme)
  },

  /** 获取语言设置 */
  getLanguage(): Language {
    return storage.get<Language>(STORAGE_KEYS.LANGUAGE) || 'zh-CN'
  },

  /** 设置语言 */
  setLanguage(language: Language): boolean {
    return storage.set(STORAGE_KEYS.LANGUAGE, language)
  },

  /** 获取货币设置 */
  getCurrency(): Currency {
    return storage.get<Currency>(STORAGE_KEYS.CURRENCY) || 'CNY'
  },

  /** 设置货币 */
  setCurrency(currency: Currency): boolean {
    return storage.set(STORAGE_KEYS.CURRENCY, currency)
  },

  /** 获取所有设置 */
  getAllSettings() {
    return {
      theme: this.getTheme(),
      language: this.getLanguage(),
      currency: this.getCurrency()
    }
  },

  /** 设置所有设置 */
  setAllSettings(settings: { theme?: Theme; language?: Language; currency?: Currency }) {
    if (settings.theme) this.setTheme(settings.theme)
    if (settings.language) this.setLanguage(settings.language)
    if (settings.currency) this.setCurrency(settings.currency)
  }
}

/**
 * 用户数据操作
 */
export const userDataStorage = {
  /**
   * 导出所有应用数据
   */
  exportData(): string {
    const exportData = {
      version: APP_INFO.VERSION,
      exportDate: new Date().toISOString(),
      data: {
        // 应用设置
        settings: settingsStorage.getAllSettings(),

        // 资产跟踪数据
        assetTracking: assetTrackingStorage.getData(),

        // 投资规划数据
        investment: {
          assets: investmentStorage.getAssets(),
          totalAmount: investmentStorage.getTotalAmount()
        },

        // 计算器数据
        calculator: {
          params: calculatorStorage.getParams()
        }
      }
    }
    return JSON.stringify(exportData, null, 2)
  },

  /**
   * 导入应用数据
   */
  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(jsonString)

      // 验证数据格式
      if (!imported.data || typeof imported.data !== 'object') {
        return { success: false, error: '数据格式无效：缺少 data 字段' }
      }

      const { data } = imported

      // 导入应用设置
      if (data.settings) {
        settingsStorage.setAllSettings(data.settings)
      }

      // 导入资产跟踪数据
      if (data.assetTracking) {
        assetTrackingStorage.setData(data.assetTracking)
      }

      // 导入投资规划数据
      if (data.investment) {
        if (data.investment.assets) {
          investmentStorage.saveAssets(data.investment.assets)
        }
      }

      // 导入计算器数据
      if (data.calculator && data.calculator.params) {
        calculatorStorage.saveParams(data.calculator.params)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '数据格式错误或已损坏'
      }
    }
  },

  /**
   * 清除所有应用数据
   */
  clearAllData(): { success: boolean; error?: string } {
    try {
      // 清除资产跟踪数据
      assetTrackingStorage.setData({
        records: [],
        adjustments: [],
        fixedAssetAdjustments: [],
        lastUpdated: new Date().toISOString()
      })

      // 清除投资规划数据
      investmentStorage.saveAssets([])

      // 清除计算器数据
      calculatorStorage.saveParams({
        principal: 0,
        monthlyContribution: 0,
        annualReturn: 5,
        years: 10
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '清除数据失败'
      }
    }
  }
}
