import React, { useState, memo } from 'react';
import { useGame } from '../../store/GameContext';
import { getCompanionById, getCompanionStats, COMPANION_EFFECT_MULTIPLIER, COMPANION_CATEGORIES } from '../../data/companions';
import { formatNumber } from '../../utils/formatter';

const CompanionEffects = memo(() => {
  const { gameState } = useGame();
  const { companions = {}, companionSlots = {} } = gameState;
  const [expandedStat, setExpandedStat] = useState(null);

  // 총 효과 계산
  const calculateTotalEffects = () => {
    const equipped = {
      attack: 0,
      critChance: 0,
      critDamage: 0,
      extraHit: 0,
      accuracy: 0,
      armorPenetration: 0,
      stageSkip: 0,
      dropRate: 0,
      goldBonus: 0,
      expBonus: 0
    };

    const owned = {
      attack: 0,
      critChance: 0,
      critDamage: 0,
      extraHit: 0,
      accuracy: 0,
      armorPenetration: 0,
      stageSkip: 0,
      dropRate: 0,
      goldBonus: 0,
      expBonus: 0
    };

    Object.entries(companions).forEach(([companionId, compState]) => {
      if (!compState.owned) return;

      const companion = getCompanionById(companionId);
      if (!companion) return;

      const stats = getCompanionStats(companion, compState.stars || 0, compState.equippedOrbs || []);
      const isEquipped = companionSlots[companion.category] === companionId;

      Object.entries(stats).forEach(([statKey, value]) => {
        if (isEquipped && equipped.hasOwnProperty(statKey)) {
          equipped[statKey] += value;
        } else if (!isEquipped && owned.hasOwnProperty(statKey)) {
          owned[statKey] += value * COMPANION_EFFECT_MULTIPLIER.owned;
        }
      });
    });

    // 총합 계산
    const total = {};
    Object.keys(equipped).forEach(key => {
      total[key] = equipped[key] + owned[key];
    });

    return { equipped, owned, total };
  };

  const effects = calculateTotalEffects();

  // 스탯 표시 설정
  const statConfig = [
    { key: 'attack', icon: '⚔️', label: '공격력', isPercent: false },
    { key: 'critChance', icon: '💥', label: '크리확률', isPercent: true },
    { key: 'critDamage', icon: '🔺', label: '크리뎀', isPercent: true },
    { key: 'extraHit', icon: '⚡', label: '추가타격', isPercent: true },
    { key: 'accuracy', icon: '🎯', label: '명중', isPercent: false },
    { key: 'armorPenetration', icon: '🗡️', label: '방관', isPercent: false },
    { key: 'stageSkip', icon: '⏭️', label: '스킵', isPercent: true },
    { key: 'dropRate', icon: '🍀', label: '드랍', isPercent: true },
    { key: 'goldBonus', icon: '💰', label: '골드', isPercent: true },
    { key: 'expBonus', icon: '📈', label: '경험치', isPercent: true }
  ];

  // 모든 스탯 표시 (0이어도 표시)
  const activeStats = statConfig;

  // 특정 스탯에 기여하는 동료들의 세부 정보
  const getStatContributors = (statKey) => {
    const contributors = [];

    Object.entries(companions).forEach(([companionId, compState]) => {
      if (!compState.owned) return;

      const companion = getCompanionById(companionId);
      if (!companion) return;

      const stats = getCompanionStats(companion, compState.stars || 0, compState.equippedOrbs || []);
      const value = stats[statKey];

      if (!value || value === 0) return;

      const isEquipped = companionSlots[companion.category] === companionId;
      const multiplier = isEquipped ? 1.0 : COMPANION_EFFECT_MULTIPLIER.owned;
      const effectiveValue = value * multiplier;

      contributors.push({
        id: companionId,
        name: companion.name,
        category: companion.category,
        stars: compState.stars || 0,
        isEquipped,
        baseValue: value,
        effectiveValue,
        multiplier
      });
    });

    return contributors;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-lg p-4">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <span>🦸 동료 효과</span>
        <span className="text-xs text-gray-400 font-normal">
          (장착 100% + 보유 40%)
        </span>
      </h3>

      <div className="space-y-2">
        {activeStats.map(stat => {
          const equippedValue = effects.equipped[stat.key];
          const ownedValue = effects.owned[stat.key];
          const totalValue = effects.total[stat.key];
          const isExpanded = expandedStat === stat.key;
          const contributors = isExpanded ? getStatContributors(stat.key) : [];

          return (
            <div key={stat.key} className="bg-gray-900/50 rounded-lg p-2">
              <div
                className="flex items-center justify-between mb-1 cursor-pointer hover:bg-gray-800/50 -m-2 p-2 rounded-lg transition-colors"
                onClick={() => setExpandedStat(isExpanded ? null : stat.key)}
              >
                <span className="text-xs text-gray-300">
                  {stat.icon} {stat.label} {totalValue > 0 && '▼'}
                </span>
                <span className={`text-sm font-bold ${totalValue > 0 ? 'text-cyan-400' : 'text-gray-600'}`}>
                  {totalValue === 0
                    ? '-'
                    : `+${stat.isPercent ? totalValue.toFixed(1) : formatNumber(Math.floor(totalValue))}${stat.isPercent ? '%' : ''}`
                  }
                </span>
              </div>

              {/* 장착/보유 세부 정보 */}
              {totalValue > 0 && (
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                  <div className="flex items-center gap-2">
                    {equippedValue > 0 && (
                      <span className="text-cyan-300">
                        장착 +{stat.isPercent ? equippedValue.toFixed(1) : formatNumber(Math.floor(equippedValue))}
                        {stat.isPercent ? '%' : ''}
                      </span>
                    )}
                    {ownedValue > 0 && (
                      <span className="text-gray-400">
                        보유 +{stat.isPercent ? ownedValue.toFixed(1) : formatNumber(Math.floor(ownedValue))}
                        {stat.isPercent ? '%' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 세부 기여도 목록 */}
              {isExpanded && contributors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
                  {contributors.map(contrib => {
                    const category = COMPANION_CATEGORIES[contrib.category];
                    return (
                      <div
                        key={contrib.id}
                        className="flex items-center justify-between text-[10px] py-1 px-2 rounded"
                        style={{ backgroundColor: `${category.color}10` }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: category.color }}>●</span>
                          <span className="text-gray-300">{contrib.name}</span>
                          <span className="text-yellow-400">
                            {'★'.repeat(contrib.stars)}
                          </span>
                          {contrib.isEquipped && (
                            <span className="bg-cyan-500 text-white px-1 rounded text-[8px] font-bold">
                              장착
                            </span>
                          )}
                          {!contrib.isEquipped && (
                            <span className="bg-gray-600 text-gray-300 px-1 rounded text-[8px]">
                              보유 40%
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-cyan-300">
                          +{stat.isPercent ? contrib.effectiveValue.toFixed(1) : formatNumber(Math.floor(contrib.effectiveValue))}
                          {stat.isPercent ? '%' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

CompanionEffects.displayName = 'CompanionEffects';

export default CompanionEffects;
