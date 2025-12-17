import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/formatter';
import { generateShopSetItem, EQUIPMENT_SETS } from '../../data/equipmentSets';

// 상점 상품 목록
const SHOP_ITEMS = [
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
    id: 'stat_max_item',
    name: '완벽의 정수',
    description: '장비 옵션을 극옵으로 변경',
    icon: '⚙️',
    cost: 2000,
    weeklyLimit: 5,
    rarity: 'mythic'
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

const RARITY_COLORS = {
  common: 'border-gray-500 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-orange-500 text-orange-400',
  mythic: 'border-red-500 text-red-400'
};

// 주간 리셋 체크 (월요일 00시 기준)
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
};

const BossCoinShop = () => {
  const { gameState, setGameState, engine } = useGame();
  const { sealedZone = {} } = gameState;
  const { bossCoins = 0 } = sealedZone;
  const shopPurchases = gameState.shopPurchases || {};

  const [purchaseAmount, setPurchaseAmount] = useState({});

  // 현재 주차의 구매 횟수 가져오기
  const getWeeklyPurchased = (itemId) => {
    const weekStart = getWeekStart();
    const purchases = shopPurchases[itemId] || { count: 0, weekStart: 0 };

    // 주간 리셋 확인
    if (purchases.weekStart < weekStart) {
      return 0;
    }
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

    if (amount <= 0) {
      alert('이번 주 구매 한도에 도달했습니다!');
      return;
    }

    if (bossCoins < totalCost) {
      alert('코인이 부족합니다!');
      return;
    }

    // GameEngine 상태 직접 업데이트 (저장을 위해)
    if (engine) {
      if (!engine.state.sealedZone) {
        engine.state.sealedZone = { tickets: 0, ownedInscriptions: [], unlockedBosses: ['vecta'], unlockedInscriptionSlots: 1, bossCoins: 0 };
      }
      engine.state.sealedZone.bossCoins = (engine.state.sealedZone.bossCoins || 0) - totalCost;

      if (!engine.state.consumables) {
        engine.state.consumables = {};
      }

      // 주간 구매 기록 업데이트
      if (!engine.state.shopPurchases) {
        engine.state.shopPurchases = {};
      }
      const weekStart = getWeekStart();
      const currentPurchases = engine.state.shopPurchases[item.id] || { count: 0, weekStart: 0 };
      if (currentPurchases.weekStart < weekStart) {
        engine.state.shopPurchases[item.id] = { count: amount, weekStart };
      } else {
        engine.state.shopPurchases[item.id] = { count: currentPurchases.count + amount, weekStart };
      }

      switch (item.id) {
        case 'awakening_stone':
          engine.state.consumables.awakening_stone = (engine.state.consumables.awakening_stone || 0) + amount;
          break;
        case 'monster_selection_ticket':
          engine.state.consumables.monster_selection_ticket = (engine.state.consumables.monster_selection_ticket || 0) + amount;
          break;
        case 'stat_max_item':
          engine.state.consumables.stat_max_item = (engine.state.consumables.stat_max_item || 0) + amount;
          break;
        case 'gear_orb':
          engine.state.orbs = (engine.state.orbs || 0) + amount;
          break;
        case 'random_set_item':
          // 랜덤 세트템 생성 및 인벤토리에 추가
          if (!engine.state.newInventory) {
            engine.state.newInventory = [];
          }
          for (let i = 0; i < amount; i++) {
            const newSetItem = generateShopSetItem();
            engine.state.newInventory.push(newSetItem);
          }
          break;
      }
    }

    // 보스 코인 차감 및 아이템 지급
    setGameState(prev => {
      const weekStart = getWeekStart();
      const currentPurchases = prev.shopPurchases?.[item.id] || { count: 0, weekStart: 0 };

      const newState = {
        ...prev,
        sealedZone: {
          ...prev.sealedZone,
          bossCoins: (prev.sealedZone?.bossCoins || 0) - totalCost
        },
        shopPurchases: {
          ...prev.shopPurchases,
          [item.id]: {
            count: currentPurchases.weekStart < weekStart ? amount : currentPurchases.count + amount,
            weekStart
          }
        }
      };

      // 아이템별 처리
      switch (item.id) {
        case 'awakening_stone':
          newState.consumables = {
            ...prev.consumables,
            awakening_stone: (prev.consumables?.awakening_stone || 0) + amount
          };
          break;
        case 'monster_selection_ticket':
          newState.consumables = {
            ...prev.consumables,
            monster_selection_ticket: (prev.consumables?.monster_selection_ticket || 0) + amount
          };
          break;
        case 'stat_max_item':
          newState.consumables = {
            ...prev.consumables,
            stat_max_item: (prev.consumables?.stat_max_item || 0) + amount
          };
          break;
        case 'gear_orb':
          newState.orbs = (prev.orbs || 0) + amount;
          break;
        case 'random_set_item':
          // 랜덤 세트템은 engine에서 처리됨 (generateShopSetItem 호출)
          break;
      }

      return newState;
    });

    // 세트템 뽑기 결과 알림
    if (item.id === 'random_set_item' && engine?.state?.newInventory) {
      const recentItems = engine.state.newInventory.slice(-amount);
      const itemNames = recentItems.map(i => `${EQUIPMENT_SETS[i.setId]?.icon || '📦'} ${i.name}`).join(', ');
      alert(`🎰 세트 뽑기 결과!\n${itemNames}`);
    } else {
      alert(`${item.name} ${amount}개 구매 완료!`);
    }
    setPurchaseAmount(prev => ({ ...prev, [item.id]: 1 }));
  };

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">🪙 상점</h2>
        <div className="text-sm text-gray-300">
          보유: <span className="text-yellow-400 font-bold">🪙 {formatNumber(bossCoins)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SHOP_ITEMS.map(item => {
          const purchased = getWeeklyPurchased(item.id);
          const remaining = item.weeklyLimit - purchased;
          const amount = Math.min(purchaseAmount[item.id] || 1, Math.max(1, remaining));
          const totalCost = item.cost * amount;
          const canAfford = bossCoins >= totalCost && remaining > 0;

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
                  <span className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                    🪙 {formatNumber(totalCost)}
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
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/50 hover:scale-[1.02] active:scale-100'
                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600'
                }`}
              >
                {remaining <= 0 ? '🚫 한도 초과' : canAfford ? '🪙 구매' : '💸 코인 부족'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BossCoinShop;
