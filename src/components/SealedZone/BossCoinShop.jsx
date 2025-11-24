import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/formatter';

// 보스 코인 상점 상품 목록
const SHOP_ITEMS = [
  {
    id: 'monster_selection_ticket',
    name: '몬스터 도감 선택권',
    description: '원하는 몬스터를 선택하여 도감에 등록',
    icon: '📜',
    cost: 1000,
    maxPurchase: 999,
    rarity: 'legendary'
  },
  {
    id: 'stat_max_item',
    name: '완벽의 정수',
    description: '장비의 현재 옵션을 최대치로 고정',
    icon: '🔷',
    cost: 2000,
    maxPurchase: 99,
    rarity: 'mythic'
  },
  {
    id: 'gear_orb',
    name: '장비 오브',
    description: '장비 옵션을 재굴림',
    icon: '🔮',
    cost: 500,
    maxPurchase: 999,
    rarity: 'epic'
  },
  {
    id: 'gear_core',
    name: '기어 코어',
    description: '장비 옵션을 최대치로 강화',
    icon: '⚙️',
    cost: 800,
    maxPurchase: 999,
    rarity: 'epic'
  }
];

const RARITY_COLORS = {
  common: 'border-gray-500 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-orange-500 text-orange-400',
  mythic: 'border-red-500 text-red-400'
};

const BossCoinShop = () => {
  const { gameState, setGameState } = useGame();
  const { sealedZone = {} } = gameState;
  const { bossCoins = 0 } = sealedZone;

  const [purchaseAmount, setPurchaseAmount] = useState({});

  // 구매 수량 변경
  const handleAmountChange = (itemId, value) => {
    setPurchaseAmount(prev => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(value, 99))
    }));
  };

  // 아이템 구매
  const purchaseItem = (item) => {
    const amount = purchaseAmount[item.id] || 1;
    const totalCost = item.cost * amount;

    if (bossCoins < totalCost) {
      alert('보스 코인이 부족합니다!');
      return;
    }

    // 보스 코인 차감 및 아이템 지급
    setGameState(prev => {
      const newState = {
        ...prev,
        sealedZone: {
          ...prev.sealedZone,
          bossCoins: prev.sealedZone.bossCoins - totalCost
        }
      };

      // 아이템별 처리
      switch (item.id) {
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
        case 'gear_core':
          newState.gearCores = (prev.gearCores || 0) + amount;
          break;
      }

      return newState;
    });

    alert(`${item.name} ${amount}개를 구매했습니다!`);
  };

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">🪙 보스 코인 상점</h2>
        <div className="text-sm text-gray-300">
          보유 코인: <span className="text-yellow-400 font-bold">{formatNumber(bossCoins)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHOP_ITEMS.map(item => {
          const amount = purchaseAmount[item.id] || 1;
          const totalCost = item.cost * amount;
          const canAfford = bossCoins >= totalCost;

          return (
            <div
              key={item.id}
              className={`bg-gray-800 border-2 ${RARITY_COLORS[item.rarity]} rounded-lg p-4`}
            >
              {/* 아이템 헤더 */}
              <div className="flex items-center mb-3">
                <div className="text-4xl mr-3">{item.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${RARITY_COLORS[item.rarity]}`}>
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>

              {/* 가격 및 수량 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">수량:</span>
                  <input
                    type="number"
                    min="1"
                    max={item.maxPurchase}
                    value={amount}
                    onChange={(e) => handleAmountChange(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center text-white"
                  />
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">총 가격</div>
                  <div className={`text-lg font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                    🪙 {formatNumber(totalCost)}
                  </div>
                </div>
              </div>

              {/* 구매 버튼 */}
              <button
                onClick={() => purchaseItem(item)}
                disabled={!canAfford}
                className={`w-full py-2 rounded font-bold transition-colors ${
                  canAfford
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canAfford ? '구매하기' : '코인 부족'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BossCoinShop;
