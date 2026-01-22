/**
 * 主内容区组件
 */

import type { MainContentProps } from './layout.types'
import './MainContent.css'

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="main-content">
      <div className="main-content__container">
        {children}
      </div>
    </main>
  )
}
