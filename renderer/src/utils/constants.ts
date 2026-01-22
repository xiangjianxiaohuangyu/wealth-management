/**
 * 应用常量定义
 */

import type { MenuItem, RoutePath } from '../types/navigation.types'
import type { AssetCategory, LiabilityCategory, TransactionCategory } from '../types/wealth.types'

/**
 * 应用信息
 */
export const APP_INFO = {
  /** 应用名称 */
  NAME: '财富管理',
  /** 应用版本 */
  VERSION: '0.0.16',
  /** 应用描述 */
  DESCRIPTION: '个人财富管理应用',
  /** 作者 */
  AUTHOR: 'Your Name',
  /** 主页 */
  HOMEPAGE: 'https://github.com/yourusername/wealth-management'
} as const

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  /** 主题设置 */
  THEME: 'app_theme',
  /** 语言设置 */
  LANGUAGE: 'app_language',
  /** 用户数据 */
  USER_DATA: 'user_data',
  /** 设置 */
  SETTINGS: 'app_settings'
} as const

/**
 * 货币符号
 */
export const CURRENCY_SYMBOLS = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  HKD: 'HK$'
} as const

/**
 * 资产类别标签
 */
export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  cash: '现金',
  stock: '股票',
  fund: '基金',
  bond: '债券',
  real_estate: '房产',
  crypto: '加密货币',
  other: '其他'
}

/**
 * 负债类别标签
 */
export const LIABILITY_CATEGORY_LABELS: Record<LiabilityCategory, string> = {
  loan: '贷款',
  credit_card: '信用卡',
  mortgage: '房贷',
  other: '其他'
}

/**
 * 收支类别标签
 */
export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: '工资',
  bonus: '奖金',
  investment: '投资收益',
  rent: '房租',
  food: '餐饮',
  transport: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  medical: '医疗',
  education: '教育',
  other: '其他'
}

/**
 * 日期格式
 */
export const DATE_FORMATS = {
  /** 完整日期时间 */
  FULL: 'YYYY-MM-DD HH:mm:ss',
  /** 短日期 */
  SHORT: 'YYYY-MM-DD',
  /** 月份 */
  MONTH: 'YYYY-MM',
  /** 时间 */
  TIME: 'HH:mm:ss',
  /** 友好格式 */
  FRIENDLY: 'YYYY年MM月DD日'
} as const

/**
 * 数字格式
 */
export const NUMBER_FORMATS = {
  /** 小数位数 */
  DECIMAL_PLACES: 2,
  /** 千分位分隔符 */
  THOUSANDS_SEPARATOR: ','
} as const

/**
 * 图表颜色
 */
export const CHART_COLORS = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc'
] as const

/**
 * 路由路径
 */
export const ROUTE_PATHS: Record<string, RoutePath> = {
  DASHBOARD: '/dashboard',
  INVESTMENT: '/investment',
  CHANGELOG: '/changelog',
  SETTINGS: '/settings'
} as const

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS = {
  /** 默认主题 */
  THEME: 'light',
  /** 默认语言 */
  LANGUAGE: 'zh-CN',
  /** 默认货币 */
  CURRENCY: 'CNY'
} as const
