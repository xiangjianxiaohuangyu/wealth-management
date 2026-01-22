/**
 * 通用类型定义
 */

/**
 * 基础响应结构
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * ID 类型
 */
export type ID = string | number

/**
 * 日期类型
 */
export type DateString = string

/**
 * 货币类型
 */
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'HKD'

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'auto'

/**
 * 语言类型
 */
export type Language = 'zh-CN' | 'en-US'

/**
 * 选项类型
 */
export interface Option<T = string> {
  label: string
  value: T
  disabled?: boolean
}

/**
 * 颜色类型
 */
export type Color =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

/**
 * 按钮大小
 */
export type ButtonSize = 'small' | 'medium' | 'large'

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc'

/**
 * 排序参数
 */
export interface SortParams {
  field: string
  direction: SortDirection
}

/**
 * 文件上传信息
 */
export interface UploadFileInfo {
  name: string
  size: number
  type: string
  url?: string
}

/**
 * 表单字段验证规则
 */
export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  custom?: (value: any) => boolean | string
}

/**
 * 表单字段错误
 */
export interface FieldError {
  field: string
  message: string
}

/**
 * 加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
