import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { SKILL_TREES, getSkillCost } from '../../data/skills';
import { formatNumber } from '../../utils/formatter';

const SkillTree = () => {
  const { gameState, upgradeSkill } = useGame();
  const { player, skillLevels } = gameState;
  const [selectedTree, setSelectedTree] = useState('combat');

  const tree = SKILL_TREES[selectedTree];

  const getTreeColor = (treeName) => {
    const colors = {
      combat: 'red',
      economy: 'yellow',
      prestige: 'purple'
    };
    return colors[treeName] || 'blue';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">스킬 트리</h3>

      {/* 트리 선택 탭 */}
      <div className="flex gap-2">
        {Object.entries(SKILL_TREES).map(([key, treeData]) => (
          <button
            key={key}
            onClick={() => setSelectedTree(key)}
            className={`flex-1 py-2 rounded font-bold transition-all ${
              selectedTree === key
                ? `bg-${treeData.color}-600 text-white`
                : 'bg-game-panel text-gray-400 hover:bg-game-border'
            }`}
          >
            {treeData.name}
          </button>
        ))}
      </div>

      {/* 스킬 리스트 */}
      <div className="space-y-3">
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
              className="bg-game-panel border border-game-border rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white">{skill.name}</h4>
                  <p className="text-sm text-gray-400">{skill.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-blue-400">
                      레벨: {currentLevel} / {maxLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 진행 바 */}
              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-full bg-${tree.color}-600 rounded-full transition-all`}
                    style={{ width: `${(currentLevel / maxLevel) * 100}%` }}
                  />
                </div>
              </div>

              {/* 현재 효과 */}
              {currentLevel > 0 && (
                <div className="mb-2 text-sm">
                  <span className="text-green-400">
                    현재 효과: {JSON.stringify(skill.effect(currentLevel))}
                  </span>
                </div>
              )}

              {/* 업그레이드 버튼 */}
              <button
                onClick={() => upgradeSkill(skill.id, tree)}
                disabled={!canAfford || isMaxLevel}
                className={`w-full py-2 rounded font-bold transition-all ${
                  isMaxLevel
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : canAfford
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isMaxLevel 
                  ? '최대 레벨' 
                  : `업그레이드 - ${costType === 'pp' ? '✨' : '💰'} ${formatNumber(cost)}`
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillTree;
