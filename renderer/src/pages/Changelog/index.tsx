/**
 * 更新日志页面
 */

import { useEffect, useState } from 'react'
import { StatusBadge } from '../../components/common/StatusBadge'
import './Changelog.css'

interface FeatureCard {
  title: string
  description: string
  status: string
  statusClass: 'completed' | 'coming-soon' | 'planned'
}

export default function Changelog() {
  const [upcomingFeatures, setUpcomingFeatures] = useState<FeatureCard[]>([])
  const [changelogHtml, setChangelogHtml] = useState<string>('')
  const [upcomingExpanded, setUpcomingExpanded] = useState(false)
  const [changelogExpanded, setChangelogExpanded] = useState(false)

  useEffect(() => {
    loadUpcomingFeatures()
    loadChangelog()
  }, [])

  // HTML 转义函数
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  // 简单的 Markdown 转 HTML 解析器
  const parseMarkdown = (markdown: string): string => {
    if (!markdown) return '<p class="empty-state">暂无内容</p>'

    let html = markdown

    // 处理代码块 ```code```
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
      return `<pre><code class="${lang || ''}">${escapeHtml(code.trim())}</code></pre>`
    })

    // 处理行内代码 `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // 处理标题 # ## ### ####
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

    // 处理粗体 **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // 处理斜体 *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // 处理链接 [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // 处理引用 > text
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')

    // 处理无序列表 - item 或 * item
    html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // 处理有序列表 1. item
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

    // 处理水平线 --- 或 ***
    html = html.replace(/^[\-\*]{3,}$/gm, '<hr>')

    // 处理段落
    html = html.replace(/^(?!<[h|u|o|p|b|h])(.+)$/gm, '<p>$1</p>')

    // 清理空标签
    html = html.replace(/<p>\s*<\/p>/g, '')
    html = html.replace(/<p>(<h[1-6]>)/g, '$1')
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    html = html.replace(/<p>(<ul>)/g, '$1')
    html = html.replace(/(<\/ul>)<\/p>/g, '$1')
    html = html.replace(/<p>(<ol>)/g, '$1')
    html = html.replace(/(<\/ol>)<\/p>/g, '$1')
    html = html.replace(/<p>(<blockquote>)/g, '$1')
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1')
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1')
    html = html.replace(/<p>(<pre>)/g, '$1')
    html = html.replace(/(<\/pre>)<\/p>/g, '$1')

    return html
  }

  // 解析卡片式功能列表
  const parseFeatureCards = (markdown: string): FeatureCard[] => {
    if (!markdown) return []

    // 分割成不同的功能块
    const sections = markdown.split(/(?=^###\s+)/m).filter((s) => s.trim())

    if (sections.length === 0) {
      return []
    }

    return sections.map((section) => {
      // 提取标题 (### 开头)
      const titleMatch = section.match(/^###\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1].trim() : '未命名功能'

      // 提取所有以 - 开头的行
      const lines = section.split('\n').filter((line) => line.trim().startsWith('-'))

      let description = '暂无描述'
      let statusText = '计划中'
      let statusClass: 'completed' | 'coming-soon' | 'planned' = 'planned'

      // 第一行是描述
      if (lines.length >= 1) {
        description = lines[0].replace(/^-\s+/, '').trim()
      }

      // 第二行是状态
      if (lines.length >= 2) {
        statusText = lines[1].replace(/^-\s+/, '').trim()

        // 根据状态文本设置样式类
        if (statusText.includes('完成') || statusText.toLowerCase().includes('completed')) {
          statusClass = 'completed'
        } else if (
          statusText.includes('即将推出') ||
          statusText.toLowerCase().includes('coming soon')
        ) {
          statusClass = 'coming-soon'
        } else {
          statusClass = 'planned'
        }
      }

      return {
        title,
        description,
        status: statusText,
        statusClass
      }
    })
  }

  // 加载后续更新安排
  const loadUpcomingFeatures = async () => {
    try {
      const content = await window.electron?.readFile?.('changelog_upcoming.md')
      if (content) {
        const features = parseFeatureCards(content)
        setUpcomingFeatures(features)
      }
    } catch (error) {
      console.error('加载后续更新安排失败:', error)
    }
  }

  // 加载更新日志
  const loadChangelog = async () => {
    try {
      const content = await window.electron?.readFile?.('changelog.md')
      if (content) {
        const html = parseMarkdown(content)
        setChangelogHtml(html)
      }
    } catch (error) {
      console.error('加载更新日志失败:', error)
    }
  }

  return (
    <div className="changelog">
      {/* 页面头部 */}
      <div className="changelog__header">
        <h2>开发日志</h2>
        <p className="changelog__description">查看后续更新安排与更新日志</p>
      </div>

      {/* 后续更新安排 */}
      <div className={`changelog__section-card ${!upcomingExpanded ? 'collapsed' : ''}`}>
        <div
          className="changelog__section-header"
          onClick={() => setUpcomingExpanded(!upcomingExpanded)}
        >
          <div className="changelog__section-title">
            <span className="changelog__icon changelog__icon--rocket">🚀</span>
            <h2>后续更新计划</h2>
          </div>
          <span className={`changelog__toggle-icon ${upcomingExpanded ? '' : 'collapsed'}`}>
            ▼
          </span>
        </div>

        <div className="changelog__section-content changelog__section-content--upcoming">
          <div className="changelog__section-content-inner">
            {upcomingFeatures.length > 0 ? (
              <div className="feature-cards-container">
                {upcomingFeatures.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <h3 className="feature-card__title">{feature.title}</h3>
                    <p className="feature-card__description">{feature.description}</p>
                    <StatusBadge status={feature.statusClass}>{feature.status}</StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>暂无后续更新安排</p>
                <p className="empty-state__hint">
                  请在项目目录下的 changelog_upcoming.md 文件中添加内容
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 更新日志 */}
      <div className={`changelog__section-card ${!changelogExpanded ? 'collapsed' : ''}`}>
        <div
          className="changelog__section-header"
          onClick={() => setChangelogExpanded(!changelogExpanded)}
        >
          <div className="changelog__section-title">
            <span className="changelog__icon changelog__icon--scroll">📜</span>
            <h2>更新日志</h2>
          </div>
          <span className={`changelog__toggle-icon ${changelogExpanded ? '' : 'collapsed'}`}>
            ▼
          </span>
        </div>

        <div className="changelog__section-content changelog__section-content--history">
          <div className="changelog__section-content-inner">
            {changelogHtml ? (
              <div
                className="changelog__markdown"
                dangerouslySetInnerHTML={{ __html: changelogHtml }}
              />
            ) : (
              <div className="empty-state">
                <p>暂无更新日志</p>
                <p className="empty-state__hint">
                  请在项目目录下的 changelog.md 文件中添加内容
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
