/**
 * 导航 Hook
 */

import { useContext } from 'react'
import { RouterContext } from '../context/RouterContext'
import type { RouteContextValue } from '../router/route.types'

/**
 * 使用导航的 Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentPath, navigate, back, forward } = useNavigation()
 *
 *   return (
 *     <div>
 *       <p>当前页面: {currentPath}</p>
 *       <button onClick={() => navigate('/dashboard')}>前往仪表盘</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useNavigation(): RouteContextValue {
  const context = useContext(RouterContext)

  if (!context) {
    throw new Error('useNavigation must be used within a RouterProvider')
  }

  return context
}
