/**
 * 资产配置组件
 *
 * 显示资产配置的饼图
 */

import { Card } from '../common/Card'
import { PieChart } from '../charts'
import type { AssetAllocation as AssetAllocationType } from '../../types/wealth.types'
import { ASSET_CATEGORY_LABELS } from '../../utils/constants'

interface AssetAllocationProps {
  /** 资产配置数据 */
  data: AssetAllocationType[]
  /** 标题 */
  title?: string
}

export function AssetAllocation({ data, title = '资产配置' }: AssetAllocationProps) {
  // 转换数据为饼图格式
  const pieData = data.map(item => ({
    name: ASSET_CATEGORY_LABELS[item.category] || item.category,
    value: item.amount
  }))

  return (
    <Card title={title} className="asset-allocation">
      <PieChart
        data={pieData}
        showLegend
        showPercentage
        height={300}
      />
    </Card>
  )
}
