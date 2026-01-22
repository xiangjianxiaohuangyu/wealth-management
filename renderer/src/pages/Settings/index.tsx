/**
 * 设置页面
 */

import { useState, useEffect } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
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

  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'about'>('general')

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

  return (
    <div className="settings">
      <h1 className="settings__title">设置</h1>

      <div className="settings__container">
        {/* 侧边栏标签 */}
        <div className="settings__tabs">
          <button
            className={`settings__tab ${activeTab === 'general' ? 'settings__tab--active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            通用设置
          </button>
          <button
            className={`settings__tab ${activeTab === 'data' ? 'settings__tab--active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            数据管理
          </button>
          <button
            className={`settings__tab ${activeTab === 'about' ? 'settings__tab--active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            关于
          </button>
        </div>

        {/* 设置内容 */}
        <div className="settings__content">
          {/* 通用设置 */}
          {activeTab === 'general' && (
            <Card title="通用设置" className="settings__card">
              <div className="settings__section">
                <div className="settings__field">
                  <label className="settings__label">主题</label>
                  <select
                    className="settings__select"
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value as any)}
                  >
                    <option value="light">浅色</option>
                    <option value="dark">深色</option>
                    <option value="auto">跟随系统</option>
                  </select>
                </div>

                <div className="settings__field">
                  <label className="settings__label">语言</label>
                  <select
                    className="settings__select"
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value as any)}
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>

                <div className="settings__field">
                  <label className="settings__label">货币</label>
                  <select
                    className="settings__select"
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value as any)}
                  >
                    <option value="CNY">人民币 (¥)</option>
                    <option value="USD">美元 ($)</option>
                    <option value="EUR">欧元 (€)</option>
                    <option value="JPY">日元 (¥)</option>
                    <option value="HKD">港币 (HK$)</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* 数据管理 */}
          {activeTab === 'data' && (
            <Card title="数据管理" className="settings__card">
              <div className="settings__section">
                <p className="settings__hint">
                  您可以导出数据进行备份，或从备份文件中恢复数据。
                </p>

                <div className="settings__actions">
                  <Button variant="primary" onClick={handleExportData}>
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
            </Card>
          )}

          {/* 关于 */}
          {activeTab === 'about' && (
            <Card title="关于" className="settings__card">
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
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
