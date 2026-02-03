/**
 * 测试区设置存储服务
 *
 * 用于保存和加载测试区设置
 */

import { storage } from './localStorage'
import type { TestZoneSettings, CalculationMethod } from '../../types/testZoneSettings.types'
import { eventBus } from '../../utils/eventBus'

/**
 * 测试区设置存储服务
 */
export const testZoneSettingsStorage = {
  /** 存储键 */
  STORAGE_KEY: 'wealth_testzone_settings',

  /**
   * 获取设置
   */
  getSettings(): TestZoneSettings {
    const data = storage.get<TestZoneSettings>(this.STORAGE_KEY)
    const defaultSettings: TestZoneSettings = {
      calculationMethod: 'total-income'
    }
    return { ...defaultSettings, ...data }
  },

  /**
   * 保存设置
   */
  setSettings(settings: TestZoneSettings): boolean {
    return storage.set(this.STORAGE_KEY, settings)
  },

  /**
   * 设置投资金额计算方式
   */
  setCalculationMethod(method: CalculationMethod): void {
    const settings = this.getSettings()
    settings.calculationMethod = method
    this.setSettings(settings)
    eventBus.emit('testzone-settings-changed')
  },

  /**
   * 获取投资金额计算方式
   */
  getCalculationMethod(): CalculationMethod {
    return this.getSettings().calculationMethod
  }
}
