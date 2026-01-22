/**
 * 更新相关类型定义
 */

/**
 * 更新信息
 */
export interface UpdateInfo {
  version: string
  releaseNotes?: string
  date?: string
}

/**
 * 下载进度信息
 */
export interface DownloadProgress {
  percent: number
  transferred: number
  total: number
}
