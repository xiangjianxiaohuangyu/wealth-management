/**
 * 折线图组件
 *
 * 基于 ECharts 的折线图封装，支持单条或多条折线
 */

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import type { LineChartProps, LineSeries } from './charts.types'
import { CHART_COLORS } from '../../utils/constants'
import './Charts.css'

export function LineChart({
  data,
  title,
  showLegend = true,
  showArea = false,
  showPoints = true,
  xAxisLabelRotate = 0,
  yAxisFormatter,
  tooltipFormatter,
  height = 400,
  width = '100%',
  className = '',
  style,
  loading = false,
  loadingText = '加载中...',
  empty = false,
  emptyText = '暂无数据',
  onClick
}: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [isReady, setIsReady] = useState(false)

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    chartInstance.current = chart
    setIsReady(true)

    // 响应式处理
    const handleResize = () => {
      chart.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
      chartInstance.current = null
    }
  }, [])

  // 更新图表配置
  useEffect(() => {
    if (!isReady || !chartInstance.current) return

    const chart = chartInstance.current

    // 标准化数据为数组格式
    const seriesData: LineSeries[] = Array.isArray(data) ? data : [data]

    // 检查数据是否为空
    const isEmpty = seriesData.length === 0 || seriesData.every(s => !s.data || s.data.length === 0)

    // 显示加载状态
    if (loading) {
      chart.showLoading({
        text: loadingText,
        color: CHART_COLORS[0],
        textColor: '#666',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0
      })
      return
    } else {
      chart.hideLoading()
    }

    // 显示空数据状态
    if (empty || isEmpty) {
      chart.clear()
      chart.setOption({
        title: {
          text: emptyText,
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14
          }
        }
      })
      return
    }

    // 获取 X 轴数据（使用第一个系列的 X 轴数据）
    const xAxisData = seriesData[0]?.data?.map(point => point.x) || []

    // 构建系列配置
    const series = seriesData.map((seriesItem, index) => {
      const seriesOption: echarts.LineSeriesOption = {
        name: seriesItem.name,
        type: 'line',
        smooth: seriesItem.smooth ?? true,
        symbol: showPoints ? 'circle' : 'none',
        symbolSize: showPoints ? 6 : 0,
        data: seriesItem.data?.map(point => point.y) || [],
        itemStyle: {
          color: seriesItem.color || CHART_COLORS[index % CHART_COLORS.length]
        },
        lineStyle: {
          width: 2
        }
      }

      if (showArea) {
        seriesOption.areaStyle = {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: (seriesItem.color || CHART_COLORS[index % CHART_COLORS.length]) + '40' },
              { offset: 1, color: (seriesItem.color || CHART_COLORS[index % CHART_COLORS.length]) + '05' }
            ]
          }
        }
      }

      return seriesOption
    })

    // 构建图表配置
    const option: echarts.EChartsOption = {
      title: title ? {
        text: title,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#2d3436'
        }
      } : undefined,
      tooltip: {
        trigger: 'axis',
        formatter: tooltipFormatter || ((params: any) => {
          let result = `${params[0].axisValue}<br/>`
          params.forEach((param: any) => {
            result += `${param.marker}${param.seriesName}: ${param.value}<br/>`
          })
          return result
        })
      },
      legend: showLegend ? {
        orient: 'horizontal',
        bottom: 10,
        left: 'center'
      } : undefined,
      grid: {
        left: '3%',
        right: '4%',
        bottom: showLegend ? 60 : 40,
        top: title ? 60 : 40,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          rotate: xAxisLabelRotate,
          interval: 'auto',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: yAxisFormatter || ((value: number) => value.toString()),
          fontSize: 12
        }
      },
      series
    }

    chart.setOption(option, true)

    // 点击事件
    const handleChartClick = (params: any) => {
      if (onClick && params.componentType === 'series') {
        const seriesIndex = params.seriesIndex
        const dataIndex = params.dataIndex
        const seriesItem = seriesData[seriesIndex]
        const clickedPoint = seriesItem?.data?.[dataIndex]
        if (clickedPoint && seriesItem) {
          onClick(clickedPoint, seriesItem.name)
        }
      }
    }

    chart.off('click')
    chart.on('click', handleChartClick)

  }, [isReady, data, title, showLegend, showArea, showPoints, xAxisLabelRotate, yAxisFormatter, tooltipFormatter, loading, empty, emptyText, loadingText, onClick])

  return (
    <div
      ref={chartRef}
      className={`chart ${className}`.trim()}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
      }}
    />
  )
}
