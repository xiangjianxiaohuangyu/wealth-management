/**
 * 更新通知测试组件 - 用于测试各种更新通知状态
 */

import { useState } from 'react'
import type { UpdateInfo, DownloadProgress } from './update.types'
import './UpdateNotification.css'

export function UpdateNotificationTest() {
  const [notifications, setNotifications] = useState<{
    latestVersion: boolean
    updateAvailable: boolean
    downloading: boolean
    downloaded: boolean
  }>({
    latestVersion: false,
    updateAvailable: false,
    downloading: false,
    downloaded: false
  })

  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    percent: 0,
    transferred: 0,
    total: 100 * 1024 * 1024 // 100MB
  })

  const [updateInfo] = useState<UpdateInfo>({
    version: '1.0.1',
    releaseNotes: '- 修复了若干bug\n- 新增测试功能\n- 性能优化',
    date: new Date().toISOString().split('T')[0]
  })

  // 显示已是最新版本
  const handleShowLatestVersion = () => {
    setNotifications({
      latestVersion: true,
      updateAvailable: false,
      downloading: false,
      downloaded: false
    })
    // 3秒后自动隐藏
    setTimeout(() => {
      setNotifications(prev => ({ ...prev, latestVersion: false }))
    }, 3000)
  }

  // 显示发现新版本
  const handleShowUpdateAvailable = () => {
    setNotifications({
      latestVersion: false,
      updateAvailable: true,
      downloading: false,
      downloaded: false
    })
  }

  // 显示下载进度
  const handleShowDownloading = () => {
    setNotifications({
      latestVersion: false,
      updateAvailable: false,
      downloading: true,
      downloaded: false
    })
    // 模拟下载进度
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        // 下载完成后，自动切换到更新已下载状态
        setTimeout(() => {
          setNotifications({
            latestVersion: false,
            updateAvailable: false,
            downloading: false,
            downloaded: true
          })
        }, 500)
      }
      setDownloadProgress({
        percent: progress,
        transferred: (progress / 100) * (100 * 1024 * 1024),
        total: 100 * 1024 * 1024
      })
    }, 500)
  }

  // 显示更新已下载
  const handleShowDownloaded = () => {
    setNotifications({
      latestVersion: false,
      updateAvailable: false,
      downloading: false,
      downloaded: true
    })
  }

  // 关闭通知
  const handleDismiss = () => {
    setNotifications({
      latestVersion: false,
      updateAvailable: false,
      downloading: false,
      downloaded: false
    })
    setDownloadProgress({
      percent: 0,
      transferred: 0,
      total: 100 * 1024 * 1024
    })
  }

  return (
    <>
      {/* 测试按钮 */}
      <div className="update-notification-test">
        <h2 className="update-notification-test__title">更新通知测试</h2>
        <p className="update-notification-test__description">
          点击下方按钮测试不同的更新通知状态
        </p>
        <div className="update-notification-test__buttons">
          <button
            className="test-button"
            onClick={handleShowLatestVersion}
          >
            已是最新版本
          </button>
          <button
            className="test-button test-button--primary"
            onClick={handleShowUpdateAvailable}
          >
            发现新版本
          </button>
          <button
            className="test-button test-button--primary"
            onClick={handleShowDownloading}
          >
            下载进度条
          </button>
          <button
            className="test-button test-button--primary"
            onClick={handleShowDownloaded}
          >
            更新已完成
          </button>
        </div>
      </div>

      {/* 已是最新版本通知 */}
      {notifications.latestVersion && (
        <div className="update-notification latest-version show">
          <div className="update-content update-content--no-action">
            <div className="update-body">
              <div className="update-header-info">
                <span className="update-icon">✓</span>
                <h3>已是最新版本</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 发现新版本通知 */}
      {notifications.updateAvailable && (
        <div className="update-notification show">
          <div className="update-content">
            <button className="close-btn" onClick={handleDismiss}>
              ✕
            </button>
            <div className="update-body">
              <div className="update-header-info">
                <span className="update-icon">🎉</span>
                <h3>发现新版本</h3>
              </div>
              <div className="update-message">
                发现新版本 {updateInfo.version}
              </div>
              {updateInfo.releaseNotes && (
                <div className="update-notes">
                  <h4>更新内容：</h4>
                  <pre>{updateInfo.releaseNotes}</pre>
                </div>
              )}
              <div className="update-actions">
                <button className="btn btn--outline" onClick={handleDismiss}>
                  稍后更新
                </button>
                <button className="btn btn--primary" onClick={handleShowDownloading}>
                  立即更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 下载进度通知 */}
      {notifications.downloading && (
        <div className="download-progress-notification show">
          <div className="progress-content">
            <div className="progress-header">
              <span className="progress-icon">⬇️</span>
              <h4>正在下载更新</h4>
            </div>

            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${downloadProgress.percent}%` }}
              />
            </div>

            <div className="progress-info">
              <span>{downloadProgress.percent.toFixed(1)}%</span>
              <span>
                {(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB / {(downloadProgress.total / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 更新已下载通知 */}
      {notifications.downloaded && (
        <div className="update-notification show">
          <div className="update-content">
            <button className="close-btn" onClick={handleDismiss}>
              ✕
            </button>
            <div className="update-body">
              <div className="update-header-info">
                <span className="update-icon">✅</span>
                <h3>更新已下载</h3>
              </div>
              <div className="update-message">
                更新已下载完成，重启应用后生效
              </div>
              <div className="update-actions">
                <button className="btn btn--outline" onClick={handleDismiss}>
                  稍后重启
                </button>
                <button className="btn btn--primary" onClick={() => alert('应用将重启以安装更新')}>
                  立即重启
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
