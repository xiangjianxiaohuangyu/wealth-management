/**
 * Electron API 类型定义
 */

type IPCChannel =
  | 'get-stock-data'
  | 'get-index-points'
  | 'read-file'
  | 'write-file'
  | 'app-version'
  | 'check-for-updates'
  | 'download-update'
  | 'install-update'
  | string

type IPCListener = (...args: unknown[]) => void

interface ElectronAPI {
  /** 监听主进程发送的消息 */
  on: (channel: IPCChannel, callback: IPCListener) => void
  /** 监听一次主进程发送的消息 */
  once: (channel: IPCChannel, callback: IPCListener) => void
  /** 移除监听器 */
  removeListener: (channel: IPCChannel, callback: IPCListener) => void
  /** 发送消息到主进程 */
  send: (channel: IPCChannel, ...args: unknown[]) => void
  /** 调用主进程方法并返回结果 */
  invoke: (channel: IPCChannel, ...args: unknown[]) => Promise<unknown>
  /** 读取文件 */
  readFile: (filename: string) => Promise<string>
}

/**
 * 更新信息类型
 */
export interface UpdateInfo {
  version: string
  releaseDate: string
  notes: string
  url: string
}

/**
 * 股票数据类型
 */
export interface StockData {
  stockCode: string
  stockName: string
  currentPrice: number
  changePercent: number
  volume: number
  updateTime: string
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
