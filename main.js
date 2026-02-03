const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

// 判断是否为开发环境
const isDev = !app.isPackaged;

// 配置日志
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.logger.transports.console.level = 'debug';  // 添加控制台日志

log.info('=== Application Starting ===');
log.info('Node version:', process.versions.node);
log.info('Electron version:', process.versions.electron);
log.info('Chrome version:', process.versions.chrome);
log.info('autoDownload initial value:', autoUpdater.autoDownload);

// 配置自动更新行为
autoUpdater.autoDownload = false;  // 不自动下载更新，需要用户确认后才下载
autoUpdater.autoInstallOnAppQuit = false;  // 不在退出时自动安装，而是提示用户
log.info('App starting...');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#f5f7fa',
    title: '财富管理 - Wealth Management',
    autoHideMenuBar: true
  });

  mainWindow = win;

  if (isDev) {
    // 开发环境：加载 Vite 开发服务器
    win.loadURL('http://localhost:5173');
    // 开发者工具已默认关闭，如需调试可按 F12 或 Ctrl+Shift+I
    // win.webContents.openDevTools();
  } else {
    // 生产环境：加载构建后的文件
    win.loadFile(path.join(__dirname, 'renderer/dist/index.html'));
  }

  // 设置自动更新
  setupAutoUpdater();

  // 应用启动后自动检查更新（延迟1秒）
  setTimeout(() => {
    // 确保在检查更新之前，自动下载已关闭
    autoUpdater.autoDownload = false;
    log.info('autoDownload set to false before checking updates');

    // 检查更新（FeedURL 已在 setupAutoUpdater 中配置）
    log.info('Current app version:', app.getVersion());
    autoUpdater.checkForUpdates().catch(err => {
      log.error('检查更新失败:', err);
    });
  }, 1000);
}

// 保存计划到本地文件
ipcMain.handle('save-plan-to-file', async (event, planName, planData) => {
  const plansDir = path.join(app.getPath('userData'), 'plans');

  // 确保目录存在
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
  }

  const fileName = `${planName}.json`;
  const filePath = path.join(plansDir, fileName);

  try {
    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['覆盖', '取消'],
        defaultId: 1,
        title: '文件已存在',
        message: `计划 "${planName}" 已存在，是否覆盖？`
      });

      if (result.response === 1) {
        return { success: false, cancelled: true };
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(planData, null, 2), 'utf-8');
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 获取已保存的计划列表
ipcMain.handle('get-saved-plans', async () => {
  const plansDir = path.join(app.getPath('userData'), 'plans');

  if (!fs.existsSync(plansDir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(plansDir).filter(file => file.endsWith('.json'));
    const plans = files.map(file => {
      const filePath = path.join(plansDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file.replace('.json', ''),
        path: filePath,
        modified: stats.mtime
      };
    });

    // 按修改时间排序（最新的在前）
    plans.sort((a, b) => b.modified - a.modified);

    return plans;
  } catch (error) {
    console.error('Error reading plans:', error);
    return [];
  }
});

// 加载指定计划
ipcMain.handle('load-plan-from-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 获取计划目录路径
ipcMain.handle('get-plans-directory', async () => {
  return path.join(app.getPath('userData'), 'plans');
});

// 删除计划文件
ipcMain.handle('delete-plan-file', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    } else {
      return { success: false, error: '文件不存在' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 获取应用版本号
ipcMain.handle('get-app-version', async () => {
  // 直接使用 Electron 的 app.getVersion() 方法
  const version = app.getVersion();
  log.info('App version requested:', version);
  return version;
});

// 读取项目目录中的文件（用于更新日志等）
ipcMain.handle('read-project-file', async (_event, fileName) => {
  // 安全验证：检查文件名格式
  if (!fileName || typeof fileName !== 'string') {
    return { success: false, error: 'Invalid file name' };
  }

  // 验证文件名只包含安全字符（防止路径遍历攻击）
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    console.error('Invalid file name format:', fileName);
    return { success: false, error: 'Invalid file name' };
  }

  // 限制在白名单文件列表
  const allowedFiles = ['changelog.md', 'changelog_upcoming.md', 'README.md', 'ARCHITECTURE.md', 'PROJECT_INTRO.md'];
  if (!allowedFiles.includes(fileName)) {
    console.error('File not in whitelist:', fileName);
    return { success: false, error: 'File not allowed' };
  }

  // 开发环境和生产环境：main.js 和 changelog.md 都在同一目录
  // 开发环境：项目根目录
  // 生产环境：resources/app 目录
  const projectRoot = __dirname;

  const filePath = path.join(projectRoot, fileName);
  console.log('Reading file:', filePath);
  console.log('File exists:', fs.existsSync(filePath));

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log('File content length:', content.length);
      return { success: true, content };
    } else {
      console.error('File not found:', filePath);
      return { success: false, error: '文件不存在' };
    }
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
});

// ========== 自动更新功能 ==========

let mainWindow = null;

// 检查更新
ipcMain.handle('check-for-updates', async () => {
  try {
    log.info('Checking for updates...');
    // 确保自动下载已关闭
    autoUpdater.autoDownload = false;
    log.info('autoDownload set to false before manual check');
    autoUpdater.checkForUpdates();
    return { success: true };
  } catch (error) {
    log.error('Error checking for updates:', error);
    return { success: false, error: error.message };
  }
});

// 下载更新（使用 ipcMain.on 配合前端的 send）
ipcMain.on('download-update', () => {
  log.info('Downloading update...');
  autoUpdater.downloadUpdate();
});

// 保留 handle 用于 invoke 调用
ipcMain.handle('download-update', async () => {
  try {
    log.info('Downloading update...');
    autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    log.error('Error downloading update:', error);
    return { success: false, error: error.message };
  }
});

// 安装更新并重启（使用 ipcMain.on 配合前端的 send）
ipcMain.on('install-update', () => {
  log.info('Installing update...');
  autoUpdater.quitAndInstall(true, true);
});

// 保留 handle 用于 invoke 调用
ipcMain.handle('install-update', async () => {
  try {
    log.info('Installing update...');
    autoUpdater.quitAndInstall(true, true);
    return { success: true };
  } catch (error) {
    log.error('Error installing update:', error);
    return { success: false, error: error.message };
  }
});

// 自动更新事件处理
function setupAutoUpdater() {
  // 在设置任何事件监听器之前，确保自动下载已关闭
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  log.info('setupAutoUpdater: autoDownload and autoInstallOnAppQuit set to false');

  // 配置更新服务器（在 setup 中配置，确保更早生效）
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'xiangjianxiaohuangyu',
    repo: 'wealth-management'
  });
  log.info('FeedURL configured: github.com/xiangjianxiaohuangyu/wealth-management');

  // 当发现可用更新时
  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    // 确保不会自动下载
    autoUpdater.autoDownload = false;
    log.info('update-available event: autoDownload set to false again');

    if (mainWindow) {
      log.info('Sending update-available event to renderer process');
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        date: info.releaseDate
      });
    } else {
      log.error('mainWindow is null, cannot send update-available event');
    }
  });

  // 当没有可用更新时
  autoUpdater.on('update-not-available', (info) => {
    log.info('===== UPDATE NOT AVAILABLE =====');
    log.info('Current version:', app.getVersion());
    log.info('Latest version on GitHub:', info.version);
    log.info('Full info:', JSON.stringify(info, null, 2));
    log.info('================================');
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available', {
        version: info.version
      });
    }
  });

  // 下载进度
  autoUpdater.on('download-progress', (progress) => {
    log.info('Download progress:', progress.percent.toFixed(1) + '%');
    if (mainWindow) {
      mainWindow.webContents.send('update-download-progress', {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
        speed: progress.bytesPerSecond
      });
    }
  });

  // 更新下载完成
  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version
      });
    }
  });

  // 更新错误
  autoUpdater.on('error', (error) => {
    log.error('Update error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', {
        message: error.message
      });
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});