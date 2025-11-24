import React from 'react';
import { useGame } from '../../store/GameContext';

const Consumables = () => {
  const { gameState } = useGame();
  const { gearCores = 0, orbs = 0, sealedZone = {}, consumables = {} } = gameState;
  const { tickets = 0, inscriptionTokens = 0, bossCoins = 0 } = sealedZone;

  return (
      <div className="space-y-4">
        {/* 소비 아이템 인벤토리 */}
        <div className="bg-game-panel border border-game-border rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">💎 소비 아이템</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 봉인구역 도전권 */}
            <div
              className="bg-gray-800 border border-blue-500 rounded-lg p-3 text-center cursor-help"
              title="획득: 보스 몬스터 처치 시 10% 확률로 1개 드랍 | 매일 자정 2개 자동 충전"
            >
              <div className="text-3xl mb-2">🎫</div>
              <p className="text-sm font-bold text-blue-400 mb-1">봉인구역 도전권</p>
              <p className="text-xl font-bold text-white mb-2">{tickets}</p>
              <p className="text-xs text-gray-400">봉인구역에 도전할 수 있는 티켓</p>
            </div>

            {/* 문양 각인권 */}
            <div
              className="bg-gray-800 border border-purple-500 rounded-lg p-3 text-center cursor-help"
              title="획득: 봉인구역 보스 처치 보상"
            >
              <div className="text-3xl mb-2">📿</div>
              <p className="text-sm font-bold text-purple-400 mb-1">문양 각인권</p>
              <p className="text-xl font-bold text-white mb-2">{inscriptionTokens}</p>
              <p className="text-xs text-gray-400">문양을 뽑을 수 있는 티켓</p>
            </div>

            {/* 보스 코인 */}
            <div
              className="bg-gray-800 border border-yellow-500 rounded-lg p-3 text-center cursor-help"
              title="획득: 봉인구역 보스 처치 보상"
            >
              <div className="text-3xl mb-2">🪙</div>
              <p className="text-sm font-bold text-yellow-400 mb-1">보스 코인</p>
              <p className="text-xl font-bold text-white mb-2">{bossCoins}</p>
              <p className="text-xs text-gray-400">보스 전용 상점에서 사용</p>
            </div>

            {/* 기어 코어 */}
            <div
              className="bg-gray-800 border border-orange-500 rounded-lg p-3 text-center cursor-help"
              title="획득: 보스 코인 상점에서 구매 (500코인)"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <p className="text-sm font-bold text-orange-400 mb-1">기어 코어</p>
              <p className="text-xl font-bold text-white mb-2">{gearCores}</p>
              <p className="text-xs text-gray-400">장비 옵션을 최대치로 강화</p>
            </div>

            {/* 오브 */}
            <div
              className="bg-gray-800 border border-purple-500 rounded-lg p-3 text-center cursor-help"
              title="획득: 보스 코인 상점에서 구매 (500코인)"
            >
              <div className="text-3xl mb-2">🔮</div>
              <p className="text-sm font-bold text-purple-400 mb-1">오브</p>
              <p className="text-xl font-bold text-white mb-2">{orbs}</p>
              <p className="text-xs text-gray-400">장비 옵션을 재조정</p>
            </div>

            {/* 몬스터 도감 선택권 */}
            <div
              className="bg-gray-800 border border-orange-500 rounded-lg p-3 text-center cursor-help"
              title="획득: 보스 코인 상점에서 구매 (1000코인)"
            >
              <div className="text-3xl mb-2">📜</div>
              <p className="text-sm font-bold text-orange-400 mb-1">몬스터 선택권</p>
              <p className="text-xl font-bold text-white mb-2">{consumables.monster_selection_ticket || 0}</p>
              <p className="text-xs text-gray-400">원하는 몬스터를 도감에 등록</p>
            </div>

            {/* 완벽의 정수 */}
            <div
              className="bg-gray-800 border border-red-500 rounded-lg p-3 text-center cursor-help"
              title="획득: 보스 코인 상점에서 구매 (2000코인)"
            >
              <div className="text-3xl mb-2">🔷</div>
              <p className="text-sm font-bold text-red-400 mb-1">완벽의 정수</p>
              <p className="text-xl font-bold text-white mb-2">{consumables.stat_max_item || 0}</p>
              <p className="text-xs text-gray-400">장비 옵션을 최대치로 고정</p>
            </div>
          </div>
        </div>

      </div>
  );
};

export default Consumables;
