/**
 * 股票数据自动更新 Hook
 *
 * 用于定时获取和更新股票数据
 */

import { useState, useEffect } from 'react'
import { stockDataService } from '../services/data/stockDataService'
import type { StockData } from '../services/data/stockDataService'

export interface UseStockDataOptions {
  /** 刷新间隔（毫秒），默认 5 分钟 */
  refreshInterval?: number
  /** 是否启用自动刷新，默认 true */
  enableAutoRefresh?: boolean
  /** 数据更新回调 */
  onDataChange?: (data: StockData | null) => void
}

export function useStockData(
  stockCode: string,
  options: UseStockDataOptions = {}
) {
  const {
    refreshInterval = 5 * 60 * 1000, // 默认 5 分钟
    enableAutoRefresh = true,
    onDataChange
  } = options

  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取数据的函数
  const fetchData = async () => {
    if (!stockCode || !stockCode.trim()) {
      setData(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const stockData = await stockDataService.getStockData(stockCode.trim())
      if (stockData) {
        setData(stockData)
        setError(null)
        onDataChange?.(stockData)
      } else {
        setData(null)
        // 不设置错误，因为可能是正常的空数据
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  // 手动刷新数据的函数
  const refresh = () => {
    fetchData()
  }

  // 初始化和定时刷新
  useEffect(() => {
    if (!stockCode) return

    // 立即获取一次数据
    fetchData()

    // 如果启用自动刷新，设置定时器
    if (enableAutoRefresh) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [stockCode, refreshInterval, enableAutoRefresh])

  return {
    data,
    loading,
    error,
    refresh
  }
}

/**
 * 批量股票数据 Hook
 *
 * 用于同时监控多个股票代码
 */
export function useBatchStockData(
  stockCodes: string[],
  options: UseStockDataOptions = {}
) {
  const {
    refreshInterval = 5 * 60 * 1000,
    enableAutoRefresh = true,
    onDataChange
  } = options

  const [dataMap, setDataMap] = useState<Record<string, StockData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 批量获取数据
  const fetchBatchData = async () => {
    const validCodes = stockCodes.filter(code => code && code.trim())

    if (validCodes.length === 0) {
      setDataMap({})
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await stockDataService.getBatchStockData(validCodes)
      setDataMap(results)
      setError(null)

      // 触发回调
      Object.values(results).forEach(data => {
        onDataChange?.(data)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      setDataMap({})
    } finally {
      setLoading(false)
    }
  }

  // 手动刷新
  const refresh = () => {
    fetchBatchData()
  }

  // 初始化和定时刷新
  useEffect(() => {
    if (stockCodes.length === 0) return

    fetchBatchData()

    if (enableAutoRefresh) {
      const interval = setInterval(fetchBatchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [stockCodes.join(','), refreshInterval, enableAutoRefresh])

  return {
    dataMap,
    loading,
    error,
    refresh
  }
}
