/**
 * 投资记录数据导出脚本
 *
 * 在浏览器控制台中执行此脚本即可导出数据
 */

// 导出投资记录数据到JSON文件
(function() {
  const storageKey = 'wealth_investment_record_data';
  const data = localStorage.getItem(storageKey);

  if (!data) {
    console.log('❌ 没有找到投资记录数据');
    return;
  }

  try {
    const parsedData = JSON.parse(data);

    // 创建下载链接
    const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investment-record-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ 投资记录数据已导出！');
    console.log('📊 数据概览：', {
      卡片数量: parsedData.cards.length,
      总记录行数: parsedData.cards.reduce((sum, card) => sum + card.rows.length, 0),
      最后更新: parsedData.lastUpdated
    });
  } catch (error) {
    console.error('❌ 导出失败：', error);
  }
})();

// 导出当前数据到控制台（可直接复制）
console.log('📋 当前数据预览：');
console.log(JSON.parse(localStorage.getItem('wealth_investment_record_data')));
