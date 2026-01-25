/**
 * 投资计算器数据存储服务
 *
 * 用于保存和加载投资计算器参数
 */

import { storage } from './localStorage'
import type { InvestmentCalculatorParams } from '../../types/wealth.types'

/**
 * 投资计算器数据接口
 */
export interface CalculatorData {
  /** 计算器参数 */
  params: InvestmentCalculatorParams
  /** 最后更新时间 */
  lastUpdated: string
}

/**
 * 默认计算器参数
 */
export const DEFAULT_CALCULATOR_PARAMS: InvestmentCalculatorParams = {
  principal: 10000,
  monthlyContribution: 1000,
  annualReturn: 8,
  years: 10,
  compoundFrequency: 12
}

/**
 * 投资计算器数据存储服务
 */
export const calculatorStorage = {
  /** 存储键 */
  STORAGE_KEY: 'wealth_calculator_data',

  /**
   * 获取计算器参数
   */
  getParams(): InvestmentCalculatorParams {
    const data = this.getData()
    return data?.params || DEFAULT_CALCULATOR_PARAMS
  },

  /**
   * 保存计算器参数
   */
  saveParams(params: InvestmentCalculatorParams): boolean {
    const dataToSave: CalculatorData = {
      params,
      lastUpdated: new Date().toISOString()
    }
    return storage.set(this.STORAGE_KEY, dataToSave)
  },

  /**
   * 获取完整的计算器数据
   */
  getData(): CalculatorData | null {
    return storage.get<CalculatorData>(this.STORAGE_KEY)
  },

  /**
   * 保存完整的计算器数据
   */
  setData(data: CalculatorData): boolean {
    const dataToSave: CalculatorData = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    return storage.set(this.STORAGE_KEY, dataToSave)
  },

  /**
   * 清除计算器数据
   */
  clearData(): boolean {
    return storage.remove(this.STORAGE_KEY)
  },

  /**
   * 导出数据为JSON字符串
   */
  exportData(): string {
    const data = this.getData()
    return JSON.stringify(data, null, 2)
  },

  /**
   * 从JSON字符串导入数据
   */
  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString) as CalculatorData

      // 验证数据格式
      if (!data.params || typeof data.params.principal !== 'number') {
        return { success: false, error: '数据格式错误：缺少计算器参数' }
      }

      this.setData(data)
      return { success: true }
    } catch (error) {
      return { success: false, error: '数据格式错误' }
    }
  }
}
