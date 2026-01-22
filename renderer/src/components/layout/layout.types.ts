/**
 * 布局组件类型定义
 */

import type { ReactNode } from 'react'
import type { MenuItem } from '../../types/navigation.types'

/**
 * 布局属性
 */
export interface LayoutProps {
  /** 子组件 */
  children?: ReactNode
}

/**
 * 侧边栏属性
 */
export interface SidebarProps {
  /** 菜单项列表 */
  menuItems: MenuItem[]
  /** 当前激活的路由路径 */
  activePath: string
  /** 点击菜单项时的回调 */
  onMenuClick?: (path: string) => void
  /** 是否收起 */
  collapsed?: boolean
}

/**
 * 主内容区属性
 */
export interface MainContentProps {
  /** 子组件 */
  children?: ReactNode
}

/**
 * 头部属性
 */
export interface HeaderProps {
  /** 标题 */
  title?: string
  /** 左侧内容 */
  leftContent?: ReactNode
  /** 右侧内容 */
  rightContent?: ReactNode
}

/**
 * 页脚属性
 */
export interface FooterProps {
  /** 版权信息 */
  copyright?: string
  /** 版本号 */
  version?: string
}
