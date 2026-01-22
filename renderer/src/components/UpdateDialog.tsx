import { useEffect, useState } from 'react'
import './UpdateDialog.css'

interface UpdateInfo {
  version: string
  releaseNotes?: string
  date?: string
}

interface UpdateDialogProps {
  updateInfo: UpdateInfo | null
  onDownload: () => void
  onInstall: () => void
  onCancel: () => void
  downloadProgress?: {
    percent: number
    transferred: number
    total: number
  }
  isDownloaded: boolean
}

export function UpdateDialog({
  updateInfo,
  onDownload,
  onInstall,
  onCancel,
  downloadProgress,
  isDownloaded
}: UpdateDialogProps) {
  if (!updateInfo) return null

  return (
    <div className="update-overlay">
      <div className="update-dialog">
        <div className="update-header">
          <h2>🎉 发现新版本</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="update-content">
          <p className="update-version">新版本：v{updateInfo.version}</p>

          {updateInfo.releaseNotes && (
            <div className="release-notes">
              <h4>更新内容：</h4>
              <pre>{updateInfo.releaseNotes}</pre>
            </div>
          )}

          {downloadProgress && !isDownloaded && (
            <div className="download-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${downloadProgress.percent}%` }}
                />
              </div>
              <p className="progress-text">
                正在下载：{downloadProgress.percent.toFixed(1)}%
                ({(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB /
                {(downloadProgress.total / 1024 / 1024).toFixed(1)} MB)
              </p>
            </div>
          )}

          {isDownloaded && (
            <div className="download-complete">
              <p className="success-text">✓ 下载完成！</p>
            </div>
          )}
        </div>

        <div className="update-footer">
          {!downloadProgress && !isDownloaded && (
            <>
              <button className="btn btn-secondary" onClick={onCancel}>
                稍后更新
              </button>
              <button className="btn btn-primary" onClick={onDownload}>
                立即更新
              </button>
            </>
          )}

          {downloadProgress && !isDownloaded && (
            <button className="btn btn-secondary" onClick={onCancel} disabled>
              下载中...
            </button>
          )}

          {isDownloaded && (
            <>
              <button className="btn btn-secondary" onClick={onCancel}>
                稍后重启
              </button>
              <button className="btn btn-primary" onClick={onInstall}>
                立即重启
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function UpdateManager() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<any>(null)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [showLatestVersion, setShowLatestVersion] = useState(false)

  useEffect(() => {
    // 监听更新可用事件
    const handleUpdateAvailable = (_event: any, info: UpdateInfo) => {
      console.log('🎉 前端收到 update-available 事件:', info)
      setUpdateInfo(info)
    }

    // 监听没有可用更新事件
    const handleUpdateNotAvailable = (_event: any, info: any) => {
      console.log('已是最新版本:', info.version)
      setShowLatestVersion(true)
      // 3秒后自动关闭提示
      setTimeout(() => {
        setShowLatestVersion(false)
      }, 3000)
    }

    // 监听下载进度
    const handleDownloadProgress = (_event: any, progress: any) => {
      setDownloadProgress(progress)
    }

    // 监听下载完成
    const handleUpdateDownloaded = (_event: any) => {
      setIsDownloaded(true)
      setDownloadProgress(null)
    }

    // 监听更新错误
    const handleUpdateError = (_event: any, error: any) => {
      console.error('Update error:', error)
      alert(`更新失败：${error.message}`)
    }

    // 添加监听器
    console.log('注册更新监听器...')
    if (!window.electron) {
      console.error('window.electron 不存在，IPC 通信未正确配置')
    }
    window.electron?.on?.('update-available', handleUpdateAvailable)
    window.electron?.on?.('update-not-available', handleUpdateNotAvailable)
    window.electron?.on?.('update-download-progress', handleDownloadProgress)
    window.electron?.on?.('update-downloaded', handleUpdateDownloaded)
    window.electron?.on?.('update-error', handleUpdateError)

    return () => {
      // 清理监听器
      window.electron?.removeListener?.('update-available', handleUpdateAvailable)
      window.electron?.removeListener?.('update-not-available', handleUpdateNotAvailable)
      window.electron?.removeListener?.('update-download-progress', handleDownloadProgress)
      window.electron?.removeListener?.('update-downloaded', handleUpdateDownloaded)
      window.electron?.removeListener?.('update-error', handleUpdateError)
    }
  }, [])

  const handleDownload = () => {
    window.electron?.send?.('download-update')
  }

  const handleInstall = () => {
    window.electron?.send?.('install-update')
  }

  const handleCancel = () => {
    setUpdateInfo(null)
    setDownloadProgress(null)
    setIsDownloaded(false)
  }

  return (
    <>
      <UpdateDialog
        updateInfo={updateInfo}
        onDownload={handleDownload}
        onInstall={handleInstall}
        onCancel={handleCancel}
        downloadProgress={downloadProgress}
        isDownloaded={isDownloaded}
      />
      {showLatestVersion && (
        <div className="update-overlay">
          <div className="update-dialog update-dialog-info">
            <div className="update-header">
              <h2>✓ 检查更新</h2>
              <button className="close-btn" onClick={() => setShowLatestVersion(false)}>✕</button>
            </div>
            <div className="update-content">
              <p className="success-text">已是最新版本</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
