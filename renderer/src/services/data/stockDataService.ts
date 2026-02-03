/**
 * 股票数据服务接口
 *
 * 预留接口用于后期集成爬虫获取实时数据
 */

export interface StockData {
  /** 股票代码 */
  stockCode: string
  /** 股票名称 */
  stockName: string
  /** 当前价格 */
  currentPrice: number
  /** 涨跌幅 */
  changePercent: number
  /** 成交量 */
  volume: number
  /** 更新时间 */
  updateTime: string
}

export interface StockPointData {
  /** 指数代码 */
  indexCode: string
  /** 指数名称 */
  indexName: string
  /** 当前点数 */
  currentPoints: number
  /** 涨跌点数 */
  changePoints: number
  /** 涨跌幅 */
  changePercent: number
  /** 更新时间 */
  updateTime: string
}

/**
 * 股票数据服务
 */
export const stockDataService = {
  /**
   * 获取股票实时数据
   * @param stockCode 股票代码
   * @returns 股票数据或 null
   *
   * TODO: 集成爬虫接口
   * - 方案1: Electron 主进程通过 axios/cheerio 爬取数据
   * - 方案2: 使用第三方 API（如 Alpha Vantage, Yahoo Finance）
   * - 方案3: 自建后端服务提供数据接口
   */
  async getStockData(stockCode: string): Promise<StockData | null> {
    try {
      // 模拟实现 - 后续替换为真实数据源
      console.log(`[StockDataService] 获取股票数据: ${stockCode}`)

      // 预留接口调用
      // const response = await window.electron.ipc.invoke('get-stock-data', stockCode)
      // return response

      return null
    } catch (error) {
      console.error('[StockDataService] 获取股票数据失败:', error)
      return null
    }
  },

  /**
   * 获取指数实时点数
   * @param indexCode 指数代码
   * @returns 指数数据或 null
   *
   * TODO: 集成爬虫接口
   */
  async getIndexPoints(indexCode: string): Promise<StockPointData | null> {
    try {
      // 模拟实现
      console.log(`[StockDataService] 获取指数点数: ${indexCode}`)

      // 预留接口调用
      // const response = await window.electron.ipc.invoke('get-index-points', indexCode)
      // return response

      return null
    } catch (error) {
      console.error('[StockDataService] 获取指数点数失败:', error)
      return null
    }
  },

  /**
   * 批量获取股票数据
   * @param stockCodes 股票代码数组
   * @returns 股票数据映射
   */
  async getBatchStockData(stockCodes: string[]): Promise<Record<string, StockData>> {
    const results: Record<string, StockData> = {}

    // 并发获取，但限制并发数
    const batchSize = 5
    for (let i = 0; i < stockCodes.length; i += batchSize) {
      const batch = stockCodes.slice(i, i + batchSize)
      const promises = batch.map(async (code) => {
        const data = await this.getStockData(code)
        if (data) {
          results[code] = data
        }
      })
      await Promise.all(promises)
    }

    return results
  },

  /**
   * 检查数据是否需要更新
   * @param lastUpdateTime 上次更新时间
   * @param cacheDuration 缓存时长（毫秒），默认 5 分钟
   */
  shouldUpdateData(lastUpdateTime: string, cacheDuration: number = 5 * 60 * 1000): boolean {
    const now = Date.now()
    const lastUpdate = new Date(lastUpdateTime).getTime()
    return now - lastUpdate > cacheDuration
  }
}
