import React from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, formatNumberWithCommas, getHPPercent } from '../../utils/formatter';

const PlayerInfo = () => {
  const { gameState, enterBossBattle, engine } = useGame();
  const { player, currentMonster, gearCores = 0, orbs = 0, upgradeCoins = 0, equipment = {} } = gameState;

  const hpPercent = getHPPercent(currentMonster.hp, currentMonster.maxHp);

  // 장비로 인한 몬스터 감소 계산
  let equipmentMonsterReduction = 0;
  Object.entries(equipment).forEach(([slot, item]) => {
    if (item) {
      item.stats.forEach(stat => {
        if (stat.id === 'monstersPerStageReduction') {
          equipmentMonsterReduction += stat.value;
        }
      });
    }
  });

  // 도감 보너스 계산
  const collectionBonus = engine ? engine.calculateCollectionBonus() : { monsterReduction: 0 };

  const actualMonstersPerFloor = Math.max(5, 40 - equipmentMonsterReduction - collectionBonus.monsterReduction);

  // 보스방 입장 가능 여부
  const canEnterBoss = player.monstersKilledInFloor >= actualMonstersPerFloor && player.floorState !== 'boss_battle';

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 space-y-3">
      {/* 플레이어 기본 정보 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">플레이어</h2>
          <p className="text-gray-300">
            <span className="text-blue-400 font-bold">Lv.{player.level}</span> (최고 층: {player.highestFloor}층)
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-2xl font-bold text-yellow-400">
            💰 {formatNumber(player.gold)}
          </p>
          {player.totalPrestiges > 0 && (
            <p className="text-purple-400 font-bold">
              ✨ PP: {player.prestigePoints}
            </p>
          )}
          <div className="flex gap-2 justify-end text-sm">
            <p className="text-orange-400 font-bold" title="기어 코어 - 장비 옵션을 최대치로 강화">
              ⚙️ {gearCores}
            </p>
            <p className="text-purple-300 font-bold" title="오브 - 장비 옵션을 재조정">
              🔮 {orbs}
            </p>
          </div>
        </div>
      </div>

      {/* 현재 층 정보 */}
      <div className="bg-gray-800 rounded p-2 border border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-gray-300 font-semibold">현재 층</p>
          <p className="text-sm text-cyan-400 font-bold">
            {player.floorState === 'boss_battle' ? '⚔️ 보스 전투 중' :
             player.floorState === 'boss_ready' ? '✅ 보스 도전 가능' :
             `몬스터: ${player.monstersKilledInFloor} / ${actualMonstersPerFloor}`}
          </p>
        </div>
        <p className="text-xl font-bold">
          {player.floor}층 -
          <span className={
            currentMonster.isLegendary ? 'text-orange-400' :
            currentMonster.isRare ? 'text-purple-400' :
            'text-gray-100'
          }>
            {currentMonster.name}
          </span>
          {currentMonster.isBoss && <span className="text-red-400 ml-2">👑 BOSS</span>}
        </p>

        {/* 보스 타이머 또는 버튼 영역 - 고정 높이 */}
        <div className="mt-2 h-10 flex items-center">
          {player.floorState === 'boss_battle' && (
            <div className="w-full space-y-1">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-red-600 font-bold">⏰ 보스 타이머</span>
                <span className="text-xs text-red-600 font-bold">{player.bossTimer}초</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-4 overflow-hidden border-2 border-red-500">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000"
                  style={{ width: `${(player.bossTimer / 20) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* 레어/전설 몬스터 타이머 (보스가 아닌 경우) */}
          {!currentMonster.isBoss && (currentMonster.isRare || currentMonster.isLegendary) && currentMonster.spawnTime && (
            (() => {
              const elapsedTime = Math.floor((Date.now() - currentMonster.spawnTime) / 1000);
              const remainingTime = Math.max(0, 5 - elapsedTime);

              if (remainingTime > 0) {
                const isLegendary = currentMonster.isLegendary;
                return (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <span className={`text-xs font-bold ${isLegendary ? 'text-orange-600' : 'text-purple-600'}`}>
                        ⏰ {isLegendary ? '전설' : '레어'} 몬스터!
                      </span>
                      <span className={`text-xs font-bold ${isLegendary ? 'text-orange-600' : 'text-purple-600'}`}>
                        {remainingTime}초
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-4 overflow-hidden border-2 ${
                      isLegendary ? 'bg-orange-200 border-orange-500' : 'bg-purple-200 border-purple-500'
                    }`}>
                      <div
                        className={`h-full transition-all duration-1000 ${
                          isLegendary
                            ? 'bg-gradient-to-r from-orange-600 to-orange-400'
                            : 'bg-gradient-to-r from-purple-600 to-purple-400'
                        }`}
                        style={{ width: `${(remainingTime / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}

          {canEnterBoss && (
            <button
              onClick={enterBossBattle}
              className="w-full h-full py-2 rounded font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white transition-all shadow-lg"
            >
              🔥 보스 도전하기
            </button>
          )}
        </div>
      </div>

      {/* 몬스터 HP 바 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-200 font-semibold">HP</span>
          <span className="text-gray-300 font-bold">
            {formatNumberWithCommas(Math.max(0, currentMonster.hp))} / {formatNumberWithCommas(currentMonster.maxHp)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden border-2 border-gray-600">
          <div
            className={`h-full transition-all duration-300 ${
              currentMonster.isBoss
                ? 'bg-gradient-to-r from-red-600 to-red-400'
                : 'bg-gradient-to-r from-green-600 to-green-400'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* 경험치 바 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-200 font-semibold">EXP</span>
          <span className="text-gray-300 font-bold">
            {formatNumberWithCommas(player.exp)} / {formatNumberWithCommas(player.expToNextLevel)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border-2 border-gray-600">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
            style={{ width: `${(player.exp / player.expToNextLevel) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
