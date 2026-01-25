/**
 * 饼图组件
 *
 * 基于 ECharts 的饼图封装，支持普通饼图和环形图
 */

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
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

  // 更新图表配置
  useEffect(() => {
    if (!isReady || !chartInstance.current) return

    const chart = chartInstance.current

    // 检查数据是否为空
    const isEmpty = !data || data.length === 0
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
        trigger: 'item',
        formatter: (params: any) => {
          const percent = params.percent
          const value = params.value
          const name = params.name
          return `${name}<br/>${showPercentage ? `占比: ${percent}%` : ''}<br/>数值: ${value}`
        }
      },
      legend: showLegend ? {
        orient: 'horizontal',
        bottom: 10,
        left: 'center'
      } : undefined,
      series: [
        {
          type: 'pie',
          radius: donut ? radius : '70%',
          center: ['50%', donut ? '50%' : '55%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: showPercentage ? '{b}: {d}%' : '{b}',
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
          data: data.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color || CHART_COLORS[index % CHART_COLORS.length]
            }
          }))
        }
      ],
      // 环形图中间文字
      graphic: donut && centerText ? [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: centerText,
          textAlign: 'center',
          fill: '#ffffff',
          fontSize: 20,
          fontWeight: 600
        }
      }] : undefined
    }

    chart.setOption(option, true)

    // 点击事件
    const handleChartClick = (params: any) => {
      if (onClick && params.componentType === 'series') {
        const clickedItem = data[params.dataIndex]
        onClick(clickedItem)
      }
    }

    chart.off('click')
    chart.on('click', handleChartClick)

  }, [isReady, data, title, showLegend, showPercentage, radius, donut, loading, empty, emptyText, loadingText, onEmpty, onClick])

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
