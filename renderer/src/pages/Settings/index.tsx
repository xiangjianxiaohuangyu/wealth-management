/**
 * 设置页面
 */

import { useState, useEffect } from 'react'
import { Button } from '../../components/common/Button'
import { CustomSelect, type SelectOption } from '../../components/common/CustomSelect'
import type { AppSettings } from './Settings.types'
import { settingsStorage, userDataStorage } from '../../services/storage/localStorage'
import { APP_INFO } from '../../utils/constants'
import './Settings.css'

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'zh-CN',
    currency: 'CNY'
  })

  // 卡片展开/折叠状态
  const [generalExpanded, setGeneralExpanded] = useState(true)
  const [dataExpanded, setDataExpanded] = useState(false)
  const [aboutExpanded, setAboutExpanded] = useState(false)

  // 加载设置
  useEffect(() => {
    const savedSettings = settingsStorage.getAllSettings()
    setSettings(savedSettings as AppSettings)
  }, [])

  // 更新设置
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    // 保存到 localStorage
    switch (key) {
      case 'theme':
        settingsStorage.setTheme(value as any)
        break
      case 'language':
        settingsStorage.setLanguage(value as any)
        break
      case 'currency':
        settingsStorage.setCurrency(value as any)
        break
    }
  }

  // 导出数据
  const handleExportData = () => {
    const data = userDataStorage.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wealth-management-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导入数据
  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = userDataStorage.importData(event.target?.result as string)
          if (result.success) {
            alert('数据导入成功')
          } else {
            alert(result.error || '导入失败')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // 清除数据
  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      userDataStorage.clearUserData()
      alert('数据已清除')
    }
  }

  // 下拉选项配置
  const themeOptions: SelectOption[] = [
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
    { value: 'auto', label: '跟随系统' }
  ]

  const languageOptions: SelectOption[] = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' }
  ]

  const currencyOptions: SelectOption[] = [
    { value: 'CNY', label: '人民币 (¥)' },
    { value: 'USD', label: '美元 ($)' },
    { value: 'EUR', label: '欧元 (€)' },
    { value: 'JPY', label: '日元 (¥)' },
    { value: 'HKD', label: '港币 (HK$)' }
  ]

  return (
    <div className="settings">
      <h1 className="settings__title">设置</h1>

      {/* 通用设置 */}
      <div className={`settings__section-card ${!generalExpanded ? 'collapsed' : ''}`}>
        <div
          className="settings__section-header"
          onClick={() => setGeneralExpanded(!generalExpanded)}
        >
          <div className="settings__section-title">
            <span className="settings__icon settings__icon--general">⚙️</span>
            <h2>通用设置</h2>
          </div>
          <span className={`settings__toggle-icon ${generalExpanded ? '' : 'collapsed'}`}>
            ▼
          </span>
        </div>

        <div className="settings__section-content">
          <div className="settings__section-content-inner">
            <div className="settings__section">
              <div className="settings__field">
                <label className="settings__label">主题</label>
                <CustomSelect
                  value={settings.theme}
                  onChange={(value) => updateSetting('theme', value as any)}
                  options={themeOptions}
                  className="settings__select-custom"
                />
              </div>

              <div className="settings__field">
                <label className="settings__label">语言</label>
                <CustomSelect
                  value={settings.language}
                  onChange={(value) => updateSetting('language', value as any)}
                  options={languageOptions}
                  className="settings__select-custom"
                />
              </div>

              <div className="settings__field">
                <label className="settings__label">货币</label>
                <CustomSelect
                  value={settings.currency}
                  onChange={(value) => updateSetting('currency', value as any)}
                  options={currencyOptions}
                  className="settings__select-custom"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className={`settings__section-card ${!dataExpanded ? 'collapsed' : ''}`}>
        <div
          className="settings__section-header"
          onClick={() => setDataExpanded(!dataExpanded)}
        >
          <div className="settings__section-title">
            <span className="settings__icon settings__icon--data">💾</span>
            <h2>数据管理</h2>
          </div>
          <span className={`settings__toggle-icon ${dataExpanded ? '' : 'collapsed'}`}>
            ▼
          </span>
        </div>

        <div className="settings__section-content">
          <div className="settings__section-content-inner">
            <div className="settings__section">
              <p className="settings__hint">
                您可以导出数据进行备份，或从备份文件中恢复数据。
              </p>

              <div className="settings__actions">
                <Button variant="outline" onClick={handleExportData}>
                  导出数据
                </Button>
                <Button variant="outline" onClick={handleImportData}>
                  导入数据
                </Button>
                <Button variant="danger" onClick={handleClearData}>
                  清除数据
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 关于 */}
      <div className={`settings__section-card ${!aboutExpanded ? 'collapsed' : ''}`}>
        <div
          className="settings__section-header"
          onClick={() => setAboutExpanded(!aboutExpanded)}
        >
          <div className="settings__section-title">
            <span className="settings__icon settings__icon--about">ℹ️</span>
            <h2>关于</h2>
          </div>
          <span className={`settings__toggle-icon ${aboutExpanded ? '' : 'collapsed'}`}>
            ▼
          </span>
        </div>

        <div className="settings__section-content">
          <div className="settings__section-content-inner">
            <div className="settings__about">
              <h2 className="settings__app-name">{APP_INFO.NAME}</h2>
              <p className="settings__app-version">版本 {APP_INFO.VERSION}</p>
              <p className="settings__app-description">{APP_INFO.DESCRIPTION}</p>

              <div className="settings__info">
                <div className="settings__info-item">
                  <span className="settings__info-label">作者</span>
                  <span className="settings__info-value">{APP_INFO.AUTHOR}</span>
                </div>
                <div className="settings__info-item">
                  <span className="settings__info-label">主页</span>
                  <a
                    className="settings__info-link"
                    href={APP_INFO.HOMEPAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {APP_INFO.HOMEPAGE}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
