/**
 * 投资记录数据导入脚本
 *
 * 使用方法：
 * 1. 准备您的JSON数据
 * 2. 修改下面的 jsonData 变量
 * 3. 在浏览器控制台执行此脚本
 */

(function() {
  const storageKey = 'wealth_investment_record_data';

  // ⚠️ 在这里粘贴您的JSON数据
  const jsonData = {
    "cards": [
      // 您的卡片数据...
    ],
    "lastUpdated": new Date().toISOString()
  };

  // 验证数据格式
  if (!jsonData.cards || !Array.isArray(jsonData.cards)) {
    console.error('❌ 数据格式错误：缺少 cards 数组');
    return;
  }

  // 备份现有数据
  const existingData = localStorage.getItem(storageKey);
  if (existingData) {
    const backupKey = `${storageKey}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, existingData);
    console.log('💾 现有数据已备份到：', backupKey);
  }

  // 保存新数据
  try {
    localStorage.setItem(storageKey, JSON.stringify(jsonData));
    console.log('✅ 数据导入成功！');
    console.log('📊 导入概览：', {
      卡片数量: jsonData.cards.length,
      总记录行数: jsonData.cards.reduce((sum, card) => sum + (card.rows?.length || 0), 0),
      最后更新: jsonData.lastUpdated
    });

    // 自动刷新页面
    setTimeout(() => {
      console.log('🔄 3秒后自动刷新页面...');
      location.reload();
    }, 3000);
  } catch (error) {
    console.error('❌ 导入失败：', error);
  }
})();
