/**
 * 更新通知组件 - 右上角弹出式通知
 */

import { useEffect, useState } from 'react'
import type { UpdateInfo, DownloadProgress } from './update.types'
import { Button } from '../common/Button'
import './UpdateNotification.css'

export function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // 监听更新事件
  useEffect(() => {
    const handleUpdateAvailable = (_event: any, info: UpdateInfo) => {
      console.log('🎉 收到更新可用事件:', info)
      setUpdateInfo(info)
      setIsVisible(true)
    }

    const handleUpdateNotAvailable = (_event: any, info: any) => {
      console.log('已是最新版本:', info.version)
    }

    const handleDownloadProgress = (_event: any, progress: DownloadProgress) => {
      console.log('下载进度:', progress.percent.toFixed(1) + '%')
      setDownloadProgress(progress)
      setIsVisible(true)
    }

    const handleUpdateDownloaded = (_event: any) => {
      console.log('下载完成')
      setIsDownloaded(true)
      setDownloadProgress(null)
    }

    const handleUpdateError = (_event: any, error: any) => {
      console.error('更新错误:', error)
      alert(`更新失败：${error.message}`)
      setIsVisible(false)
    }

    window.electron?.on?.('update-available', handleUpdateAvailable)
    window.electron?.on?.('update-not-available', handleUpdateNotAvailable)
    window.electron?.on?.('update-download-progress', handleDownloadProgress)
    window.electron?.on?.('update-downloaded', handleUpdateDownloaded)
    window.electron?.on?.('update-error', handleUpdateError)

    return () => {
      window.electron?.removeListener?.('update-available', handleUpdateAvailable)
      window.electron?.removeListener?.('update-not-available', handleUpdateNotAvailable)
      window.electron?.removeListener?.('update-download-progress', handleDownloadProgress)
      window.electron?.removeListener?.('update-downloaded', handleUpdateDownloaded)
      window.electron?.removeListener?.('update-error', handleUpdateError)
    }
  }, [])

  const handleDownloadClick = () => {
    console.log('用户点击下载更新')
    window.electron?.send?.('download-update')
  }

  const handleInstallClick = () => {
    console.log('用户点击安装更新')
    window.electron?.send?.('install-update')
  }

  const handleDismissClick = () => {
    setIsVisible(false)
    // 延迟清除状态，等待动画完成
    setTimeout(() => {
      setUpdateInfo(null)
      setDownloadProgress(null)
      setIsDownloaded(false)
    }, 300)
  }

  // 下载进度通知
  if (downloadProgress && !isDownloaded) {
    return (
      <div className={`download-progress-notification ${isVisible ? 'show' : ''}`}>
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
              {(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB /
              {(downloadProgress.total / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 下载完成通知
  if (isDownloaded) {
    return (
      <div className={`update-notification ${isVisible ? 'show' : ''}`}>
        <div className="update-content">
          <div className="update-header">
            <span className="update-icon">✅</span>
            <h3>更新已下载</h3>
            <button className="close-btn" onClick={handleDismissClick}>
              ✕
            </button>
          </div>
          <div className="update-body">
            <p className="update-message">
              新版本 v{updateInfo?.version} 已下载完成，重启应用即可安装。
            </p>
            <div className="update-actions">
              <Button variant="outline" onClick={handleDismissClick}>
                稍后重启
              </Button>
              <Button variant="primary" onClick={handleInstallClick}>
                立即重启
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 更新可用通知
  if (updateInfo && isVisible) {
    return (
      <div className={`update-notification ${isVisible ? 'show' : ''}`}>
        <div className="update-content">
          <div className="update-header">
            <span className="update-icon">🎉</span>
            <h3>发现新版本</h3>
            <button className="close-btn" onClick={handleDismissClick}>
              ✕
            </button>
          </div>
          <div className="update-body">
            <p className="update-message">
              新版本 <strong>v{updateInfo.version}</strong> 已发布
            </p>
            {updateInfo.releaseNotes && (
              <div className="update-notes">
                <h4>更新内容：</h4>
                <pre>{updateInfo.releaseNotes}</pre>
              </div>
            )}
            <div className="update-actions">
              <Button variant="outline" onClick={handleDismissClick}>
                稍后更新
              </Button>
              <Button variant="primary" onClick={handleDownloadClick}>
                立即更新
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// 导出别名供 App.tsx 使用
export { UpdateNotification as UpdateManager }
