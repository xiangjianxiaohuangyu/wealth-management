/**
 * 路由上下文
 */

import { createContext, useState, useCallback, ReactNode } from 'react'
import type { RouterProviderProps, RouteContextValue } from '../router/route.types'
import type { RoutePath } from '../types/navigation.types'
import { DEFAULT_ROUTE, menuItems } from '../router/routes'

/**
 * 路由上下文
 */
export const RouterContext = createContext<RouteContextValue | null>(null)

/**
 * 路由提供器
 *
 * @example
 * ```tsx
 * <RouterProvider initialRoute="/dashboard">
 *   <App />
 * </RouterProvider>
 * ```
 */
export function RouterProvider({
  initialRoute = DEFAULT_ROUTE,
  children
}: RouterProviderProps) {
  const [currentPath, setCurrentPath] = useState<RoutePath>(initialRoute)
  const [history, setHistory] = useState<RoutePath[]>([initialRoute])
  const [historyIndex, setHistoryIndex] = useState(0)

  /**
   * 导航到指定路径
   */
  const navigate = useCallback((path: RoutePath) => {
    setCurrentPath(path)
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      return [...newHistory, path]
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  /**
   * 返回上一页
   */
  const back = useCallback(() => {
    if (historyIndex > 0) {
      const newPath = history[historyIndex - 1]
      setCurrentPath(newPath)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  /**
   * 前往下一页
   */
  const forward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newPath = history[historyIndex + 1]
      setCurrentPath(newPath)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  /**
   * 替换当前路由
   */
  const replace = useCallback((path: RoutePath) => {
    setCurrentPath(path)
    setHistory(prev => {
      const newHistory = [...prev]
      newHistory[historyIndex] = path
      return newHistory
    })
  }, [historyIndex])

  const value: RouteContextValue = {
    currentPath,
    history,
    historyIndex,
    navigate,
    back,
    forward,
    replace,
    menuItems
  }

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  )
}
