/**
 * 投资组合表格组件
 *
 * 功能：
 * - 显示资产列表
 * - 管理表格头和表格行
 */

import type { AssetAllocationItem } from '../../types/investment.types'
import { PortfolioTableRow } from './PortfolioTableRow'
import { PortfolioCharts } from './PortfolioCharts'
import './PortfolioTable.css'

export interface PortfolioTableProps {
  /** 资产列表 */
  assets: AssetAllocationItem[]
  /** 总投资金额 */
  totalAmount: number
  /** 总实际金额 */
  totalActualAmount: number
  /** 当前编辑的资产ID */
  editingId: string | null
  /** 编辑回调 */
  onEdit: (id: string) => void
  /** 保存回调 */
  onSave: (id: string, updates: Partial<AssetAllocationItem>) => void
  /** 取消回调 */
  onCancel: () => void
  /** 删除回调 */
  onDelete: (id: string) => void
  /** 添加资产回调 */
  onAddAsset: () => void
}

export function PortfolioTable({
  assets,
  totalAmount,
  totalActualAmount,
  editingId,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAddAsset
}: PortfolioTableProps) {
  return (
    <div className="portfolio-table">
      {/* 图表区域 */}
      <PortfolioCharts assets={assets} />

      {/* 表头 */}
      <div className="portfolio-table__header">
        <div>资产名称</div>
        <div>计划比例(%)</div>
        <div>计划金额(￥)</div>
        <div>实际金额(￥)</div>
        <div>实际比例(%)</div>
        <div>偏离度</div>
        <div>操作</div>
      </div>

      {/* 数据行 */}
      <div className="portfolio-table__body">
        {assets.length === 0 ? (
          <div className="portfolio-table__empty">
            <p>暂无资产配置，点击下方"添加资产"按钮开始配置</p>
          </div>
        ) : (
          assets.map(asset => (
            <PortfolioTableRow
              key={asset.id}
              asset={asset}
              isEditing={editingId === asset.id}
              totalAmount={totalAmount}
              totalActualAmount={totalActualAmount}
              onEdit={onEdit}
              onSave={onSave}
              onCancel={onCancel}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* 添加资产按钮 */}
      <button
        className="portfolio-table__add-asset-btn"
        onClick={onAddAsset}
      >
        + 添加资产
      </button>
    </div>
  )
}
