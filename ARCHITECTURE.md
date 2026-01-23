# 财富管理系统 - 架构文档

## 目录结构

```
wealth-management/
├── main.js                          # Electron 主进程入口
├── preload.js                       # 预加载脚本
├── package.json                     # 项目配置
├── renderer/                        # React 渲染进程
│   ├── src/
│   │   ├── App.tsx                  # 应用根组件
│   │   ├── App.css                  # 全局样式（#root 等）
│   │   ├── main.tsx                 # React 渲染入口
│   │   ├── index.css                # 全局重置样式
│   │   │
│   │   ├── styles/                  # 全局样式资源
│   │   │   └── variables.css        # CSS 变量定义（颜色、间距、字体等）
│   │   │
│   │   ├── assets/                  # 静态资源
│   │   │
│   │   ├── components/              # 组件库
│   │   │   ├── common/              # 通用 UI 组件
│   │   │   │   ├── Button/          # 按钮组件
│   │   │   │   ├── Card/            # 卡片组件
│   │   │   │   └── Modal/           # 模态框组件
│   │   │   │
│   │   │   ├── layout/              # 布局组件
│   │   │   │   ├── AppLayout.tsx    # 主布局容器
│   │   │   │   ├── Sidebar.tsx      # 侧边导航栏
│   │   │   │   ├── MainContent.tsx  # 主内容区域
│   │   │   │   ├── *.css            # 各布局组件样式
│   │   │   │   └── layout.types.ts
│   │   │   │
│   │   │   ├── Dashboard/           # 仪表盘业务组件
│   │   │   │   ├── WealthSummary.tsx         # 财富摘要卡片
│   │   │   │   ├── AssetAllocation.tsx       # 资产配置图表
│   │   │   │   ├── RecentTransactions.tsx    # 最近交易列表
│   │   │   │   ├── *.css            # 各组件样式
│   │   │   │   └── Dashboard.types.ts
│   │   │   │
│   │   │   ├── Investment/          # 投资业务组件
│   │   │   │   ├── InvestmentCalculator.tsx   # 投资计算器
│   │   │   │   ├── PortfolioList.tsx         # 投资组合列表
│   │   │   │   ├── *.css            # 各组件样式
│   │   │   │   └── Investment.types.ts
│   │   │   │
│   │   │   ├── charts/              # 图表组件
│   │   │   │   ├── LineChart.tsx    # 折线图
│   │   │   │   ├── PieChart.tsx     # 饼图
│   │   │   │   ├── Charts.css
│   │   │   │   ├── charts.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── update/              # 更新功能组件
│   │   │       ├── UpdateDialog.tsx
│   │   │       ├── UpdateNotification.tsx
│   │   │       ├── *.css
│   │   │       ├── update.types.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── pages/                   # 页面组件
│   │   │   ├── Dashboard/           # 财富总览页面
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Dashboard.css
│   │   │   │   └── Dashboard.types.ts
│   │   │   │
│   │   │   ├── Investment/          # 投资规划页面
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Investment.css
│   │   │   │   └── Investment.types.ts
│   │   │   │
│   │   │   ├── Changelog/           # 更新日志页面
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Changelog.css
│   │   │   │   └── Changelog.types.ts
│   │   │   │
│   │   │   └── Settings/            # 设置页面
│   │   │       ├── index.tsx
│   │   │       ├── Settings.css
│   │   │       └── Settings.types.ts
│   │   │
│   │   ├── context/                 # React Context
│   │   │   └── RouterContext.tsx    # 路由上下文
│   │   │
│   │   ├── hooks/                   # 自定义 Hooks
│   │   │   ├── useChartData.ts      # 图表数据管理
│   │   │   ├── useLocalStorage.ts   # 本地存储
│   │   │   ├── useNavigation.ts     # 导航管理
│   │   │   └── index.ts
│   │   │
│   │   ├── services/                # 服务层
│   │   │   ├── data/                # 数据服务
│   │   │   │   ├── chartDataService.ts
│   │   │   │   ├── wealthDataService.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── ipc/                 # IPC 通信服务
│   │   │   │   ├── ipcService.ts
│   │   │   │   ├── updateService.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── storage/             # 存储服务
│   │   │       ├── localStorage.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── utils/                   # 工具函数
│   │   │   ├── format/              # 格式化工具
│   │   │   │   ├── currency.ts      # 货币格式化
│   │   │   │   ├── date.ts          # 日期格式化
│   │   │   │   └── index.ts
│   │   │   ├── constants.ts         # 常量定义
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                   # TypeScript 类型定义
│   │   │   ├── common.types.ts      # 通用类型
│   │   │   ├── navigation.types.ts  # 导航类型
│   │   │   ├── wealth.types.ts      # 财富类型
│   │   │   └── index.ts
│   │   │
│   │   └── electron.d.ts            # Electron 类型声明
│   │
│   ├── dist/                        # 构建输出
│   └── package.json
│
└── release/                         # 应用打包输出
```

## CSS 样式层级分析

### 当前样式层级结构

```
全局层级
├── index.css                    # 基础重置 + body 样式
└── styles/variables.css         # CSS 变量系统（玻璃态主题）

应用层级
└── App.css                      # #root 容器样式

布局层级
├── AppLayout.css               # 主布局容器
├── Sidebar.css                 # 侧边栏样式
└── MainContent.css             # 主内容区样式

组件层级
├── common/                     # 通用组件样式
│   ├── Button.css
│   ├── Card.css
│   └── Modal.css
├── charts/Charts.css           # 图表组件样式
└── update/                     # 更新组件样式

业务组件层级
├── Dashboard/                  # 仪表盘组件样式
│   ├── WealthSummary.css
│   ├── AssetAllocation.css
│   └── RecentTransactions.css
└── Investment/                 # 投资组件样式

页面层级
├── Dashboard/Dashboard.css     # 财富总览页面
├── Investment/Investment.css   # 投资规划页面
├── Changelog/Changelog.css     # 更新日志页面
└── Settings/Settings.css       # 设置页面
```

### 样式层级问题与建议

#### ✅ 优点

1. **统一的 CSS 变量系统**
   - 所有设计令牌集中在 `variables.css`
   - 完整的玻璃态主题颜色、间距、字体定义
   - 便于主题切换和维护

2. **BEM 命名规范**
   - 组件样式采用 BEM (Block__Element--Modifier)
   - 避免样式冲突，提高可维护性

3. **组件样式隔离**
   - 每个组件都有独立的 CSS 文件
   - 样式文件与组件文件同名，易于查找

#### ⚠️ 问题与改进建议

**1. 全局样式重复定义**

问题：`index.css`、`App.css` 和 `variables.css` 中都有全局样式

建议职责划分：
- `index.css` - 全局重置 + 基础样式（box-sizing, html, body）
- `App.css` - 应用容器样式（#root 容器布局）
- `variables.css` - 纯 CSS 变量定义（不包含具体样式规则）

**2. 缺少全局工具类文件**

问题：工具类与变量定义混在 `variables.css` 中，不便于扩展

建议：创建 `styles/utilities.css`，按功能分类（间距、文字、布局等）

**3. 公共样式未提取**

问题：玻璃态背景、滚动条样式、卡片阴影在多处重复定义

建议：创建 `styles/common.css` 提取公共样式类

```css
/* 示例：玻璃态容器 */
.glass-container {
  background: var(--color-bg-elevated);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--color-border);
}

/* 示例：自定义滚动条 */
.custom-scrollbar {
  overflow-y: auto;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar);
  border-radius: 4px;
}
```

## 可复用的公用组件建议

### 当前已有但可推广的组件

#### 1. Card 组件（已存在，需推广）
- 推广到：Investment、Settings、Changelog 页面
- 理由：统一的卡片样式和交互，支持标题、副标题、操作区

#### 2. Button 组件（已存在）
- 检查所有页面是否都使用 Button 组件
- 理由：统一按钮样式和交互，支持多种变体和尺寸

### 建议新增的公用组件

#### 1. List/ListItem 组件 ⭐⭐⭐⭐⭐
**使用场景：** RecentTransactions、PortfolioList、Changelog、Settings

**复用价值：** 多个页面都有列表展示需求，统一列表项样式和交互

#### 2. StatCard 组件 ⭐⭐⭐⭐
**使用场景：** WealthSummary 统计卡片、投资收益统计

**复用价值：** 统一的数值展示卡片，支持趋势指示、图标

#### 3. EmptyState 组件 ⭐⭐⭐⭐
**使用场景：** 无数据时的空状态展示

**复用价值：** 提升用户体验，统一的空状态设计

#### 4. Table 组件 ⭐⭐⭐⭐⭐
**使用场景：** 交易记录表格、投资组合明细表格

**复用价值：** 数据展示是核心功能，支持排序、分页等高级功能

#### 5. Badge/Tag 组件 ⭐⭐⭐
**使用场景：** 交易类型标签、资产类别标签、状态标签

**复用价值：** 轻量级标签组件，统一颜色语义

#### 6. InputGroup/FormItem 组件 ⭐⭐⭐⭐
**使用场景：** 设置页面表单、数据录入表单

**复用价值：** 表单是常见交互，统一表单样式和验证

### 公用组件优先级

**高优先级（立即实施）：**
1. List/ListItem - 多页面都有列表需求
2. Table - 数据展示核心组件
3. StatCard - 统一数值展示

**中优先级（近期实施）：**
4. EmptyState - 提升用户体验
5. Badge/Tag - 标签展示需求
6. InputGroup - 表单组件统一

## 架构优点

1. **清晰的分层架构** - 组件层、页面层、服务层分离明确
2. **类型安全** - 完整的 TypeScript 类型定义
3. **模块化设计** - 组件高度模块化，按功能划分
4. **统一的设计系统** - CSS 变量化的设计令牌，玻璃态主题统一
5. **代码分割** - 路由级别的懒加载，优化性能

## 改进建议

### 短期（1-2周）
1. 样式组织优化 - 创建 utilities.css 和 common.css
2. 组件复用 - 推广 Card、Button，创建 List/ListItem
3. 文档完善 - 添加组件使用文档

### 中期（1-2月）
1. 组件库建设 - 实现 Table、StatCard、EmptyState
2. 测试覆盖 - 添加单元测试和集成测试
3. 性能优化 - 组件级代码分割

### 长期（3-6月）
1. 状态管理 - 引入 Redux 或 Zustand
2. 主题系统 - 多主题支持
3. 国际化 - i18n 支持

## 总结

当前架构整体设计良好，具有清晰的分层和模块化设计。主要需要改进：

1. **CSS 样式组织** - 明确职责边界，提取公共样式
2. **组件复用** - 创建更多公用组件，减少重复代码
3. **文档完善** - 添加组件使用文档和示例

通过实施这些改进，可以进一步提升项目的可维护性和开发效率。
