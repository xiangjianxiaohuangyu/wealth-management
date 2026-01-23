/**
 * 路由配置
 */

import { lazy } from 'react'
import type { RouteConfig, MenuItem } from '../types/navigation.types'

/**
 * 懒加载页面组件
 */
const WealthOverview = lazy(() => import('../pages/WealthOverview'))
const Investment = lazy(() => import('../pages/Investment'))
const Changelog = lazy(() => import('../pages/Changelog'))
const Settings = lazy(() => import('../pages/Settings'))

/**
 * 路由配置表
 */
export const routeConfigs: RouteConfig[] = [
  {
    path: '/dashboard',
    component: WealthOverview,
    title: '财富总览',
    meta: {
      description: '查看您的资产、负债和收支情况',
      icon: '📊',
      order: 1
    }
  },
  {
    path: '/investment',
    component: Investment,
    title: '投资规划',
    meta: {
      description: '管理投资组合和计算投资回报',
      icon: '📋',
      order: 2
    }
  },
  {
    path: '/changelog',
    component: Changelog,
    title: '开发日志',
    meta: {
      description: '查看应用更新历史',
      icon: '📝',
      order: 3
    }
  },
  {
    path: '/settings',
    component: Settings,
    title: '设置',
    meta: {
      description: '应用设置和数据管理',
      icon: '⚙️',
      order: 4
    }
  }
]

/**
 * 默认路由
 */
export const DEFAULT_ROUTE: RouteConfig['path'] = '/dashboard'

/**
 * 菜单配置
 */
export const menuItems: MenuItem[] = routeConfigs
  .filter(route => !route.meta?.hidden)
  .map(route => ({
    id: route.path,
    path: route.path,
    label: route.title,
    icon: route.meta?.icon
  }))
  .sort((a, b) => {
    const orderA = routeConfigs.find(r => r.path === a.path)?.meta?.order ?? 0
    const orderB = routeConfigs.find(r => r.path === b.path)?.meta?.order ?? 0
    return orderA - orderB
  })

/**
 * 根据 path 获取路由配置
 */
export function getRouteByPath(path: string): RouteConfig | undefined {
  return routeConfigs.find(route => route.path === path)
}

/**
 * 根据 path 获取菜单项
 */
export function getMenuItemByPath(path: string): MenuItem | undefined {
  return menuItems.find(item => item.path === path)
}
