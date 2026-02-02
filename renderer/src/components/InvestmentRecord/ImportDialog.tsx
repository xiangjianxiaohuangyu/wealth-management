/**
 * 导入对话框组件
 *
 * 用于导入投资记录JSON数据
 */

import { useState, useRef } from 'react'
import type { InvestmentRecordData } from '../../types/investmentRecord.types'
import './ImportDialog.css'

export interface ImportDialogProps {
  /** 是否显示 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 导入回调 */
  onImport: (data: InvestmentRecordData) => void
}

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<InvestmentRecordData | null>(null)
  const [error, setError] = useState<string>('')
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      setPreviewData(null)
      setError('')
      return
    }

    // 验证文件类型
    if (!selectedFile.name.endsWith('.json')) {
      setError('请选择JSON文件')
      return
    }

    setFile(selectedFile)
    setError('')

    // 读取并预览文件
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as InvestmentRecordData

        // 验证数据格式
        if (!data.cards || !Array.isArray(data.cards)) {
          setError('数据格式错误：缺少cards数组')
          return
        }

        // 验证每个卡片
        for (const card of data.cards) {
          if (!card.id || !card.name) {
            setError('数据格式错误：卡片数据不完整')
            return
          }
          if (!card.rows || !Array.isArray(card.rows)) {
            setError('数据格式错误：卡片缺少rows数组')
            return
          }
        }

        setPreviewData(data)
        setError('')
      } catch (err) {
        setError('JSON解析失败：' + (err as Error).message)
      }
    }

    reader.readAsText(selectedFile)
  }

  const handleImport = () => {
    if (!previewData) return

    setIsImporting(true)

    // 备份现有数据
    const existingData = localStorage.getItem('wealth_investment_record_data')
    if (existingData) {
      const backupKey = `wealth_investment_record_data_backup_${Date.now()}`
      localStorage.setItem(backupKey, existingData)
      console.log('✅ 现有数据已备份到：', backupKey)
    }

    // 导入新数据
    setTimeout(() => {
      onImport(previewData)
      setIsImporting(false)
      handleClose()
    }, 500)
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="import-dialog-overlay" onClick={handleClose} />
      <div className="import-dialog">
        <div className="import-dialog__header">
          <h2>导入投资记录数据</h2>
          <button className="import-dialog__close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="import-dialog__body">
          {/* 文件选择 */}
          <div className="import-dialog__section">
            <label className="import-dialog__label">选择JSON文件</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="import-dialog__file-input"
            />
            <div className="import-dialog__hint">
              支持 .json 格式的投资记录数据文件
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="import-dialog__error">
              ⚠️ {error}
            </div>
          )}

          {/* 数据预览 */}
          {previewData && (
            <div className="import-dialog__section">
              <label className="import-dialog__label">数据预览</label>
              <div className="import-dialog__preview">
                <div className="import-dialog__preview-info">
                  <div className="import-dialog__preview-item">
                    <span className="import-dialog__preview-label">卡片数量：</span>
                    <span className="import-dialog__preview-value">
                      {previewData.cards.length}
                    </span>
                  </div>
                  <div className="import-dialog__preview-item">
                    <span className="import-dialog__preview-label">总记录行数：</span>
                    <span className="import-dialog__preview-value">
                      {previewData.cards.reduce((sum, card) => sum + card.rows.length, 0)}
                    </span>
                  </div>
                  <div className="import-dialog__preview-item">
                    <span className="import-dialog__preview-label">最后更新：</span>
                    <span className="import-dialog__preview-value">
                      {previewData.lastUpdated
                        ? new Date(previewData.lastUpdated).toLocaleString('zh-CN')
                        : '未知'}
                    </span>
                  </div>
                </div>

                <div className="import-dialog__preview-cards">
                  <div className="import-dialog__preview-cards-title">卡片列表：</div>
                  {previewData.cards.map((card, index) => (
                    <div key={card.id} className="import-dialog__preview-card">
                      <span className="import-dialog__preview-card-index">{index + 1}.</span>
                      <span className="import-dialog__preview-card-name">{card.name}</span>
                      <span className="import-dialog__preview-card-rows">
                        ({card.rows.length} 行)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="import-dialog__footer">
          <button
            className="import-dialog__btn import-dialog__btn--cancel"
            onClick={handleClose}
            disabled={isImporting}
          >
            取消
          </button>
          <button
            className="import-dialog__btn import-dialog__btn--import"
            onClick={handleImport}
            disabled={!previewData || isImporting}
          >
            {isImporting ? '导入中...' : '确认导入'}
          </button>
        </div>
      </div>
    </>
  )
}
