/**
 * 最近交易组件
 *
 * 显示最近的交易记录列表
 */

import { Card } from '../common/Card'
import type { Transaction } from '../../types/wealth.types'
import { TRANSACTION_CATEGORY_LABELS } from '../../utils/constants'
import { formatRelativeTime } from '../../utils/format/date'
import { formatCurrency } from '../../utils/format/currency'
import './RecentTransactions.css'

interface RecentTransactionsProps {
  /** 交易记录 */
  transactions: Transaction[]
  /** 标题 */
  title?: string
}

export function RecentTransactions({
  transactions,
  title = '最近交易'
}: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card title={title} className="recent-transactions">
        <p className="recent-transactions__empty">暂无交易记录</p>
      </Card>
    )
  }

  return (
    <Card title={title} className="recent-transactions">
      <div className="recent-transactions__list">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="recent-transactions__item">
            <div className="recent-transactions__icon">
              {transaction.type === 'income' ? '📈' : '📉'}
            </div>
            <div className="recent-transactions__details">
              <div className="recent-transactions__category">
                {TRANSACTION_CATEGORY_LABELS[transaction.category] || transaction.category}
              </div>
              <div className="recent-transactions__description">
                {transaction.description || transaction.notes}
              </div>
              <div className="recent-transactions__date">
                {formatRelativeTime(transaction.date)}
              </div>
            </div>
            <div
              className={`recent-transactions__amount recent-transactions__amount--${transaction.type}`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
