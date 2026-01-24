/**
 * 投资模式选择器
 *
 * 两个按钮：固定百分比 / 固定金额
 * 左右并列布局
 */

import type { InvestmentMode } from '../../types/investment.types'

interface InvestmentModeSelectorProps {
  /** 当前模式 */
  mode: InvestmentMode
  /** 模式变化回调 */
  onChange: (mode: InvestmentMode) => void
  /** 是否禁用 */
  disabled?: boolean
}

export function InvestmentModeSelector({
  mode,
  onChange,
  disabled = false
}: InvestmentModeSelectorProps) {
  return (
    <div className="investment-mode-selector">
      <button
        type="button"
        className={`investment-mode-selector__button ${
          mode === 'percentage' ? 'investment-mode-selector__button--active' : ''
        }`}
        onClick={() => onChange('percentage')}
        disabled={disabled}
      >
        固定百分比
      </button>

      <button
        type="button"
        className={`investment-mode-selector__button ${
          mode === 'amount' ? 'investment-mode-selector__button--active' : ''
        }`}
        onClick={() => onChange('amount')}
        disabled={disabled}
      >
        固定金额
      </button>
    </div>
  )
}
