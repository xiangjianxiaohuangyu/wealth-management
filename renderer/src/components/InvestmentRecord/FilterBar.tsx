/**
 * 筛选和排序工具栏
 */

import './FilterBar.css'

export interface FilterBarProps {
  /** 当前筛选状态 */
  filter: 'all' | 'completed' | 'pending' | 'not-started'
  /** 筛选变更回调 */
  onFilterChange: (filter: 'all' | 'completed' | 'pending' | 'not-started') => void
  /** 当前行数 */
  totalCount: number
}

export function FilterBar({ filter, onFilterChange, totalCount }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__filters">
        <button
          className={`filter-bar__btn ${filter === 'all' ? 'filter-bar__btn--active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          全部 ({totalCount})
        </button>
        <button
          className={`filter-bar__btn ${filter === 'completed' ? 'filter-bar__btn--active' : ''}`}
          onClick={() => onFilterChange('completed')}
        >
          已完成
        </button>
        <button
          className={`filter-bar__btn ${filter === 'pending' ? 'filter-bar__btn--active' : ''}`}
          onClick={() => onFilterChange('pending')}
        >
          进行中
        </button>
        <button
          className={`filter-bar__btn ${filter === 'not-started' ? 'filter-bar__btn--active' : ''}`}
          onClick={() => onFilterChange('not-started')}
        >
          未开始
        </button>
      </div>
    </div>
  )
}
