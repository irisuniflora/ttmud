import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { ITEM_SLOT_NAMES, RARITIES, STAT_RANGES, DAMAGE_STATS, UTILITY_STATS, calculateStatPercentage, getStatColorByPercentage, getItemPrice, getDiamondGrade, getDiamondColor } from '../../data/items';
import { EQUIPMENT_CONFIG } from '../../data/gameBalance';
import { formatNumber, formatStatValue } from '../../utils/formatter';
import NotificationModal from '../UI/NotificationModal';

// 슬롯별 아이콘
const SLOT_ICONS = {
  weapon: '⚔️',
  armor: '🛡️',
  gloves: '🧤',
  boots: '👢',
  necklace: '📿',
  ring: '💍'
};

const Equipment = () => {
  const { gameState, unequipItem, enhanceSlot, usePerfectEssence, useOrb, equipItem, autoEquipAll, autoSellItems, sellItem, updateSettings } = useGame();
  const { equipment, slotEnhancements = {}, player, orbs = 0, inventory = [], settings = {}, consumables = {} } = gameState;

  const [sellRarity, setSellRarity] = React.useState(() => {
    const saved = localStorage.getItem('ttmud_sellRarity');
    return saved || 'common';
  });

  React.useEffect(() => {
    localStorage.setItem('ttmud_sellRarity', sellRarity);
  }, [sellRarity]);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [sellPopup, setSellPopup] = useState(null); // { x, y, gold, id }

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

  const getEnhancementSuccessRate = (slot) => {
    const currentLevel = slotEnhancements[slot] || 0;
    const { baseSuccessRate, successRateDecayPerLevel, minSuccessRate } = EQUIPMENT_CONFIG.enhancement;
    return Math.max(
      minSuccessRate,
      baseSuccessRate - (currentLevel * successRateDecayPerLevel)
    );
  };

  const getEnhancementGlow = (level) => {
    // 강화 수치 효과 비활성화
    return '';
  };

  const handleEnhance = (slot) => {
    const result = enhanceSlot(slot);
    if (result.success) {
      // 20강 이상에서만 성공 메시지 표시
      if (result.newLevel >= 20) {
        showNotification('✨ 강화 성공!', `+${result.newLevel} 달성! (확률: ${result.successRate.toFixed(1)}%)`, 'success');
      }
    } else {
      // 20강 이상에서만 실패 메시지 표시
      const currentLevel = slotEnhancements[slot] || 0;
      if (currentLevel >= 19) {
        showNotification('💔 강화 실패', `${result.message} (확률: ${result.successRate.toFixed(1)}%)`, 'warning');
      }
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

  const handleUsePerfectEssence = (slot, statIndex) => {
    const essenceCount = consumables.stat_max_item || 0;
    if (essenceCount < 1) {
      showNotification('완벽의 정수 부족', '완벽의 정수가 없습니다', 'warning');
      return;
    }

    const result = usePerfectEssence(slot, statIndex);
    if (result.success) {
      showNotification('⚙️ 극옵화 성공!', result.message, 'success');
    } else {
      showNotification('극옵화 실패', result.message, 'error');
    }
  };

  const handleUseOrb = (slot) => {
    if (orbs < 1) {
      showNotification('오브 부족', '오브가 없습니다', 'warning');
      return;
    }

    if (!equipment[slot]) {
      showNotification('장비 없음', '해당 슬롯에 장착된 장비가 없습니다', 'warning');
      return;
    }

    const result = useOrb(slot);
    if (result.success) {
      showNotification('🔮 재조정 완료!', result.message, 'success');
    } else {
      showNotification('재조정 실패', result.message, 'error');
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
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">⚔️ 장착 중인 장비</h3>
            <span className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
              장비옵션 예시 : <span className="text-yellow-400">0.5%</span><span className="text-green-400">(+0.3%)</span> <span className="text-gray-500">[80%]</span> = 기본값 <span className="text-green-400">(+강화)</span> <span className="text-gray-500">[완성도]</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={autoEquipAll}
              className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded transition-all shadow-lg text-sm"
              title="모든 슬롯에 최적 장비 장착"
            >
              ⚡ 자동 장착
            </button>
            <button
              onClick={() => setShowInfoModal(true)}
              className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded transition-all shadow-lg text-sm"
              title="장비 정보 보기"
            >
              📊 장비 정보
            </button>
          </div>
        </div>

        {/* 장비 슬롯 */}
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(ITEM_SLOT_NAMES).map(([slot, name]) => {
            const item = equipment[slot];
            const enhancementLevel = slotEnhancements[slot] || 0;
            const enhancementCost = getEnhancementCost(slot);
            const successRate = getEnhancementSuccessRate(slot);
            const canEnhance = player && player.gold >= enhancementCost;
            const glowClass = getEnhancementGlow(enhancementLevel);

            return (
              <div key={slot} className="bg-game-panel border border-game-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{SLOT_ICONS[slot]}</span>
                    <p className="text-sm text-gray-300 font-semibold">{name}</p>
                  </div>
                  {enhancementLevel > 0 && (
                    <span className="text-xs text-cyan-400 font-bold">+{enhancementLevel}</span>
                  )}
                </div>

                {item ? (
                  <div className={`border-2 ${getRarityColor(item.rarity)} ${getRarityBg(item.rarity)} ${glowClass} rounded p-2 mb-2 transition-all duration-300`}>
                    <p className={`text-xs font-bold ${getRarityColor(item.rarity)} text-center mb-2`}>
                      {RARITIES[item.rarity]?.name || ''}
                    </p>
                    <div className="text-xs space-y-1">
                      {item.stats.map((stat, idx) => {
                        const percentage = calculateStatPercentage(stat);
                        const colorClass = getStatColorByPercentage(percentage);
                        const diamondGrade = getDiamondGrade(percentage);
                        const diamondColorClass = getDiamondColor(percentage);
                        const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats.includes(stat.id);
                        const bonusValue = isExcluded ? 0 : stat.value * (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
                        const formattedBaseValue = formatStatValue(stat.value, stat.suffix);
                        const formattedBonusValue = formatStatValue(bonusValue, stat.suffix);
                        const essenceCount = consumables.stat_max_item || 0;

                        return (
                          <div key={idx} className="flex items-center justify-between gap-1">
                            <span className={`truncate font-bold ${colorClass}`}>
                              {stat.name.substring(0, 2)} {formattedBaseValue}{stat.suffix}
                              {enhancementLevel > 0 && !isExcluded && bonusValue > 0 && (
                                <span className="text-green-400 text-[10px]">(+{formattedBonusValue})</span>
                              )}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {/* 다이아몬드 등급 표시 */}
                              <span className={`text-[10px] font-bold ${diamondColorClass}`}>
                                {'◆'.repeat(diamondGrade.count)}
                              </span>
                              {/* 완벽의 정수 버튼 (극옵 아닌 경우만) */}
                              {essenceCount > 0 && percentage < 100 && (
                                <button
                                  onClick={() => handleUsePerfectEssence(slot, idx)}
                                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-[8px] px-0.5 rounded ml-0.5"
                                  title="완벽의 정수로 극옵화"
                                >
                                  ⚙
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 space-y-1">
                      {/* 오브 버튼 */}
                      {orbs > 0 && (
                        <button
                          onClick={() => handleUseOrb(slot)}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs py-1 rounded font-bold"
                          title="오브로 옵션 재조정"
                        >
                          🔮 옵션 재조정
                        </button>
                      )}
                      {/* 해제 버튼 */}
                      <button
                        onClick={() => unequipItem(slot)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 rounded"
                      >
                        해제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-600 rounded p-4 text-center h-28 flex items-center justify-center mb-2">
                    <p className="text-gray-600 text-sm">-</p>
                  </div>
                )}

                {/* 강화 버튼 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-gray-400">비용</span>
                    <span className="text-yellow-400 font-bold">{formatNumber(enhancementCost)}G</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-gray-400">성공률</span>
                    <span className={`font-bold ${successRate >= 70 ? 'text-green-400' : successRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {successRate.toFixed(1)}%
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnhance(slot)}
                    disabled={!canEnhance}
                    className={`w-full py-1 rounded text-xs font-bold transition-all ${
                      canEnhance
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    강화 +{enhancementLevel + 1}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 인벤토리 장비 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">
              🎒 인벤토리 ({inventory.length})
            </h3>
          </div>

          {/* 일괄 판매 */}
          <div className="flex items-center justify-between gap-2 bg-game-panel border border-game-border rounded p-2 mb-3">
            <div className="flex items-center gap-2">
              <select
                value={sellRarity}
                onChange={(e) => setSellRarity(e.target.value)}
                className="px-2 py-1 bg-game-bg border border-game-border rounded text-xs text-white"
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
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded text-sm"
              >
                💰 일괄 판매
              </button>
            </div>

            {/* 자동 판매 설정 */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSellEnabled || false}
                  onChange={(e) => updateSettings({ autoSellEnabled: e.target.checked })}
                  className="w-3 h-3"
                />
                <span className="text-xs text-white font-bold">자동 판매</span>
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
              <span className="text-xs text-gray-400">이하 자동 판매</span>
            </div>
          </div>

          {inventory.length === 0 ? (
            <div className="bg-game-bg border border-game-border rounded p-6 text-center">
              <p className="text-gray-500 text-sm">인벤토리가 비어있습니다</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {Object.entries(ITEM_SLOT_NAMES).map(([slot, slotName]) => {
                const items = itemsBySlot[slot];
                if (items.length === 0) return null;

                return (
                  <div key={slot} className="bg-game-bg border border-game-border rounded p-2">
                    <h4 className="text-xs font-bold text-cyan-400 mb-1">
                      {slotName} ({items.length})
                    </h4>
                    <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
                      {items.map(item => {
                        return (
                          <div
                            key={item.id}
                            className={`border-2 ${getRarityColor(item.rarity)} ${getRarityBg(item.rarity)} rounded p-1 hover:scale-105 transition-all min-h-[70px] flex flex-col relative group`}
                          >
                            <div
                              className="cursor-pointer flex-1"
                              onClick={() => equipItem(item)}
                              title={`${item.name} - 클릭하여 장착`}
                            >
                              <p className={`text-[9px] font-bold ${getRarityColor(item.rarity)} text-center mb-0.5`}>
                                {RARITIES[item.rarity]?.name || ''}
                              </p>
                              <div className="text-[8px] text-center space-y-0 overflow-hidden">
                                {item.stats.map((stat, idx) => {
                                  const percentage = calculateStatPercentage(stat);
                                  const colorClass = getStatColorByPercentage(percentage);
                                  const diamondGrade = getDiamondGrade(percentage);
                                  const diamondColorClass = getDiamondColor(percentage);
                                  const formattedValue = formatStatValue(stat.value, stat.suffix);

                                  return (
                                    <div key={idx} className={`truncate font-bold ${colorClass} flex items-center justify-center gap-0.5`}>
                                      <span>{stat.name.substring(0, 3)} +{formattedValue}{stat.suffix}</span>
                                      <span className={`${diamondColorClass} text-[7px]`}>
                                        {'◆'.repeat(diamondGrade.count)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {/* 개별 판매 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const price = getItemPrice(item);
                                sellItem(item.id);
                                setSellPopup({ x: rect.left, y: rect.top, gold: price, id: Date.now() });
                                setTimeout(() => setSellPopup(null), 1500);
                              }}
                              className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white text-[8px] px-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                              title="판매"
                            >
                              💰
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 장비 정보 모달 */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowInfoModal(false)}>
          <div className="bg-game-panel border-2 border-game-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">📊 장비 정보</h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 딜링 스탯 */}
              <div>
                <h3 className="text-lg font-bold text-rose-400 mb-3">⚔️ 딜링 스탯 (무기, 갑옷, 장갑)</h3>
                <div className="space-y-4">
                  {Object.entries(DAMAGE_STATS).map(([statId, statDef]) => {
                    const ranges = STAT_RANGES[statId];
                    if (!ranges) return null;

                    return (
                      <div key={statId} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">
                          {statDef.name} {statDef.suffix && `(${statDef.suffix})`}
                        </h4>
                        <div className="grid grid-cols-7 gap-2 text-xs">
                          {Object.entries(RARITIES).map(([rarity, rarityData]) => {
                            const range = ranges[rarity];
                            const colorClass = getRarityColor(rarity).split(' ')[0];

                            return (
                              <div key={rarity} className={`bg-gray-900 border ${getRarityColor(rarity).split(' ')[1]} rounded p-2 text-center`}>
                                <p className={`font-bold ${colorClass} mb-1 text-[10px]`}>
                                  {rarityData.name}
                                </p>
                                <p className="text-gray-300 text-[10px]">
                                  {range.min.toFixed(1)} - {range.max.toFixed(1)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 유틸리티 스탯 */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-3">🔧 유틸리티 스탯 (신발, 목걸이, 반지)</h3>
                <div className="space-y-4">
                  {Object.entries(UTILITY_STATS).map(([statId, statDef]) => {
                    const ranges = STAT_RANGES[statId];
                    if (!ranges) {
                      // monstersPerStageReduction은 고정값
                      if (statId === 'monstersPerStageReduction') {
                        return (
                          <div key={statId} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                            <h4 className="text-sm font-bold text-cyan-400 mb-2">
                              {statDef.name} {statDef.suffix && `(${statDef.suffix})`}
                            </h4>
                            <div className="text-xs text-gray-300 space-y-1">
                              <p className="text-orange-400">• 전설: -1</p>
                              <p className="text-red-400">• 신화: -2</p>
                              <p className="text-gray-900 bg-white rounded px-2 py-1 inline-block">• 다크: -3 또는 -4</p>
                              <p className="text-gray-400 text-[10px] mt-2">* 유틸리티 슬롯(신발, 목걸이, 반지)에서 전설 이상 등급일 때 0.5% 확률로 출현</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    return (
                      <div key={statId} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">
                          {statDef.name} {statDef.suffix && `(${statDef.suffix})`}
                        </h4>
                        <div className="grid grid-cols-7 gap-2 text-xs">
                          {Object.entries(RARITIES).map(([rarity, rarityData]) => {
                            const range = ranges[rarity];
                            const colorClass = getRarityColor(rarity).split(' ')[0];

                            return (
                              <div key={rarity} className={`bg-gray-900 border ${getRarityColor(rarity).split(' ')[1]} rounded p-2 text-center`}>
                                <p className={`font-bold ${colorClass} mb-1 text-[10px]`}>
                                  {rarityData.name}
                                </p>
                                <p className="text-gray-300 text-[10px]">
                                  {range.min.toFixed(1)} - {range.max.toFixed(1)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500 rounded-lg p-4">
                <h4 className="text-sm font-bold text-yellow-400 mb-2">ℹ️ 참고 사항</h4>
                <div className="text-xs text-gray-200 space-y-1">
                  <p>• 위 수치는 1층 기준 기본값입니다</p>
                  <p>• <span className="text-cyan-400 font-bold">50층마다 모든 장비 스탯이 1.2배씩 증가합니다</span></p>
                  <p className="text-gray-400 text-[10px] ml-3">예: 51층 = x1.2, 101층 = x1.44, 151층 = x1.73...</p>
                  <p>• 장비 슬롯 강화 시 해당 슬롯의 모든 스탯이 5%씩 증가합니다</p>
                  <p>• 다이아몬드 등급: <span className="text-gray-500">◆(하옵)</span> <span className="text-blue-400">◆◆(중옵)</span> <span className="text-yellow-400">◆◆◆(상옵)</span> <span className="text-cyan-400">💎💎💎(극옵)</span></p>
                  <p>• 완벽의 정수(⚙️)를 사용하면 개별 옵션을 극옵으로 변경할 수 있습니다</p>
                  <p>• 오브(🔮)를 사용하면 장비 옵션을 재조정할 수 있습니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 판매 팝업 */}
      {sellPopup && (
        <div
          className="fixed pointer-events-none z-50 animate-bounce"
          style={{ left: sellPopup.x - 20, top: sellPopup.y - 30 }}
        >
          <span className="text-yellow-400 font-bold text-sm bg-gray-900 px-2 py-1 rounded border border-yellow-500 shadow-lg">
            +{formatNumber(sellPopup.gold)}💰
          </span>
        </div>
      )}
    </>
  );
};

export default Equipment;
