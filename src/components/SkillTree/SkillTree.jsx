import React from 'react';
import { useGame } from '../../store/GameContext';
import { SKILL_TREES, getSkillCost } from '../../data/skills';
import { formatNumber } from '../../utils/formatter';

const SkillTree = () => {
  const { gameState, upgradeSkill } = useGame();
  const { player, skillLevels } = gameState;

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
                      {currentLevel > 0 && (
                        <span className="text-xs text-green-400">
                          {JSON.stringify(skill.effect(currentLevel))}
                        </span>
                      )}
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
                      : `${costType === 'pp' ? '✨' : '💰'} ${formatNumber(cost)}`
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
      <h3 className="text-xl font-bold text-white">스킬 트리</h3>

      {/* 모든 스킬 트리를 한 페이지에 표시 */}
      <div className="space-y-4">
        {Object.entries(SKILL_TREES).map(([key, tree]) => renderSkillTree(key, tree))}
      </div>
    </div>
  );
};

export default SkillTree;
