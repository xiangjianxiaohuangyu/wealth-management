/**
 * 数据版本控制和迁移服务
 *
 * 用于处理应用更新时的数据兼容性问题
 */

import { assetTrackingStorage } from './assetTrackingStorage'
import { investmentStorage } from './investmentStorage'
import { calculatorStorage } from './calculatorStorage'
import { settingsStorage } from './localStorage'
import { APP_INFO } from '../../utils/constants'

/**
 * 当前数据版本
 */
export const DATA_VERSION = APP_INFO.VERSION

/**
 * 数据版本信息
 */
export interface DataVersionInfo {
  version: string
  exportDate: string
  minCompatibleVersion: string
}

/**
 * 支持的数据版本及其兼容性
 */
const VERSION_COMPATIBILITY: Record<string, {
  migrate: (data: any) => any
}> = {
  '1.0.0': {
    migrate: (data) => data // 当前版本，无需迁移
  }
}

/**
 * 数据版本控制服务
 */
export const dataVersionService = {
  /** 存储键 */
  STORAGE_KEY: 'wealth_data_version',

  /**
   * 获取当前数据版本
   */
  getCurrentVersion(): string {
    const versionInfo = this.getVersionInfo()
    return versionInfo?.version || DATA_VERSION
  },

  /**
   * 获取版本信息
   */
  getVersionInfo(): DataVersionInfo | null {
    try {
      const storage = window.localStorage
      const info = storage.getItem(this.STORAGE_KEY)
      return info ? JSON.parse(info) : null
    } catch {
      return null
    }
  },

  /**
   * 保存当前版本信息
   */
  saveVersionInfo(): void {
    const info: DataVersionInfo = {
      version: DATA_VERSION,
      exportDate: new Date().toISOString(),
      minCompatibleVersion: '1.0.0'
    }
    const storage = window.localStorage
    storage.setItem(this.STORAGE_KEY, JSON.stringify(info))
  },

  /**
   * 检查数据版本兼容性
   */
  checkCompatibility(version: string): { compatible: boolean; needsMigration: boolean; minCompatible?: string } {
    // 当前版本完全兼容
    if (version === DATA_VERSION) {
      return { compatible: true, needsMigration: false }
    }

    // 检查是否有对应的迁移逻辑
    const hasMigration = VERSION_COMPATIBILITY[version]
    if (!hasMigration) {
      return {
        compatible: false,
        needsMigration: false,
        minCompatible: '1.0.0'
      }
    }

    return { compatible: true, needsMigration: true }
  },

  /**
   * 迁移数据到当前版本
   */
  migrateData(data: any): any {
    const version = data.version || '1.0.0'

    // 如果没有版本信息，假设是初始版本
    if (!data.version) {
      console.log('📦 检测到无版本号的旧数据，标记为版本 1.0.0')
      data.version = '1.0.0'
      return data
    }

    const compatibility = this.checkCompatibility(version)

    // 不兼容
    if (!compatibility.compatible) {
      console.warn(`⚠️ 数据版本 ${version} 不兼容，当前版本 ${DATA_VERSION}`)
      return null
    }

    // 需要迁移
    if (compatibility.needsMigration) {
      console.log(`🔄 迁移数据从版本 ${version} 到 ${DATA_VERSION}`)
      const migration = VERSION_COMPATIBILITY[version]
      if (migration) {
        data = migration.migrate(data)
      }
    }

    return data
  },

  /**
   * 导出版本化的数据
   */
  exportData(): string {
    const exportData = {
      version: DATA_VERSION,
      exportDate: new Date().toISOString(),
      minCompatibleVersion: '1.0.0',
      data: {
        // 应用设置
        settings: settingsStorage.getAllSettings(),

        // 资产跟踪数据
        assetTracking: assetTrackingStorage.getData(),

        // 投资规划数据
        investment: {
          assets: investmentStorage.getAssets(),
          totalAmount: investmentStorage.getTotalAmount()
        },

        // 计算器数据
        calculator: {
          params: calculatorStorage.getParams()
        }
      }
    }
    return JSON.stringify(exportData, null, 2)
  },

  /**
   * 导入数据（带版本检查）
   */
  importData(jsonString: string): { success: boolean; error?: string; migrated?: boolean } {
    try {
      const imported = JSON.parse(jsonString)

      // 检查版本信息
      if (!imported.version) {
        return {
          success: false,
          error: '数据格式无效：缺少版本信息'
        }
      }

      // 检查兼容性
      const compatibility = this.checkCompatibility(imported.version)

      if (!compatibility.compatible) {
        return {
          success: false,
          error: `数据版本 ${imported.version} 不兼容，当前应用版本 ${DATA_VERSION}。请更新应用或使用兼容的数据版本。`
        }
      }

      // 迁移数据（如果需要）
      let data = imported.data
      let migrated = false

      if (compatibility.needsMigration) {
        const migratedData = this.migrateData({ version: imported.version, data })
        if (!migratedData) {
          return {
            success: false,
            error: '数据迁移失败'
          }
        }
        data = migratedData.data
        migrated = true
      }

      // 导入应用设置
      if (data.settings) {
        settingsStorage.setAllSettings(data.settings)
      }

      // 导入资产跟踪数据
      if (data.assetTracking) {
        assetTrackingStorage.setData(data.assetTracking)
      }

      // 导入投资规划数据
      if (data.investment) {
        if (data.investment.assets) {
          investmentStorage.saveAssets(data.investment.assets)
        }
      }

      // 导入计算器数据
      if (data.calculator && data.calculator.params) {
        calculatorStorage.saveParams(data.calculator.params)
      }

      // 更新版本信息
      this.saveVersionInfo()

      return {
        success: true,
        migrated
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '数据格式错误或已损坏'
      }
    }
  },

  /**
   * 保留：兼容旧版本的导入（不带版本检查）
   * 这个方法用于导入旧格式的数据文件
   */
  importLegacyData(jsonString: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(jsonString)

      // 尝试识别旧格式数据
      // 旧格式可能直接包含 data 字段但没有 version
      const data = imported.data || imported

      // 验证数据格式
      if (!data || typeof data !== 'object') {
        return { success: false, error: '数据格式无效：缺少 data 字段' }
      }

      // 导入数据（假设格式兼容）
      if (data.settings) {
        settingsStorage.setAllSettings(data.settings)
      }

      if (data.assetTracking) {
        assetTrackingStorage.setData(data.assetTracking)
      }

      if (data.investment) {
        if (data.investment.assets) {
          investmentStorage.saveAssets(data.investment.assets)
        }
      }

      if (data.calculator && data.calculator.params) {
        calculatorStorage.saveParams(data.calculator.params)
      }

      // 更新版本信息
      this.saveVersionInfo()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '数据格式错误或已损坏'
      }
    }
  }
}
