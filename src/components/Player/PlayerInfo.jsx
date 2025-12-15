import React from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, formatNumberWithCommas, getHPPercent } from '../../utils/formatter';
import { getTotalSkillEffects } from '../../data/skills';
import { getHeroById, getHeroStats } from '../../data/heroes';
import { EQUIPMENT_CONFIG, getMonstersPerFloor } from '../../data/gameBalance';
import { getTotalRelicEffects } from '../../data/prestigeRelics';

const PlayerInfo = () => {
  const { gameState, enterBossBattle, toggleFloorLock, goDownFloor, engine } = useGame();
  const { player, currentMonster, orbs = 0, upgradeCoins = 0, equipment = {}, skillLevels = {}, slotEnhancements = {}, heroes = {}, relics = {} } = gameState;

  const hpPercent = getHPPercent(currentMonster.hp, currentMonster.maxHp);

  // 전투력 계산
  const calculateCombatPower = () => {
    const skillEffects = getTotalSkillEffects(skillLevels);
    const relicEffects = getTotalRelicEffects(relics);

    // 영웅 버프 계산
    let heroAttack = 0;
    let heroCritChance = 0;
    let heroCritDmg = 0;

    Object.keys(heroes || {}).forEach(heroId => {
      const heroState = heroes[heroId];
      if (heroState && heroState.inscribed) {
        const heroData = getHeroById(heroId);
        if (heroData) {
          const stats = getHeroStats(heroData, heroState.grade, heroState.stars);
          if (stats.attack) heroAttack += stats.attack;
          if (stats.critChance) heroCritChance += stats.critChance;
          if (stats.critDmg) heroCritDmg += stats.critDmg;
        }
      }
    });

    // 장비 스탯 계산
    let equipmentAttack = 0;
    let equipmentCritChance = 0;
    let equipmentCritDmg = 0;

    Object.entries(equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          if (stat.id === 'attack') equipmentAttack += stat.value * enhancementBonus;
          else if (stat.id === 'critChance') equipmentCritChance += stat.value * enhancementBonus;
          else if (stat.id === 'critDmg') equipmentCritDmg += stat.value * enhancementBonus;
        });
      }
    });

    const totalAttack = Math.floor(player.stats.baseAtk + equipmentAttack + heroAttack);
    const totalCritChance = player.stats.critChance + equipmentCritChance + (skillEffects.critChance || 0) + heroCritChance + (relicEffects.critChance || 0);
    const totalCritDmg = player.stats.critDmg + equipmentCritDmg + (skillEffects.critDmg || 0) + heroCritDmg + (relicEffects.critDmg || 0);

    const critChanceMultiplier = Math.min(totalCritChance, 100) / 100;
    const avgDamagePerHit = totalAttack * (1 + critChanceMultiplier * (totalCritDmg / 100));

    // 유물 데미지 보너스 적용
    const relicDamageMultiplier = 1 + (relicEffects.damagePercent || 0) / 100;
    return Math.floor(avgDamagePerHit * 10 * 30 * relicDamageMultiplier);
  };

  const combatPower = calculateCombatPower();

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

  // 유물 효과 (몬스터 감소)
  const relicEffectsForMonster = getTotalRelicEffects(relics);
  const relicMonsterReduction = Math.floor(relicEffectsForMonster.monstersPerStageReduction || 0);

  const baseMonstersPerFloor = getMonstersPerFloor(player.floor);
  const actualMonstersPerFloor = Math.max(5, baseMonstersPerFloor - equipmentMonsterReduction - collectionBonus.monsterReduction - relicMonsterReduction);

  // 보스방 입장 가능 여부
  const canEnterBoss = player.monstersKilledInFloor >= actualMonstersPerFloor && player.floorState !== 'boss_battle';

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 space-y-3">
      {/* 플레이어 기본 정보 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-100">플레이어</h2>
            <span className="text-rose-400 font-bold text-sm" title="전투력 (30초간 허수아비 기대 데미지)">
              ⚡ {formatNumber(combatPower)}
            </span>
          </div>
          <p className="text-gray-300">
            <span className="text-blue-400 font-bold">Lv.{player.level}</span> (최고 층: {player.highestFloor}층)
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-2xl font-bold text-yellow-400">
            💰 {formatNumber(player.gold)}
          </p>
          {player.totalPrestiges > 0 && (
            <p className="text-pink-400 font-bold" title="유물 조각&#10;환생 시 획득&#10;환생유물 탭에서 사용">
              💎 {gameState.relicFragments || 0}
            </p>
          )}
          <p className="text-blue-400 font-bold" title="스킬 포인트&#10;레벨업 시 1개씩 획득&#10;스킬 탭에서 사용 가능">
            📘 SP: {player.skillPoints || 0}
          </p>
          <p className="text-purple-300 font-bold text-sm" title="오브 - 장비 옵션을 재조정">
            🔮 {orbs}
          </p>
        </div>
      </div>

      {/* 현재 층 정보 */}
      <div className="bg-gray-800 rounded p-2 border border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-300 font-semibold">현재 층</p>
            {player.floorLocked && (
              <span className="text-xs text-yellow-400 font-bold">🔒 고정</span>
            )}
          </div>
          <p className="text-sm text-cyan-400 font-bold">
            {player.floorState === 'boss_battle' ? '⚔️ 보스 전투 중' :
             `남은 몬스터: ${Math.max(0, actualMonstersPerFloor - player.monstersKilledInFloor)} / ${actualMonstersPerFloor}`}
          </p>
        </div>

        {/* 층 정보 + 버튼들 */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xl font-bold flex-1">
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

          {/* 층 컨트롤 버튼들 */}
          {player.floorState !== 'boss_battle' && (
            <div className="flex items-center gap-1">
              {/* 층 고정 토글 */}
              <button
                onClick={toggleFloorLock}
                className={`px-2 py-1.5 rounded font-bold text-xs transition-all ${
                  player.floorLocked
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
                title={player.floorLocked ? '층 고정 해제' : '층 고정'}
              >
                {player.floorLocked ? '🔒' : '🔓'}
              </button>

              {/* 내려가기 버튼 */}
              <button
                onClick={goDownFloor}
                disabled={player.floor <= 1}
                className={`px-2 py-1.5 rounded font-bold text-xs transition-all ${
                  player.floor > 1
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                title="이전 층으로"
              >
                ⬇️
              </button>

              {/* 보스 도전 버튼 */}
              <button
                onClick={enterBossBattle}
                disabled={!canEnterBoss}
                className={`px-3 py-1.5 rounded font-bold text-sm transition-all whitespace-nowrap ${
                  canEnterBoss
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                🔥 보스 도전
              </button>
            </div>
          )}
        </div>

        {/* 보스 타이머 또는 레어/전설 몬스터 타이머 영역 */}
        <div className="mt-2 h-6 flex items-center">
          {player.floorState === 'boss_battle' && (
            <div className="w-full space-y-0.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-red-600 font-bold">⏰ 보스 타이머</span>
                <span className="text-xs text-red-600 font-bold">{player.bossTimer}초</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-3 overflow-hidden border-2 border-red-500">
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
                  <div className="w-full space-y-0.5">
                    <div className="flex justify-between items-center px-1">
                      <span className={`text-xs font-bold ${isLegendary ? 'text-orange-600' : 'text-purple-600'}`}>
                        ⏰ {isLegendary ? '전설' : '레어'} 몬스터!
                      </span>
                      <span className={`text-xs font-bold ${isLegendary ? 'text-orange-600' : 'text-purple-600'}`}>
                        {remainingTime}초
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 overflow-hidden border-2 ${
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
