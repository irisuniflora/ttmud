import React from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, formatPercent } from '../../utils/formatter';
import { getTotalSkillEffects } from '../../data/skills';
import { getHeroById, getHeroStats } from '../../data/heroes';
import { EQUIPMENT_CONFIG } from '../../data/gameBalance';

const StatsList = () => {
  const { gameState, engine } = useGame();
  const { player, skillLevels, equipment, slotEnhancements = {}, heroes } = gameState;

  const totalDPS = engine.calculateTotalDPS();
  const skillEffects = getTotalSkillEffects(skillLevels);

  // 영웅 버프 계산
  let heroBuffs = {
    attack: 0,
    critChance: 0,
    critDmg: 0,
    goldBonus: 0,
    dropRate: 0,
    expBonus: 0,
    hpPercentDmgChance: 0,
    hpPercentDmgValue: 0,
    dotDmgPercent: 0,
    stageSkipChance: 0,
  };

  Object.keys(heroes || {}).forEach(heroId => {
    const heroState = heroes[heroId];
    if (heroState && heroState.inscribed) {
      const heroData = getHeroById(heroId);
      if (heroData) {
        const stats = getHeroStats(heroData, heroState.grade, heroState.stars);
        if (stats.attack) heroBuffs.attack += stats.attack;
        if (stats.critChance) heroBuffs.critChance += stats.critChance;
        if (stats.critDmg) heroBuffs.critDmg += stats.critDmg;
        if (stats.goldBonus) heroBuffs.goldBonus += stats.goldBonus;
        if (stats.dropRate) heroBuffs.dropRate += stats.dropRate;
        if (stats.expBonus) heroBuffs.expBonus += stats.expBonus;
        if (stats.hpPercentDmgChance) heroBuffs.hpPercentDmgChance += stats.hpPercentDmgChance;
        if (stats.hpPercentDmgValue) heroBuffs.hpPercentDmgValue += stats.hpPercentDmgValue;
        if (stats.dotDmgPercent) heroBuffs.dotDmgPercent += stats.dotDmgPercent;
        if (stats.stageSkipChance) heroBuffs.stageSkipChance += stats.stageSkipChance;
      }
    }
  });

  // 장비 스탯 계산
  let equipmentAttack = 0;
  let equipmentCritChance = 0;
  let equipmentCritDmg = 0;
  let equipmentAccuracy = 0;
  let equipmentPenetration = 0;
  let equipmentGoldBonus = 0;
  let equipmentDropRate = 0;
  let equipmentExpBonus = 0;
  let equipmentMonstersPerStageReduction = 0;
  let equipmentBossDamageIncrease = 0;
  let equipmentNormalMonsterDamageIncrease = 0;

  Object.entries(equipment).forEach(([slot, item]) => {
    if (item) {
      const enhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
      item.stats.forEach(stat => {
        if (stat.id === 'attack') {
          equipmentAttack += stat.value * enhancementBonus;
        } else if (stat.id === 'critChance') {
          equipmentCritChance += stat.value * enhancementBonus;
        } else if (stat.id === 'critDmg') {
          equipmentCritDmg += stat.value * enhancementBonus;
        } else if (stat.id === 'accuracy') {
          equipmentAccuracy += stat.value * enhancementBonus;
        } else if (stat.id === 'penetration') {
          equipmentPenetration += stat.value * enhancementBonus;
        } else if (stat.id === 'goldBonus') {
          equipmentGoldBonus += stat.value * enhancementBonus;
        } else if (stat.id === 'dropRate') {
          equipmentDropRate += stat.value * enhancementBonus;
        } else if (stat.id === 'expBonus') {
          equipmentExpBonus += stat.value * enhancementBonus;
        } else if (stat.id === 'monstersPerStageReduction') {
          equipmentMonstersPerStageReduction += stat.value * enhancementBonus;
        } else if (stat.id === 'bossDamageIncrease') {
          equipmentBossDamageIncrease += stat.value * enhancementBonus;
        } else if (stat.id === 'normalMonsterDamageIncrease') {
          equipmentNormalMonsterDamageIncrease += stat.value * enhancementBonus;
        }
      });
    }
  });

  // 총 공격력 계산 (캐릭터 기본 + 장비 + 영웅)
  const totalAttack = Math.floor(
    player.stats.baseAtk +
    equipmentAttack +
    heroBuffs.attack
  );

  // 방생 보너스 계산
  const rangeStart = Math.floor((player.floor - 1) / 5) * 5 + 1;
  const releaseBonus = engine ? engine.calculateReleaseBonus(rangeStart) : { damageBonus: 0, dropRateBonus: 0 };

  // 총 크리티컬 확률과 데미지
  const totalCritChance = player.stats.critChance + equipmentCritChance + (skillEffects.critChance || 0) + heroBuffs.critChance;
  const totalCritDmg = player.stats.critDmg + equipmentCritDmg + (skillEffects.critDmg || 0) + heroBuffs.critDmg;

  // 전투력 계산 (30초간 허수아비 타격 기대 데미지)
  // 평균 데미지 = 공격력 × (1 + 크리확률 × 크리데미지)
  const critChanceMultiplier = Math.min(totalCritChance, 100) / 100; // 최대 100%
  const avgDamagePerHit = totalAttack * (1 + critChanceMultiplier * (totalCritDmg / 100));
  // 30초간 기대 데미지 (초당 10회 공격 가정)
  const combatPower = Math.floor(avgDamagePerHit * 10 * 30);

  const stats = [
    // DPS 관련 스탯 (와인색)
    { icon: '⚔️', name: '공격력', value: formatNumber(totalAttack), color: 'text-rose-400' },
    { icon: '💥', name: '치명타 확률', value: formatPercent(totalCritChance), color: 'text-rose-400' },
    { icon: '🎯', name: '치명타 데미지', value: formatPercent(totalCritDmg), color: 'text-rose-400' },
    { icon: '⚡', name: '전투력', value: formatNumber(combatPower), color: 'text-rose-400' },
    { icon: '🔍', name: '명중률', value: formatPercent(equipmentAccuracy), color: 'text-rose-400', hide: equipmentAccuracy === 0 },
    { icon: '🔱', name: '관통', value: formatPercent(equipmentPenetration), color: 'text-rose-400', hide: equipmentPenetration === 0 },
    { icon: '👑', name: '보스 데미지', value: '+' + formatPercent(equipmentBossDamageIncrease), color: 'text-rose-400' },
    { icon: '🗡️', name: '일반몹 데미지', value: '+' + formatPercent(equipmentNormalMonsterDamageIncrease), color: 'text-rose-400' },

    // 보너스 관련 스탯 (금색)
    { icon: '💰', name: '골드 획득량', value: '+' + formatPercent(player.stats.goldBonus + equipmentGoldBonus + (skillEffects.goldPercent || 0) + (skillEffects.permanentGoldPercent || 0) + heroBuffs.goldBonus), color: 'text-yellow-400' },
    { icon: '🍀', name: '드랍율', value: formatPercent(player.stats.dropRate + equipmentDropRate + (skillEffects.dropRate || 0) + heroBuffs.dropRate), color: 'text-yellow-400' },
    { icon: '✨', name: '경험치 증가량', value: '+' + formatPercent(equipmentExpBonus + heroBuffs.expBonus), color: 'text-yellow-400', hide: (equipmentExpBonus + heroBuffs.expBonus) === 0 },
    { icon: '💀', name: '체력퍼뎀', value: `${formatPercent(heroBuffs.hpPercentDmgChance)} (${Math.floor(heroBuffs.hpPercentDmgValue)}%HP)`, color: 'text-yellow-400', hide: heroBuffs.hpPercentDmgChance === 0 },
    { icon: '🔥', name: '도트 데미지', value: formatPercent(heroBuffs.dotDmgPercent), color: 'text-yellow-400', hide: heroBuffs.dotDmgPercent === 0 },
    { icon: '⏭️', name: '스킵 확률', value: formatPercent(heroBuffs.stageSkipChance), color: 'text-yellow-400', hide: heroBuffs.stageSkipChance === 0 },

    // 방생 보너스 (연보라색) - 현재 구간에만 적용됨
    {
      icon: '🕊️',
      name: '방생 데미지',
      value: '+' + formatPercent(releaseBonus.damageBonus),
      color: 'text-purple-300',
      hide: releaseBonus.damageBonus === 0,
      tooltip: `${rangeStart}~${rangeStart+4}층 구간에 적용`
    },
    {
      icon: '🕊️',
      name: '방생 드랍',
      value: '+' + formatPercent(releaseBonus.dropRateBonus),
      color: 'text-purple-300',
      hide: releaseBonus.dropRateBonus === 0,
      tooltip: `${rangeStart}~${rangeStart+4}층 구간에 적용`
    },

    // 몬스터 감소 (맨 아래, 초록색) - 장비 + 도감 보너스
    {
      icon: '➖',
      name: '몬스터 감소',
      value: `${Math.floor(equipmentMonstersPerStageReduction) + (engine ? engine.calculateCollectionBonus().monsterReduction : 0)}`,
      color: 'text-green-400'
    },
  ];

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-3 shadow-md h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-100 mb-2">스탯</h3>
      <div className="grid grid-cols-2 gap-1.5 flex-1 content-start">
        {stats.filter(stat => !stat.hide).map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-800 rounded p-1.5 border border-gray-700"
            title={stat.tooltip || ''}
          >
            <div className="flex items-center gap-1">
              <span className="text-sm">{stat.icon}</span>
              <span className="text-xs text-gray-200 font-semibold">{stat.name}</span>
            </div>
            <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsList;
