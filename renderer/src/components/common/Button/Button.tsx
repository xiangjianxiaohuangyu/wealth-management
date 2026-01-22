/**
 * 按钮组件
 */

import type { ButtonProps } from './Button.types'
import './Button.css'

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  block = false,
  danger = false,
  className = '',
  style,
  onClick
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${
        block ? 'btn--block' : ''
      } ${danger ? 'btn--danger' : ''} ${className}`.trim()}
      style={style}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {icon && !loading && (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="btn__content">{children}</span>
    </button>
  )
}
