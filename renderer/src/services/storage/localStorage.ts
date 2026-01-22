/**
 * LocalStorage 封装服务
 *
 * 提供类型安全的 localStorage 操作
 */

import type { Theme, Language, Currency } from '../../types/common.types'

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
  /** 获取用户数据 */
  getUserData() {
    return storage.get(STORAGE_KEYS.USER_DATA)
  },

  /** 保存用户数据 */
  setUserData(data: any): boolean {
    return storage.set(STORAGE_KEYS.USER_DATA, data)
  },

  /** 删除用户数据 */
  clearUserData(): boolean {
    return storage.remove(STORAGE_KEYS.USER_DATA)
  },

  /** 导出用户数据 */
  exportData(): string {
    const data = this.getUserData()
    return JSON.stringify(data, null, 2)
  },

  /** 导入用户数据 */
  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString)
      this.setUserData(data)
      return { success: true }
    } catch (error) {
      return { success: false, error: '数据格式错误' }
    }
  }
}
