# 财富管理应用 - 架构文档

## 1. 项目概述

### 1.1 项目信息
- **项目名称**: 财富管理 (Wealth Management)
- **版本**: 0.0.13
- **技术栈**: Electron + React 19 + TypeScript + Vite + ECharts
- **仓库**: https://github.com/xiangjianxiaohuangyu/wealth-management

### 1.2 应用特性
- 跨平台桌面应用（Windows、macOS）
- 自动更新功能（基于 GitHub Releases）
- 本地数据存储
- 响应式设计

## 2. 架构概览

### 2.1 Electron 架构模式
采用主进程（Main Process）和渲染进程（Renderer Process）分离的架构：

```
┌─────────────────────────────────────────────────────────┐
│                     Electron 应用                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐              ┌─────────────────┐   │
│  │   主进程        │              │   渲染进程        │   │
│  │  (main.js)     │◄────IPC─────►│  (React App)    │   │
│  │                │              │                 │   │
│  │ - 窗口管理      │              │ - 用户界面       │   │
│  │ - IPC 处理器    │              │ - 状态管理       │   │
│  │ - 自动更新      │              │ - 业务逻辑       │   │
│  │ - 文件操作      │              │ - 图表渲染       │   │
│  └────────────────┘              └─────────────────┘   │
│           ▲                                 ▲           │
│           │                                 │           │
│  ┌────────┴─────────────────────────────────┴──────┐  │
│  │            预加载脚本 (preload.js)               │  │
│  │            contextBridge 安全桥接                │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 技术栈分层

#### 前端层
- **UI 框架**: React 19.2.0
- **构建工具**: Vite 7.2.4
- **语言**: TypeScript 5.9.3
- **图表库**: ECharts 6.0.0
- **样式**: CSS (system-ui 字体栈)

#### 桌面层
- **运行时**: Electron 40.0.0
- **自动更新**: electron-updater 6.7.3
- **日志**: electron-log 5.4.3
- **构建**: electron-builder 26.4.0

## 3. 目录结构

### 3.1 根目录结构
```
wealth-management/
├── main.js                    # Electron 主进程入口
├── preload.js                # 预加载脚本
├── package.json              # 主项目配置
├── renderer/                 # 渲染进程（React 应用）
│   ├── src/                  # 源代码
│   ├── package.json          # 渲染进程配置
│   └── vite.config.ts        # Vite 配置
└── release/                  # 构建输出目录
```

### 3.2 渲染进程目录结构
```
renderer/src/
├── main.tsx                  # React 应用入口
├── App.tsx                   # 根组件
├── index.css                 # 全局样式
│
├── pages/                    # 页面组件
│   ├── Dashboard/            # 财富总览
│   ├── Investment/           # 投资规划
│   ├── Changelog/            # 更新日志
│   └── Settings/             # 设置
│
├── components/               # 可复用组件
│   ├── layout/               # 布局组件
│   ├── common/               # 通用组件
│   └── charts/               # 图表组件
│
├── services/                 # 业务逻辑层
│   ├── ipc/                  # IPC 通信
│   ├── data/                 # 数据处理
│   └── storage/              # 数据存储
│
├── hooks/                    # 自定义 Hooks
├── utils/                    # 工具函数
├── types/                    # 类型定义
├── router/                   # 路由配置
├── assets/                   # 静态资源
└── styles/                   # 全局样式
```

## 4. 核心模块

### 4.1 主进程 (main.js)

#### 窗口管理
```javascript
// 窗口配置
- 尺寸: 1400x900（最小 1200x700）
- 背景色: #f5f7fa
- 标题: 财富管理 - Wealth Management
- 开发环境: 加载 http://localhost:5173
- 生产环境: 加载 renderer/dist/index.html
```

#### IPC 通信处理器
| 通道名 | 类型 | 功能描述 |
|--------|------|----------|
| `save-plan-to-file` | invoke | 保存计划到本地文件 |
| `get-saved-plans` | invoke | 获取已保存的计划列表 |
| `load-plan-from-file` | invoke | 加载指定计划 |
| `get-plans-directory` | invoke | 获取计划目录路径 |
| `delete-plan-file` | invoke | 删除计划文件 |
| `get-app-version` | invoke | 获取应用版本号 |
| `read-project-file` | invoke | 读取项目文件 |
| `check-for-updates` | on/send | 检查更新 |
| `download-update` | on/send | 下载更新 |
| `install-update` | on/send | 安装更新 |

#### 自动更新机制
- **更新源**: GitHub Releases
- **更新策略**: 手动触发（不自动下载）
- **事件通知**: update-available, update-download-progress, update-downloaded

### 4.2 预加载脚本 (preload.js)

#### 安全暴露的 API
```typescript
window.electron = {
  // 事件监听
  on: (channel: string, callback: Function) => void
  removeListener: (channel: string, callback: Function) => void

  // 发送消息
  send: (channel: string, ...args: any[]) => void

  // 调用主进程方法
  invoke: (channel: string, ...args: any[]) => Promise<any>
}
```

#### 白名单机制
- **可监听事件**: update-*, check-for-updates
- **可发送消息**: download-update, install-update
- **可调用方法**: get-*, save-*, load-*, delete-*

### 4.3 渲染进程

#### 主要组件
1. **App.tsx**: 应用根组件
2. **UpdateDialog.tsx**: 更新对话框（已实现）
3. **布局组件**: AppLayout, Sidebar, MainContent（待实现）
4. **页面组件**: Dashboard, Investment, Changelog, Settings（待实现）

## 5. IPC 通信流程

### 5.1 单向通信（主进程 → 渲染进程）
```javascript
// 主进程
mainWindow.webContents.send('update-available', updateInfo)

// 渲染进程
window.electron.on('update-available', (event, info) => {
  // 处理更新信息
})
```

### 5.2 双向通信（invoke/handle 模式）
```typescript
// 渲染进程
const version = await window.electron.invoke('get-app-version')

// 主进程
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})
```

### 5.3 更新流程示例
```
1. 主进程检测更新
   ↓ send('update-available')
2. 渲染进程显示对话框
   ↓ user clicks download
3. send('download-update')
   ↓
4. 主进程下载更新
   ↓ send('update-download-progress')
5. 渲染进程更新进度条
   ↓ download complete
6. send('update-downloaded')
   ↓ user clicks install
7. send('install-update')
   ↓
8. 主进程安装并重启
```

## 6. 数据存储

### 6.1 本地文件存储
- **位置**: 用户数据目录 /plans
- **格式**: JSON
- **功能**: 保存、加载、删除投资计划

### 6.2 数据结构
```typescript
interface Plan {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: any
}
```

## 7. 开发工作流

### 7.1 开发环境
```bash
# 启动开发服务器
npm run dev

# 渲染进程热重载
# Vite HMR 自动刷新
```

### 7.2 构建
```bash
# Windows 构建
npm run build:win

# macOS 构建
npm run build:mac

# 完整发布流程
npm run release
```

### 7.3 版本管理
```bash
# 补丁版本 (0.0.13 → 0.0.14)
npm run bump

# 次要版本 (0.0.13 → 0.1.0)
npm run bump:minor

# 主要版本 (0.0.13 → 1.0.0)
npm run bump:major
```

## 8. 安全考虑

### 8.1 IPC 安全
- 使用 contextBridge 隔离上下文
- 白名单机制限制可访问的通道
- contextIsolation: true（启用）

### 8.2 数据安全
- 本地数据存储在用户目录
- JSON 格式易于查看和编辑
- 无敏感信息硬编码

## 9. 性能优化

### 9.1 构建优化
- Vite 快速冷启动
- 代码分割（动态导入）
- 生产环境压缩

### 9.2 运行时优化
- 懒加载页面组件
- 图表按需渲染
- 防抖/节流用户输入

## 10. 已实现功能

✅ Electron 窗口创建和管理
✅ IPC 通信框架
✅ 自动更新机制
✅ 版本信息获取
✅ 文件存储功能（计划管理）
✅ 更新对话框 UI

## 11. 待实现功能

❌ 应用主布局（侧边栏 + 内容区）
❌ 页面导航系统
❌ 财富总览页面
❌ 投资规划页面
❌ 更新日志页面
❌ 设置页面
❌ 图表组件（饼图、折线图等）
❌ 数据可视化
❌ 样式美化
❌ 用户交互功能

## 12. 技术债务和改进方向

### 12.1 当前限制
- 大多数组件文件为空
- 无状态管理（考虑添加 Zustand 或 Redux Toolkit）
- 无错误边界
- 无单元测试

### 12.2 改进建议
- 添加状态管理库
- 实现错误边界和日志记录
- 添加单元测试和集成测试
- 优化性能（虚拟滚动、懒加载）
- 添加主题系统（亮/暗模式）
- 国际化支持
