import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, formatNumberWithCommas, getHPPercent } from '../../utils/formatter';
import { getTotalSkillEffects } from '../../data/skills';
import { getHeroById, getHeroStats } from '../../data/heroes';
import { EQUIPMENT_CONFIG, getMonstersPerFloor, FLOOR_CONFIG } from '../../data/gameBalance';
import { getTotalRelicEffects } from '../../data/prestigeRelics';
import { getEnhanceBonus } from '../../data/equipmentSets';
import BattleField from '../Battle/BattleField';
import BossBattle from '../Battle/BossBattle';

const PlayerInfo = () => {
  const { gameState, enterBossBattle, toggleFloorLock, goDownFloor, goToFloor, engine } = useGame();
  const [showFloorInput, setShowFloorInput] = useState(false);
  const [targetFloor, setTargetFloor] = useState('');
  const { player, currentMonster, orbs = 0, equipment = {}, skillLevels = {}, slotEnhancements = {}, heroes = {}, relics = {} } = gameState;

  const hpPercent = getHPPercent(currentMonster.hp, currentMonster.maxHp);
  const expPercent = (player.exp / player.expToNextLevel) * 100;

  // 전투력 계산
  const calculateCombatPower = () => {
    const skillEffects = getTotalSkillEffects(skillLevels);
    const relicEffects = getTotalRelicEffects(relics);

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

    let equipmentAttack = 0;
    let equipmentCritChance = 0;
    let equipmentCritDmg = 0;

    Object.entries(equipment).forEach(([slot, item]) => {
      if (item) {
        const slotEnhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        const itemEnhanceBonus = 1 + getEnhanceBonus(item.enhanceLevel) / 100;
        item.stats.forEach(stat => {
          const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats?.includes(stat.id);
          const slotBonus = isExcluded ? 1 : slotEnhancementBonus;
          const itemBonus = stat.isMain ? itemEnhanceBonus : 1;
          if (stat.id === 'attack') equipmentAttack += stat.value * slotBonus * itemBonus;
          else if (stat.id === 'critChance') equipmentCritChance += stat.value * slotBonus * itemBonus;
          else if (stat.id === 'critDmg') equipmentCritDmg += stat.value * slotBonus * itemBonus;
        });
      }
    });

    const totalAttack = Math.floor(player.stats.baseAtk + equipmentAttack + heroAttack);
    const totalCritChance = player.stats.critChance + equipmentCritChance + (skillEffects.critChance || 0) + heroCritChance + (relicEffects.critChance || 0);
    const totalCritDmg = player.stats.critDmg + equipmentCritDmg + (skillEffects.critDmg || 0) + heroCritDmg + (relicEffects.critDmg || 0);

    const critChanceMultiplier = Math.min(totalCritChance, 100) / 100;
    const avgDamagePerHit = totalAttack * (1 + critChanceMultiplier * (totalCritDmg / 100));

    const relicDamageMultiplier = 1 + (relicEffects.damagePercent || 0) / 100;
    return Math.floor(avgDamagePerHit * 10 * 30 * relicDamageMultiplier);
  };

  const combatPower = calculateCombatPower();

  // 몬스터 수 계산
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

  const collectionBonus = engine ? engine.calculateCollectionBonus() : { monsterReduction: 0 };
  const relicEffectsForMonster = getTotalRelicEffects(relics);
  const relicMonsterReduction = Math.floor(relicEffectsForMonster.monstersPerStageReduction || 0);
  const baseMonstersPerFloor = getMonstersPerFloor(player.floor);
  const actualMonstersPerFloor = Math.max(5, baseMonstersPerFloor - equipmentMonsterReduction - collectionBonus.monsterReduction - relicMonsterReduction);
  const monstersKilled = Math.floor(player.monstersKilledInFloor);
  const monstersRemaining = Math.max(0, Math.floor(actualMonstersPerFloor - monstersKilled));
  const monsterProgress = (monstersKilled / actualMonstersPerFloor) * 100;

  const canEnterBoss = player.monstersKilledInFloor >= actualMonstersPerFloor && player.floorState !== 'boss_battle';

  // 보스 타이머 최대값 계산 (기본값 + 유물 보너스)
  const maxBossTimer = FLOOR_CONFIG.bossTimeLimit + (relicEffectsForMonster.bossTimeLimit || 0);

  // 보스전일 때는 BossBattle 컴포넌트 렌더링
  if (player.floorState === 'boss_battle') {
    return <BossBattle />;
  }

  return (
    <div className="bg-game-panel border border-game-border rounded-lg overflow-hidden">
      {/* 상단 헤더 - 컴팩트 */}
      <div className="px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {/* 좌측: 레벨 & 전투력 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 font-bold text-lg">Lv.{player.level}</span>
              <span className="text-gray-500 text-xs">(최고 {player.highestFloor}층)</span>
            </div>
            <div className="text-rose-400 font-bold text-sm flex items-center gap-1" title="전투력">
              <span>⚡</span>
              <span>{formatNumber(combatPower)}</span>
            </div>
          </div>

          {/* 우측: 재화 */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-yellow-400 font-bold">💰 {formatNumber(player.gold)}</span>
            <span className="text-blue-400 font-bold">📘 {player.skillPoints || 0}</span>
            {player.totalPrestiges > 0 && (
              <span className="text-pink-400 font-bold">🏺 {gameState.relicFragments || 0}</span>
            )}
            <span className="text-purple-300 font-bold">🔮 {orbs}</span>
          </div>
        </div>
      </div>

      {/* 배틀필드 영역 */}
      <div className="relative">
        <BattleField />

        {/* 배틀필드 위 오버레이 - 층 정보 */}
        <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            {/* 층 & 몬스터 정보 */}
            <div className="flex items-center gap-2">
              <span
                className="text-white font-bold text-lg cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => setShowFloorInput(true)}
                title={`클릭하여 층 이동 (최고 ${player.highestFloor}층)`}
              >
                {player.floor}층
              </span>
              {player.floorLocked && <span className="text-yellow-400 text-xs">🔒</span>}
              <span className="text-gray-400">|</span>
              <span className={`font-semibold ${
                currentMonster.isLegendary ? 'text-orange-400' : currentMonster.isRare ? 'text-purple-400' : 'text-gray-300'
              }`}>
                {currentMonster.isLegendary ? '🌟 ' : currentMonster.isRare ? '✨ ' : ''}
                {currentMonster.name}
              </span>
            </div>

            {/* 진행도 */}
            <div
              className="flex items-center gap-1 text-xs cursor-help"
              title={`기본 ${baseMonstersPerFloor}마리${(Math.floor(equipmentMonsterReduction) + collectionBonus.monsterReduction + relicMonsterReduction) > 0 ? `\n감소: -${Math.floor(equipmentMonsterReduction) + collectionBonus.monsterReduction + relicMonsterReduction}마리` : ''}${Math.floor(equipmentMonsterReduction) > 0 ? `\n  └ 장비: -${Math.floor(equipmentMonsterReduction)}` : ''}${collectionBonus.monsterReduction > 0 ? `\n  └ 도감: -${collectionBonus.monsterReduction}` : ''}${relicMonsterReduction > 0 ? `\n  └ 유물: -${relicMonsterReduction}` : ''}`}
            >
              <span className="text-gray-400">{monstersKilled}/{Math.floor(actualMonstersPerFloor)}</span>
            </div>
          </div>
        </div>

        {/* 배틀필드 아래 오버레이 - HP & 컨트롤 */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
          {/* 몬스터 HP 바 */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-gray-300 font-semibold">{currentMonster.name}</span>
              <span className="text-gray-400">
                {formatNumber(Math.max(0, currentMonster.hp))} / {formatNumber(currentMonster.maxHp)}
              </span>
            </div>
            <div className="w-full bg-gray-900/80 rounded-full h-3 overflow-hidden border border-gray-600">
              <div
                className={`h-full transition-all duration-300 ${
                  currentMonster.isLegendary
                    ? 'bg-gradient-to-r from-orange-600 to-orange-400'
                    : currentMonster.isRare
                      ? 'bg-gradient-to-r from-purple-600 to-purple-400'
                      : 'bg-gradient-to-r from-green-600 to-green-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* 층 컨트롤 */}
          <div className="flex items-center justify-between">
            {/* 진행 바 */}
            <div className="flex-1 mr-2">
              <div className="w-full bg-gray-900/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${monsterProgress}%` }}
                />
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleFloorLock}
                className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${
                  player.floorLocked
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                    : 'bg-gray-700/80 hover:bg-gray-600 text-gray-400'
                }`}
                title={player.floorLocked ? '층 고정 해제' : '층 고정'}
              >
                {player.floorLocked ? '🔒' : '🔓'}
              </button>

              <button
                onClick={() => setShowFloorInput(true)}
                disabled={player.highestFloor <= 1}
                className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${
                  player.highestFloor > 1
                    ? 'bg-cyan-700/80 hover:bg-cyan-600 text-white'
                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                }`}
                title={`층 이동 (1~${player.highestFloor}층)`}
              >
                🪜
              </button>

              <button
                onClick={goDownFloor}
                disabled={player.floor <= 1}
                className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${
                  player.floor > 1
                    ? 'bg-gray-700/80 hover:bg-gray-600 text-white'
                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                }`}
                title="이전 층으로"
              >
                ⬇️
              </button>

              <button
                onClick={enterBossBattle}
                disabled={!canEnterBoss}
                className={`px-3 h-7 rounded font-bold text-xs transition-all flex items-center gap-1 ${
                  canEnterBoss
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                }`}
              >
                🔥 보스
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 경험치 바 - 하단 */}
      <div className="px-3 py-2 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-xs font-bold min-w-[32px]">EXP</span>
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
              style={{ width: `${expPercent}%` }}
            />
          </div>
          <span className="text-gray-500 text-xs min-w-[80px] text-right">
            {formatNumberWithCommas(player.exp)} / {formatNumberWithCommas(player.expToNextLevel)}
          </span>
        </div>
      </div>

      {/* 층 이동 플로팅 모달 */}
      {showFloorInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowFloorInput(false)}>
          <div
            className="bg-gray-900 border-2 border-cyan-500/50 rounded-xl p-4 shadow-2xl shadow-cyan-500/20 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-3">
              <div className="text-cyan-400 font-bold text-lg mb-1">🪜 층 이동</div>
              <div className="text-gray-400 text-xs">1 ~ {player.highestFloor}층 이동 가능</div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                value={targetFloor}
                onChange={(e) => setTargetFloor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const floor = parseInt(targetFloor);
                    if (floor > 0 && floor <= player.highestFloor) {
                      goToFloor(floor);
                      setShowFloorInput(false);
                      setTargetFloor('');
                    }
                  } else if (e.key === 'Escape') {
                    setShowFloorInput(false);
                    setTargetFloor('');
                  }
                }}
                autoFocus
                placeholder="층 입력"
                min="1"
                max={player.highestFloor}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-lg focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-gray-400">층</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowFloorInput(false);
                  setTargetFloor('');
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm transition-all"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const floor = parseInt(targetFloor);
                  if (floor > 0 && floor <= player.highestFloor) {
                    goToFloor(floor);
                    setShowFloorInput(false);
                    setTargetFloor('');
                  }
                }}
                disabled={!targetFloor || parseInt(targetFloor) < 1 || parseInt(targetFloor) > player.highestFloor}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                  targetFloor && parseInt(targetFloor) >= 1 && parseInt(targetFloor) <= player.highestFloor
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                이동
              </button>
            </div>
            {/* 빠른 이동 버튼 */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-gray-500 text-xs mb-2">빠른 이동</div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => { goToFloor(1); setShowFloorInput(false); setTargetFloor(''); }}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
                >
                  1층
                </button>
                {player.highestFloor > 10 && (
                  <button
                    onClick={() => { goToFloor(Math.floor(player.highestFloor / 2)); setShowFloorInput(false); setTargetFloor(''); }}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {Math.floor(player.highestFloor / 2)}층
                  </button>
                )}
                <button
                  onClick={() => { goToFloor(player.highestFloor); setShowFloorInput(false); setTargetFloor(''); }}
                  className="px-2 py-1 bg-cyan-800 hover:bg-cyan-700 text-cyan-300 rounded text-xs"
                >
                  최고층 ({player.highestFloor})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;
