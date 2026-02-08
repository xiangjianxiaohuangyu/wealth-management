/**
 * 更新对话框组件 - 使用玻璃态 Modal
 */

import { useEffect, useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import type { UpdateInfo, DownloadProgress } from './update.types'
import './UpdateDialog.css'

export function UpdateDialog() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [showLatestVersion, setShowLatestVersion] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // 监听更新事件
  useEffect(() => {
    const handleUpdateAvailable = (...args: unknown[]) => {
      const info = args[1] as UpdateInfo
      console.log('🎉 收到更新可用事件:', info)
      setUpdateInfo(info)
    }

    const handleUpdateNotAvailable = (...args: unknown[]) => {
      const info = args[1] as any
      console.log('已是最新版本:', info.version)
      setShowLatestVersion(true)
      setTimeout(() => setShowLatestVersion(false), 3000)
    }

    const handleDownloadProgress = (...args: unknown[]) => {
      const progress = args[1] as DownloadProgress
      console.log('下载进度:', progress.percent.toFixed(1) + '%')
      setDownloadProgress(progress)
      setIsDownloading(true)
    }

    const handleUpdateDownloaded = (...args: unknown[]) => {
      console.log('下载完成')
      setIsDownloaded(true)
      setIsDownloading(false)
      setDownloadProgress(null)
    }

    const handleUpdateError = (...args: unknown[]) => {
      const error = args[1] as any
      console.error('更新错误:', error)
      alert(`更新失败：${error.message}`)
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
    setIsDownloading(true)
    window.electron?.send?.('download-update')
  }

  const handleInstallClick = () => {
    console.log('用户点击安装更新')
    window.electron?.send?.('install-update')
  }

  const handleCancelClick = () => {
    setUpdateInfo(null)
    setDownloadProgress(null)
    setIsDownloaded(false)
    setIsDownloading(false)
  }

  return (
    <>
      <Modal
        isOpen={!!updateInfo}
        onClose={handleCancelClick}
        title="🎉 发现新版本"
        className="update-dialog-modal"
        footer={
          <div className="update-dialog__footer">
            {!isDownloading && !isDownloaded && (
              <>
                <Button variant="outline" onClick={handleCancelClick}>
                  稍后更新
                </Button>
                <Button variant="primary" onClick={handleDownloadClick}>
                  立即更新
                </Button>
              </>
            )}

            {(isDownloading || isDownloaded) && (
              <>
                <Button variant="outline" onClick={handleCancelClick} disabled>
                  {isDownloading && !isDownloaded ? '下载中...' : '稍后重启'}
                </Button>
                {isDownloaded && (
                  <Button variant="primary" onClick={handleInstallClick}>
                    立即重启
                  </Button>
                )}
              </>
            )}
          </div>
        }
      >
        <div className="update-dialog__content">
          <p className="update-dialog__version">新版本：v{updateInfo?.version}</p>

          {!(isDownloading || isDownloaded) && updateInfo?.releaseNotes && (
            <div className="update-dialog__notes">
              <h4>更新内容：</h4>
              <pre>{updateInfo.releaseNotes}</pre>
            </div>
          )}

          {(isDownloading || downloadProgress) && !isDownloaded && (
            <div className="update-dialog__progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${downloadProgress?.percent || 0}%` }}
                />
              </div>
              <p className="progress-text">
                {downloadProgress
                  ? `正在下载：${downloadProgress.percent.toFixed(1)}% (${(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB / ${(downloadProgress.total / 1024 / 1024).toFixed(1)} MB)`
                  : '正在准备下载...'
                }
              </p>
            </div>
          )}

          {isDownloaded && (
            <div className="update-dialog__success">
              <p className="success-text">✓ 下载完成！</p>
            </div>
          )}
        </div>
      </Modal>

      <UpdateInfoModal isOpen={showLatestVersion} onClose={() => setShowLatestVersion(false)} />
    </>
  )
}

// 导出别名供 App.tsx 使用
export { UpdateDialog as UpdateManager }

// 简单的信息提示 Modal
function UpdateInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✓ 检查更新"
      className="update-info-modal"
      footer={
        <Button variant="primary" onClick={onClose}>
          确定
        </Button>
      }
    >
      <p className="update-dialog__info-text">已是最新版本</p>
    </Modal>
  )
}
