/**
 * 侧边栏组件
 */

import { useEffect, useState, type MouseEvent } from 'react'
import type { SidebarProps } from './layout.types'
import './Sidebar.css'

export function Sidebar({
  menuItems,
  activePath,
  onMenuClick,
  collapsed = false
}: SidebarProps) {
  const [appVersion, setAppVersion] = useState('加载中...')

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await (window as any).electron.invoke('get-app-version')
        setAppVersion(version)
      } catch (error) {
        console.error('获取版本号失败:', error)
        setAppVersion('未知')
      }
    }
    fetchVersion()
  }, [])

  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>, path: string) => {
    e.preventDefault()
    onMenuClick?.(path)
  }

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
    >
      <div className="sidebar__header">
        <h1 className="sidebar__title">财富管理</h1>
        {!collapsed && (
          <p className="sidebar__subtitle">Wealth Management</p>
        )}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar__menu-item">
              <button
                className={`sidebar__menu-button ${
                  activePath === item.path ? 'sidebar__menu-button--active' : ''
                }`}
                onClick={(e) => handleMenuClick(e, item.path)}
                disabled={item.disabled}
                aria-label={item.label}
                aria-current={activePath === item.path ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="sidebar__menu-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {!collapsed && (
                  <span className="sidebar__menu-label">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>版本 <span id="app-version">{appVersion}</span></p>
      </div>
    </aside>
  )
}
