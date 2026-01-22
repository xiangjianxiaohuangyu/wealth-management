/**
 * 日期格式化工具
 */

import { DATE_FORMATS } from '../constants'

/**
 * 格式化日期
 *
 * @param date - 日期对象、时间戳或日期字符串
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```ts
 * formatDate(new Date(), 'YYYY-MM-DD') // '2024-01-15'
 * formatDate(new Date(), 'YYYY年MM月DD日') // '2024年01月15日'
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') // '2024-01-15 14:30:45'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  format: string = DATE_FORMATS.SHORT
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间（多久之前）
 *
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 相对时间字符串
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 1000 * 60)) // '1分钟前'
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60)) // '1小时前'
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 24)) // '1天前'
 * ```
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) {
    return `${years}年前`
  }
  if (months > 0) {
    return `${months}个月前`
  }
  if (days > 0) {
    return `${days}天前`
  }
  if (hours > 0) {
    return `${hours}小时前`
  }
  if (minutes > 0) {
    return `${minutes}分钟前`
  }
  return '刚刚'
}

/**
 * 解析日期字符串
 *
 * @param dateString - 日期字符串
 * @returns 日期对象
 *
 * @example
 * ```ts
 * parseDate('2024-01-15') // Date object
 * parseDate('2024-01-15T14:30:00') // Date object
 * ```
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * 获取日期范围
 *
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 日期范围内的所有日期
 *
 * @example
 * ```ts
 * getDateRange('2024-01-01', '2024-01-03')
 * // ['2024-01-01', '2024-01-02', '2024-01-03']
 * ```
 */
export function getDateRange(
  startDate: string | Date,
  endDate: string | Date
): string[] {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  const dates: string[] = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(formatDate(current, DATE_FORMATS.SHORT))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * 获取月份的第一天和最后一天
 *
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 包含第一天和最后一天的对象
 *
 * @example
 * ```ts
 * getMonthBounds('2024-01-15')
 * // { firstDay: '2024-01-01', lastDay: '2024-01-31' }
 * ```
 */
export function getMonthBounds(
  date: Date | string | number
): { firstDay: string; lastDay: string } {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  const firstDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
  const lastDay = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0)

  return {
    firstDay: formatDate(firstDay, DATE_FORMATS.SHORT),
    lastDay: formatDate(lastDay, DATE_FORMATS.SHORT)
  }
}

/**
 * 判断是否是今天
 *
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 是否是今天
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  const today = new Date()
  return (
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate()
  )
}

/**
 * 添加天数
 *
 * @param date - 日期对象、时间戳或日期字符串
 * @param days - 要添加的天数
 * @returns 新的日期对象
 *
 * @example
 * ```ts
 * addDays('2024-01-01', 7) // '2024-01-08'
 * addDays('2024-01-01', -7) // '2023-12-25'
 * ```
 */
export function addDays(
  date: Date | string | number,
  days: number
): Date {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  const result = new Date(dateObj)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 添加月份
 *
 * @param date - 日期对象、时间戳或日期字符串
 * @param months - 要添加的月数
 * @returns 新的日期对象
 *
 * @example
 * ```ts
 * addMonths('2024-01-01', 1) // '2024-02-01'
 * addMonths('2024-01-01', -1) // '2023-12-01'
 * ```
 */
export function addMonths(
  date: Date | string | number,
  months: number
): Date {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  const result = new Date(dateObj)
  result.setMonth(result.getMonth() + months)
  return result
}
