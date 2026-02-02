/**
 * 投资记录验证工具
 * 用于验证投资记录数据的完整性和正确性
 */

import type { InvestmentRecordRow, InvestmentRecordCard } from '../../types/investmentRecord.types'

/**
 * 验证错误类型
 */
export interface ValidationError {
  /** 字段名 */
  field: string
  /** 行ID */
  rowId?: string
  /** 错误消息 */
  message: string
  /** 错误级别 */
  level: 'error' | 'warning'
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationError[]
}

/**
 * 验证单个行的起始点和终点
 * @param row - 投资记录行
 * @returns 验证结果
 */
export function validateStartEndPoint(row: InvestmentRecordRow): ValidationResult {
  const errors: ValidationError[] = []

  // 检查起始点是否有效
  if (isNaN(row.startPoint) || row.startPoint < 0) {
    errors.push({
      field: 'startPoint',
      rowId: row.id,
      message: '起始点必须为有效数字且不能为负数',
      level: 'error'
    })
  }

  // 检查终点是否有效
  if (isNaN(row.endPoint) || row.endPoint < 0) {
    errors.push({
      field: 'endPoint',
      rowId: row.id,
      message: '终点必须为有效数字且不能为负数',
      level: 'error'
    })
  }

  // 检查起始点是否小于终点
  if (!isNaN(row.startPoint) && !isNaN(row.endPoint) && row.startPoint >= row.endPoint) {
    errors.push({
      field: 'startPoint',
      rowId: row.id,
      message: '起始点必须小于终点',
      level: 'error'
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证规划比例
 * @param percentage - 规划比例
 * @returns 验证结果
 */
export function validatePercentage(percentage: number): ValidationResult {
  const errors: ValidationError[] = []

  if (isNaN(percentage)) {
    errors.push({
      field: 'plannedPercentage',
      message: '规划比例必须为有效数字',
      level: 'error'
    })
  } else if (percentage < 0 || percentage > 100) {
    errors.push({
      field: 'plannedPercentage',
      message: '规划比例必须在 0-100 之间',
      level: 'error'
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证金额
 * @param amount - 金额
 * @param fieldName - 字段名称
 * @returns 验证结果
 */
export function validateAmount(amount: number, fieldName: string = 'amount'): ValidationResult {
  const errors: ValidationError[] = []

  if (isNaN(amount)) {
    errors.push({
      field: fieldName,
      message: '金额必须为有效数字',
      level: 'error'
    })
  } else if (amount < 0) {
    errors.push({
      field: fieldName,
      message: '金额不能为负数',
      level: 'error'
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 计算卡片内所有行的规划比例总和
 * @param card - 投资记录卡片
 * @param excludeRowId - 排除的行ID（用于编辑时）
 * @returns 比例总和
 */
export function calculateCardPercentageTotal(
  card: InvestmentRecordCard,
  excludeRowId?: string
): number {
  return card.rows
    .filter(row => row.id !== excludeRowId)
    .reduce((sum, row) => sum + row.plannedPercentage, 0)
}

/**
 * 验证卡片内规划比例总和
 * @param card - 投资记录卡片
 * @param excludeRowId - 排除的行ID（编辑时使用）
 * @returns 验证结果
 */
export function validateCardPercentageTotal(
  card: InvestmentRecordCard,
  excludeRowId?: string
): ValidationResult {
  const total = calculateCardPercentageTotal(card, excludeRowId)
  const errors: ValidationError[] = []

  if (total > 100) {
    errors.push({
      field: 'plannedPercentage',
      message: `卡片"${card.name}"的规划比例总和为 ${total.toFixed(1)}%，超过 100%`,
      level: 'error'
    })
  } else if (total > 90) {
    errors.push({
      field: 'plannedPercentage',
      message: `卡片"${card.name}"的规划比例总和为 ${total.toFixed(1)}%，接近上限`,
      level: 'warning'
    })
  }

  return {
    valid: total <= 100,
    errors
  }
}

/**
 * 验证单个行的规划比例
 * @param percentage - 待验证的比例
 * @param card - 投资记录卡片
 * @param currentRowId - 当前行ID（编辑时使用）
 * @returns 验证结果：是否有效、调整后的比例、提示消息
 */
export function validateRowPercentage(
  percentage: number,
  card: InvestmentRecordCard,
  currentRowId?: string
): {
  valid: boolean
  adjustedPercentage: number
  message: string
} {
  const otherTotal = calculateCardPercentageTotal(card, currentRowId)
  const maxAvailable = Math.max(0, 100 - otherTotal)

  if (percentage > maxAvailable) {
    return {
      valid: false,
      adjustedPercentage: maxAvailable,
      message: `比例总和不能超过100%，最大可用值为 ${maxAvailable.toFixed(1)}%`
    }
  }

  return {
    valid: true,
    adjustedPercentage: percentage,
    message: ''
  }
}

/**
 * 验证单个行的完整性
 * @param row - 投资记录行
 * @returns 验证结果
 */
export function validateRow(row: InvestmentRecordRow): ValidationResult {
  const allErrors: ValidationError[] = []

  // 验证起始点和终点
  const endPointResult = validateStartEndPoint(row)
  allErrors.push(...endPointResult.errors)

  // 验证规划比例
  const percentageResult = validatePercentage(row.plannedPercentage)
  allErrors.push(...percentageResult.errors)

  // 验证实际金额
  const amountResult = validateAmount(row.actualAmount, 'actualAmount')
  allErrors.push(...amountResult.errors)

  return {
    valid: allErrors.filter(e => e.level === 'error').length === 0,
    errors: allErrors
  }
}

/**
 * 验证整个卡片
 * @param card - 投资记录卡片
 * @returns 验证结果
 */
export function validateCard(card: InvestmentRecordCard): ValidationResult {
  const allErrors: ValidationError[] = []

  // 验证每个行
  card.rows.forEach(row => {
    const rowResult = validateRow(row)
    allErrors.push(...rowResult.errors)
  })

  // 验证卡片比例总和
  const totalResult = validateCardPercentageTotal(card)
  allErrors.push(...totalResult.errors)

  return {
    valid: allErrors.filter(e => e.level === 'error').length === 0,
    errors: allErrors
  }
}

/**
 * 获取行的错误提示
 * @param row - 投资记录行
 * @param field - 字段名
 * @returns 错误消息或空字符串
 */
export function getRowErrorMessage(row: InvestmentRecordRow, field: string): string {
  const result = validateRow(row)
  const error = result.errors.find(e => e.field === field && e.level === 'error')
  return error?.message || ''
}

/**
 * 检查行是否有错误
 * @param row - 投资记录行
 * @returns 是否有错误
 */
export function rowHasErrors(row: InvestmentRecordRow): boolean {
  const result = validateRow(row)
  return result.errors.some(e => e.level === 'error')
}

/**
 * 检查卡片是否有错误
 * @param card - 投资记录卡片
 * @returns 是否有错误
 */
export function cardHasErrors(card: InvestmentRecordCard): boolean {
  const result = validateCard(card)
  return result.errors.some(e => e.level === 'error')
}

/**
 * 获取卡片的错误数量
 * @param card - 投资记录卡片
 * @returns 错误数量
 */
export function getCardErrorCount(card: InvestmentRecordCard): number {
  const result = validateCard(card)
  return result.errors.filter(e => e.level === 'error').length
}
