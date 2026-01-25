/**
 * 图表组件类型定义
 */

import type { CSSProperties } from 'react'

/**
 * 饼图数据项
 */
export interface PieDataItem {
  /** 数据项名称 */
  name: string
  /** 数据值 */
  value: number
  /** 颜色（可选） */
  color?: string
}

/**
 * 折线图数据点
 */
export interface LineDataPoint {
  /** X 轴值（通常是时间或类别） */
  x: string | number
  /** Y 轴值 */
  y: number
}

/**
 * 折线图系列
 */
export interface LineSeries {
  /** 系列名称 */
  name: string
  /** 数据点数组 */
  data: LineDataPoint[]
  /** 颜色（可选） */
  color?: string
  /** 是否平滑曲线 */
  smooth?: boolean
}

/**
 * 图表通用属性
 */
export interface BaseChartProps {
  /** 图表唯一标识 */
  id?: string
  /** 图表高度 */
  height?: string | number
  /** 图表宽度 */
  width?: string | number
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: CSSProperties
  /** 是否显示加载状态 */
  loading?: boolean
  /** 加载提示文字 */
  loadingText?: string
  /** 是否显示空数据提示 */
  empty?: boolean
  /** 空数据提示文字 */
  emptyText?: string
}

/**
 * 饼图组件属性
 */
export interface PieChartProps extends BaseChartProps {
  /** 饼图数据 */
  data: PieDataItem[]
  /** 图表标题 */
  title?: string
  /** 环形图中间文字（仅环形图有效） */
  centerText?: string
  /** 是否显示图例 */
  showLegend?: boolean
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 饼图半径 */
  radius?: [string, string]
  /** 是否环形图 */
  donut?: boolean
  /** 数据为空时的回调 */
  onEmpty?: () => void
  /** 点击数据项的回调 */
  onClick?: (item: PieDataItem) => void
}

/**
 * 折线图组件属性
 */
export interface LineChartProps extends BaseChartProps {
  /** 折线图数据（可以多个系列） */
  data: LineSeries | LineSeries[]
  /** 图表标题 */
  title?: string
  /** 是否显示图例 */
  showLegend?: boolean
  /** 是否显示区域填充 */
  showArea?: boolean
  /** 是否显示数据点 */
  showPoints?: boolean
  /** X 轴标签旋转角度 */
  xAxisLabelRotate?: number
  /** Y 轴格式化函数 */
  yAxisFormatter?: (value: number) => string
  /** 工具提示格式化函数 */
  tooltipFormatter?: (params: any) => string
  /** 点击数据点的回调 */
  onClick?: (point: LineDataPoint, seriesName: string) => void
}

/**
 * 图表颜色配置
 */
export interface ChartColors {
  /** 主色调 */
  primary: string[]
  /** 渐变色 */
  gradient: {
    start: string
    end: string
  }
}
