/**
 * 总投资金额输入组件
 *
 * 功能：
 * - 显示总投资金额（从资产跟踪中获取）
 * - 投资组合管理
 * - 数据持久化
 * - 自动监听资产跟踪数据变化并更新
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card } from '../common/Card'
import { TotalInvestmentInput } from './TotalInvestmentInput'
import { PortfolioCard } from './PortfolioCard'
import type { AssetAllocationItem } from '../../types/investment.types'
import { investmentStorage } from '../../services/storage/investmentStorage'
import { assetTrackingStorage } from '../../services/storage/assetTrackingStorage'
import { updateAllAssetsCalculations } from '../../utils/calculation/portfolioCalculation'
import './AssetAllocationTable.css'

interface TotalInvestmentProps {
  /** 金额变化回调 */
  onChange?: (amount: number) => void
}

export function AssetAllocationTable({
  onChange
}: TotalInvestmentProps) {
  const [assets, setAssets] = useState<AssetAllocationItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const prevTotalAmountRef = useRef(0)
  const assetsRef = useRef<AssetAllocationItem[]>([])

  // 保持 assetsRef 同步
  useEffect(() => {
    assetsRef.current = assets
  }, [assets])

  // 计算总投资金额的函数
  const calculateTotalAmount = () => {
    const records = assetTrackingStorage.getAllRecords()
    const allAdjustments = assetTrackingStorage.getAllAdjustments()

    // 计算基础投资金额
    const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)

    // 计算投资调整金额
    const investmentAdjustments = allAdjustments
      .filter(a => a.type === 'investment')
      .reduce((sum, adj) => sum + adj.amount, 0)

    return baseInvestment + investmentAdjustments
  }

  // 初始化：从localStorage加载资产配置
  useEffect(() => {
    const savedAssets = investmentStorage.getAssets()
    if (savedAssets.length > 0) {
      setAssets(savedAssets)
      assetsRef.current = savedAssets
    }

    // 初始化总投资金额
    const initialAmount = calculateTotalAmount()
    setTotalAmount(initialAmount)
    prevTotalAmountRef.current = initialAmount
  }, [])

  // 监听资产跟踪数据变化
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newAmount = calculateTotalAmount()

      // 如果总投资金额发生变化，更新所有资产的计算
      if (newAmount !== prevTotalAmountRef.current) {
        prevTotalAmountRef.current = newAmount
        setTotalAmount(newAmount)

        // 重新计算所有资产的计划金额和偏离度
        const currentAssets = assetsRef.current
        if (currentAssets.length > 0) {
          const updatedAssets = updateAllAssetsCalculations(currentAssets, newAmount)
          setAssets(updatedAssets)
        }

        onChange?.(newAmount)
      }
    }, 1000) // 每秒检查一次

    return () => clearInterval(intervalId)
  }, [])

  // 保存资产配置到localStorage（不包含总金额）
  useEffect(() => {
    if (assets.length > 0) {
      investmentStorage.saveAssets(assets)
    }
  }, [assets])

  // 资产列表变化
  const handleAssetsChange = (newAssets: AssetAllocationItem[]) => {
    setAssets(newAssets)
    onChange?.(totalAmount)
  }

  return (
    <>
      {/* 总投资金额卡片 - 只读显示 */}
      <Card className="total-investment-card">
        <div className="total-investment-card__content">
          <label className="total-investment-card__label">
            总投资金额
          </label>
          <TotalInvestmentInput
            value={totalAmount}
            onChange={() => {}}
            disabled={true}
          />
          <span className="total-investment-card__label-hint">（来自资产跟踪）</span>
        </div>
      </Card>

      {/* 投资组合卡片 */}
      <PortfolioCard
        totalAmount={totalAmount}
        assets={assets}
        onAssetsChange={handleAssetsChange}
      />
    </>
  )
}
