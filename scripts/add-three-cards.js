/**
 * 添加三张新投资记录卡片
 *
 * 纳斯达克、黄金、BTC（保留上证50）
 */

(function() {
  const storageKey = 'wealth_investment_record_data';

  // 获取现有数据
  const existingData = localStorage.getItem(storageKey);
  let existingCards = [];

  if (existingData) {
    try {
      const parsed = JSON.parse(existingData);
      existingCards = parsed.cards || [];
      console.log('📦 现有卡片：', existingCards.map(c => c.name));
    } catch (e) {
      console.error('❌ 读取现有数据失败：', e);
    }
  }

  // 生成纳斯达克卡片（9行）
  const nasdaqRows = [];
  const nasdaqPercentages = [0.5, 0.5, 0.5, 0.5, 1, 1, 1, 2, 3]; // 9个比例

  for (let i = 0; i < 9; i++) {
    const startPoint = 24000 - (i * 1000);
    const endPoint = startPoint - 1000;
    const percentage = nasdaqPercentages[i];

    nasdaqRows.push({
      id: `row-nasdaq-${String(i + 1).padStart(3, '0')}`,
      startPoint: startPoint,
      endPoint: endPoint,
      plannedPercentage: percentage,
      actualAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 生成黄金卡片（6行）
  const goldRows = [];
  const goldPercentages = [0.5, 1, 1.5, 2, 2, 3]; // 6个比例

  for (let i = 0; i < 6; i++) {
    const startPoint = 1100 - (i * 100);
    const endPoint = startPoint - 100;
    const percentage = goldPercentages[i];

    goldRows.push({
      id: `row-gold-${String(i + 1).padStart(3, '0')}`,
      startPoint: startPoint,
      endPoint: endPoint,
      plannedPercentage: percentage,
      actualAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 生成BTC卡片（6行）
  const btcRows = [];
  const btcPercentages = [0.5, 0.5, 1, 2, 3, 3]; // 6个比例

  for (let i = 0; i < 6; i++) {
    const startPoint = 100 - (i * 10);
    const endPoint = startPoint - 10;
    const percentage = btcPercentages[i];

    btcRows.push({
      id: `row-btc-${String(i + 1).padStart(3, '0')}`,
      startPoint: startPoint,
      endPoint: endPoint,
      plannedPercentage: percentage,
      actualAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 创建新卡片
  const now = new Date().toISOString();
  const newCards = [
    {
      id: `card-nasdaq-${Date.now()}`,
      name: '纳斯达克',
      rows: nasdaqRows,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `card-gold-${Date.now() + 1}`,
      name: '黄金',
      rows: goldRows,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `card-btc-${Date.now() + 2}`,
      name: 'BTC',
      rows: btcRows,
      createdAt: now,
      updatedAt: now
    }
  ];

  // 合并现有卡片和新卡片
  const allCards = [...existingCards, ...newCards];

  // 保存到 localStorage
  const data = {
    cards: allCards,
    lastUpdated: now
  };

  localStorage.setItem(storageKey, JSON.stringify(data));

  // 输出结果
  console.log('✅ 新卡片添加成功！');
  console.log('');
  console.log('📊 纳斯达克（9行）：');
  console.log('   起始：24000 → 终点：15000（递减1000）');
  console.log('   比例：4个0.5%、3个1%、1个2%、1个3%');
  console.log('   总比例：10%');
  console.log('');
  console.log('📊 黄金（6行）：');
  console.log('   起始：1100 → 终点：500（递减100）');
  console.log('   比例：1个0.5%、1个1%、1个1.5%、2个2%、1个3%');
  console.log('   总比例：10%');
  console.log('');
  console.log('📊 BTC（6行）：');
  console.log('   起始：100 → 终点：40（递减10）');
  console.log('   比例：2个0.5%、1个1%、1个2%、2个3%');
  console.log('   总比例：10%');
  console.log('');
  console.log('📈 总计卡片数：', allCards.length);
  console.log('📋 总记录行数：', allCards.reduce((sum, card) => sum + card.rows.length, 0));
  console.log('');
  console.log('🔄 2秒后自动刷新页面...');

  setTimeout(() => {
    location.reload();
  }, 2000);
})();
