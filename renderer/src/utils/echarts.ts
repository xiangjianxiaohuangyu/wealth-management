/**
 * ECharts 按需导入配置
 *
 * 只导入项目实际使用的 ECharts 组件，减少 bundle 体积
 */

import * as echarts from 'echarts/core'
import {
  LineChart,
  PieChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent
} from 'echarts/components'
import {
  CanvasRenderer
} from 'echarts/renderers'

// 注册必需的组件
echarts.use([
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  CanvasRenderer
])

export default echarts

// 导出类型以供使用
export type { EChartsOption } from 'echarts'
