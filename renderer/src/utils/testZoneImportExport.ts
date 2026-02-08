/**
 * 投资规划数据导入导出工具
 *
 * 处理投资规划数据的导入导出功能
 */

import type { TestZoneData } from '../types/testzone.types'

/** 导入数据的行格式 */
interface ImportRow {
  id: string
  startPoint: number
  endPoint: number
  plannedPercentage: number
  actualAmount: number
  createdAt: string
  updatedAt: string
}

/** 导入数据的卡片格式 */
interface ImportCard {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  rows: ImportRow[]
}

/** 导入数据的完整格式 */
interface ImportData {
  cards: ImportCard[]
  lastUpdated: string
}

/**
 * 将内部数据格式转换为导入导出格式
 */
function convertToImportFormat(data: TestZoneData): ImportData {
  return {
    cards: data.tables.map(table => ({
      id: table.id,
      name: table.name,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
      rows: table.rows.map(row => ({
        id: row.id,
        startPoint: row.valueRangeStart,
        endPoint: row.valueRangeEnd,
        plannedPercentage: row.investmentPercentage,
        actualAmount: row.actualAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    })),
    lastUpdated: data.lastUpdated || new Date().toISOString()
  }
}

/**
 * 将导入导出格式转换为内部数据格式
 */
function convertFromImportFormat(importData: ImportData): TestZoneData {
  return {
    tables: importData.cards.map(card => ({
      id: card.id,
      name: card.name,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      rows: card.rows.map(row => ({
        id: row.id,
        valueRangeStart: row.startPoint,
        valueRangeEnd: row.endPoint,
        investmentPercentage: row.plannedPercentage,
        investmentAmount: 0, // 导入时重新计算
        actualAmount: row.actualAmount,
        useTotalInvestment: false
      }))
    })),
    lastUpdated: importData.lastUpdated
  }
}

/**
 * 导出数据为JSON字符串
 */
export function exportTestData(data: TestZoneData): string {
  const importFormat = convertToImportFormat(data)
  return JSON.stringify(importFormat, null, 2)
}

/**
 * 从JSON字符串导入数据
 */
export function importTestData(jsonString: string): { success: boolean; data?: TestZoneData; error?: string } {
  try {
    const importData = JSON.parse(jsonString) as ImportData

    // 验证数据格式
    if (!Array.isArray(importData.cards)) {
      return { success: false, error: '数据格式错误：缺少卡片列表' }
    }

    // 验证每个卡片的格式
    for (const card of importData.cards) {
      if (!card.name || !Array.isArray(card.rows)) {
        return { success: false, error: '数据格式错误：卡片字段不完整' }
      }

      // 验证每行的格式
      for (const row of card.rows) {
        if (typeof row.startPoint !== 'number' ||
            typeof row.endPoint !== 'number' ||
            typeof row.plannedPercentage !== 'number' ||
            typeof row.actualAmount !== 'number') {
          return { success: false, error: '数据格式错误：行字段不完整或类型错误' }
        }
      }
    }

    const data = convertFromImportFormat(importData)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: '数据格式错误：无法解析JSON' }
  }
}

/**
 * 下载JSON文件
 */
export function downloadJsonFile(jsonString: string, filename: string = 'testzone-data.json') {
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 读取JSON文件
 */
export function readJsonFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsText(file, 'utf-8')
  })
}
