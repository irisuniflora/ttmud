import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import {
  PRESTIGE_RELICS,
  calculateRelicEffect,
  getRelicUpgradeCost,
  getRelicGachaCost,
  getTotalRelicEffects
} from '../../data/prestigeRelics';
import { formatNumber } from '../../utils/formatter';

const PrestigeRelics = () => {
  const { gameState, setGameState } = useGame();
  const { player, prestigeRelics = {}, relicFragments = 0, relicGachaCount = 0 } = gameState;

  const [selectedCategory, setSelectedCategory] = useState('all');

  // 현재 가챠 비용 계산
  const currentGachaCost = getRelicGachaCost(relicGachaCount);

  // 유물 효과 합산
  const totalRelicEffects = getTotalRelicEffects(prestigeRelics);
  const relicUpgradeCostReduction = totalRelicEffects.relicUpgradeCostReduction || 0;

  // 아직 보유하지 않은 유물 목록
  const unownedRelicIds = Object.keys(PRESTIGE_RELICS).filter(id => !prestigeRelics[id]);
  const hasAllRelics = unownedRelicIds.length === 0;

  // 유물 뽑기 (중복 없이 랜덤 획득)
  const gachaRelic = () => {
    if (hasAllRelics) {
      alert('모든 유물을 보유하고 있습니다!');
      return;
    }

    if (relicFragments < currentGachaCost) {
      alert(`유물 조각이 부족합니다! (필요: ${currentGachaCost}개)`);
      return;
    }

    // 보유하지 않은 유물 중 랜덤 선택
    const randomRelicId = unownedRelicIds[Math.floor(Math.random() * unownedRelicIds.length)];
    const relic = PRESTIGE_RELICS[randomRelicId];

    setGameState(prev => {
      const newRelics = { ...prev.prestigeRelics };

      // 새로운 유물 획득
      newRelics[randomRelicId] = {
        relicId: randomRelicId,
        level: 1
      };

      alert(`${relic.icon} ${relic.name} 획득!`);

      return {
        ...prev,
        relicFragments: prev.relicFragments - currentGachaCost,
        relicGachaCount: (prev.relicGachaCount || 0) + 1,
        prestigeRelics: newRelics
      };
    });
  };

  // 유물 레벨업
  const upgradeRelic = (relicId) => {
    const relicInstance = prestigeRelics[relicId];
    if (!relicInstance) return;

    const relic = PRESTIGE_RELICS[relicId];

    // 만렙 체크
    if (relic.maxLevel && relicInstance.level >= relic.maxLevel) {
      alert('이미 최대 레벨입니다!');
      return;
    }

    const cost = getRelicUpgradeCost(relicInstance.level, relicUpgradeCostReduction);

    if (relicFragments < cost) {
      alert(`유물 조각이 부족합니다! (필요: ${cost}개)`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      relicFragments: prev.relicFragments - cost,
      prestigeRelics: {
        ...prev.prestigeRelics,
        [relicId]: {
          ...prev.prestigeRelics[relicId],
          level: prev.prestigeRelics[relicId].level + 1
        }
      }
    }));
  };

  // 카테고리별 유물 필터링
  const categories = {
    all: '전체',
    prestige: '환생',
    gold: '골드',
    damage: '데미지',
    equipment: '장비',
    inscription: '문양',
    collection: '도감',
    monster: '몬스터',
    utility: '유틸리티'
  };

  const ownedRelics = Object.entries(prestigeRelics)
    .filter(([relicId, data]) => {
      if (selectedCategory === 'all') return true;
      const relic = PRESTIGE_RELICS[relicId];
      return relic && relic.category === selectedCategory;
    })
    .map(([relicId, data]) => ({
      relicId,
      ...data,
      ...PRESTIGE_RELICS[relicId]
    }));

  return (
    <div className="space-y-3">
      {/* 헤더 + 소환 합친 컴팩트 UI */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500 rounded-lg p-3">
        <div className="flex items-center justify-between gap-3">
          {/* 왼쪽: 제목 + 보유 조각 */}
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-purple-300">환생 유물</h2>
              <p className="text-xs text-gray-400">미보유: {unownedRelicIds.length} / {Object.keys(PRESTIGE_RELICS).length}</p>
            </div>
            <div className="text-2xl font-bold text-pink-400">💎 {relicFragments}</div>
          </div>

          {/* 오른쪽: 소환 버튼 */}
          <button
            onClick={gachaRelic}
            disabled={relicFragments < currentGachaCost || hasAllRelics}
            className={`px-4 py-2 rounded font-bold text-sm transition-all whitespace-nowrap ${
              hasAllRelics
                ? 'bg-green-800 text-green-300 cursor-not-allowed'
                : relicFragments < currentGachaCost
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
            }`}
          >
            {hasAllRelics ? '✓ 모두 보유' : `소환 (💎 ${currentGachaCost})`}
          </button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-game-panel border border-game-border rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded text-sm font-bold transition-all ${
                selectedCategory === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* 보유 유물 */}
      <div className="bg-game-panel border border-game-border rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">
          보유 유물 ({ownedRelics.length})
          {relicUpgradeCostReduction > 0 && (
            <span className="text-sm text-green-400 ml-2">
              (강화 비용 -{relicUpgradeCostReduction.toFixed(0)}%)
            </span>
          )}
        </h3>

        {ownedRelics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedCategory === 'all' ? '보유한 유물이 없습니다' : '이 카테고리의 유물이 없습니다'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ownedRelics.map(relicData => {
              const { relicId, level, name, icon, description, maxLevel, effectPerLevel, effectType, category } = relicData;
              const effect = calculateRelicEffect(relicId, level);
              const upgradeCost = getRelicUpgradeCost(level, relicUpgradeCostReduction);
              const canUpgrade = relicFragments >= upgradeCost;
              const isMaxLevel = maxLevel && level >= maxLevel;

              // 다음 레벨 효과 계산
              const nextEffect = !isMaxLevel ? calculateRelicEffect(relicId, level + 1) : null;

              return (
                <div
                  key={relicId}
                  className="bg-gray-800 border-2 border-purple-700 rounded-lg p-3 hover:border-purple-500 transition-colors"
                >
                  {/* 유물 헤더 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl">{icon}</div>
                      <div>
                        <div className="text-sm font-bold text-purple-300">
                          {name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Lv.{level}
                          {maxLevel && ` / ${maxLevel}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                      {categories[category]}
                    </div>
                  </div>

                  {/* 효과 */}
                  <div className="bg-gray-900 rounded p-2 mb-2">
                    <div className="text-xs text-gray-400 mb-1">{description}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-yellow-400">
                        +{formatNumber(effect.value)}
                        {effectType?.includes('Percent') ||
                         effectType?.includes('Chance') ||
                         effectType?.includes('Spawn') ||
                         effectType?.includes('Reduction') ||
                         effectType?.includes('Bonus') ? '%' :
                         effectType === 'bossTimeLimit' ? '초' :
                         effectType === 'monstersPerStageReduction' ? '마리' : ''}
                      </div>
                      {nextEffect && (
                        <div className="text-xs text-green-400">
                          → {formatNumber(nextEffect.value)}
                          {effectType?.includes('Percent') ||
                           effectType?.includes('Chance') ||
                           effectType?.includes('Spawn') ||
                           effectType?.includes('Reduction') ||
                           effectType?.includes('Bonus') ? '%' :
                           effectType === 'bossTimeLimit' ? '초' :
                           effectType === 'monstersPerStageReduction' ? '마리' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 레벨업 버튼 */}
                  <button
                    onClick={() => upgradeRelic(relicId)}
                    disabled={!canUpgrade || isMaxLevel}
                    className={`w-full py-1.5 rounded font-bold text-xs transition-all ${
                      isMaxLevel
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : canUpgrade
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isMaxLevel ? '최대 레벨' : `강화 (💎 ${upgradeCost}개)`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestigeRelics;
