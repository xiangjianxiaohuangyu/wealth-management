/**
 * 输入格式化工具
 * 用于千分位格式化和数字输入处理
 */

/**
 * 格式化数字为千分位格式
 * @param value - 输入值（字符串或数字）
 * @returns 千分位格式化的字符串（如 "1,234,567"）
 *
 * @example
 * ```ts
 * formatNumberWithThousands(1234567) // '1,234,567'
 * formatNumberWithThousands("1234567") // '1,234,567'
 * formatNumberWithThousands(0) // ''
 * ```
 */
export function formatNumberWithThousands(value: string | number): string {
  // 移除所有非数字字符
  const cleaned = String(value).replace(/[^\d]/g, '')
  if (!cleaned) return ''

  // 添加千分位分隔符
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 解析千分位格式字符串为数字
 * @param formatted - 千分位格式字符串
 * @returns 数字
 *
 * @example
 * ```ts
 * parseThousandsNumber('1,234,567') // 1234567
 * parseThousandsNumber('') // 0
 * parseThousandsNumber('123') // 123
 * ```
 */
export function parseThousandsNumber(formatted: string): number {
  const cleaned = formatted.replace(/[^\d]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

/**
 * 解析千分位格式字符串为浮点数
 * @param formatted - 千分位格式字符串
 * @returns 浮点数
 *
 * @example
 * ```ts
 * parseThousandsFloat('1,234.56') // 1234.56
 * parseThousandsFloat('') // 0
 * ```
 */
export function parseThousandsFloat(formatted: string): number {
  // 移除千分位逗号，保留小数点
  const cleaned = formatted.replace(/,/g, '').trim()
  if (!cleaned) return 0

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * 格式化浮点数为带千分位的字符串
 * @param value - 数字
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 *
 * @example
 * ```ts
 * formatFloatWithThousands(1234.56, 2) // '1,234.56'
 * formatFloatWithThousands(1234.5, 2) // '1,234.50'
 * ```
 */
export function formatFloatWithThousands(value: number, decimals: number = 2): string {
  const rounded = value.toFixed(decimals)
  const parts = rounded.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * 清理输入字符串，移除所有非数字字符（保留小数点）
 * @param value - 输入字符串
 * @returns 清理后的字符串
 *
 * @example
 * ```ts
 * cleanNumberInput('1,234.56') // '1234.56'
 * cleanNumberInput('abc123') // '123'
 * cleanNumberInput('') // ''
 * ```
 */
export function cleanNumberInput(value: string): string {
  return value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
}
