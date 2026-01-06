import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, formatPercent } from '../../utils/formatter';
import { getTotalSkillEffects } from '../../data/skills';
import { EQUIPMENT_CONFIG, CLASS_CONFIG, canAdvanceClass, getClassBonuses } from '../../data/gameBalance';
import { getTotalRelicEffects } from '../../data/prestigeRelics';
import { EQUIPMENT_SETS, EQUIPMENT_SLOT_NAMES, getEnhanceBonus } from '../../data/equipmentSets';
import { calculateSetBonuses, SET_EFFECT_TYPES } from '../../data/monsterSets';
import TrainingDummy from '../TrainingDummy/TrainingDummy';

// 전직 완료 모달 컴포넌트
const ClassAdvanceModal = ({ isOpen, onClose, className, classLevel, bonuses }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* 모달 */}
      <div className={`relative transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        {/* 빛나는 배경 효과 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl blur-xl opacity-60 animate-pulse" />

        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 border-2 border-purple-400 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          {/* 별 효과 */}
          <div className="absolute top-4 left-4 text-yellow-300 animate-bounce">✦</div>
          <div className="absolute top-6 right-6 text-purple-300 animate-bounce" style={{ animationDelay: '0.2s' }}>✧</div>
          <div className="absolute bottom-8 left-8 text-pink-300 animate-bounce" style={{ animationDelay: '0.4s' }}>✦</div>
          <div className="absolute bottom-6 right-4 text-cyan-300 animate-bounce" style={{ animationDelay: '0.6s' }}>✧</div>

          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="text-7xl animate-bounce">🎖️</div>
              <div className="absolute -top-2 -right-2 text-2xl animate-spin" style={{ animationDuration: '3s' }}>✨</div>
            </div>
          </div>

          {/* 타이틀 */}
          <h2 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-yellow-200 via-purple-200 to-pink-200 text-transparent bg-clip-text">
            전직 완료!
          </h2>

          {/* 클래스 이름 */}
          <div className="text-center mb-6">
            <span className="text-2xl font-bold text-purple-300">{className}</span>
            <span className="text-lg text-gray-400 ml-2">({classLevel}차 전직)</span>
          </div>

          {/* 보너스 정보 */}
          {bonuses && (
            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-purple-500/30">
              <div className="text-sm text-purple-300 font-bold mb-3 text-center">획득 보너스</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between bg-purple-900/30 rounded-lg px-3 py-2">
                  <span className="text-gray-300">⚔️ 공격력</span>
                  <span className="text-green-400 font-bold">+{bonuses.attackPercent}%</span>
                </div>
                <div className="flex items-center justify-between bg-purple-900/30 rounded-lg px-3 py-2">
                  <span className="text-gray-300">💥 치확</span>
                  <span className="text-green-400 font-bold">+{bonuses.critChance}%</span>
                </div>
                <div className="flex items-center justify-between bg-purple-900/30 rounded-lg px-3 py-2">
                  <span className="text-gray-300">🎯 치뎀</span>
                  <span className="text-green-400 font-bold">+{bonuses.critDamage}%</span>
                </div>
                <div className="flex items-center justify-between bg-purple-900/30 rounded-lg px-3 py-2">
                  <span className="text-gray-300">🔥 최종뎀</span>
                  <span className="text-green-400 font-bold">+{bonuses.finalDamagePercent || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 확인 버튼 */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
          >
            확인
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

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
                  ? `+${formatPercent(item.value)}`
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
  const { gameState, engine, advanceClass } = useGame();
  const { player, skillLevels, equipment, slotEnhancements = {}, prestigeRelics = {} } = gameState;
  const [selectedStat, setSelectedStat] = useState(null);
  const [showDummy, setShowDummy] = useState(false);
  const [classAdvanceModal, setClassAdvanceModal] = useState({ isOpen: false, className: '', classLevel: 0, bonuses: null });

  // localStorage에서 최고 DPS 가져오기
  const bestDPS = parseInt(localStorage.getItem('ttmud_bestDPS') || '0', 10);

  // 전직 시스템 정보
  const currentClassLevel = player.classLevel || 0;
  const currentClass = CLASS_CONFIG.levels[currentClassLevel];
  const nextClass = CLASS_CONFIG.levels[currentClassLevel + 1];
  const canAdvance = nextClass && canAdvanceClass(currentClassLevel, player.level);
  const classBonuses = getClassBonuses(currentClassLevel);

  const totalDPS = engine.calculateTotalDPS();
  const skillEffects = getTotalSkillEffects(skillLevels);
  const relicEffects = getTotalRelicEffects(prestigeRelics);

  // 슬롯별 유물 보너스 매핑
  const slotRelicBonusMap = {
    weapon: relicEffects.weaponPercent || 0,
    armor: relicEffects.armorPercent || 0,
    gloves: relicEffects.glovesPercent || 0,
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

  // 구 영웅 시스템 제거됨 - 빈 객체로 초기화 (새 동료 시스템은 GameEngine에서 자동 적용)
  const heroBuffs = {
    attack: 0,
    critChance: 0,
    critDmg: 0,
    goldBonus: 0,
    dropRate: 0,
    expBonus: 0,
    stageSkipChance: 0,
    accuracy: 0
  };
  const heroDetails = [];

  Object.entries(equipment).forEach(([slot, item]) => {
    if (item) {
      const enhancementLevel = slotEnhancements[slot] || 0;
      const enhancementBonus = 1 + (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
      // 아이템 자체 강화 보너스 (+1~+20 강화)
      const itemEnhanceBonus = 1 + getEnhanceBonus(item.enhanceLevel) / 100;
      // 유물 보너스: 전체 장비 보너스 + 해당 슬롯 보너스
      const slotBonus = slotRelicBonusMap[slot] || 0;
      const relicBonus = 1 + (allEquipmentBonus + slotBonus) / 100;

      const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
      const itemName = setData ? `${setData.name} ${EQUIPMENT_SLOT_NAMES[slot]}` : `${EQUIPMENT_SLOT_NAMES[slot]}`;

      // 기본 스탯 ID 목록 (강화 보너스 적용 대상)
      const mainStatIds = ['attack', 'accuracy', 'critChance', 'monstersPerStageReduction', 'skipChance', 'ppBonus'];

      item.stats.forEach((stat, statIdx) => {
        // 크리티컬 스탯은 슬롯 강화 효과 제외
        const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats?.includes(stat.id);
        const slotEnhanceBonus = isExcluded ? 1 : enhancementBonus;
        // 아이템 강화 보너스는 기본옵션(isMain)에만 적용
        // 레거시 지원: isMain 플래그가 없는 경우 첫번째 스탯이 mainStatIds에 있으면 기본옵션으로 취급
        const isMainStat = stat.isMain || (statIdx === 0 && mainStatIds.includes(stat.id));
        const itemBonus = isMainStat ? itemEnhanceBonus : 1;
        const finalValue = stat.value * slotEnhanceBonus * itemBonus * relicBonus;

        if (equipmentStats.hasOwnProperty(stat.id)) {
          equipmentStats[stat.id] += finalValue;
          equipmentDetails.push({
            slot,
            name: itemName,
            statId: stat.id,
            baseValue: stat.value,
            enhancementBonus: slotEnhanceBonus,
            itemEnhanceBonus: itemBonus,
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
  // 4. 전직 공격력% 곱연산
  const afterClassPercent = afterEquipPercent * (1 + (classBonuses.attackPercent || 0) / 100);
  // 5. 동료 공격력 (동료 강화% 적용)
  const heroAttackWithBonus = heroBuffs.attack * (1 + (skillEffects.heroDmgPercent || 0) / 100);
  // 6. 도감 보너스는 별도 합산
  const totalAttack = Math.floor(afterClassPercent + heroAttackWithBonus + collectionBonus.attack);

  // 총 크리티컬 확률과 데미지 (유물 효과 + 세트 보너스 + 전직 보너스 포함)
  const totalCritChance = player.stats.critChance + equipmentStats.critChance + (skillEffects.critChance || 0) + heroBuffs.critChance + (relicEffects.critChance || 0) + setBonuses.critChance + (classBonuses.critChance || 0);

  // 치명타 확률 오버플로우 → 치명타 데미지 전환 계산
  let critOverflowBonus = 0;
  if (totalCritChance > 100) {
    if (totalCritChance <= 200) {
      critOverflowBonus = (totalCritChance - 100) * 3;
    } else {
      critOverflowBonus = 300 + (totalCritChance - 200) * 5;
    }
  }

  const baseCritDmg = player.stats.critDmg + equipmentStats.critDmg + (skillEffects.critDmg || 0) + heroBuffs.critDmg + (relicEffects.critDmg || 0) + setBonuses.critDmg + (classBonuses.critDamage || 0);
  const totalCritDmg = baseCritDmg + critOverflowBonus;

  // 장비 스탯을 슬롯별로 합산하여 요약 (헬퍼 함수)
  const getEquipmentSummary = (statId, isPercent = false) => {
    const bySlot = {};
    equipmentDetails.filter(e => e.statId === statId).forEach(e => {
      bySlot[e.slot] = (bySlot[e.slot] || 0) + e.finalValue;
    });
    if (Object.keys(bySlot).length === 0) return '없음';
    return Object.entries(bySlot)
      .map(([slot, val]) => `${EQUIPMENT_SLOT_NAMES[slot] || slot}: ${isPercent ? formatPercent(val) : formatNumber(val)}`)
      .join(', ');
  };

  // 각 스탯별 상세 breakdown 생성
  const getStatBreakdown = (statId) => {
    switch (statId) {
      case 'attack': {
        // 장비 공격력% 슬롯별 요약
        const equipAtkPercentSummary = getEquipmentSummary('attackPercent', true);

        return [
          // 1단계: 기본 공격력 + 장비 고정 공격력
          { icon: '👤', source: '① 기본 + 장비 공격력', value: baseAndEquipAtk, detail: `기본 ${formatNumber(player.stats.baseAtk)} + 장비 ${formatNumber(equipmentStats.attack)}` },
          // 2단계: 곱연산 적용
          { icon: '📜', source: '② 스킬 공격력%', value: skillEffects.atkPercent || 0, isPercent: true, isMultiplier: true, detail: '(기본+장비)에 곱연산' },
          { icon: '⚔️', source: '③ 장비 공격력%', value: equipmentStats.attackPercent, isPercent: true, isMultiplier: true, detail: equipAtkPercentSummary },
          // 3단계: 전직 공격력%
          { icon: '🎖️', source: '④ 전직 공격력%', value: classBonuses.attackPercent || 0, isPercent: true, isMultiplier: true, detail: currentClass?.name || '초심자' },
          // 4단계: 동료 공격력 (별도 계산)
          { icon: '🦸', source: '⑤ 동료 공격력', value: heroBuffs.attack, detail: heroDetails.filter(h => h.stats.attack).map(h => `${h.name}: ${formatNumber(h.stats.attack)}`).join(', ') || '없음' },
          { icon: '📜', source: '⑤ 동료 강화%', value: skillEffects.heroDmgPercent || 0, isPercent: true, isMultiplier: true, detail: '동료 공격력에 곱연산' },
          // 5단계: 도감 보너스 (합산)
          { icon: '📖', source: '⑥ 도감 보너스', value: collectionBonus.attack, detail: '몬스터 수집 보너스' },
        ];
      }

      case 'critChance': {
        const breakdown = [
          { icon: '👤', source: '기본 치명타', value: player.stats.critChance, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.critChance, isPercent: true, detail: getEquipmentSummary('critChance', true) },
          { icon: '📜', source: '스킬', value: skillEffects.critChance || 0, isPercent: true },
          { icon: '🦸', source: '동료', value: heroBuffs.critChance, isPercent: true, detail: heroDetails.filter(h => h.stats.critChance).map(h => `${h.name}: ${formatPercent(h.stats.critChance)}`).join(', ') || '없음' },
          { icon: '🏺', source: '유물', value: relicEffects.critChance || 0, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.critChance, isPercent: true },
          { icon: '🎖️', source: '전직', value: classBonuses.critChance || 0, isPercent: true, detail: currentClass?.name || '초심자' },
        ];
        // 100% 초과 시 치명타 데미지 전환 안내
        if (totalCritChance > 100) {
          if (totalCritChance <= 200) {
            // 100~200% 구간: 1%당 3% 치뎀
            const overflow = totalCritChance - 100;
            breakdown.push({
              icon: '✨',
              source: '100~200% 구간 → 치뎀 전환',
              value: overflow * 3,
              isPercent: true,
              detail: `초과 ${formatPercent(overflow)} × 3 = 치뎀 +${formatPercent(overflow * 3)}`
            });
          } else {
            // 200% 초과: 100~200 구간 + 200% 초과 구간
            const tier1Bonus = 100 * 3; // 300%
            const tier2Overflow = totalCritChance - 200;
            const tier2Bonus = tier2Overflow * 5;
            breakdown.push({
              icon: '✨',
              source: '100~200% 구간 (×3)',
              value: tier1Bonus,
              isPercent: true,
              detail: `100% × 3 = 치뎀 +300%`
            });
            breakdown.push({
              icon: '⭐',
              source: '200%+ 구간 (×5)',
              value: tier2Bonus,
              isPercent: true,
              detail: `초과 ${formatPercent(tier2Overflow)} × 5 = 치뎀 +${formatPercent(tier2Bonus)}`
            });
          }
        }
        return breakdown;
      }

      case 'critDmg': {
        const breakdown = [
          { icon: '👤', source: '기본 치명타 데미지', value: player.stats.critDmg, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.critDmg, isPercent: true, detail: getEquipmentSummary('critDmg', true) },
          { icon: '📜', source: '스킬', value: skillEffects.critDmg || 0, isPercent: true },
          { icon: '🦸', source: '동료', value: heroBuffs.critDmg, isPercent: true, detail: heroDetails.filter(h => h.stats.critDmg).map(h => `${h.name}: ${formatPercent(h.stats.critDmg)}`).join(', ') || '없음' },
          { icon: '🏺', source: '유물', value: relicEffects.critDmg || 0, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.critDmg, isPercent: true },
          { icon: '🎖️', source: '전직', value: classBonuses.critDamage || 0, isPercent: true, detail: currentClass?.name || '초심자' },
        ];
        // 치명타 확률 오버플로우 → 치명타 데미지 전환 보너스
        if (totalCritChance > 100) {
          if (totalCritChance <= 200) {
            const overflow = totalCritChance - 100;
            breakdown.push({
              icon: '✨',
              source: '치확 오버 (100~200%)',
              value: overflow * 3,
              isPercent: true,
              detail: `초과 ${formatPercent(overflow)} × 3 = +${formatPercent(overflow * 3)}`
            });
          } else {
            const tier1Bonus = 100 * 3;
            const tier2Overflow = totalCritChance - 200;
            const tier2Bonus = tier2Overflow * 5;
            breakdown.push({
              icon: '✨',
              source: '치확 오버 (100~200%)',
              value: tier1Bonus,
              isPercent: true,
              detail: `100% × 3 = +300%`
            });
            breakdown.push({
              icon: '⭐',
              source: '치확 오버 (200%+)',
              value: tier2Bonus,
              isPercent: true,
              detail: `초과 ${formatPercent(tier2Overflow)} × 5 = +${formatPercent(tier2Bonus)}`
            });
          }
        }
        return breakdown;
      }

      case 'bossDamage':
        return [
          { icon: '⚔️', source: '장비 보스 데미지', value: equipmentStats.bossDamageIncrease, isPercent: true, detail: getEquipmentSummary('bossDamageIncrease', true) },
          { icon: '🏺', source: '유물 보스 데미지', value: relicEffects.bossDamage || 0, isPercent: true },
          { icon: '📖', source: '보스 도감 보너스', value: bossCollectionBonus.damageBonus, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.bossDamage, isPercent: true },
        ];

      case 'goldBonus':
        return [
          { icon: '👤', source: '기본 골드 보너스', value: player.stats.goldBonus, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.goldBonus, isPercent: true, detail: getEquipmentSummary('goldBonus', true) },
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
          { icon: '⚔️', source: '장비', value: equipmentStats.dropRate, isPercent: true, detail: getEquipmentSummary('dropRate', true) },
          { icon: '📜', source: '스킬', value: skillEffects.dropRate || 0, isPercent: true },
          { icon: '🦸', source: '동료', value: heroBuffs.dropRate, isPercent: true, detail: heroDetails.filter(h => h.stats.dropRate).map(h => `${h.name}: ${formatPercent(h.stats.dropRate)}`).join(', ') || '없음' },
          { icon: '📚', source: '세트 보너스', value: setBonuses.dropRate, isPercent: true },
        ];

      case 'expBonus':
        return [
          { icon: '📜', source: '스킬', value: skillEffects.expPercent || 0, isPercent: true },
          { icon: '⚔️', source: '장비', value: equipmentStats.expBonus, isPercent: true, detail: getEquipmentSummary('expBonus', true) },
          { icon: '🦸', source: '동료', value: heroBuffs.expBonus, isPercent: true, detail: heroDetails.filter(h => h.stats.expBonus).map(h => `${h.name}: ${formatPercent(h.stats.expBonus)}`).join(', ') || '없음' },
          { icon: '📖', source: '도감', value: collectionBonus.expBonus, isPercent: true },
          { icon: '📚', source: '세트 보너스', value: setBonuses.expBonus, isPercent: true },
        ];

      case 'relicDamage':
        return [
          { icon: '🏺', source: '유물 데미지%', value: relicEffects.damagePercent || 0, isPercent: true },
          { icon: '⭐', source: '유물당 데미지', value: (relicEffects.damagePerRelic || 0) * relicCount, isPercent: true, detail: `${relicCount}개 × ${relicEffects.damagePerRelic || 0}%` },
        ];

      case 'accuracy':
        return [
          { icon: '📚', source: '세트 보너스', value: setBonuses.accuracy || 0, detail: '도감 세트 완성 보너스' },
        ];

      case 'skipChance':
        return [
          { icon: '⚔️', source: '장비 스킵 확률', value: equipmentStats.skipChance, isPercent: true },
          { icon: '🦸', source: '동료 스킵 확률', value: heroBuffs.stageSkipChance, isPercent: true, detail: heroDetails.filter(h => h.stats.stageSkipChance).map(h => `${h.name}: ${formatPercent(h.stats.stageSkipChance)}`).join(', ') || '없음' },
        ];

      default:
        return [];
    }
  };

  const stats = [
    // DPS 관련 스탯 (와인색)
    { id: 'attack', icon: '⚔️', name: '공격력', value: formatNumber(totalAttack), color: 'text-rose-400' },
    { id: 'critChance', icon: '💥', name: '치명타 확률', value: totalCritChance > 100 ? `100% (+${formatPercent(totalCritChance - 100)})` : formatPercent(totalCritChance), color: 'text-rose-400', tooltip: totalCritChance > 200 ? `200% 초과! 치뎀 +${formatPercent(300 + (totalCritChance - 200) * 5)}로 전환` : totalCritChance > 100 ? `100% 초과분 치뎀 +${formatPercent((totalCritChance - 100) * 3)}로 전환` : '100%초과→치뎀×3, 200%초과→치뎀×5' },
    { id: 'critDmg', icon: '🎯', name: '치명타 데미지', value: formatPercent(totalCritDmg), color: 'text-rose-400' },
    { id: 'bossDamage', icon: '👑', name: '보스 데미지', value: '+' + formatPercent(equipmentStats.bossDamageIncrease + (relicEffects.bossDamage || 0) + bossCollectionBonus.damageBonus + setBonuses.bossDamage), color: 'text-rose-400' },
    { id: 'relicDamage', icon: '💎', name: '유물 데미지', value: '+' + formatPercent((relicEffects.damagePercent || 0) + (relicEffects.damagePerRelic || 0) * relicCount), color: 'text-pink-400', hide: ((relicEffects.damagePercent || 0) + (relicEffects.damagePerRelic || 0) * relicCount) === 0 },

    // 보너스 관련 스탯 (금색)
    { id: 'goldBonus', icon: '💰', name: '골드 획득량', value: '+' + formatPercent(player.stats.goldBonus + equipmentStats.goldBonus + (skillEffects.goldPercent || 0) + (skillEffects.permanentGoldPercent || 0) + heroBuffs.goldBonus + (relicEffects.goldPercent || 0) + collectionBonus.goldBonus + setBonuses.goldBonus), color: 'text-yellow-400' },
    { id: 'dropRate', icon: '🍀', name: '드랍율', value: formatPercent(player.stats.dropRate + equipmentStats.dropRate + (skillEffects.dropRate || 0) + heroBuffs.dropRate + setBonuses.dropRate), color: 'text-yellow-400' },
    { id: 'expBonus', icon: '📈', name: '경험치 증가량', value: '+' + formatPercent((skillEffects.expPercent || 0) + equipmentStats.expBonus + heroBuffs.expBonus + collectionBonus.expBonus + setBonuses.expBonus), color: 'text-yellow-400', hide: ((skillEffects.expPercent || 0) + equipmentStats.expBonus + heroBuffs.expBonus + collectionBonus.expBonus + setBonuses.expBonus) === 0 },
    { id: 'accuracy', icon: '🎯', name: '명중', value: formatNumber((setBonuses.accuracy || 0) + (heroBuffs.accuracy || 0)), color: 'text-yellow-400', hide: ((setBonuses.accuracy || 0) + (heroBuffs.accuracy || 0)) === 0, tooltip: '봉인구역 보스 회피에 대응 (문양 명중은 별도)' },
    { id: 'skipChance', icon: '⏭️', name: '스킵 확률', value: formatPercent(heroBuffs.stageSkipChance + equipmentStats.skipChance + setBonuses.skipChance), color: 'text-yellow-400', hide: (heroBuffs.stageSkipChance + equipmentStats.skipChance + setBonuses.skipChance) === 0 },
  ];

  const handleStatClick = (stat) => {
    if (stat.noPopup) return;
    setSelectedStat(stat);
  };

  const handleAdvanceClass = () => {
    if (canAdvance) {
      const newClassLevel = currentClassLevel + 1;
      const newBonuses = getClassBonuses(newClassLevel);
      const result = advanceClass();
      if (result.success) {
        setClassAdvanceModal({
          isOpen: true,
          className: nextClass.name,
          classLevel: newClassLevel,
          bonuses: newBonuses
        });
      } else {
        alert(result.message || '전직에 실패했습니다.');
      }
    }
  };

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-3 shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-gray-100">스탯</h3>
        {/* 전투력 (허수아비 DPS 기준) */}
        <button
          onClick={() => setShowDummy(true)}
          className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-500 hover:to-red-500 rounded text-xs font-bold transition-all"
          title="허수아비 훈련장 열기"
        >
          <span>🎯</span>
          <span className="text-yellow-300">전투력</span>
          <span className="text-white">{formatNumber(bestDPS)}</span>
        </button>
      </div>

      {/* 전직 섹션 - 압축 */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/50 rounded p-1.5 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">{currentClass?.name || '초심자'}</span>
          {currentClassLevel > 0 && (
            <span className="text-yellow-400 text-xs">({currentClassLevel}차)</span>
          )}
          {currentClassLevel > 0 && classBonuses && (
            <span className="text-[10px] text-cyan-400">
              공+{classBonuses.attackPercent}% 치확+{classBonuses.critChance}% 치뎀+{classBonuses.critDamage}% 최종+{classBonuses.finalDamagePercent || 0}%
            </span>
          )}
        </div>
        {nextClass ? (
          canAdvance ? (
            <button
              onClick={handleAdvanceClass}
              className="px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded animate-pulse"
            >
              {nextClass.name} 전직
            </button>
          ) : (
            <span className="text-xs text-gray-400">
              다음: <span className="text-purple-300">{nextClass.name}</span> (Lv.{nextClass.requiredLevel})
            </span>
          )
        ) : (
          <span className="text-xs text-yellow-400">MAX</span>
        )}
      </div>

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

      {/* 허수아비 훈련장 모달 */}
      {showDummy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowDummy(false)}>
          <div
            className="max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <TrainingDummy />
            <button
              onClick={() => setShowDummy(false)}
              className="mt-2 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 전직 완료 모달 */}
      <ClassAdvanceModal
        isOpen={classAdvanceModal.isOpen}
        onClose={() => setClassAdvanceModal({ ...classAdvanceModal, isOpen: false })}
        className={classAdvanceModal.className}
        classLevel={classAdvanceModal.classLevel}
        bonuses={classAdvanceModal.bonuses}
      />
    </div>
  );
};

export default StatsList;
