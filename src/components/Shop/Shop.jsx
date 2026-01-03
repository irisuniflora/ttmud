import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/formatter';
import { generateShopSetItem, EQUIPMENT_SETS } from '../../data/equipmentSets';

// 코인 상점 아이템
const COIN_SHOP_ITEMS = [
  {
    id: 'awakening_stone',
    name: '각성석',
    description: '장비 업그레이드 횟수 복구',
    icon: '✨',
    cost: 3000,
    weeklyLimit: 5,
    rarity: 'epic'
  },
  {
    id: 'monster_selection_ticket',
    name: '도감 선택권',
    description: '원하는 몬스터를 도감에 등록',
    icon: '📜',
    cost: 1000,
    weeklyLimit: 1,
    rarity: 'legendary'
  },
  {
    id: 'seal_stone',
    name: '봉인석',
    description: '재굴림 시 옵션 잠금',
    icon: '🔒',
    cost: 1500,
    weeklyLimit: 10,
    rarity: 'epic'
  },
  {
    id: 'gear_orb',
    name: '카르마 오브',
    description: '장비 옵션 재굴림',
    icon: '🔮',
    cost: 500,
    weeklyLimit: 10,
    rarity: 'epic'
  },
  {
    id: 'random_set_item',
    name: '랜덤 세트 뽑기',
    description: '랜덤 세트템 1개 (Lv.10 고정)',
    icon: '🎰',
    cost: 5000,
    weeklyLimit: 3,
    rarity: 'legendary',
    isGacha: true
  }
];

// 골드 상점 아이템
const GOLD_SHOP_ITEMS = [
  {
    id: 'gold_gear_orb',
    name: '카르마 오브',
    description: '장비 옵션 재굴림',
    icon: '🔮',
    cost: 100000,
    weeklyLimit: 5,
    rarity: 'rare'
  },
  {
    id: 'gold_skill_point',
    name: '스킬 포인트',
    description: '스킬 레벨업에 사용',
    icon: '📘',
    cost: 50000,
    weeklyLimit: 10,
    rarity: 'rare'
  },
  {
    id: 'gold_raid_ticket',
    name: '봉인구역 도전권',
    description: '봉인구역 입장 티켓',
    icon: '🎫',
    cost: 200000,
    weeklyLimit: 3,
    rarity: 'epic'
  }
];

// 다이아 상점 아이템 (프리미엄)
const DIAMOND_SHOP_ITEMS = [
  {
    id: 'diamond_auto_progress',
    name: '자동 진행 티켓',
    description: '1시간 자동 진행 보상',
    icon: '⏰',
    cost: 50,
    weeklyLimit: 7,
    rarity: 'epic'
  },
  {
    id: 'diamond_gold_boost',
    name: '골드 부스터',
    description: '1시간 골드 2배',
    icon: '💰',
    cost: 30,
    weeklyLimit: 14,
    rarity: 'rare'
  },
  {
    id: 'diamond_exp_boost',
    name: '경험치 부스터',
    description: '1시간 경험치 2배',
    icon: '✨',
    cost: 30,
    weeklyLimit: 14,
    rarity: 'rare'
  },
  {
    id: 'diamond_legendary_ticket',
    name: '전설 소환권',
    description: '전설 몬스터 즉시 획득',
    icon: '🌟',
    cost: 200,
    weeklyLimit: 1,
    rarity: 'legendary'
  },
  {
    id: 'diamond_premium_set',
    name: '프리미엄 세트 상자',
    description: '유니크 이상 세트템 보장',
    icon: '🎁',
    cost: 150,
    weeklyLimit: 3,
    rarity: 'mythic'
  }
];

const RARITY_COLORS = {
  common: 'border-gray-500 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-orange-500 text-orange-400',
  mythic: 'border-red-500 text-red-400'
};

const SHOP_TABS = [
  { id: 'coin', name: '코인 상점', icon: '🪙', currency: 'bossCoins', currencyName: '코인' },
  { id: 'gold', name: '골드 상점', icon: '💰', currency: 'gold', currencyName: '골드' },
  { id: 'diamond', name: '다이아 상점', icon: '💎', currency: 'diamonds', currencyName: '다이아' }
];

// 주간 리셋 체크 (월요일 00시 기준)
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
};

const Shop = () => {
  const { gameState, setGameState, engine } = useGame();
  const [activeShop, setActiveShop] = useState('coin');
  const [purchaseAmount, setPurchaseAmount] = useState({});

  const { sealedZone = {}, player = {} } = gameState;
  const bossCoins = sealedZone.bossCoins || 0;
  const gold = player.gold || 0;
  const diamonds = gameState.diamonds || 0;
  const shopPurchases = gameState.shopPurchases || {};

  // 현재 탭의 재화량 가져오기
  const getCurrentCurrency = () => {
    const tab = SHOP_TABS.find(t => t.id === activeShop);
    switch (tab.currency) {
      case 'bossCoins': return bossCoins;
      case 'gold': return gold;
      case 'diamonds': return diamonds;
      default: return 0;
    }
  };

  // 현재 탭의 아이템 가져오기
  const getCurrentItems = () => {
    switch (activeShop) {
      case 'coin': return COIN_SHOP_ITEMS;
      case 'gold': return GOLD_SHOP_ITEMS;
      case 'diamond': return DIAMOND_SHOP_ITEMS;
      default: return [];
    }
  };

  // 주간 구매 횟수 가져오기
  const getWeeklyPurchased = (itemId) => {
    const weekStart = getWeekStart();
    const purchases = shopPurchases[itemId] || { count: 0, weekStart: 0 };
    if (purchases.weekStart < weekStart) return 0;
    return purchases.count;
  };

  // 구매 수량 변경
  const handleAmountChange = (itemId, value, weeklyLimit) => {
    const purchased = getWeeklyPurchased(itemId);
    const remaining = weeklyLimit - purchased;
    setPurchaseAmount(prev => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(value, remaining))
    }));
  };

  // 아이템 구매
  const purchaseItem = (item) => {
    const purchased = getWeeklyPurchased(item.id);
    const remaining = item.weeklyLimit - purchased;
    const amount = Math.min(purchaseAmount[item.id] || 1, remaining);
    const totalCost = item.cost * amount;
    const currentCurrency = getCurrentCurrency();
    const tab = SHOP_TABS.find(t => t.id === activeShop);

    if (amount <= 0) {
      alert('이번 주 구매 한도에 도달했습니다!');
      return;
    }

    if (currentCurrency < totalCost) {
      alert(`${tab.currencyName}이(가) 부족합니다!`);
      return;
    }

    // GameEngine 상태 업데이트
    if (engine) {
      // 재화 차감
      switch (tab.currency) {
        case 'bossCoins':
          if (!engine.state.sealedZone) {
            engine.state.sealedZone = { tickets: 0, bossCoins: 0 };
          }
          engine.state.sealedZone.bossCoins = (engine.state.sealedZone.bossCoins || 0) - totalCost;
          break;
        case 'gold':
          engine.state.player.gold = (engine.state.player.gold || 0) - totalCost;
          break;
        case 'diamonds':
          engine.state.diamonds = (engine.state.diamonds || 0) - totalCost;
          break;
      }

      if (!engine.state.consumables) engine.state.consumables = {};
      if (!engine.state.shopPurchases) engine.state.shopPurchases = {};

      // 주간 구매 기록
      const weekStart = getWeekStart();
      const currentPurchases = engine.state.shopPurchases[item.id] || { count: 0, weekStart: 0 };
      engine.state.shopPurchases[item.id] = {
        count: currentPurchases.weekStart < weekStart ? amount : currentPurchases.count + amount,
        weekStart
      };

      // 아이템별 처리
      switch (item.id) {
        case 'awakening_stone':
        case 'monster_selection_ticket':
        case 'seal_stone':
          engine.state.consumables[item.id] = (engine.state.consumables[item.id] || 0) + amount;
          break;
        case 'gear_orb':
        case 'gold_gear_orb':
          engine.state.orbs = (engine.state.orbs || 0) + amount;
          break;
        case 'gold_skill_point':
          engine.state.player.skillPoints = (engine.state.player.skillPoints || 0) + amount;
          break;
        case 'gold_raid_ticket':
          if (!engine.state.sealedZone) engine.state.sealedZone = {};
          engine.state.sealedZone.tickets = (engine.state.sealedZone.tickets || 0) + amount;
          break;
        case 'random_set_item':
          if (!engine.state.newInventory) engine.state.newInventory = [];
          for (let i = 0; i < amount; i++) {
            engine.state.newInventory.push(generateShopSetItem());
          }
          break;
        case 'diamond_auto_progress':
        case 'diamond_gold_boost':
        case 'diamond_exp_boost':
        case 'diamond_legendary_ticket':
        case 'diamond_premium_set':
          engine.state.consumables[item.id] = (engine.state.consumables[item.id] || 0) + amount;
          break;
      }
    }

    // React 상태 업데이트
    setGameState(prev => {
      const weekStart = getWeekStart();
      const currentPurchases = prev.shopPurchases?.[item.id] || { count: 0, weekStart: 0 };
      const tab = SHOP_TABS.find(t => t.id === activeShop);

      const newState = {
        ...prev,
        shopPurchases: {
          ...prev.shopPurchases,
          [item.id]: {
            count: currentPurchases.weekStart < weekStart ? amount : currentPurchases.count + amount,
            weekStart
          }
        }
      };

      // 재화 차감
      switch (tab.currency) {
        case 'bossCoins':
          newState.sealedZone = {
            ...prev.sealedZone,
            bossCoins: (prev.sealedZone?.bossCoins || 0) - totalCost
          };
          break;
        case 'gold':
          newState.player = {
            ...prev.player,
            gold: (prev.player?.gold || 0) - totalCost
          };
          break;
        case 'diamonds':
          newState.diamonds = (prev.diamonds || 0) - totalCost;
          break;
      }

      // 아이템별 처리
      switch (item.id) {
        case 'awakening_stone':
        case 'monster_selection_ticket':
        case 'seal_stone':
        case 'diamond_auto_progress':
        case 'diamond_gold_boost':
        case 'diamond_exp_boost':
        case 'diamond_legendary_ticket':
        case 'diamond_premium_set':
          newState.consumables = {
            ...prev.consumables,
            [item.id]: (prev.consumables?.[item.id] || 0) + amount
          };
          break;
        case 'gear_orb':
        case 'gold_gear_orb':
          newState.orbs = (prev.orbs || 0) + amount;
          break;
        case 'gold_skill_point':
          newState.player = {
            ...newState.player,
            skillPoints: (prev.player?.skillPoints || 0) + amount
          };
          break;
        case 'gold_raid_ticket':
          newState.sealedZone = {
            ...newState.sealedZone,
            tickets: (prev.sealedZone?.tickets || 0) + amount
          };
          break;
      }

      return newState;
    });

    // 세트템 결과 알림
    if (item.id === 'random_set_item' && engine?.state?.newInventory) {
      const recentItems = engine.state.newInventory.slice(-amount);
      const itemNames = recentItems.map(i => `${EQUIPMENT_SETS[i.setId]?.icon || '📦'} ${i.name}`).join(', ');
      alert(`🎰 세트 뽑기 결과!\n${itemNames}`);
    } else {
      alert(`${item.name} ${amount}개 구매 완료!`);
    }
    setPurchaseAmount(prev => ({ ...prev, [item.id]: 1 }));
  };

  const currentTab = SHOP_TABS.find(t => t.id === activeShop);
  const currentCurrency = getCurrentCurrency();
  const items = getCurrentItems();

  return (
    <div className="space-y-4">
      {/* 상점 탭 */}
      <div className="flex gap-2">
        {SHOP_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveShop(tab.id)}
            className={`px-4 py-2 rounded font-bold transition-all ${
              activeShop === tab.id
                ? tab.id === 'coin' ? 'bg-yellow-600 text-white'
                : tab.id === 'gold' ? 'bg-amber-600 text-white'
                : 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* 보유 재화 */}
      <div className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2">
        <span className="text-gray-400">보유 {currentTab.currencyName}</span>
        <span className={`font-bold text-lg ${
          activeShop === 'coin' ? 'text-yellow-400'
          : activeShop === 'gold' ? 'text-amber-400'
          : 'text-cyan-400'
        }`}>
          {currentTab.icon} {formatNumber(currentCurrency)}
        </span>
      </div>

      {/* 아이템 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(item => {
          const purchased = getWeeklyPurchased(item.id);
          const remaining = item.weeklyLimit - purchased;
          const amount = Math.min(purchaseAmount[item.id] || 1, Math.max(1, remaining));
          const totalCost = item.cost * amount;
          const canAfford = currentCurrency >= totalCost && remaining > 0;

          return (
            <div
              key={item.id}
              className={`bg-gray-800 border ${RARITY_COLORS[item.rarity]} rounded-lg p-3`}
            >
              {/* 아이템 헤더 */}
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold truncate ${RARITY_COLORS[item.rarity]}`}>
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 truncate">{item.description}</p>
                </div>
              </div>

              {/* 주간 한도 */}
              <div className="text-[10px] text-gray-500 mb-2">
                주간: <span className={remaining > 0 ? 'text-green-400' : 'text-red-400'}>{purchased}/{item.weeklyLimit}</span>
              </div>

              {/* 수량 선택 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-gray-400">수량:</span>
                <input
                  type="number"
                  min="1"
                  max={remaining}
                  value={amount}
                  onChange={(e) => handleAmountChange(item.id, parseInt(e.target.value) || 1, item.weeklyLimit)}
                  disabled={remaining <= 0}
                  className="w-12 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-center text-white text-xs"
                />
                <div className="flex-1 text-right">
                  <span className={`text-xs font-bold ${canAfford ? (
                    activeShop === 'coin' ? 'text-yellow-400'
                    : activeShop === 'gold' ? 'text-amber-400'
                    : 'text-cyan-400'
                  ) : 'text-red-400'}`}>
                    {currentTab.icon} {formatNumber(totalCost)}
                  </span>
                </div>
              </div>

              {/* 구매 버튼 */}
              <button
                onClick={() => purchaseItem(item)}
                disabled={!canAfford}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  remaining <= 0
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600'
                    : canAfford
                    ? activeShop === 'coin'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg'
                      : activeShop === 'gold'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white shadow-lg'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600'
                }`}
              >
                {remaining <= 0 ? '🚫 한도 초과' : canAfford ? '구매' : '재화 부족'}
              </button>
            </div>
          );
        })}
      </div>

      {/* 다이아 충전 안내 (다이아 상점에서만) */}
      {activeShop === 'diamond' && (
        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-sm">
            💎 다이아몬드는 게임 내 특별 이벤트나 업적으로 획득할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
};

export default Shop;
