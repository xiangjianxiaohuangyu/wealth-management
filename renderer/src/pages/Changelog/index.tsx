/**
 * 更新日志页面
 */

import { useMemo } from 'react'
import { Card } from '../../components/common/Card'
import type { ChangelogItem } from './Changelog.types'
import changelogData from '../../assets/data/changelog.json'
import './Changelog.css'

export default function Changelog() {
  const changelog: ChangelogItem[] = useMemo(() => {
    return changelogData as ChangelogItem[]
  }, [])

  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; className: string }> = {
      added: { label: '新增', className: 'changelog__badge--added' },
      changed: { label: '变更', className: 'changelog__badge--changed' },
      fixed: { label: '修复', className: 'changelog__badge--fixed' },
      removed: { label: '移除', className: 'changelog__badge--removed' },
      security: { label: '安全', className: 'changelog__badge--security' }
    }
    return labels[type] || { label: type, className: '' }
  }

  const getVersionTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; className: string }> = {
      major: { label: '重大更新', className: 'changelog__version--major' },
      minor: { label: '功能更新', className: 'changelog__version--minor' },
      patch: { label: '修复更新', className: 'changelog__version--patch' }
    }
    return labels[type] || { label: type, className: '' }
  }

  return (
    <div className="changelog">
      <h1 className="changelog__title">更新日志</h1>
      <p className="changelog__description">查看应用的版本历史和更新内容</p>

      <div className="changelog__timeline">
        {changelog.map((item) => {
          const versionType = getVersionTypeLabel(item.type)

          return (
            <div key={item.version} className="changelog__item">
              <div className="changelog__marker" />

              <Card className="changelog__card">
                <div className="changelog__header">
                  <div className="changelog__version-info">
                    <h2 className="changelog__version">v{item.version}</h2>
                    <span className={`changelog__version-badge ${versionType.className}`}>
                      {versionType.label}
                    </span>
                  </div>
                  <div className="changelog__date">{item.date}</div>
                </div>

                <div className="changelog__changes">
                  {item.changes.map((change, index) => {
                    const changeType = getChangeTypeLabel(change.type)

                    return (
                      <div key={index} className="changelog__change">
                        <span className={`changelog__badge ${changeType.className}`}>
                          {changeType.label}
                        </span>
                        <span className="changelog__description">{change.description}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
