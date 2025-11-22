import React from 'react';
import { useGame } from '../../store/GameContext';

const Consumables = () => {
  const { gameState } = useGame();
  const { gearCores = 0, orbs = 0 } = gameState;

  return (
      <div className="space-y-4">
        {/* 소비 아이템 인벤토리 */}
        <div className="bg-game-panel border border-game-border rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">💎 소비 아이템</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 기어 코어 */}
            <div className="bg-gray-800 border border-orange-500 rounded-lg p-3 text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <p className="text-sm font-bold text-orange-400 mb-1">기어 코어</p>
              <p className="text-xl font-bold text-white mb-2">{gearCores}</p>
              <p className="text-xs text-gray-400">장비 옵션을 최대치로 강화</p>
            </div>

            {/* 오브 */}
            <div className="bg-gray-800 border border-purple-500 rounded-lg p-3 text-center">
              <div className="text-3xl mb-2">🔮</div>
              <p className="text-sm font-bold text-purple-400 mb-1">오브</p>
              <p className="text-xl font-bold text-white mb-2">{orbs}</p>
              <p className="text-xs text-gray-400">장비 옵션을 재조정</p>
            </div>

            {/* TODO: 추가 소비 아이템 (전설 선택권, 미스터리 토큰 등) */}
          </div>
        </div>

      </div>
  );
};

export default Consumables;
