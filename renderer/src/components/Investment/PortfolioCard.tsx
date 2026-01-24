/**
 * 投资组合卡片组件
 *
 * 功能：
 * - 状态管理（资产列表、编辑状态、弹窗状态）
 * - CRUD操作逻辑
 * - 验证和提醒触发
 * - 数据自动计算和更新
 */

import { useState, useCallback, useEffect } from 'react'
import { Card } from '../common/Card'
import { PortfolioTable } from './PortfolioTable'
import { CreateAssetModal } from './CreateAssetModal'
import { ValidationToast } from './ValidationToast'
import type { AssetAllocationItem } from '../../types/investment.types'
import { updateAllAssetsCalculations } from '../../utils/calculation/portfolioCalculation'
import { validateAssetPercentage, calculateTotalPercentage } from '../../utils/validation/investmentValidation'
import { generateId } from '../../utils/idGenerator'
import './PortfolioCard.css'

export interface PortfolioCardProps {
  /** 总投资金额 */
  totalAmount: number
  /** 资产列表 */
  assets: AssetAllocationItem[]
  /** 资产列表变化回调 */
  onAssetsChange: (assets: AssetAllocationItem[]) => void
}

export function PortfolioCard({ totalAmount, assets, onAssetsChange }: PortfolioCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [validation, setValidation] = useState<{
    show: boolean
    message: string
    type: 'error' | 'warning'
  }>({
    show: false,
    message: '',
    type: 'error'
  })

  // 计算总实际金额
  const totalActualAmount = assets.reduce((sum, asset) => sum + asset.actualAmount, 0)

  // 计算最大可用比例
  const maxPercentage = Math.max(0, 100 - calculateTotalPercentage(assets))

  // 显示验证提示
  const showValidation = useCallback((message: string, type: 'error' | 'warning' = 'error') => {
    setValidation({ show: true, message, type })
  }, [])

  // 隐藏验证提示
  const hideValidation = useCallback(() => {
    setValidation(prev => ({ ...prev, show: false }))
  }, [])

  // 添加新资产
  const handleAddAsset = useCallback((name: string, percentage: number) => {
    // 验证比例
    const result = validateAssetPercentage(percentage, assets)

    if (!result.valid) {
      showValidation(result.message, 'warning')
    }

    // 创建新资产对象
    const newAsset: AssetAllocationItem = {
      id: generateId(),
      name,
      mode: 'percentage',
      plannedPercentage: result.adjustedPercentage,
      plannedAmount: (result.adjustedPercentage * totalAmount) / 100,
      actualAmount: 0,
      actualPercentage: 0,
      suggestion: 'balanced',
      suggestionAmount: 0
    }

    // 更新列表
    const updatedAssets = [...assets, newAsset]
    const recalculatedAssets = updateAllAssetsCalculations(updatedAssets, totalAmount)
    onAssetsChange(recalculatedAssets)

    setIsCreateModalOpen(false)
  }, [assets, totalAmount, onAssetsChange, showValidation])

  // 编辑资产
  const handleEditAsset = useCallback((id: string, updates: Partial<AssetAllocationItem>) => {
    const assetToEdit = assets.find(a => a.id === id)
    if (!assetToEdit) return

    let finalUpdates = { ...updates }

    // 如果更新比例，验证总和
    if (updates.plannedPercentage !== undefined) {
      const result = validateAssetPercentage(updates.plannedPercentage, assets, id)

      if (!result.valid) {
        showValidation(result.message, 'warning')
      }

      finalUpdates.plannedPercentage = result.adjustedPercentage
    }

    // 更新资产
    const updatedAssets = assets.map(asset =>
      asset.id === id ? { ...asset, ...finalUpdates } : asset
    )

    // 重新计算所有字段
    const recalculatedAssets = updateAllAssetsCalculations(updatedAssets, totalAmount)
    onAssetsChange(recalculatedAssets)

    setEditingId(null)
  }, [assets, totalAmount, onAssetsChange, showValidation])

  // 删除资产
  const handleDeleteAsset = useCallback((id: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== id)
    const recalculatedAssets = updateAllAssetsCalculations(updatedAssets, totalAmount)
    onAssetsChange(recalculatedAssets)
  }, [assets, totalAmount, onAssetsChange])

  // 进入编辑模式
  const handleStartEdit = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  // 总投资金额变化时，重新计算所有资产
  useEffect(() => {
    if (assets.length > 0) {
      const recalculatedAssets = updateAllAssetsCalculations(assets, totalAmount)
      onAssetsChange(recalculatedAssets)
    }
  }, [totalAmount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Card className="portfolio-card">
        {/* 表格 */}
        <PortfolioTable
          assets={assets}
          totalAmount={totalAmount}
          totalActualAmount={totalActualAmount}
          editingId={editingId}
          onEdit={handleStartEdit}
          onSave={handleEditAsset}
          onCancel={handleCancelEdit}
          onDelete={handleDeleteAsset}
          onAddAsset={() => setIsCreateModalOpen(true)}
        />
      </Card>

      {/* 创建资产弹窗 */}
      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleAddAsset}
        totalAmount={totalAmount}
        maxPercentage={maxPercentage}
      />

      {/* 验证提醒 */}
      <ValidationToast
        show={validation.show}
        message={validation.message}
        type={validation.type}
        onClose={hideValidation}
      />
    </>
  )
}
