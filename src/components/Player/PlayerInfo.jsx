import React from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, formatNumberWithCommas, getHPPercent } from '../../utils/formatter';

const PlayerInfo = () => {
  const { gameState, enterBossBattle } = useGame();
  const { player, currentMonster, gearCores = 0, upgradeCoins = 0, equipment = {} } = gameState;

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

  const actualMonstersPerFloor = Math.max(5, 20 - equipmentMonsterReduction);

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
            <p className="text-cyan-400 font-bold" title="등급업 코인">
              🪙 {formatNumber(upgradeCoins)}
            </p>
            <p className="text-orange-400 font-bold" title="기어 코어">
              ⚙️ {gearCores}
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
        <p className="text-xl font-bold text-gray-100">
          {player.floor}층 - {currentMonster.name}
          {currentMonster.isBoss && <span className="text-red-400 ml-2">👑 BOSS</span>}
        </p>

        {/* 보스 타이머 또는 버튼 영역 - 고정 높이 */}
        <div className="mt-2 h-10 flex items-center">
          {player.floorState === 'boss_battle' && (
            <div className="w-full p-2 bg-red-100 border border-red-500 rounded flex items-center justify-center">
              <p className="text-center text-red-600 font-bold text-base">
                ⏰ 남은 시간: {player.bossTimer}초
              </p>
            </div>
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
