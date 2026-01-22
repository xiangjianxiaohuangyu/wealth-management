/**
 * Changelog 页面类型定义
 */

/**
 * 更新记录项
 */
export interface ChangelogItem {
  /** 版本号 */
  version: string
  /** 发布日期 */
  date: string
  /** 更新类型 */
  type: 'major' | 'minor' | 'patch'
  /** 更新内容列表 */
  changes: ChangelogChange[]
}

/**
 * 更新内容
 */
export interface ChangelogChange {
  /** 类型 */
  type: 'added' | 'changed' | 'fixed' | 'removed' | 'security'
  /** 描述 */
  description: string
}
