import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { FLOOR_RANGES, getCollectionBonus } from '../../data/monsters';
import { formatNumberWithCommas } from '../../utils/formatter';

const Collection = () => {
  const { gameState } = useGame();
  const { collection, statistics } = gameState;
  const [activeTab, setActiveTab] = useState('monsters');

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-100">도감</h3>

      {/* 탭 선택 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('monsters')}
          className={`flex-1 py-2 rounded font-bold ${
            activeTab === 'monsters'
              ? 'bg-red-600 text-white'
              : 'bg-game-panel text-gray-300 border border-game-border'
          }`}
        >
          몬스터
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 rounded font-bold ${
            activeTab === 'stats'
              ? 'bg-green-600 text-white'
              : 'bg-game-panel text-gray-300 border border-game-border'
          }`}
        >
          통계
        </button>
      </div>

      {/* 몬스터 도감 - 희귀 몬스터만 표시 */}
      {activeTab === 'monsters' && (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm font-bold">
            희귀 몬스터 도감
          </p>

          {Object.entries(FLOOR_RANGES).map(([floorStart, data]) => {
                  const floor = parseInt(floorStart);

                  // 수집 진행도 계산
                  let collectedCount = 0;
                  data.monsters.forEach((_, idx) => {
                    const rareId = `rare_${floor}_${idx}`;
                    if (collection.rareMonsters?.[rareId]?.unlocked) {
                      collectedCount++;
                    }
                  });

                  // 보너스 계산
                  const bonus = getCollectionBonus(collectedCount, 10);

                  return (
                    <div key={floor} className="bg-game-panel border border-game-border rounded-lg p-3">
                      {/* 던전 제목 */}
                      <h4 className="text-sm font-bold text-cyan-400 mb-2">
                        {data.name} <span className="text-gray-400">({collectedCount}/10)</span>
                        {bonus.attack > 0 && (
                          <span className="text-red-400 ml-2">+{bonus.attack}% DMG</span>
                        )}
                        {bonus.goldBonus > 0 && (
                          <span className="text-yellow-400 ml-2">+{bonus.goldBonus}% Gold</span>
                        )}
                      </h4>

                      {/* 희귀 몬스터 그리드 (5x2) - 10마리 */}
                      <div className="grid grid-cols-5 gap-1">
                        {/* 각 일반 몬스터의 희귀 버전 */}
                        {data.monsters.map((monsterName, idx) => {
                          const rareId = `rare_${floor}_${idx}`;
                          const isUnlocked = collection.rareMonsters?.[rareId]?.unlocked;

                          return (
                            <div
                              key={rareId}
                              className={`border rounded p-2 text-center transition-all ${
                                isUnlocked
                                  ? 'bg-game-panel border-pink-500'
                                  : 'bg-gray-900 border-gray-700'
                              }`}
                            >
                              <p className={`text-xs font-bold truncate ${
                                isUnlocked ? 'text-pink-400' : 'text-gray-600'
                              }`}>
                                {isUnlocked ? monsterName : '???'}
                              </p>
                              <p className={`text-[10px] ${
                                isUnlocked ? 'text-pink-500' : 'text-gray-600'
                              }`}>
                                희귀!
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

          {/* 보스 도감 - 100층 아래 */}
          <div className="bg-game-panel border border-game-border rounded-lg p-3 mt-4">
            <h4 className="text-sm font-bold text-yellow-400 mb-2">
              희귀 보스 도감 <span className="text-gray-400">({
                Object.keys(collection.rareBosses || {}).filter(id => collection.rareBosses[id]?.unlocked).length
              }/20)</span>
            </h4>

            {/* 보스 그리드 (5x4) - 20마리 */}
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(FLOOR_RANGES).map(([floorStart, data]) => {
                const floor = parseInt(floorStart);
                const rareId = `rare_boss_${floor}`;
                const isUnlocked = collection.rareBosses?.[rareId]?.unlocked;

                return (
                  <div
                    key={rareId}
                    className={`border rounded p-2 text-center transition-all ${
                      isUnlocked
                        ? 'bg-game-panel border-yellow-500'
                        : 'bg-gray-900 border-gray-700'
                    }`}
                  >
                    <p className={`text-xs font-bold truncate ${
                      isUnlocked ? 'text-yellow-400' : 'text-gray-600'
                    }`}>
                      {isUnlocked ? data.boss : '???'}
                    </p>
                    <p className={`text-[10px] ${
                      isUnlocked ? 'text-yellow-500' : 'text-gray-600'
                    }`}>
                      희귀 보스!
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 통계 */}
      {activeTab === 'stats' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">총 데미지</p>
              <p className="text-xl font-bold text-red-400">
                {formatNumberWithCommas(statistics.totalDamageDealt)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">획득한 골드</p>
              <p className="text-xl font-bold text-yellow-400">
                {formatNumberWithCommas(statistics.totalGoldEarned)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">처치한 몬스터</p>
              <p className="text-xl font-bold text-blue-400">
                {formatNumberWithCommas(statistics.totalMonstersKilled)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">처치한 보스</p>
              <p className="text-xl font-bold text-purple-400">
                {formatNumberWithCommas(statistics.totalBossesKilled)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">획득한 아이템</p>
              <p className="text-xl font-bold text-green-400">
                {formatNumberWithCommas(statistics.totalItemsFound)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">환생 횟수</p>
              <p className="text-xl font-bold text-pink-400">
                {gameState.player.totalPrestiges}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
