/**
 * 导航相关类型定义
 */

import type { ReactNode } from 'react'

/**
 * 路由路径类型
 */
export type RoutePath =
  | '/dashboard'
  | '/investment'
  | '/investment-record'
  | '/asset-tracking'
  | '/test-zone'
  | '/changelog'
  | '/settings'

/**
 * 菜单项类型
 */
export interface MenuItem {
  /** 菜单项唯一标识 */
  id: string
  /** 路由路径 */
  path: RoutePath
  /** 显示文本 */
  label: string
  /** 图标 (可以是组件或字符串) */
  icon?: ReactNode | string
  /** 是否禁用 */
  disabled?: boolean
  /** 子菜单项 */
  children?: MenuItem[]
}

/**
 * 路由配置项
 */
export interface RouteConfig {
  /** 路由路径 */
  path: RoutePath
  /** 页面组件 */
  component: React.ComponentType
  /** 页面标题 */
  title: string
  /** 是否需要认证 */
  requireAuth?: boolean
  /** 是否隐藏（不在菜单中显示） */
  hidden?: boolean
  /** 路由元信息 */
  meta?: RouteMeta
}

/**
 * 路由元信息
 */
export interface RouteMeta {
  /** 页面描述 */
  description?: string
  /** 页面图标 */
  icon?: string
  /** 排序顺序 */
  order?: number
  /** 自定义数据 */
  [key: string]: any
}

/**
 * 导航状态
 */
export interface NavigationState {
  /** 当前激活的路由路径 */
  currentPath: RoutePath
  /** 导航历史记录 */
  history: RoutePath[]
  /** 历史记录索引 */
  historyIndex: number
}

/**
 * 导航操作
 */
export interface NavigationActions {
  /** 导航到指定路径 */
  navigate: (path: RoutePath) => void
  /** 返回上一页 */
  back: () => void
  /** 前往下一页 */
  forward: () => void
  /** 替换当前路由 */
  replace: (path: RoutePath) => void
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /** 标题 */
  title: string
  /** 路由路径 */
  path?: RoutePath
  /** 是否可点击 */
  clickable?: boolean
}
