/**
 * 主布局组件
 */

import { Suspense, lazy } from 'react'
import { useNavigation } from '../../hooks/useNavigation'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import type { LayoutProps } from './layout.types'
import './AppLayout.css'

/**
 * 路由组件映射
 */
const routeComponents = {
  '/dashboard': lazy(() => import('../../pages/WealthOverview')),
  '/asset-tracking': lazy(() => import('../../pages/AssetTracking')),
  '/test-zone': lazy(() => import('../../pages/TestZone')),
  '/changelog': lazy(() => import('../../pages/Changelog')),
  '/settings': lazy(() => import('../../pages/Settings'))
}

/**
 * 加载组件
 */
function LoadingFallback() {
  return (
    <div className="layout__loading">
      <div className="layout__spinner" />
      <p>加载中...</p>
    </div>
  )
}

export function AppLayout({ children }: LayoutProps) {
  const { currentPath, navigate, menuItems } = useNavigation()

  // 获取当前路由对应的组件
  const RouteComponent = routeComponents[currentPath as keyof typeof routeComponents]

  const handleMenuClick = (path: string) => {
    navigate(path as any)
  }

  return (
    <div className="layout">
      <Sidebar
        menuItems={menuItems}
        activePath={currentPath}
        onMenuClick={handleMenuClick}
      />

      <MainContent>
        <Suspense fallback={<LoadingFallback />}>
          {children || (RouteComponent && <RouteComponent />)}
        </Suspense>
      </MainContent>
    </div>
  )
}
