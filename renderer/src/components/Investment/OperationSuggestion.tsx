/**
 * 操作建议组件
 *
 * 三种状态：
 * - 需补仓￥xxx (蓝色)
 * - 需减持￥xxx (红色)
 * - 已平衡 (绿色)
 *
 * 显示为两行：第一行为状态文本，第二行为金额
 */

import type { OperationSuggestion } from '../../types/investment.types'
import { formatCurrency } from '../../utils/format/currency'
import './OperationSuggestion.css'

interface OperationSuggestionProps {
  /** 建议类型 */
  suggestion: OperationSuggestion
  /** 差异金额 */
  amount: number
}

export function OperationSuggestion({ suggestion, amount }: OperationSuggestionProps) {
  const getStatusText = (): string => {
    switch (suggestion) {
      case 'need-buy':
        return '需补仓'
      case 'need-sell':
        return '需减持'
      case 'balanced':
        return '已平衡'
      default:
        return ''
    }
  }

  const getAmountText = (): string => {
    if (suggestion === 'balanced') {
      return ''
    }
    return formatCurrency(amount, 'CNY', { decimals: 0 })
  }

  return (
    <div className={`operation-suggestion operation-suggestion--${suggestion}`}>
      <div className="operation-suggestion__status">{getStatusText()}</div>
      {suggestion !== 'balanced' && (
        <div className="operation-suggestion__amount">{getAmountText()}</div>
      )}
    </div>
  )
}
