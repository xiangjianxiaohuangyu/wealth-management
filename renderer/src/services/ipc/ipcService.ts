/**
 * IPC 服务封装
 *
 * 提供类型安全的与主进程通信的接口
 */

/**
 * IPC 通道名
 */
export const IPC_CHANNELS = {
  /** 获取应用版本 */
  GET_APP_VERSION: 'get-app-version',
  /** 检查更新 */
  CHECK_FOR_UPDATES: 'check-for-updates',
  /** 下载更新 */
  DOWNLOAD_UPDATE: 'download-update',
  /** 安装更新 */
  INSTALL_UPDATE: 'install-update'
} as const

/**
 * IPC 服务类
 */
class IPCService {
  /**
   * 调用主进程方法
   */
  async invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    if (!window.electron?.invoke) {
      console.error('Electron IPC not available')
      throw new Error('Electron IPC not available')
    }

    try {
      return await window.electron.invoke(channel, ...args) as T
    } catch (error) {
      console.error(`IPC invoke error: ${channel}`, error)
      throw error
    }
  }

  /**
   * 发送消息到主进程
   */
  send(channel: string, ...args: any[]): void {
    if (!window.electron?.send) {
      console.error('Electron IPC not available')
      return
    }

    try {
      window.electron.send(channel, ...args)
    } catch (error) {
      console.error(`IPC send error: ${channel}`, error)
    }
  }

  /**
   * 监听主进程消息
   */
  on(channel: string, callback: (...args: any[]) => void): () => void {
    if (!window.electron?.on) {
      console.error('Electron IPC not available')
      return () => {}
    }

    try {
      window.electron.on(channel, callback)
      return () => {
        window.electron?.removeListener?.(channel, callback)
      }
    } catch (error) {
      console.error(`IPC on error: ${channel}`, error)
      return () => {}
    }
  }

  /**
   * 移除监听器
   */
  removeListener(channel: string, callback: (...args: any[]) => void): void {
    if (!window.electron?.removeListener) {
      return
    }

    try {
      window.electron.removeListener(channel, callback)
    } catch (error) {
      console.error(`IPC removeListener error: ${channel}`, error)
    }
  }

  /**
   * 一次性监听器
   */
  once(channel: string, callback: (...args: any[]) => void): void {
    if (!window.electron?.once) {
      console.error('Electron IPC not available')
      return
    }

    try {
      window.electron.once(channel, callback)
    } catch (error) {
      console.error(`IPC once error: ${channel}`, error)
    }
  }
}

/**
 * 导出单例实例
 */
export const ipcService = new IPCService()

/**
 * 便捷方法：获取应用版本
 */
export async function getAppVersion(): Promise<string> {
  return ipcService.invoke<string>(IPC_CHANNELS.GET_APP_VERSION)
}
