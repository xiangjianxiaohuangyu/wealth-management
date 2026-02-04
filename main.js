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

// ========== 股票数据获取功能 ==========
const axios = require('axios');

// 股票数据缓存（2分钟缓存）
const stockDataCache = new Map();
const STOCK_CACHE_DURATION = 2 * 60 * 1000;

// 请求队列（限流：最小间隔500ms）
const requestQueue = [];
let isProcessing = false;
const MIN_REQUEST_INTERVAL = 500;

/**
 * 验证股票代码格式
 * 支持：A股(sh/sz)、港股(hk)、美股指数(IXIC/DJI等)、黄金现货(AU9999)
 */
function validateStockCode(stockCode) {
  const code = stockCode.trim().toLowerCase();

  // A股格式：sh/sz + 6位数字
  const aShareMatch = code.match(/^(sh|sz)(\d{6})$/);
  if (aShareMatch) {
    return { valid: true, normalizedCode: code };
  }

  // 港股格式：hk + 5位数字
  const hkMatch = code.match(/^hk(\d{5})$/);
  if (hkMatch) {
    return { valid: true, normalizedCode: code };
  }

  // 美股指数：IXIC(纳斯达克), DJI(道琼斯), SPX/INX(S&P500)
  const usIndexMatch = code.match(/^(ixic|dji|spx|inx)$/);
  if (usIndexMatch) {
    return { valid: true, normalizedCode: code.toUpperCase() };
  }

  // 黄金现货：AU9999
  const goldMatch = code.match(/^au\d{4}$/);
  if (goldMatch) {
    return { valid: true, normalizedCode: code.toUpperCase() };
  }

  // 国际商品期货：黄金(GC), 原油(CL)等
  const futuresMatch = code.match(/^(gc|cl|si|hg)\d{2,}$/);
  if (futuresMatch) {
    return { valid: true, normalizedCode: code.toUpperCase() };
  }

  return {
    valid: false,
    error: 'Invalid stock code format. Expected: sh600000, sz000001, hk00700, IXIC, AU9999, GC, CL'
  };
}

/**
 * 获取股票实时数据
 */
ipcMain.handle('get-stock-data', async (event, stockCode) => {
  try {
    if (!stockCode || typeof stockCode !== 'string') {
      return { success: false, error: 'Invalid stock code' };
    }

    // 验证股票代码格式
    const validation = validateStockCode(stockCode);
    if (!validation.valid) {
      console.error(`[StockAPI] Invalid stock code format: ${stockCode}`);
      return { success: false, error: validation.error };
    }

    const code = validation.normalizedCode;

    // 检查缓存
    const cached = stockDataCache.get(code);
    if (cached && Date.now() - cached.timestamp < STOCK_CACHE_DURATION) {
      return { success: true, data: cached.data };
    }

    // 加入请求队列
    return new Promise((resolve) => {
      requestQueue.push({ code, resolve });
      processQueue();
    });

  } catch (error) {
    console.error('Error fetching stock data:', error);
    return { success: false, error: error.message };
  }
});

/**
 * 处理请求队列（限流）
 */
async function processQueue() {
  if (isProcessing || requestQueue.length === 0) {
    return;
  }

  isProcessing = true;

  while (requestQueue.length > 0) {
    const { code, resolve } = requestQueue.shift();

    try {
      const result = await fetchStockData(code);

      // 更新缓存
      if (result.success) {
        stockDataCache.set(code, {
          data: result.data,
          timestamp: Date.now()
        });
      }

      resolve(result);
    } catch (error) {
      resolve({ success: false, error: error.message });
    }

    // 请求间隔
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL));
  }

  isProcessing = false;
}

/**
 * 将用户代码转换为新浪API格式
 * 新浪对不同市场使用不同的前缀
 */
function convertToSinaApiCode(stockCode) {
  const code = stockCode.toUpperCase();

  // A股：直接使用 (sh600000, sz000001)
  if (code.match(/^(SH|SZ)\d{6}$/)) {
    return code.toLowerCase();
  }

  // 港股：直接使用 (hk00700)
  if (code.match(/^HK\d{5}$/)) {
    return code.toLowerCase();
  }

  // 美股指数：添加gb_前缀 (IXIC -> gb_ixic)
  if (['IXIC', 'DJI', 'SPX', 'INX'].includes(code)) {
    return `gb_${code.toLowerCase()}`;
  }

  // 国内黄金现货：添加hf_前缀 (AU9999 -> hf_au9999)
  if (code.match(/^AU\d{4}$/)) {
    return `hf_${code.toLowerCase()}`;
  }

  // 国际期货：直接使用 (GC, CL等)
  return code.toLowerCase();
}

/**
 * 尝试从多个API获取股票数据
 * 优先使用新浪，失败则尝试其他来源
 */
async function fetchStockData(stockCode) {
  try {
    const apiCode = convertToSinaApiCode(stockCode);
    const apiUrl = `http://hq.sinajs.cn/list=${apiCode}`;

    console.log(`[StockAPI] Original code: ${stockCode}, API code: ${apiCode}`);
    console.log(`[StockAPI] Requesting: ${apiUrl}`);

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'http://finance.sina.com.cn'
      },
      timeout: 5000
    });

    console.log(`[StockAPI] Response status: ${response.status}`);
    console.log(`[StockAPI] Response data:`, response.data);

    if (response.status !== 200) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    // 使用原始代码解析（stockCode），因为用户输入的是原始代码
    const data = parseSinaStockData(stockCode, response.data);

    if (!data) {
      console.error(`[StockAPI] Failed to parse stock code: ${stockCode}`);

      // 如果新浪解析失败，尝试备用API
      const fallbackResult = await tryFallbackAPI(stockCode);
      if (fallbackResult) {
        return fallbackResult;
      }

      return { success: false, error: 'Failed to parse stock data' };
    }

    console.log(`[StockAPI] Parsed data:`, data);
    return { success: true, data };

  } catch (error) {
    console.error(`[StockAPI] Request failed: ${error.message}`);

    // 如果请求失败，尝试备用API
    try {
      const fallbackResult = await tryFallbackAPI(stockCode);
      if (fallbackResult) {
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error(`[StockAPI] Fallback also failed: ${fallbackError.message}`);
    }

    if (error.code === 'ECONNABORTED') {
      return { success: false, error: 'Request timeout' };
    }
    return { success: false, error: error.message };
  }
}

/**
 * 尝试使用备用API获取数据
 * 由于新浪API已不再支持美股指数和黄金，直接使用其他数据源
 */
async function tryFallbackAPI(stockCode) {
  const codeUpper = stockCode.toUpperCase();

  console.log(`[StockAPI] Using alternative API for: ${stockCode}`);

  // ========== 美股指数 (IXIC, DJI, SPX) ==========
  if (['IXIC', 'DJI', 'SPX', 'INX'].includes(codeUpper)) {
    try {
      // 使用腾讯API获取美股指数
      const tencentMap = {
        'IXIC': '.IXIC',
        'DJI': '.DJI',
        'SPX': '.INX',
        'INX': '.INX'
      };

      const tencentCode = tencentMap[codeUpper] || `.${codeUpper}`;
      const tencentUrl = `http://qt.gtimg.cn/q=${tencentCode}`;

      console.log(`[StockAPI] Fetching from Tencent API: ${tencentUrl}`);

      const response = await axios.get(tencentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'http://stockapp.finance.qq.com'
        },
        timeout: 5000
      });

      // 腾讯返回格式: v(".IXIC","18400.12,18350.23",...)
      // 实际格式: v_IXIC="~18400.12~18350.23~..."
      const match = response.data.match(/"([^"]+)"/);
      if (match && match[1]) {
        const fields = match[1].split('~');
        const currentPrice = parseFloat(fields[1]);
        const prevClose = parseFloat(fields[3]) || currentPrice;

        if (!isNaN(currentPrice)) {
          const changePercent = prevClose > 0
            ? ((currentPrice - prevClose) / prevClose) * 100
            : 0;

          const names = {
            'IXIC': '纳斯达克',
            'DJI': '道琼斯',
            'SPX': 'S&P500',
            'INX': 'S&P500'
          };

          const result = {
            stockCode: codeUpper,
            stockName: names[codeUpper] || codeUpper,
            currentPrice,
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: 0,
            updateTime: new Date().toISOString()
          };

          console.log(`[StockAPI] Tencent API success:`, result);
          return { success: true, data: result };
        }
      }
    } catch (error) {
      console.error(`[StockAPI] Tencent API failed:`, error.message);
    }

    // 如果腾讯API失败，使用Yahoo Finance API（备用）
    try {
      console.log(`[StockAPI] Trying Yahoo Finance API for ${codeUpper}`);

      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/^${codeUpper}`;

      const response = await axios.get(yahooUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 5000
      });

      if (response.data && response.data.chart && response.data.chart.result && response.data.chart.result[0]) {
        const meta = response.data.chart.result[0].meta;
        const currentPrice = meta.regularMarketPrice;
        const prevClose = meta.previousClose;

        if (!isNaN(currentPrice) && !isNaN(prevClose)) {
          const changePercent = prevClose > 0
            ? ((currentPrice - prevClose) / prevClose) * 100
            : 0;

          const names = {
            'IXIC': '纳斯达克',
            'DJI': '道琼斯',
            'SPX': 'S&P500',
            'INX': 'S&P500'
          };

          const result = {
            stockCode: codeUpper,
            stockName: names[codeUpper] || codeUpper,
            currentPrice,
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: 0,
            updateTime: new Date().toISOString()
          };

          console.log(`[StockAPI] Yahoo Finance API success:`, result);
          return { success: true, data: result };
        }
      }
    } catch (error) {
      console.error(`[StockAPI] Yahoo Finance API failed:`, error.message);
    }
  }

  // ========== 国内黄金现货 (AU9999, AU99) ==========
  if (/^AU\d{4}$/.test(codeUpper)) {
    try {
      // 东方财富黄金现货API
      const eastmoneyUrl = `http://push2.eastmoney.com/api/qt/stock/klt?secid=116.${codeUpper.slice(2)}&fields1=f1,f2,f3&fields2=f51,f52,f53&ut=fa5fd1943c7b386f172d6893dbfba10b&klt=1&fqt=0&end=20500101&lmt=1`;

      console.log(`[StockAPI] Fetching from Eastmoney API for gold`);

      const response = await axios.get(eastmoneyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'http://quote.eastmoney.com'
        },
        timeout: 5000
      });

      if (response.data && response.data.data && response.data.data.diff) {
        const diff = response.data.data.diff;
        if (diff.length > 0) {
          const latest = diff[0];
          const currentPrice = latest[2]; // 最新价
          const prevClose = latest[5]; // 昨收

          if (!isNaN(currentPrice) && !isNaN(prevClose)) {
            const changePercent = prevClose > 0
              ? ((currentPrice - prevClose) / prevClose) * 100
              : 0;

            const result = {
              stockCode: codeUpper,
              stockName: `黄金${codeUpper.slice(2)}`,
              currentPrice,
              changePercent: parseFloat(changePercent.toFixed(2)),
              volume: 0,
              updateTime: new Date().toISOString()
            };

            console.log(`[StockAPI] Eastmoney API success:`, result);
            return { success: true, data: result };
          }
        }
      }
    } catch (error) {
      console.error(`[StockAPI] Eastmoney API failed:`, error.message);
    }

    // 如果所有API都失败，返回模拟数据（标注为模拟数据）
    console.log(`[StockAPI] All APIs failed, using simulated data for gold (demo only)`);

    const mockGoldPrice = 560 + Math.random() * 10;
    const mockChange = (Math.random() - 0.5) * 2;

    return {
      success: true,
      data: {
        stockCode: codeUpper,
        stockName: `黄金${codeUpper.slice(2)}(模拟)`,
        currentPrice: parseFloat(mockGoldPrice.toFixed(2)),
        changePercent: parseFloat(mockChange.toFixed(2)),
        volume: 0,
        updateTime: new Date().toISOString()
      }
    };
  }

  console.log(`[StockAPI] No API available for: ${stockCode}`);
  return null;
}

/**
 * 解析新浪财经返回的数据
 * 支持多种格式：A股、港股、美股指数、商品期货
 */
function parseSinaStockData(stockCode, responseData) {
  try {
    console.log(`[StockParser] Parsing stock code: ${stockCode}`);
    console.log(`[StockParser] Raw response:`, responseData);

    // 新浪返回格式：var hq_str_sh600000="浦发银行,10.23,10.22,...";
    // 美股指数：var hq_str_gb_ixic="Nasdaq,18400.12,...";
    // 黄金：var hq_str_hf_au9999="560.50,1.2,...";
    const match = responseData.match(/="([^"]*)"/);
    if (!match) {
      console.error(`[StockParser] No match found in response for stock code: ${stockCode}`);
      console.error(`[StockParser] Stock code may not exist or API format changed`);
      return null;
    }

    const dataStr = match[1];

    // 检查返回数据是否为空（新浪API对不存在的股票代码返回空字符串）
    if (!dataStr || dataStr.trim() === '') {
      console.error(`[StockParser] Empty data returned for stock code: ${stockCode}`);
      console.error(`[StockParser] Stock code may be invalid or not supported`);
      return null;
    }

    const fields = dataStr.split(',');
    console.log(`[StockParser] Fields count: ${fields.length}`);
    console.log(`[StockParser] Fields:`, fields);

    const codeUpper = stockCode.toUpperCase();

    // ========== 美股指数格式 (IXIC, DJI, SPX) - 优先判断 ==========
    // 新浪美股指数实际格式: "纳斯达克,23255.1855,-1.43,2026-02-04,..."
    // 字段: [0]=名称, [1]=当前价, [2]=涨跌幅%, [3]=时间
    if (['IXIC', 'DJI', 'SPX', 'INX'].includes(codeUpper)) {
      const name = fields[0];
      const currentPrice = parseFloat(fields[1]);
      const changePercent = parseFloat(fields[2]);

      if (!isNaN(currentPrice) && !isNaN(changePercent)) {
        const names = {
          'IXIC': '纳斯达克',
          'DJI': '道琼斯',
          'SPX': 'S&P500',
          'INX': 'S&P500'
        };

        const result = {
          stockCode: codeUpper,
          stockName: name || names[codeUpper] || codeUpper,
          currentPrice,
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: 0,
          updateTime: new Date().toISOString()
        };

        console.log(`[StockParser] Parsed US index result:`, result);
        return result;
      }
    }

    // ========== 国内黄金现货格式 (AU9999, AU99等) ==========
    // 格式: "560.50,1.2,..." (当前价,涨跌幅,...)
    if (/^AU\d{4}$/.test(codeUpper)) {
      const currentPrice = parseFloat(fields[0]);
      const changePercent = parseFloat(fields[1]);

      if (!isNaN(currentPrice) && !isNaN(changePercent)) {
        const result = {
          stockCode: codeUpper,
          stockName: `黄金${codeUpper.slice(2)}`,
          currentPrice,
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: 0,
          updateTime: new Date().toISOString()
        };

        console.log(`[StockParser] Parsed gold spot result:`, result);
        return result;
      }
    }

    // ========== 国际商品期货格式 (GC=黄金, CL=原油) ==========
    // 格式: "2025.50,2030.00,2020.00,..."
    if (/^(GC|CL|SI|HG)\d+/.test(codeUpper)) {
      const currentPrice = parseFloat(fields[0]);
      const changePercent = parseFloat(fields[1]);

      if (!isNaN(currentPrice) && !isNaN(changePercent)) {
        const names = {
          'GC': '黄金期货',
          'CL': '原油期货',
          'SI': '白银期货',
          'HG': '铜期货'
        };
        const baseCode = codeUpper.replace(/\d+$/, '');
        const name = names[baseCode] || codeUpper;

        const result = {
          stockCode: codeUpper,
          stockName: name,
          currentPrice,
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: 0,
          updateTime: new Date().toISOString()
        };

        console.log(`[StockParser] Parsed futures result:`, result);
        return result;
      }
    }

    // ========== A股数据格式（至少33个字段） ==========
    if (fields.length >= 33) {
      const name = fields[0];
      const currentPrice = parseFloat(fields[3]);
      const prevClose = parseFloat(fields[2]);
      const changePercent = prevClose > 0
        ? ((currentPrice - prevClose) / prevClose) * 100
        : 0;

      const result = {
        stockCode: codeUpper,
        stockName: name,
        currentPrice,
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: parseInt(fields[8]) || 0,
        updateTime: new Date().toISOString()
      };

      console.log(`[StockParser] Parsed A-share result:`, result);
      return result;
    }

    // ========== 港股数据格式 ==========
    // 港股通常有20+个字段
    if (fields.length >= 20) {
      const name = fields[1];
      const currentPrice = parseFloat(fields[6]);
      const prevClose = parseFloat(fields[3]);
      const changePercent = prevClose > 0
        ? ((currentPrice - prevClose) / prevClose) * 100
        : 0;

      const result = {
        stockCode: codeUpper,
        stockName: name,
        currentPrice,
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: parseInt(fields[12]) || 0,
        updateTime: new Date().toISOString()
      };

      console.log(`[StockParser] Parsed HK stock result:`, result);
      return result;
    }

    // ========== 通用指数/其他格式 ==========
    // 尝试使用前几个字段作为价格和涨跌幅
    if (fields.length >= 2) {
      const currentPrice = parseFloat(fields[0]);
      const changePercent = parseFloat(fields[1]);

      if (!isNaN(currentPrice) && !isNaN(changePercent)) {
        const result = {
          stockCode: codeUpper,
          stockName: codeUpper,
          currentPrice,
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: 0,
          updateTime: new Date().toISOString()
        };

        console.log(`[StockParser] Parsed generic result:`, result);
        return result;
      }
    }

    console.error(`[StockParser] Unable to parse data format for ${stockCode}`);
    console.error(`[StockParser] Fields:`, fields);
    return null;
  } catch (error) {
    console.error('[StockParser] Error parsing stock data:', error);
    return null;
  }
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