/**
 * 路由类型定义
 */

import type { RoutePath, NavigationState, NavigationActions, MenuItem } from '../types/navigation.types'

/**
 * 路由上下文值
 */
export interface RouteContextValue extends NavigationState, NavigationActions {
  /** 菜单项列表 */
  menuItems: MenuItem[]
}

/**
 * 路由提供器属性
 */
export interface RouterProviderProps {
  /** 初始路由 */
  initialRoute?: RoutePath
  /** 子组件 */
  children: React.ReactNode
}
