import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, formatPercent } from '../../utils/formatter';
import { getTotalSkillEffects } from '../../data/skills';
import { getHeroById, getHeroStats } from '../../data/heroes';
import { EQUIPMENT_CONFIG } from '../../data/gameBalance';
import { getTotalRelicEffects } from '../../data/prestigeRelics';
import { EQUIPMENT_SETS, EQUIPMENT_SLOT_NAMES } from '../../data/equipmentSets';
import { calculateSetBonuses, SET_EFFECT_TYPES } from '../../data/monsterSets';

// 스탯 상세 분석 팝업 컴포넌트
const StatDetailPopup = ({ stat, onClose, breakdown }) => {
  if (!stat || !breakdown) return null;

  // 공격력인 경우 특별 수식 표시
  const isAttackStat = stat.id === 'attack';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-4 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyan-300">
            {stat.icon} {stat.name} 상세 분석
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* 최종 값 */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4 text-center">
          <div className="text-sm text-gray-400">최종 값</div>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
        </div>

        {/* 계산 공식 */}
        <div className="space-y-2">
          {breakdown.map((item, index) => (
            <div key={index} className={`flex justify-between items-center rounded px-3 py-2 ${
              item.value === 0 ? 'bg-gray-800/50 text-gray-500' :
              item.isMultiplier ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-gray-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.icon}</span>
                <div>
                  <span className={`text-sm ${item.value === 0 ? 'text-gray-500' : item.isMultiplier ? 'text-yellow-300' : 'text-gray-300'}`}>
                    {item.source}
                  </span>
                  {item.detail && (
                    <div className="text-xs text-gray-500">{item.detail}</div>
                  )}
                </div>
              </div>
              <span className={`font-bold ${
                item.value === 0 ? 'text-gray-500' :
                item.isMultiplier ? 'text-yellow-400' :
                item.value > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.isMultiplier
                  ? `×${(1 + item.value / 100).toFixed(2)}`
                  : item.isPercent
                    ? (item.value >= 0 ? '+' : '') + formatPercent(item.value)
                    : (item.value >= 0 ? '+' : '') + formatNumber(item.value)
                }
              </span>
            </div>
          ))}
        </div>

        {/* 수식 요약 */}
        {breakdown.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              {isAttackStat ? (
                <span>
                  (기본 + 장비) × 스킬% × 장비% + 동료 × 동료강화% + 도감
                </span>
              ) : (
                breakdown.filter(b => b.value !== 0).map(b => b.source).join(' + ')
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsList = () => {
  const { gameState, engine } = useGame();
  const { player, skillLevels, equipment, slotEnhancements = {}, heroes, prestigeRelics = {} } = gameState;
  const [selectedStat, setSelectedStat] = useState(null);

  const totalDPS = engine.calculateTotalDPS();
  const skillEffects = getTotalSkillEffects(skillLevels);
  const relicEffects = getTotalRelicEffects(prestigeRelics);

  // 영웅 버프 계산 (상세 정보 포함)
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
  let heroDetails = []; // 어떤 영웅이 얼마나 기여하는지

  Object.keys(heroes || {}).forEach(heroId => {
    const heroState = heroes[heroId];
    if (heroState && heroState.inscribed) {
      const heroData = getHeroById(heroId);
      if (heroData) {
        const stats = getHeroStats(heroData, heroState.grade, heroState.stars);
        heroDetails.push({ name: heroData.name, stats });
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

  // 슬롯별 유물 보너스 매핑
  const slotRelicBonusMap = {
    weapon: relicEffects.weaponPercent || 0,
    helmet: relicEffects.helmetPercent || 0,
    armor: relicEffects.armorPercent || 0,
    boots: relicEffects.bootsPercent || 0,
    necklace: relicEffects.necklacePercent || 0,
    ring: relicEffects.ringPercent || 0
  };
  const allEquipmentBonus = relicEffects.equipmentPercent || 0;

  // 장비 스탯 계산 (유물 보너스 적용) - 상세 정보 포함
  let equipmentStats = {
    attack: 0,
    attackPercent: 0,
    critChance: 0,
    critDmg: 0,
    goldBonus: 0,
    dropRate: 0,
    expBonus: 0,
    monstersPerStageReduction: 0,
    bossDamageIncrease: 0,
    skipChance: 0,
  };
  let equipmentDetails = []; // 어떤 장비가 얼마나 기여하는지

  // 유물 장비 보너스 합계 (표시용)
  let totalRelicEquipBonus = 0;

  Object.entries(equipment).forEach(([slot, item]) => {
    if (item) {
      const enhancementLevel = slotEnhancements[slot] || 0;
      const enhancementBonus = 1 + (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
      // 유물 보너스: 전체 장비 보너스 + 해당 슬롯 보너스
      const slotBonus = slotRelicBonusMap[slot] || 0;
      const relicBonus = 1 + (allEquipmentBonus + slotBonus) / 100;
      totalRelicEquipBonus += (allEquipmentBonus + slotBonus);

      const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
      const itemName = setData ? `${setData.name} ${EQUIPMENT_SLOT_NAMES[slot]}` : `${EQUIPMENT_SLOT_NAMES[slot]}`;

      item.stats.forEach(stat => {
        // 크리티컬 스탯은 강화 효과 제외
        const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats?.includes(stat.id);
        const bonus = isExcluded ? 1 : enhancementBonus;
        const finalValue = stat.value * bonus * relicBonus;

        if (equipmentStats.hasOwnProperty(stat.id)) {
          equipmentStats[stat.id] += finalValue;
          equipmentDetails.push({
            slot,
            name: itemName,
            statId: stat.id,
            baseValue: stat.value,
            enhancementBonus: bonus,
            relicBonus,
            finalValue
          });
        }
      });
    }
  });

  // 도감 보너스 계산
  const collectionBonus = engine ? engine.calculateCollectionBonus() : { attack: 0, goldBonus: 0, expBonus: 0, monsterReduction: 0 };

  // 세트 보너스 계산
  const { collection } = gameState;
  const completedSets = collection.completedSets || [];
  const setBonuses = calculateSetBonuses(completedSets);

  // 보스 도감 보너스
  const bossCollectionBonus = engine ? engine.calculateBossCollectionBonus() : { damageBonus: 0 };

  // 유물 보유 개수
  const relicCount = Object.keys(prestigeRelics).length;

  // 총 공격력 계산 (GameEngine과 동일한 공식)
  // 1. 기본 공격력 + 장비 고정 공격력
  const baseAndEquipAtk = player.stats.baseAtk + equipmentStats.attack;
  // 2. 스킬 공격력% 곱연산
  const afterSkillAtk = baseAndEquipAtk * (1 + (skillEffects.atkPercent || 0) / 100);
  // 3. 장비 공격력% 곱연산
  const afterEquipPercent = afterSkillAtk * (1 + equipmentStats.attackPercent / 100);
  // 4. 동료 공격력 (동료 강화% 적용)
  const heroAttackWithBonus = heroBuffs.attack * (1 + (skillEffects.heroDmgPercent || 0) / 100);
  // 5. 도감 보너스는 별도 합산
  const totalAttack = Math.floor(afterEquipPercent + heroAttackWithBonus + collectionBonus.attack);

  // 총 크리티컬 확률과 데미지 (유물 효과 + 세트 보너스 포함)
  const totalCritChance = player.stats.critChance + equipmentStats.critChance + (skillEffects.critChance || 0) + heroBuffs.critChance + (relicEffects.critChance || 0) + setBonuses.critChance;
  const totalCritDmg = player.stats.critDmg + equipmentStats.critDmg + (skillEffects.critDmg || 0) + heroBuffs.critDmg + (relicEffects.critDmg || 0) + setBonuses.critDmg;

  // 각 스탯별 상세 breakdown 생성
  const getStatBreakdown = (statId) => {
    switch (statId) {
      case 'attack':
        return [
          // 1단계: 기본 공격력 + 장비 고정 공격력
          { icon: '👤', source: '① 기본 공격력', value: player.stats.baseAtk, detail: `레벨 ${player.level}` },
          { icon: '⚔️', source: '① 장비 공격력', value: equipmentStats.attack, detail: equipmentDetails.filter(e => e.statId === 'attack').map(e => `${e.name}: ${formatNumber(e.finalValue)}`).join(', ') || '없음' },
          // 2단계: 곱연산 적용
          { icon: '📜', source: '② 스킬 공격력%', value: skillEffects.atkPercent || 0, isPercent: true, isMultiplier: true, detail: '(기본+장비)에 곱연산' },
          { icon: '⚔️', source: '③ 장비 공격력%', value: equipmentStats.attackPercent, isPercent: true, isMultiplier: true, detail: equipmentDetails.filter(e => e.statId === 'attackPercent').map(e => `${e.name}: ${formatPercent(e.finalValue)}`).join(', ') || '없음' },
          // 3단계: 동료 공격력 (별도 계산)
          { icon: '🦸', source: '④ 동료 공격력', value: heroBuffs.attack, detail: heroDetails.filter(h => h.stats.attack).map(h => `${h.name}: ${formatNumber(h.stats.attack)}`).join(', ') || '없음' },
          { icon: '📜', source: '④ 동료 강화%', value: skillEffects.heroDmgPercent || 0, isPercent: true, isMultiplier: true, detail: '동료 공격력에 곱연산' },
          // 4단계: 도감 보너스 (합산)
          { icon: '📖', source: '⑤ 도감 보너스', value: collectionBonus.attack, detail: '몬스터 수집 보너스' },
        ];

      case 'critChance':
        return [
          { icon: '👤', source: '기본 치명타', value: player.stats.critChance, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.critChance, isPercent: true, detail: equipmentDetails.filter(e => e.statId === 'critChance').map(e => `${e.name}: ${formatPercent(e.finalValue)}`).join(', ') || '없음' },
          { icon: '📜', source: '스킬', value: skillEffects.critChance || 0, isPercent: true },
          { icon: '🦸', source: '동료', value: heroBuffs.critChance, isPercent: true, detail: heroDetails.filter(h => h.stats.critChance).map(h => `${h.name}: ${formatPercent(h.stats.critChance)}`).join(', ') || '없음' },
          { icon: '🏺', source: '유물', value: relicEffects.critChance || 0, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.critChance, isPercent: true },
        ];

      case 'critDmg':
        return [
          { icon: '👤', source: '기본 치명타 데미지', value: player.stats.critDmg, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.critDmg, isPercent: true, detail: equipmentDetails.filter(e => e.statId === 'critDmg').map(e => `${e.name}: ${formatPercent(e.finalValue)}`).join(', ') || '없음' },
          { icon: '📜', source: '스킬', value: skillEffects.critDmg || 0, isPercent: true },
          { icon: '🦸', source: '동료', value: heroBuffs.critDmg, isPercent: true, detail: heroDetails.filter(h => h.stats.critDmg).map(h => `${h.name}: ${formatPercent(h.stats.critDmg)}`).join(', ') || '없음' },
          { icon: '🏺', source: '유물', value: relicEffects.critDmg || 0, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.critDmg, isPercent: true },
        ];

      case 'bossDamage':
        return [
          { icon: '⚔️', source: '장비 보스 데미지', value: equipmentStats.bossDamageIncrease, isPercent: true, detail: equipmentDetails.filter(e => e.statId === 'bossDamageIncrease').map(e => `${e.name}: ${formatPercent(e.finalValue)}`).join(', ') || '없음' },
          { icon: '🏺', source: '유물 보스 데미지', value: relicEffects.bossDamage || 0, isPercent: true },
          { icon: '📖', source: '보스 도감 보너스', value: bossCollectionBonus.damageBonus, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.bossDamage, isPercent: true },
        ];

      case 'goldBonus':
        return [
          { icon: '👤', source: '기본 골드 보너스', value: player.stats.goldBonus, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.goldBonus, isPercent: true, detail: equipmentDetails.filter(e => e.statId === 'goldBonus').map(e => `${e.name}: ${formatPercent(e.finalValue)}`).join(', ') || '없음' },
          { icon: '📜', source: '스킬 (일반)', value: skillEffects.goldPercent || 0, isPercent: true },
          { icon: '📜', source: '스킬 (영구)', value: skillEffects.permanentGoldPercent || 0, isPercent: true },
          { icon: '🦸', source: '동료', value: heroBuffs.goldBonus, isPercent: true, detail: heroDetails.filter(h => h.stats.goldBonus).map(h => `${h.name}: ${formatPercent(h.stats.goldBonus)}`).join(', ') || '없음' },
          { icon: '🏺', source: '유물', value: relicEffects.goldPercent || 0, isPercent: true },
          { icon: '📖', source: '도감', value: collectionBonus.goldBonus, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.goldBonus, isPercent: true },
        ];

      case 'dropRate':
        return [
          { icon: '👤', source: '기본 드랍율', value: player.stats.dropRate, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.dropRate, isPercent: true, detail: equipmentDetails.filter(e => e.statId === 'dropRate').map(e => `${e.name}: ${formatPercent(e.finalValue)}`).join(', ') || '없음' },
          { icon: '📜', source: '스킬', value: skillEffects.dropRate || 0, isPercent: true },
          { icon: '🦸', source: '동료', value: heroBuffs.dropRate, isPercent: true, detail: heroDetails.filter(h => h.stats.dropRate).map(h => `${h.name}: ${formatPercent(h.stats.dropRate)}`).join(', ') || '없음' },
          { icon: '📚', source: '세트 보너스', value: setBonuses.dropRate, isPercent: true, detail: `${completedSets.length}개 세트 완성` },
        ];

      case 'expBonus':
        return [
          { icon: '📜', source: '스킬', value: skillEffects.expPercent || 0, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.expBonus, isPercent: true, detail: equipmentDetails.filter(e => e.statId === 'expBonus').map(e => `${e.name}: ${formatPercent(e.finalValue)}`).join(', ') || '없음' },
          { icon: '🦸', source: '동료', value: heroBuffs.expBonus, isPercent: true, detail: heroDetails.filter(h => h.stats.expBonus).map(h => `${h.name}: ${formatPercent(h.stats.expBonus)}`).join(', ') || '없음' },
          { icon: '📖', source: '도감', value: collectionBonus.expBonus, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.expBonus, isPercent: true },
        ];

      case 'relicDamage':
        return [
          { icon: '🏺', source: '유물 데미지%', value: relicEffects.damagePercent || 0, isPercent: true },
          { icon: '⭐', source: '유물당 데미지', value: (relicEffects.damagePerRelic || 0) * relicCount, isPercent: true, detail: `${relicCount}개 × ${relicEffects.damagePerRelic || 0}%` },
        ];

      case 'relicEquip':
        return [
          { icon: '🏺', source: '전체 장비 보너스', value: allEquipmentBonus, isPercent: true },
          { icon: '⚔️', source: '무기 보너스', value: slotRelicBonusMap.weapon, isPercent: true },
          { icon: '🛡️', source: '갑옷 보너스', value: slotRelicBonusMap.armor, isPercent: true },
          { icon: '🧤', source: '장갑 보너스', value: slotRelicBonusMap.gloves || 0, isPercent: true },
          { icon: '👢', source: '신발 보너스', value: slotRelicBonusMap.boots, isPercent: true },
          { icon: '📿', source: '목걸이 보너스', value: slotRelicBonusMap.necklace, isPercent: true },
          { icon: '💍', source: '반지 보너스', value: slotRelicBonusMap.ring, isPercent: true },
        ];

      case 'hpPercentDmg':
        return [
          { icon: '🦸', source: '발동 확률', value: heroBuffs.hpPercentDmgChance, isPercent: true, detail: heroDetails.filter(h => h.stats.hpPercentDmgChance).map(h => `${h.name}: ${formatPercent(h.stats.hpPercentDmgChance)}`).join(', ') || '없음' },
          { icon: '💀', source: 'HP 비례 데미지', value: heroBuffs.hpPercentDmgValue, isPercent: true, detail: '몬스터 최대 HP의 %' },
        ];

      case 'dotDmg':
        return [
          { icon: '🦸', source: '동료 도트 데미지', value: heroBuffs.dotDmgPercent, isPercent: true, detail: heroDetails.filter(h => h.stats.dotDmgPercent).map(h => `${h.name}: ${formatPercent(h.stats.dotDmgPercent)}`).join(', ') || '없음' },
        ];

      case 'skipChance':
        return [
          { icon: '⚔️', source: '장비 스킵 확률', value: equipmentStats.skipChance, isPercent: true },
          { icon: '🦸', source: '동료 스킵 확률', value: heroBuffs.stageSkipChance, isPercent: true, detail: heroDetails.filter(h => h.stats.stageSkipChance).map(h => `${h.name}: ${formatPercent(h.stats.stageSkipChance)}`).join(', ') || '없음' },
        ];

      case 'setBonus':
        return [
          { icon: '⚔️', source: '공격력%', value: setBonuses.attackPercent, isPercent: true },
          { icon: '💥', source: '치명타 확률', value: setBonuses.critChance, isPercent: true },
          { icon: '🎯', source: '치명타 데미지', value: setBonuses.critDmg, isPercent: true },
          { icon: '💰', source: '골드 획득량', value: setBonuses.goldBonus, isPercent: true },
          { icon: '🍀', source: '드랍율', value: setBonuses.dropRate, isPercent: true },
          { icon: '📚', source: '경험치', value: setBonuses.expBonus, isPercent: true },
          { icon: '👑', source: '보스 데미지', value: setBonuses.bossDamage, isPercent: true },
          { icon: '➖', source: '몬스터 감소', value: setBonuses.monsterReduction },
        ];

      default:
        return [];
    }
  };

  const stats = [
    // DPS 관련 스탯 (와인색)
    { id: 'attack', icon: '⚔️', name: '공격력', value: formatNumber(totalAttack), color: 'text-rose-400' },
    { id: 'critChance', icon: '💥', name: '치명타 확률', value: formatPercent(totalCritChance), color: 'text-rose-400' },
    { id: 'critDmg', icon: '🎯', name: '치명타 데미지', value: formatPercent(totalCritDmg), color: 'text-rose-400' },
    { id: 'bossDamage', icon: '👑', name: '보스 데미지', value: '+' + formatPercent(equipmentStats.bossDamageIncrease + (relicEffects.bossDamage || 0) + bossCollectionBonus.damageBonus + setBonuses.bossDamage), color: 'text-rose-400' },
    { id: 'relicDamage', icon: '💎', name: '유물 데미지', value: '+' + formatPercent((relicEffects.damagePercent || 0) + (relicEffects.damagePerRelic || 0) * relicCount), color: 'text-pink-400', hide: ((relicEffects.damagePercent || 0) + (relicEffects.damagePerRelic || 0) * relicCount) === 0 },
    { id: 'relicEquip', icon: '🧭', name: '유물 장비', value: '+' + formatPercent(totalRelicEquipBonus / 6), color: 'text-cyan-400', hide: totalRelicEquipBonus === 0, tooltip: '유물로 인한 장비 스탯 평균 증가량' },

    // 보너스 관련 스탯 (금색)
    { id: 'goldBonus', icon: '💰', name: '골드 획득량', value: '+' + formatPercent(player.stats.goldBonus + equipmentStats.goldBonus + (skillEffects.goldPercent || 0) + (skillEffects.permanentGoldPercent || 0) + heroBuffs.goldBonus + (relicEffects.goldPercent || 0) + collectionBonus.goldBonus + setBonuses.goldBonus), color: 'text-yellow-400' },
    { id: 'dropRate', icon: '🍀', name: '드랍율', value: formatPercent(player.stats.dropRate + equipmentStats.dropRate + (skillEffects.dropRate || 0) + heroBuffs.dropRate + setBonuses.dropRate), color: 'text-yellow-400' },
    { id: 'expBonus', icon: '📚', name: '경험치 증가량', value: '+' + formatPercent((skillEffects.expPercent || 0) + equipmentStats.expBonus + heroBuffs.expBonus + collectionBonus.expBonus + setBonuses.expBonus), color: 'text-yellow-400', hide: ((skillEffects.expPercent || 0) + equipmentStats.expBonus + heroBuffs.expBonus + collectionBonus.expBonus + setBonuses.expBonus) === 0 },
    { id: 'hpPercentDmg', icon: '💀', name: '체력퍼뎀', value: `${formatPercent(heroBuffs.hpPercentDmgChance + setBonuses.hpPercentDmg)} (${Math.floor(heroBuffs.hpPercentDmgValue)}%HP)`, color: 'text-yellow-400', hide: (heroBuffs.hpPercentDmgChance + setBonuses.hpPercentDmg) === 0 },
    { id: 'dotDmg', icon: '🔥', name: '도트 데미지', value: formatPercent(heroBuffs.dotDmgPercent + setBonuses.dotDamage), color: 'text-yellow-400', hide: (heroBuffs.dotDmgPercent + setBonuses.dotDamage) === 0 },
    { id: 'skipChance', icon: '⏭️', name: '스킵 확률', value: formatPercent(heroBuffs.stageSkipChance + equipmentStats.skipChance + setBonuses.skipChance), color: 'text-yellow-400', hide: (heroBuffs.stageSkipChance + equipmentStats.skipChance + setBonuses.skipChance) === 0 },

    // 세트 보너스 (청록색) - 완성 세트 개수와 주요 보너스 표시
    {
      id: 'setBonus',
      icon: '📚',
      name: '세트 보너스',
      value: `${completedSets.length}세트`,
      color: 'text-cyan-400',
      hide: completedSets.length === 0,
      tooltip: `완성 세트: ${completedSets.length}개\n공격력+${setBonuses.attackPercent}%, 치확+${setBonuses.critChance}%`
    },

    // 환생 횟수 (핑크색)
    {
      id: 'prestige',
      icon: '🔄',
      name: '환생 횟수',
      value: `${player.totalPrestiges || 0}회`,
      color: 'text-pink-400',
      hide: (player.totalPrestiges || 0) === 0,
      noPopup: true // 이 스탯은 클릭해도 팝업 없음
    },
  ];

  const handleStatClick = (stat) => {
    if (stat.noPopup) return;
    setSelectedStat(stat);
  };

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-3 shadow-md h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-100 mb-2">스탯</h3>
      <div className="grid grid-cols-2 gap-1.5 flex-1 content-start overflow-y-auto">
        {stats.filter(stat => !stat.hide).map((stat, index) => (
          <div
            key={index}
            className={`flex items-center justify-between bg-gray-800 rounded p-1.5 border border-gray-700 ${
              stat.noPopup ? '' : 'cursor-pointer hover:bg-gray-700 hover:border-cyan-600 transition-colors'
            }`}
            title={stat.tooltip || (stat.noPopup ? '' : '클릭하여 상세 분석 보기')}
            onClick={() => handleStatClick(stat)}
          >
            <div className="flex items-center gap-1">
              <span className="text-sm">{stat.icon}</span>
              <span className="text-xs text-gray-200 font-semibold">{stat.name}</span>
            </div>
            <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* 스탯 상세 분석 팝업 */}
      {selectedStat && (
        <StatDetailPopup
          stat={selectedStat}
          breakdown={getStatBreakdown(selectedStat.id)}
          onClose={() => setSelectedStat(null)}
        />
      )}
    </div>
  );
};

export default StatsList;
