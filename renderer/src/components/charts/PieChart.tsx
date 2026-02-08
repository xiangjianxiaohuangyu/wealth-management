/**
 * 饼图组件
 *
 * 基于 ECharts 的饼图封装，支持普通饼图和环形图
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import echarts from '../../utils/echarts'
import type { PieChartProps } from './charts.types'
import { CHART_COLORS } from '../../utils/constants'
import './Charts.css'

export function PieChart({
  data = [],
  title,
  centerText,
  showLegend = true,
  showPercentage = true,
  radius = ['0%', '70%'],
  donut = false,
  height = 400,
  width = '100%',
  className = '',
  style,
  loading = false,
  loadingText = '加载中...',
  empty = false,
  emptyText = '暂无数据',
  onEmpty,
  onClick
}: PieChartProps) {
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

  // 检查数据是否为空
  const isEmpty = useMemo(() => {
    return !data || data.length === 0
  }, [data])

  // 构建系列数据
  const seriesData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.name,
      value: item.value,
      itemStyle: {
        color: item.color || CHART_COLORS[index % CHART_COLORS.length]
      }
    }))
  }, [data])

  // 构建图表配置
  const chartOption = useMemo(() => {
    return {
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
        trigger: 'item' as const,
        formatter: (params: any) => {
          const percent = params.percent
          const value = params.value
          const name = params.name
          return `${name}<br/>${showPercentage ? `占比: ${percent}%` : ''}<br/>数值: ${value}`
        }
      },
      legend: showLegend ? {
        orient: 'horizontal' as const,
        bottom: 10,
        left: 'center'
      } : undefined,
      series: [
        {
          type: 'pie' as const,
          radius: donut ? radius : '70%',
          center: ['50%', donut ? '50%' : '55%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: showPercentage ? '{b}\n{d}%' : '{b}',
            fontSize: 14
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: true
          },
          data: seriesData
        }
      ],
      // 环形图中间文字
      graphic: donut && centerText ? [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: centerText,
          fill: '#ffffff',
          fontSize: 20,
          fontWeight: 600
        }
      }] : undefined
    }
  }, [title, showLegend, showPercentage, radius, donut, centerText, seriesData])

  // 更新图表配置
  useEffect(() => {
    if (!isReady || !chartInstance.current) return

    const chart = chartInstance.current

    // 检查数据是否为空
    if (isEmpty) {
      onEmpty?.()
    }

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

    chart.setOption(chartOption, true)

    // 点击事件
    const handleChartClick = (params: any) => {
      if (onClick && params.componentType === 'series') {
        const clickedItem = data[params.dataIndex]
        onClick(clickedItem)
      }
    }

    chart.off('click')
    chart.on('click', handleChartClick)

  }, [isReady, chartOption, loading, empty, isEmpty, emptyText, loadingText, onEmpty, onClick, data])

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
