/**
 * 货币格式化工具
 */

import type { Currency } from '../../types/common.types'
import { CURRENCY_SYMBOLS, NUMBER_FORMATS } from '../constants'

/**
 * 格式化货币金额
 *
 * @param amount - 金额
 * @param currency - 货币类型
 * @param options - 格式化选项
 * @returns 格式化后的货币字符串
 *
 * @example
 * ```ts
 * formatCurrency(1234.56, 'CNY') // '¥1,234.56'
 * formatCurrency(1234.56, 'USD') // '$1,234.56'
 * formatCurrency(1234.56, 'CNY', { showSymbol: false }) // '1,234.56'
 * formatCurrency(1234.56, 'CNY', { decimals: 0 }) // '¥1,235'
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'CNY',
  options: {
    /** 是否显示货币符号 */
    showSymbol?: boolean
    /** 小数位数 */
    decimals?: number
    /** 是否使用千分位分隔符 */
    useThousandsSeparator?: boolean
  } = {}
): string {
  const {
    showSymbol = true,
    decimals = NUMBER_FORMATS.DECIMAL_PLACES,
    useThousandsSeparator = true
  } = options

  // 四舍五入到指定小数位
  const roundedAmount = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals)

  // 格式化数字部分
  let formattedNumber = roundedAmount.toFixed(decimals)

  // 添加千分位分隔符
  if (useThousandsSeparator) {
    const parts = formattedNumber.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NUMBER_FORMATS.THOUSANDS_SEPARATOR)
    formattedNumber = parts.join('.')
  }

  // 添加货币符号
  if (showSymbol) {
    const symbol = CURRENCY_SYMBOLS[currency] || currency
    return `${symbol}${formattedNumber}`
  }

  return formattedNumber
}

/**
 * 解析货币字符串为数字
 *
 * @param value - 货币字符串
 * @returns 解析后的数字
 *
 * @example
 * ```ts
 * parseCurrency('¥1,234.56') // 1234.56
 * parseCurrency('$1,234.56') // 1234.56
 * parseCurrency('1,234.56') // 1234.56
 * ```
 */
export function parseCurrency(value: string): number {
  // 移除所有非数字字符（除了小数点和负号）
  const cleaned = value.replace(/[^\d.-]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * 格式化百分比
 *
 * @param value - 数值 (0-1)
 * @param decimals - 小数位数
 * @returns 格式化后的百分比字符串
 *
 * @example
 * ```ts
 * formatPercentage(0.1234) // '12.34%'
 * formatPercentage(0.1234, 1) // '12.3%'
 * ```
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 解析百分比字符串为数字
 *
 * @param value - 百分比字符串
 * @returns 解析后的数字 (0-1)
 *
 * @example
 * ```ts
 * parsePercentage('12.34%') // 0.1234
 * parsePercentage('12.34') // 0.1234
 * ```
 */
export function parsePercentage(value: string): number {
  const cleaned = value.replace('%', '').trim()
  return (parseFloat(cleaned) || 0) / 100
}

/**
 * 计算增长率
 *
 * @param oldValue - 旧值
 * @param newValue - 新值
 * @returns 增长率 (如 0.1234 表示 12.34%)
 */
export function calculateGrowthRate(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 1 : 0
  return (newValue - oldValue) / Math.abs(oldValue)
}

/**
 * 格式化增长率的文本表示
 *
 * @param oldValue - 旧值
 * @param newValue - 新值
 * @param decimals - 小数位数
 * @returns 格式化后的增长率字符串
 *
 * @example
 * ```ts
 * formatGrowth(100, 120) // '+20.00%'
 * formatGrowth(100, 80) // '-20.00%'
 * formatGrowth(100, 100) // '0.00%'
 * ```
 */
export function formatGrowth(
  oldValue: number,
  newValue: number,
  decimals: number = 2
): string {
  const rate = calculateGrowthRate(oldValue, newValue)
  const sign = rate > 0 ? '+' : ''
  return `${sign}${formatPercentage(rate, decimals)}`
}
