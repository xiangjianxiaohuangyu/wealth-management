/**
 * 更新组件导出
 */

// 导出更新通知组件（推荐使用）
export { UpdateNotification, UpdateNotification as UpdateManager } from './UpdateNotification'

// 导出更新对话框组件（Modal 形式，供后续使用）
export { UpdateDialog } from './UpdateDialog'

// 导出类型
export type { UpdateInfo, DownloadProgress } from './update.types'
