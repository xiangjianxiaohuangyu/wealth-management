/**
 * 卡片组件
 */

import type { CardProps } from './Card.types'
import './Card.css'

export function Card({
  children,
  title,
  subtitle,
  extra,
  bordered = true,
  hoverable = false,
  className = '',
  style
}: CardProps) {
  return (
    <div
      className={`card ${bordered ? 'card--bordered' : ''} ${
        hoverable ? 'card--hoverable' : ''
      } ${className}`.trim()}
      style={style}
    >
      {(title || subtitle || extra) && (
        <div className="card__header">
          <div className="card__header-content">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {extra && <div className="card__extra">{extra}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  )
}
