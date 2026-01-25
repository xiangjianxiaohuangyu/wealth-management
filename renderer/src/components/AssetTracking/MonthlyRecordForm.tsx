/**
 * 月度记录表单组件
 *
 * 用于添加和编辑月度资产记录
 */

import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { validateMonthlyRecord } from '../../services/data/assetTrackingService'
import type { MonthlyAssetRecord } from '../../types/assetTracking.types'
import './MonthlyRecordForm.css'

export interface MonthlyRecordFormProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: Omit<MonthlyAssetRecord, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, data: Partial<MonthlyAssetRecord>) => void
  editingRecord?: MonthlyAssetRecord | null
  existingRecords?: MonthlyAssetRecord[]
}

export function MonthlyRecordForm({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  editingRecord,
  existingRecords = []
}: MonthlyRecordFormProps) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [totalIncome, setTotalIncome] = useState('')
  const [consumption, setConsumption] = useState('')
  const [savings, setSavings] = useState('')
  const [investment, setInvestment] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // 检测是否存在重复的年月记录
  const duplicateRecord = !editingRecord && existingRecords.find(
    r => r.year === year && r.month === month
  )

  // 重置表单
  useEffect(() => {
    if (!isOpen) {
      setError('')
      if (!editingRecord) {
        setYear(new Date().getFullYear())
        setMonth(new Date().getMonth() + 1)
        setTotalIncome('')
        setConsumption('')
        setSavings('')
        setInvestment('')
        setNotes('')
      }
    }
  }, [isOpen, editingRecord])

  // 加载编辑数据
  useEffect(() => {
    if (editingRecord) {
      setYear(editingRecord.year)
      setMonth(editingRecord.month)
      setTotalIncome(editingRecord.totalIncome.toString())
      setConsumption(editingRecord.consumption.toString())
      setSavings(editingRecord.savings.toString())
      setInvestment(editingRecord.investment.toString())
      setNotes(editingRecord.notes || '')
    }
  }, [editingRecord])

  const handleSubmit = () => {
    const incomeNum = parseFloat(totalIncome) || 0
    const consumptionNum = parseFloat(consumption) || 0
    const savingsNum = parseFloat(savings) || 0
    const investmentNum = parseFloat(investment) || 0

    // 验证数据
    const validation = validateMonthlyRecord({
      totalIncome: incomeNum,
      consumption: consumptionNum,
      savings: savingsNum,
      investment: investmentNum
    })

    if (!validation.valid) {
      setError(validation.error || '')
      return
    }

    const recordData = {
      year,
      month,
      totalIncome: incomeNum,
      consumption: consumptionNum,
      savings: savingsNum,
      investment: investmentNum,
      currency: 'CNY' as const,
      notes: notes.trim()
    }

    if (editingRecord) {
      onUpdate(editingRecord.id, recordData)
    } else {
      onAdd(recordData)
    }
  }

  const unallocated = (parseFloat(totalIncome) || 0)
    - (parseFloat(consumption) || 0)
    - (parseFloat(savings) || 0)
    - (parseFloat(investment) || 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? '编辑月度记录' : '添加月度记录'}
      className="modal--monthly-form"
      closeOnOverlayClick={false}
      footer={
        <>
          <button className="monthly-record-form__btn monthly-record-form__btn--cancel" onClick={onClose}>
            取消
          </button>
          <button className="monthly-record-form__btn monthly-record-form__btn--confirm" onClick={handleSubmit}>
            {editingRecord ? '更新' : '添加'}
          </button>
        </>
      }
    >
      <div className="monthly-record-form__form">
        {/* 年月选择 */}
        <div className="monthly-record-form__row">
          <div className="monthly-record-form__field">
            <label className="monthly-record-form__label">年份</label>
            <select
              className="monthly-record-form__select"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 51 }, (_, i) => 2000 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="monthly-record-form__field">
            <label className="monthly-record-form__label">月份</label>
            <select
              className="monthly-record-form__select"
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
        </div>

        {/* 总收入 */}
        <div className="monthly-record-form__field">
          <label className="monthly-record-form__label">月总收入 (¥)</label>
          <input
            type="text"
            className="monthly-record-form__input"
            placeholder="0.00"
            value={totalIncome}
            onChange={e => setTotalIncome(e.target.value.replace(/[^\d.]/g, ''))}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>

        {/* 消费 */}
        <div className="monthly-record-form__field">
          <label className="monthly-record-form__label">消费金额 (¥)</label>
          <input
            type="text"
            className="monthly-record-form__input"
            placeholder="0.00"
            value={consumption}
            onChange={e => setConsumption(e.target.value.replace(/[^\d.]/g, ''))}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>

        {/* 存款 */}
        <div className="monthly-record-form__field">
          <label className="monthly-record-form__label">存款金额 (¥)</label>
          <input
            type="text"
            className="monthly-record-form__input"
            placeholder="0.00"
            value={savings}
            onChange={e => setSavings(e.target.value.replace(/[^\d.]/g, ''))}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>

        {/* 投资 */}
        <div className="monthly-record-form__field">
          <label className="monthly-record-form__label">投资金额 (¥)</label>
          <input
            type="text"
            className="monthly-record-form__input"
            placeholder="0.00"
            value={investment}
            onChange={e => setInvestment(e.target.value.replace(/[^\d.]/g, ''))}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>

        {/* 备注 */}
        <div className="monthly-record-form__field">
          <label className="monthly-record-form__label">备注（可选）</label>
          <textarea
            className="monthly-record-form__textarea"
            placeholder="添加备注..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>

        {/* 未分配金额提示 */}
        {totalIncome && (
          <div className={`monthly-record-form__unallocated ${unallocated < 0 ? 'monthly-record-form__unallocated--error' : ''}`}>
            未分配金额: ¥{unallocated.toFixed(2)}
          </div>
        )}

        {/* 重复记录警告 */}
        {duplicateRecord && (
          <div className="monthly-record-form__duplicate-warning">
            ⚠️ {year}年{month}月的记录已存在，继续添加将覆盖原记录
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="monthly-record-form__error">{error}</div>
        )}
      </div>
    </Modal>
  )
}
