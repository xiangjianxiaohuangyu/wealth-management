# 数据持久化实现文档

## 概述

应用使用 `localStorage` 进行数据持久化，所有用户数据都存储在浏览器的本地存储中。

## 数据持久化文件位置

### 1. **初始化服务** - `renderer/src/services/storage/initStorage.ts`
- **功能**：首次使用应用时加载默认数据
- **实现**：
  - `initializeDefaultData()`: 初始化默认的投资规划和资产跟踪数据
  - `isInitialized()`: 检查是否已经初始化
  - `markAsInitialized()`: 标记为已初始化，避免重复初始化

**调用位置**：在应用启动时自动调用（`main.tsx:8`）

### 2. **投资规划数据** - `renderer/src/services/storage/investmentStorage.ts`
- **存储键**：`wealth_investment_data`
- **数据结构**：
  ```typescript
  {
    totalAmount: number,        // 总投资金额（来自资产跟踪）
    assets: AssetAllocationItem[], // 资产配置列表
    lastUpdated: string          // 最后更新时间
  }
  ```
- **核心方法**：
  - `getAssets()`: 获取资产列表
  - `saveAssets(assets)`: 保存资产列表（数据持久化）
  - `getData()`: 获取完整数据
  - `setData(data)`: 保存完整数据

**数据持久化触发位置**：
- `renderer/src/components/Investment/AssetAllocationTable.tsx:95-97`
  ```typescript
  useEffect(() => {
    if (assets.length > 0) {
      investmentStorage.saveAssets(assets)
    }
  }, [assets])
  ```
  当资产列表发生变化时，自动保存到 localStorage

### 3. **资产跟踪数据** - `renderer/src/services/storage/assetTrackingStorage.ts`
- **存储键**：`wealth_asset_tracking_data`
- **数据结构**：
  ```typescript
  {
    records: MonthlyAssetRecord[],      // 月度记录列表
    adjustments: AssetAdjustment[],      // 资产调整记录
    fixedAssetAdjustments: AssetAdjustment[], // 固定资产调整记录
    lastUpdated: string                   // 最后更新时间
  }
  ```
- **核心方法**：
  - `getAllRecords()`: 获取所有月度记录
  - `setData(data)`: 保存完整数据（数据持久化）
  - `addRecord(record)`: 添加记录
  - `updateRecord(id, data)`: 更新记录
  - `deleteRecord(id)`: 删除记录

**数据持久化触发位置**：
- 添加/编辑/删除月度记录时自动保存
- 资产调整时自动保存

### 4. **计算器数据** - `renderer/src/services/storage/calculatorStorage.ts`
- **存储键**：`wealth_calculator_data`
- **数据结构**：
  ```typescript
  {
    params: InvestmentCalculatorParams, // 计算器参数
    lastUpdated: string                  // 最后更新时间
  }
  ```
- **默认参数**：
  ```typescript
  {
    principal: 10000,              // 初始本金 1万
    monthlyContribution: 1000,     // 每月投入 1千
    annualReturn: 8,              // 年化收益率 8%
    years: 10,                    // 投资年限 10年
    compoundFrequency: 12         // 复利频率（月度）
  }
  ```
- **核心方法**：
  - `getParams()`: 获取计算器参数
  - `saveParams(params)`: 保存计算器参数（数据持久化）

**数据持久化触发位置**：
- `renderer/src/components/Investment/InvestmentCalculator.tsx:24-26`
  ```typescript
  useEffect(() => {
    calculatorStorage.saveParams(params)
  }, [params])
  ```
  当计算器参数变化时，自动保存到 localStorage

### 5. **应用设置** - `renderer/src/services/storage/localStorage.ts`
- **存储键**：
  - `wealth_theme`: 主题设置
  - `wealth_language`: 语言设置
  - `wealth_currency`: 货币设置
- **核心方法**：
  - `settingsStorage.setTheme()`: 保存主题
  - `settingsStorage.setLanguage()`: 保存语言
  - `settingsStorage.setCurrency()`: 保存货币

## 默认数据

### 投资规划默认资产
应用初始化时会创建以下默认资产配置（总计100%）：

1. **股票** - 40%
   - 颜色：蓝色 (#5470c6)

2. **基金** - 30%
   - 颜色：绿色 (#91cc75)

3. **债券** - 20%
   - 颜色：黄色 (#fac858)

4. **现金** - 10%
   - 颜色：红色 (#ee6666)

### 计算器默认参数
- 初始本金：¥10,000
- 每月投入：¥1,000
- 年化收益率：8%
- 投资年限：10年

## 数据持久化流程

### 首次启动
1. 应用启动 → `main.tsx` 调用 `autoInitialize()`
2. 检查 `wealth_app_initialized` 标志
3. 如果未初始化：
   - 保存默认投资规划资产
   - 保存空的资产跟踪记录
   - 标记为已初始化

### 用户操作时的自动保存

**投资规划**：
1. 用户添加/编辑/删除资产 → `assets` 状态更新
2. `useEffect` 监听到 `assets` 变化
3. 自动调用 `investmentStorage.saveAssets(assets)`
4. 数据保存到 `localStorage['wealth_investment_data']`

**资产跟踪**：
1. 用户添加/编辑/删除月度记录
2. 直接调用 `assetTrackingStorage.setData()`
3. 数据保存到 `localStorage['wealth_asset_tracking_data']`

**计算器**：
1. 用户修改计算器参数 → `params` 状态更新
2. `useEffect` 监听到 `params` 变化
3. 自动调用 `calculatorStorage.saveParams(params)`
4. 数据保存到 `localStorage['wealth_calculator_data']`

## 数据同步

### 资产跟踪 → 投资规划
投资规划中的总投资金额从资产跟踪中实时计算获取：

**位置**：`renderer/src/components/Investment/AssetAllocationTable.tsx:40-53`

```typescript
const calculateTotalAmount = () => {
  const records = assetTrackingStorage.getAllRecords()
  const allAdjustments = assetTrackingStorage.getAllAdjustments()

  const baseInvestment = records.reduce((sum, r) => sum + r.investment, 0)
  const investmentAdjustments = allAdjustments
    .filter(a => a.type === 'investment')
    .reduce((sum, adj) => sum + adj.amount, 0)

  return baseInvestment + investmentAdjustments
}
```

**自动更新机制**：每秒检查一次总投资金额是否变化，如果变化则重新计算所有资产的计划金额和偏离度。

## 注意事项

1. **数据安全**：所有数据存储在浏览器 localStorage 中，清除浏览器数据会丢失
2. **容量限制**：localStorage 通常有 5-10MB 的存储限制
3. **数据格式**：所有数据以 JSON 格式存储
4. **首次使用**：首次打开应用会自动加载默认数据，无需手动创建
5. **数据备份**：建议用户定期使用"导出数据"功能进行备份
