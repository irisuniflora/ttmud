import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';

const CombatLog = () => {
  const { gameState } = useGame();
  const { combatLog = [] } = gameState;
  const [activeTab, setActiveTab] = useState('acquired');

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      unique: 'text-yellow-400',
      legendary: 'text-orange-400',
      mythic: 'text-red-400',
      dark: 'text-white'
    };
    return colors[rarity] || 'text-gray-300';
  };

  const getLogColor = (log) => {
    // 등급이 있으면 등급별 색상, 없으면 타입별 색상
    if (log.rarity) {
      return `${getRarityColor(log.rarity)} font-medium`;
    }

    switch (log.type) {
      case 'gear_core':
        return 'text-orange-400 font-bold';
      case 'rare_monster':
        return 'text-pink-400 font-bold animate-pulse';
      default:
        return 'text-gray-300';
    }
  };

  const acquiredLogs = combatLog.filter(log => log.type === 'acquired' || log.type === 'gear_core' || log.type === 'rare_monster').slice(0, 10);
  const soldLogs = combatLog.filter(log => log.type === 'sold').slice(0, 10);

  const currentLogs = activeTab === 'acquired' ? acquiredLogs : soldLogs;

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-3 shadow-md h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-100 mb-2">아이템 로그</h3>

      {/* 탭 버튼 */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setActiveTab('acquired')}
          className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
            activeTab === 'acquired'
              ? 'bg-purple-600 text-white'
              : 'bg-game-bg text-gray-300 hover:bg-gray-700'
          }`}
        >
          📦 획득 ({acquiredLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
            activeTab === 'sold'
              ? 'bg-yellow-600 text-white'
              : 'bg-game-bg text-gray-300 hover:bg-gray-700'
          }`}
        >
          💰 판매 ({soldLogs.length})
        </button>
      </div>

      <div className="bg-game-bg rounded p-2 flex-1 overflow-y-auto">
        {currentLogs.length === 0 ? (
          <p className="text-gray-400 text-xs text-center mt-4">
            {activeTab === 'acquired' ? '획득한 아이템이 없습니다' : '판매한 아이템이 없습니다'}
          </p>
        ) : (
          <div className="space-y-1">
            {currentLogs.map((log) => (
              <div key={log.id} className={`text-xs ${getLogColor(log)}`}>
                {log.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatLog;
