const { contextBridge, ipcRenderer } = require('electron')

// 暴露 IPC 通信 API 给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 监听事件
  on: (channel, callback) => {
    const validChannels = [
      'update-available',
      'update-not-available',
      'update-download-progress',
      'update-downloaded',
      'update-error'
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(event, ...args))
    }
  },
  // 移除监听器
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  },
  // 发送消息
  send: (channel, ...args) => {
    const validChannels = ['download-update', 'install-update', 'check-for-updates']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args)
    }
  },
  // 调用主进程方法（返回 Promise）
  invoke: (channel, ...args) => {
    const validChannels = [
      'get-app-version',
      'check-for-updates',
      'download-update',
      'install-update',
      'save-plan-to-file',
      'get-saved-plans',
      'load-plan-from-file',
      'get-plans-directory',
      'delete-plan-file',
      'read-project-file',
      'get-stock-data'
    ]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`))
  },
  // 读取项目文件的便捷方法
  readFile: (filename) => {
    return ipcRenderer.invoke('read-project-file', filename).then(result => {
      if (result.success) {
        return result.content
      } else {
        throw new Error(result.error || '读取文件失败')
      }
    })
  }
})
