# 财富管理应用 (Wealth Management)

一款基于 Electron + React + TypeScript 的跨平台桌面财富管理应用。

## 项目信息

- **版本**: 0.0.13
- **技术栈**: Electron 40.0.0 + React 19 + TypeScript + Vite + ECharts
- **仓库**: https://github.com/xiangjianxiaohuangyu/wealth-management

## 应用特性

- ✅ 跨平台桌面应用（Windows、macOS）
- ✅ 自动更新功能（基于 GitHub Releases）
- ✅ 本地数据存储
- ✅ 响应式设计

## 文档

- **[架构文档](ARCHITECTURE.md)** - 了解项目的整体架构、技术栈和核心模块
- **[工作计划](WORK_PLAN.md)** - 查看开发计划和里程碑

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 安装主项目依赖
npm install

# 安装渲染进程依赖
cd renderer
npm install
cd ..
```

### 开发模式

```bash
npm run dev
```

这将启动 Electron 应用和 Vite 开发服务器，支持热重载。

### 构建应用

```bash
# Windows 构建
npm run build:win

# macOS 构建
npm run build:mac
```

### 发布新版本

```bash
# 补丁版本 (0.0.13 → 0.0.14)
npm run release

# 次要版本 (0.0.13 → 0.1.0)
npm run release:minor

# 主要版本 (0.0.13 → 1.0.0)
npm run release:major
```

## 项目结构

```
wealth-management/
├── main.js                    # Electron 主进程
├── preload.js                # 预加载脚本
├── package.json              # 主项目配置
├── renderer/                 # React 渲染进程
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 可复用组件
│   │   ├── services/         # 业务逻辑
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── utils/            # 工具函数
│   │   └── types/            # 类型定义
│   └── package.json
├── ARCHITECTURE.md           # 架构文档
├── WORK_PLAN.md              # 工作计划
└── README.md                 # 项目文档
```

## 技术栈

### 前端层
- **UI 框架**: React 19.2.0
- **构建工具**: Vite 7.2.4
- **语言**: TypeScript 5.9.3
- **图表库**: ECharts 6.0.0

### 桌面层
- **运行时**: Electron 40.0.0
- **自动更新**: electron-updater 6.7.3
- **日志**: electron-log 5.4.3
- **构建**: electron-builder 26.4.0

## 开发指南

### 主要功能模块

1. **财富总览** - 展示总资产、资产配置、收支趋势
2. **投资规划** - 投资组合管理、计算器、目标追踪
3. **更新日志** - 版本历史和发布详情
4. **设置** - 应用设置和数据管理

### IPC 通信

项目使用 Electron IPC 进行主进程和渲染进程通信：

```typescript
// 渲染进程调用主进程
const version = await window.electron.invoke('get-app-version')

// 监听主进程事件
window.electron.on('update-available', (event, info) => {
  console.log('New version available:', info)
})
```

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置
- 为公共 API 添加注释
- 保持代码简洁和可维护

## 当前状态

### 已实现功能
- ✅ Electron 窗口创建和管理
- ✅ IPC 通信框架
- ✅ 自动更新机制
- ✅ 版本信息获取
- ✅ 文件存储功能
- ✅ 更新对话框 UI

### 待实现功能
- ❌ 应用主布局（侧边栏 + 内容区）
- ❌ 页面导航系统
- ❌ 财富总览页面
- ❌ 投资规划页面
- ❌ 更新日志页面
- ❌ 设置页面
- ❌ 图表组件和数据可视化

## 开发路线图

### v0.1.0 - MVP（最小可行产品）
- 完整的布局系统
- 财富总览和投资规划页面
- 基础图表展示

### v0.2.0 - 功能完善
- 高级图表和分析
- 数据导入/导出
- 主题系统

### v1.0.0 - 稳定发布
- 数据备份和恢复
- 国际化支持
- 完整测试覆盖

详细开发计划请查看 [WORK_PLAN.md](WORK_PLAN.md)。

## 许可证

MIT License

## 联系方式

- GitHub Issues: https://github.com/xiangjianxiaohuangyu/wealth-management/issues
