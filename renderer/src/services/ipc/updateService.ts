/**
 * 更新服务
 *
 * 封装与应用更新相关的 IPC 调用
 */

import { ipcService, IPC_CHANNELS } from './ipcService'

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
  bytesPerSecond: number
}

/**
 * 更新状态
 */
export type UpdateStatus = 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'

/**
 * 更新事件监听器
 */
export interface UpdateListeners {
  onUpdateAvailable?: (info: UpdateInfo) => void
  onUpdateNotAvailable?: (info: { version: string }) => void
  onDownloadProgress?: (progress: DownloadProgress) => void
  onUpdateDownloaded?: () => void
  onUpdateError?: (error: Error) => void
}

/**
 * 更新服务类
 */
class UpdateService {
  private status: UpdateStatus = 'idle'
  private listeners: UpdateListeners = {}

  /**
   * 获取当前更新状态
   */
  getStatus(): UpdateStatus {
    return this.status
  }

  /**
   * 设置状态
   */
  private setStatus(status: UpdateStatus): void {
    this.status = status
  }

  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    this.setStatus('checking')

    try {
      const info = await ipcService.invoke<UpdateInfo>(IPC_CHANNELS.CHECK_FOR_UPDATES)

      if (info) {
        this.setStatus('available')
        this.listeners.onUpdateAvailable?.(info)
      } else {
        this.setStatus('not-available')
        this.listeners.onUpdateNotAvailable?.({ version: 'unknown' })
      }

      return info
    } catch (error) {
      this.setStatus('error')
      this.listeners.onUpdateError?.(error as Error)
      return null
    }
  }

  /**
   * 下载更新
   */
  downloadUpdate(): void {
    this.setStatus('downloading')
    ipcService.send(IPC_CHANNELS.DOWNLOAD_UPDATE)
  }

  /**
   * 安装更新
   */
  installUpdate(): void {
    ipcService.send(IPC_CHANNELS.INSTALL_UPDATE)
  }

  /**
   * 设置事件监听器
   */
  setListeners(listeners: UpdateListeners): void {
    this.listeners = listeners

    // 移除旧的监听器
    this.removeAllListeners()

    // 添加新的监听器
    if (listeners.onUpdateAvailable) {
      ipcService.on('update-available', (_event, info) => {
        this.setStatus('available')
        listeners.onUpdateAvailable?.(info)
      })
    }

    if (listeners.onUpdateNotAvailable) {
      ipcService.on('update-not-available', (_event, info) => {
        this.setStatus('not-available')
        listeners.onUpdateNotAvailable?.(info)
      })
    }

    if (listeners.onDownloadProgress) {
      ipcService.on('update-download-progress', (_event, progress) => {
        listeners.onDownloadProgress?.(progress)
      })
    }

    if (listeners.onUpdateDownloaded) {
      ipcService.on('update-downloaded', () => {
        this.setStatus('downloaded')
        listeners.onUpdateDownloaded?.()
      })
    }

    if (listeners.onUpdateError) {
      ipcService.on('update-error', (_event, error) => {
        this.setStatus('error')
        listeners.onUpdateError?.(error)
      })
    }
  }

  /**
   * 移除所有监听器
   */
  private removeAllListeners(): void {
    ipcService.removeListener('update-available', () => {})
    ipcService.removeListener('update-not-available', () => {})
    ipcService.removeListener('update-download-progress', () => {})
    ipcService.removeListener('update-downloaded', () => {})
    ipcService.removeListener('update-error', () => {})
  }

  /**
   * 清理
   */
  dispose(): void {
    this.removeAllListeners()
    this.listeners = {}
  }
}

/**
 * 导出单例实例
 */
export const updateService = new UpdateService()
