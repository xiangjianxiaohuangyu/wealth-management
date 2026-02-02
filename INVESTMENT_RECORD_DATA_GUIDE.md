# 投资记录数据存储说明

## 📍 数据存储位置

投资记录数据**不是存储在文件中**，而是存储在**浏览器的 localStorage** 中。

### 存储信息
- **存储方式：** `localStorage`（浏览器本地存储）
- **存储键名：** `wealth_investment_record_data`
- **数据格式：** JSON 字符串
- **存储位置：** 浏览器 Application → Local Storage

---

## 📤 导出数据

### 方法一：使用导出脚本（推荐）

1. 打开投资记录页面
2. 按 `F12` 打开开发者工具
3. 切换到 `Console` 标签
4. 复制并执行 `scripts/export-investment-record.js` 中的代码
5. 数据会自动下载为 JSON 文件

**快速导出命令：**
```javascript
// 一行命令导出
fetch('file:///path/to/scripts/export-investment-record.js')
  .then(r => r.text())
  .then(eval)
```

### 方法二：手动导出

1. 按 `F12` 打开开发者工具
2. 进入 `Application` → `Local Storage`
3. 找到 `wealth_investment_record_data`
4. 双击值并复制
5. 粘贴到文本编辑器保存为 `.json` 文件

---

## 📥 导入数据

### 方法一：使用导入脚本

1. 打开投资记录页面
2. 按 `F12` 打开控制台
3. 修改 `scripts/import-investment-record.js` 中的 `jsonData`
4. 粘贴您的数据并执行脚本

### 方法二：直接导入

```javascript
// 1. 准备您的JSON数据
const myData = {
  "cards": [ /* 您的卡片数据 */ ],
  "lastUpdated": new Date().toISOString()
};

// 2. 保存到 localStorage
localStorage.setItem('wealth_investment_record_data', JSON.stringify(myData));

// 3. 刷新页面
location.reload();
```

---

## 🔍 查看当前数据

### 在控制台中查看

```javascript
// 查看原始数据
console.log(JSON.parse(localStorage.getItem('wealth_investment_record_data')));

// 查看数据概览
const data = JSON.parse(localStorage.getItem('wealth_investment_record_data'));
console.log('📊 数据概览：');
console.log('卡片数量:', data.cards.length);
console.log('总记录行数:', data.cards.reduce((sum, card) => sum + card.rows.length, 0));
data.cards.forEach(card => {
  console.log(`- ${card.name}: ${card.rows.length} 行`);
});
```

---

## 💾 数据备份建议

### 自动备份（推荐添加）

由于 localStorage 数据可能因以下原因丢失：
- 清除浏览器缓存
- 隐私模式浏览
- 更换浏览器/电脑

建议定期导出备份。

### 定期备份脚本

```javascript
// 每次打开投资记录页面时自动备份
(function() {
  const storageKey = 'wealth_investment_record_data';
  const data = localStorage.getItem(storageKey);

  if (data) {
    const backupKey = `${storageKey}_backup_${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(backupKey, data);
    console.log('✅ 自动备份已完成：', backupKey);
  }
})();
```

---

## 🗑️ 清除数据

### 清除所有投资记录数据

```javascript
// ⚠️ 警告：此操作不可逆
if (confirm('确定要清除所有投资记录数据吗？')) {
  localStorage.removeItem('wealth_investment_record_data');
  location.reload();
}
```

### 清除所有备份

```javascript
// 清除所有备份（保留主数据）
Object.keys(localStorage)
  .filter(key => key.startsWith('wealth_investment_record_data_backup_'))
  .forEach(key => localStorage.removeItem(key));
console.log('✅ 所有备份已清除');
```

---

## 📋 数据格式示例

```json
{
  "cards": [
    {
      "id": "card-xxx",
      "name": "上证50",
      "rows": [
        {
          "id": "row-xxx",
          "startPoint": 4200,
          "endPoint": 4100,
          "plannedPercentage": 0.5,
          "actualAmount": 0,
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": "2025-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "lastUpdated": "2025-01-01T00:00:00.000Z"
}
```

---

## 🔧 故障排除

### 问题1：数据丢失

**原因：**
- 清除了浏览器缓存
- 使用了隐私/无痕模式
- 更换了浏览器

**解决方案：**
- 从备份文件导入
- 定期导出数据备份

### 问题2：数据格式错误

**症状：**
- 页面显示异常
- 数据无法加载

**解决方案：**
```javascript
// 验证数据格式
const data = localStorage.getItem('wealth_investment_record_data');
try {
  JSON.parse(data);
  console.log('✅ 数据格式正确');
} catch (e) {
  console.error('❌ 数据格式错误：', e);
}
```

### 问题3：查看备份数据

```javascript
// 列出所有备份
Object.keys(localStorage)
  .filter(key => key.includes('wealth_investment_record_data'))
  .forEach(key => {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(`📦 ${key}:`, {
      卡片数: data.cards?.length || 0,
      行数: data.cards?.reduce((sum, c) => sum + (c.rows?.length || 0), 0) || 0
    });
  });
```

---

## 📞 帮助脚本位置

- **导出脚本：** `scripts/export-investment-record.js`
- **导入脚本：** `scripts/import-investment-record.js`
- **示例数据：** `investment-record-sample-data.json`
