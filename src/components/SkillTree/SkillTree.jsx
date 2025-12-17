import React from 'react';
import { useGame } from '../../store/GameContext';
import { SKILL_TREES, getSkillCost } from '../../data/skills';
import { formatNumber } from '../../utils/formatter';

const SkillTree = () => {
  const { gameState, upgradeSkill } = useGame();
  const { player, skillLevels } = gameState;
  const skillPoints = player.skillPoints || 0;

  const renderSkillTree = (treeKey, tree) => {
    return (
      <div key={treeKey} className="bg-game-panel border border-game-border rounded-lg p-4">
        <h3 className={`text-lg font-bold text-${tree.color}-400 mb-3`}>{tree.name}</h3>
        <div className="space-y-2">
          {tree.skills.map(skill => {
            const currentLevel = skillLevels[skill.id] || 0;
            const maxLevel = skill.maxLevel;
            const cost = getSkillCost(skill, currentLevel);
            const costType = skill.costType || 'gold';
            const canAfford = costType === 'pp'
              ? player.prestigePoints >= cost
              : costType === 'sp'
              ? skillPoints >= cost
              : player.gold >= cost;
            const isMaxLevel = currentLevel >= maxLevel;

            return (
              <div
                key={skill.id}
                className="bg-gray-800 border border-gray-700 rounded p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{skill.name}</h4>
                    <p className="text-xs text-gray-400 mb-1">{skill.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-400">
                        레벨: {currentLevel} / {maxLevel}
                      </span>
                      {currentLevel > 0 && (() => {
                        const effect = skill.effect(currentLevel);
                        const effectText = Object.entries(effect).map(([key, value]) => {
                          const effectNames = {
                            critChance: '크리티컬',
                            critDmg: '치명타 데미지',
                            atkPercent: '공격력',
                            heroDmgPercent: '동료 데미지',
                            goldPercent: '골드 획득',
                            dropRate: '드랍률',
                            expPercent: '경험치 획득',
                            startingGold: '시작 골드',
                            startingLevel: '시작 레벨',
                            permanentDmgPercent: '영구 데미지',
                            permanentGoldPercent: '영구 골드'
                          };
                          const name = effectNames[key] || key;
                          const unit = key.includes('Percent') || key === 'critDmg' ? '%' :
                                       key === 'startingGold' ? 'G' :
                                       key === 'startingLevel' ? 'Lv' :
                                       key === 'critChance' || key === 'dropRate' ? '%' : '';
                          return `${name} +${value}${unit}`;
                        }).join(', ');
                        return (
                          <span className="text-xs text-yellow-400 font-bold">
                            [{effectText}]
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 업그레이드 버튼 */}
                  <button
                    onClick={() => upgradeSkill(skill.id, tree)}
                    disabled={!canAfford || isMaxLevel}
                    className={`px-3 py-1.5 rounded font-bold text-xs whitespace-nowrap transition-all ${
                      isMaxLevel
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isMaxLevel
                      ? '최대'
                      : `${costType === 'pp' ? '🌟' : costType === 'sp' ? '📘' : '💰'} ${formatNumber(cost)}`
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 헤더: 스킬 포인트 표시 */}
      <div className="flex items-center justify-between bg-game-panel border border-game-border rounded-lg p-4">
        <h3 className="text-xl font-bold text-white">스킬 트리</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">보유 스킬 포인트:</span>
          <span className="text-2xl font-bold text-blue-400">📘 {skillPoints}</span>
        </div>
      </div>

      {/* 모든 스킬 트리를 가로 3열로 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(SKILL_TREES).map(([key, tree]) => renderSkillTree(key, tree))}
      </div>
    </div>
  );
};

export default SkillTree;
