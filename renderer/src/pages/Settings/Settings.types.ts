/**
 * Settings 页面类型定义
 */

import type { Theme, Language, Currency } from '../../types/common.types'

/**
 * 应用设置
 */
export interface AppSettings {
  /** 主题 */
  theme: Theme
  /** 语言 */
  language: Language
  /** 货币 */
  currency: Currency
}

/**
 * 设置类别
 */
export type SettingsCategory = 'general' | 'data' | 'about'
