import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { ITEM_SLOT_NAMES, RARITIES } from '../../data/items';
import { EQUIPMENT_CONFIG } from '../../data/gameBalance';
import { formatNumber } from '../../utils/formatter';
import NotificationModal from '../UI/NotificationModal';

const Inventory = () => {
  const { gameState, equipItem, unequipItem, autoEquipAll, enhanceSlot, autoSellItems, updateSettings, useGearCore } = useGame();
  const { equipment, inventory, slotEnhancements = {}, player, settings = {}, gearCores = 0 } = gameState;

  // localStorage에서 마지막 선택한 레어리티 불러오기
  const [sellRarity, setSellRarity] = React.useState(() => {
    const saved = localStorage.getItem('ttmud_sellRarity');
    return saved || 'common';
  });

  // sellRarity가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('ttmud_sellRarity', sellRarity);
  }, [sellRarity]);

  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  const getEnhancementCost = (slot) => {
    const currentLevel = slotEnhancements[slot] || 0;
    return Math.floor(
      EQUIPMENT_CONFIG.enhancement.baseCost *
      Math.pow(EQUIPMENT_CONFIG.enhancement.costMultiplier, currentLevel)
    );
  };

  const handleEnhance = (slot) => {
    const result = enhanceSlot(slot);
    if (!result.success) {
      showNotification('강화 실패', result.message, 'error');
    }
  };

  const handleAutoSell = () => {
    const result = autoSellItems(sellRarity);
    if (result.success) {
      showNotification('판매 완료!', `${result.soldCount}개 아이템을 ${formatNumber(result.totalGold)} 골드에 판매했습니다!`, 'success');
    } else {
      showNotification('판매 실패', result.message, 'warning');
    }
  };

  const handleUseGearCore = (slot, statIndex) => {
    if (gearCores < 1) {
      showNotification('기어 코어 부족', '기어 코어가 없습니다', 'warning');
      return;
    }

    const result = useGearCore(slot, statIndex);
    if (result.success) {
      showNotification('⚙️ 강화 성공!', result.message, 'success');
    } else {
      showNotification('강화 실패', result.message, 'error');
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-common border-common',
      rare: 'text-rare border-rare',
      epic: 'text-epic border-epic',
      unique: 'text-unique border-unique',
      legendary: 'text-legendary border-legendary',
      mythic: 'text-mythic border-mythic',
      dark: 'text-dark border-dark'
    };
    return colors[rarity] || 'text-gray-400 border-gray-400';
  };

  const getRarityBg = (rarity) => {
    const colors = {
      common: 'bg-gray-500/10',
      rare: 'bg-blue-500/10',
      epic: 'bg-purple-500/10',
      unique: 'bg-yellow-500/10',
      legendary: 'bg-orange-500/10',
      mythic: 'bg-red-500/10',
      dark: 'bg-white/10'
    };
    return colors[rarity] || 'bg-gray-500/10';
  };

  // 슬롯별로 아이템 그룹화
  const itemsBySlot = {};
  Object.keys(ITEM_SLOT_NAMES).forEach(slot => {
    itemsBySlot[slot] = inventory
      .filter(item => item.slot === slot)
      .sort((a, b) => {
        const rarityOrder = { dark: 7, mythic: 6, legendary: 5, unique: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      });
  });

  return (
    <>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <div className="space-y-4">
      {/* 장착된 장비 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white">장착 중인 장비</h3>
          <button
            onClick={autoEquipAll}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded transition-all shadow-lg"
          >
            ⚡ 자동 장착
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(ITEM_SLOT_NAMES).map(([slot, name]) => {
            const item = equipment[slot];
            const enhancementLevel = slotEnhancements[slot] || 0;
            const enhancementCost = getEnhancementCost(slot);
            const canEnhance = enhancementLevel < EQUIPMENT_CONFIG.enhancement.maxLevel && player.gold >= enhancementCost;

            return (
              <div key={slot} className="bg-game-bg border border-game-border rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-400">{name}</p>
                  {enhancementLevel > 0 && (
                    <span className="text-[10px] text-cyan-400 font-bold">+{enhancementLevel}</span>
                  )}
                </div>
                {item ? (
                  <div className={`border-2 ${getRarityColor(item.rarity)} ${getRarityBg(item.rarity)} rounded p-1 mb-1`}>
                    <p className={`text-[10px] font-bold ${getRarityColor(item.rarity)} text-center truncate mb-1`}>
                      {RARITIES[item.rarity]?.name || ''}
                    </p>
                    <div className="text-[9px] text-gray-200 text-center space-y-0.5">
                      {item.stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-1 px-1">
                          <span className="truncate flex-1 text-left">
                            {stat.name} +{stat.value}{stat.suffix}
                          </span>
                          {gearCores > 0 && (
                            <button
                              onClick={() => handleUseGearCore(slot, idx)}
                              className="bg-orange-600 hover:bg-orange-700 text-white text-[8px] px-1 rounded"
                              title="기어 코어로 최대치 강화"
                            >
                              ⚙️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => unequipItem(slot)}
                      className="mt-1 w-full bg-red-600 hover:bg-red-700 text-white text-[10px] py-0.5 rounded"
                    >
                      해제
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-600 rounded p-2 text-center h-20 flex items-center justify-center mb-1">
                    <p className="text-gray-600 text-xs">-</p>
                  </div>
                )}
                {/* 강화 버튼 */}
                <button
                  onClick={() => handleEnhance(slot)}
                  disabled={!canEnhance}
                  className={`w-full py-0.5 rounded text-[10px] font-bold transition-all ${
                    canEnhance
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  title={`강화 비용: ${formatNumber(enhancementCost)} 골드`}
                >
                  {enhancementLevel >= EQUIPMENT_CONFIG.enhancement.maxLevel ? 'MAX' : `강화 (${formatNumber(enhancementCost)})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 인벤토리 - 슬롯별 분류 */}
      <div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">
              🎒 인벤토리 ({inventory.length})
            </h3>

            {/* 일괄 판매 */}
            <div className="flex items-center gap-2">
              <select
                value={sellRarity}
                onChange={(e) => setSellRarity(e.target.value)}
                className="px-2 py-1 bg-game-bg border border-game-border rounded text-sm text-white"
              >
                <option value="common">일반</option>
                <option value="rare">레어</option>
                <option value="epic">에픽</option>
                <option value="unique">유니크</option>
                <option value="legendary">전설</option>
                <option value="mythic">신화</option>
                <option value="dark">다크</option>
              </select>
              <button
                onClick={handleAutoSell}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded transition-all shadow-lg"
              >
                💰 일괄 판매
              </button>
            </div>
          </div>

          {/* 자동 판매 설정 */}
          <div className="bg-game-bg border border-game-border rounded p-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSellEnabled || false}
                  onChange={(e) => updateSettings({ autoSellEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-white font-bold">⚙️ 자동 판매</span>
              </label>
              <select
                value={settings.autoSellRarity || 'common'}
                onChange={(e) => updateSettings({ autoSellRarity: e.target.value })}
                disabled={!settings.autoSellEnabled}
                className="px-2 py-1 bg-game-panel border border-game-border rounded text-xs text-white disabled:opacity-50"
              >
                <option value="common">일반</option>
                <option value="rare">레어</option>
                <option value="epic">에픽</option>
                <option value="unique">유니크</option>
                <option value="legendary">전설</option>
                <option value="mythic">신화</option>
                <option value="dark">다크</option>
              </select>
              <span className="text-xs text-gray-400">이하 아이템 자동 판매</span>
            </div>
          </div>
        </div>

        {inventory.length === 0 ? (
          <div className="bg-game-bg border border-game-border rounded p-8 text-center">
            <p className="text-gray-500">인벤토리가 비어있습니다</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {Object.entries(ITEM_SLOT_NAMES).map(([slot, slotName]) => {
              const items = itemsBySlot[slot];
              if (items.length === 0) return null;

              return (
                <div key={slot} className="bg-game-bg border border-game-border rounded p-3">
                  <h4 className="text-sm font-bold text-cyan-400 mb-2">
                    {slotName} ({items.length})
                  </h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className={`border-2 ${getRarityColor(item.rarity)} ${getRarityBg(item.rarity)} rounded p-1 cursor-pointer hover:scale-105 transition-all min-h-[88px] flex flex-col`}
                        onClick={() => equipItem(item)}
                        title={`${item.name} - 클릭하여 장착`}
                      >
                        <p className={`text-[10px] font-bold ${getRarityColor(item.rarity)} text-center mb-1`}>
                          {RARITIES[item.rarity]?.name || ''}
                        </p>
                        <div className="text-[9px] text-gray-200 text-center space-y-0.5 flex-1 overflow-hidden">
                          {item.stats.map((stat, idx) => (
                            <div key={idx} className="truncate">
                              {stat.name} +{stat.value}{stat.suffix}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Inventory;
