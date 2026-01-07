import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../store/GameContext';
import { useToast } from '../UI/ToastContainer';
import { RAID_BOSSES, calculateRaidBossStats, INSCRIPTION_SLOT_CONFIG, checkBossUnlock, getDifficultyName, getDifficultyColor, calculateBossDefenseRate } from '../../data/raidBosses';
import { DEFENSE_FORMULAS } from '../../data/formulas';
import { INSCRIPTIONS, INSCRIPTION_GRADES, INSCRIPTION_ABILITIES, calculateInscriptionStats, migrateGrade } from '../../data/inscriptions';
import { getTotalRelicEffects } from '../../data/prestigeRelics';
import { generateSetItem, EQUIPMENT_SLOTS, getEnhanceBonus } from '../../data/equipmentSets';
import { EQUIPMENT_CONFIG } from '../../data/gameBalance';
import { formatNumber, formatPercent } from '../../utils/formatter';
import { getTotalSkillEffects } from '../../data/skills';
import NotificationModal from '../UI/NotificationModal';

// GitHub Pages 배포용 BASE_URL
const BASE_URL = import.meta.env.BASE_URL || '/';

// 장비 슬롯 설정
const EQUIPMENT_SLOT_KEYS = ['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'];
const EQUIPMENT_SLOT_NAMES = {
  weapon: '무기',
  armor: '갑옷',
  gloves: '장갑',
  boots: '신발',
  necklace: '목걸이',
  ring: '반지'
};
const SLOT_ICONS = {
  weapon: '⚔️',
  armor: '🛡️',
  gloves: '🧤',
  boots: '👢',
  necklace: '📿',
  ring: '💍'
};

// 보스 이미지 경로 가져오기
const getBossImage = (bossId) => {
  return `${BASE_URL}images/raid_bosses/${bossId}.png`;
};

// 문양 이미지 경로 가져오기
const getInscriptionImage = (inscriptionId) => {
  return `${BASE_URL}images/inscriptions/${inscriptionId}.png`;
};

// 전직 단계별 폴더명
const CLASS_FOLDERS = ['base', 'class1', 'class2', 'class3'];

// 현재 전직 단계에 따른 캐릭터 이미지 경로
const getPlayerImagePath = (classLevel, frame) => {
  const folder = CLASS_FOLDERS[classLevel] || 'base';
  return `${BASE_URL}images/field/characters/${folder}/player_${frame}.png`;
};

// 등급별 카드 스타일 (테두리, 배경, 그림자)
const getGradeCardStyle = (grade, isSelected = false) => {
  if (isSelected) {
    return {
      className: 'bg-blue-900 border-blue-500 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50',
      borderStyle: {}
    };
  }

  switch (grade) {
    case 'common':
      return {
        className: 'bg-gray-800/80 border-gray-600 hover:bg-gray-700',
        borderStyle: {}
      };
    case 'uncommon':
      return {
        className: 'bg-gradient-to-b from-blue-900/40 to-gray-800 border-blue-500/70 hover:border-blue-400 shadow-sm shadow-blue-500/20',
        borderStyle: {}
      };
    case 'rare':
      return {
        className: 'bg-gradient-to-b from-purple-900/40 to-gray-800 border-purple-500/70 hover:border-purple-400 shadow-md shadow-purple-500/30',
        borderStyle: {}
      };
    case 'epic':
      return {
        className: 'bg-gradient-to-b from-purple-800/60 to-gray-800 border-purple-400 hover:border-purple-300 shadow-md shadow-purple-400/50',
        borderStyle: { borderWidth: '2px' }
      };
    case 'unique':
      return {
        className: 'bg-gradient-to-b from-yellow-900/50 to-gray-800 border-yellow-500 hover:border-yellow-400 shadow-md shadow-yellow-500/40',
        borderStyle: { borderWidth: '2px' }
      };
    case 'legendary':
      return {
        className: 'bg-gradient-to-b from-orange-900/50 to-gray-800 border-orange-500 hover:border-orange-400 shadow-lg shadow-orange-500/40',
        borderStyle: { borderWidth: '2px' }
      };
    case 'mythic':
      return {
        className: 'bg-gradient-to-b from-red-900/60 via-orange-900/40 to-gray-800 border-red-500 hover:border-red-400 shadow-lg shadow-red-500/50 animate-pulse',
        borderStyle: { borderWidth: '2px' }
      };
    default:
      return {
        className: 'bg-gray-800 border-gray-700 hover:bg-gray-700',
        borderStyle: {}
      };
  }
};

const SealedZone = () => {
  const [activeSubTab, setActiveSubTab] = useState('boss'); // 'boss' 또는 'inscription'
  const { gameState, setGameState, engine } = useGame();
  const toast = useToast();
  const { player, sealedZone = {}, equipment = {}, skillLevels = {}, slotEnhancements = {}, heroes = {}, relics = {} } = gameState;

  const [selectedBoss, setSelectedBoss] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(1); // 숫자 레벨 (1부터 시작)
  const [activeInscriptions, setActiveInscriptions] = useState([]); // 문양 배열
  const [inBattle, setInBattle] = useState(false);
  const [bossHP, setBossHP] = useState(100);
  const [battleLog, setBattleLog] = useState([]);

  // 전투 상태 추가
  const [battleState, setBattleState] = useState({
    totalAttacks: 0,
    totalMisses: 0,
    lastMissed: false,
    guaranteedCritNext: false
  });

  // 보스 패턴 상태 추가
  const [bossPatternState, setBossPatternState] = useState({
    hasShield: false,
    shieldHP: 0,
    maxShieldHP: 0,
    isRegenerating: false,
    regenAmount: 0,
    equipmentDestroyed: false,
    healReduction: 0, // 치유 감소 %
    isInvincible: false, // 에스모드 무적 상태
    invincibleRemaining: 0, // 무적 남은 시간 (ms)
    destructionRageActive: false, // 파괴 분노 활성화 여부
    destructionRageRemaining: 0 // 파괴 분노 남은 시간 (ms)
  });

  // 베크타 장비 파괴 상태: { slotKey: remainingTime (ms) }
  const [destroyedEquipments, setDestroyedEquipments] = useState({});

  // 전투력 계산 (PlayerInfo와 동일한 로직) - 전투 중 파괴된 장비 제외
  const calculateCombatPower = () => {
    const skillEffects = getTotalSkillEffects(skillLevels);
    const relicEffects = getTotalRelicEffects(relics);

    // 구 영웅 시스템 제거됨 - 새 동료 시스템은 GameEngine에서 자동 적용
    let heroAttack = 0;
    let heroCritChance = 0;
    let heroCritDmg = 0;

    let equipmentAttack = 0;
    let equipmentCritChance = 0;
    let equipmentCritDmg = 0;

    Object.entries(equipment).forEach(([slot, item]) => {
      if (item) {
        // 베크타 전투 중 파괴된 장비는 스탯 0으로 처리
        if (inBattle && destroyedEquipments[slot] > 0) {
          return; // 스탯 계산에서 제외
        }

        // 슬롯 강화 보너스 (구 시스템)
        const slotEnhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        // 아이템 자체 강화 보너스 (신 시스템 - +1~+20)
        const itemEnhanceBonus = 1 + getEnhanceBonus(item.enhanceLevel) / 100;

        item.stats.forEach(stat => {
          // 크리티컬 스탯은 슬롯 강화 효과 제외
          const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats?.includes(stat.id);
          const slotBonus = isExcluded ? 1 : slotEnhancementBonus;
          // 아이템 강화 보너스는 기본옵션(isMain)에만 적용
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

  // 알림 모달 상태
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  // 데미지 계산 함수 (캐릭터 데미지 + 문양 능력 전부 적용)
  const calculateDamage = (inscriptionStats, bossStats, currentBossHP) => {
    const bossData = RAID_BOSSES[selectedBoss];
    if (!bossData) return { damage: 0, isMiss: false, isCrit: false, shieldDamage: 0 };

    // 분쇄의 문양: 무적 즉시 해제 (invincible_destroy)
    const hasInvincibleDestroy = inscriptionStats?.specialAbility?.type === 'invincible_destroy';
    if (hasInvincibleDestroy && bossPatternState.isInvincible) {
      // 무적 즉시 해제
      setBossPatternState(prev => ({ ...prev, isInvincible: false, invincibleRemaining: 0 }));
      setBattleLog(log => [...log.slice(-5), `💥 분쇄의 문양이 무적을 파괴했습니다!`]);
    }

    // 에스모드 무적 상태 체크 - 무적 파괴 문양 없으면 데미지 0
    if (bossPatternState.isInvincible && !hasInvincibleDestroy) {
      return { damage: 0, isMiss: false, isCrit: false, shieldDamage: 0, shieldBypassDamage: 0, isInvincible: true };
    }

    // 유물 효과: 문양 스탯/데미지 증가
    const relicEffects = getTotalRelicEffects(gameState.prestigeRelics || {});
    const inscriptionStatsBonus = 1 + (relicEffects.inscriptionStats || 0) / 100;
    const inscriptionDamageBonus = 1 + (relicEffects.inscriptionDamage || 0) / 100;

    // 캐릭터 기본 DPS (전체 DPS가 각 문양 공격에 추가됨)
    // calculateTotalDPS()는 { damage, isCrit } 객체를 반환함
    const dpsResult = engine ? engine.calculateTotalDPS() : null;
    const playerDPS = dpsResult ? dpsResult.damage : 0;

    // 기본 데미지 = 캐릭터 전체 DPS
    let baseDamage = playerDPS;

    // 어빌리티: true_hit (필중 - 회피 무시) - abilities는 문자열 배열임
    const abilities = inscriptionStats.abilities || [];
    const hasTrueHit = abilities.includes('true_hit');

    // 명중률 계산 (새 공식: 명중 >= 회피 → 100%, 명중 < 회피 → 명중/회피*100%)
    // 보스 회피 (bossStats.evasion - calculateRaidBossStats에서 난이도 반영됨)
    const bossEvasion = bossStats.evasion || 500;
    // 동료 명중 계산
    // 구 영웅 시스템 제거됨 - 명중률은 현재 게임에서 사용 안함
    let heroAccuracy = 0;
    // 플레이어 명중 = 캐릭터 기본 명중 + 문양 명중
    const playerAccuracy = (gameState.player?.stats?.accuracy || 0) + (inscriptionStats.accuracy || 0) + heroAccuracy;

    let hitChance = 100;

    if (!hasTrueHit) {
      if (playerAccuracy >= bossEvasion) {
        // 명중 >= 회피: 100% 명중
        hitChance = 100;
      } else {
        // 명중 < 회피: (명중/회피) * 100%
        hitChance = Math.max(10, (playerAccuracy / bossEvasion) * 100);
      }
    }

    const isHit = Math.random() * 100 < hitChance;

    // 미스 처리
    if (!isHit) {
      return { damage: 0, isMiss: true, isCrit: false, shieldDamage: 0 };
    }

    // 치명타 판정
    let isCrit = false;
    const critChance = inscriptionStats.critChance || 0;

    // 고라스: 치명타 무효 (crit_immunity)
    const hasCritImmunity = bossData.pattern?.type === 'crit_immunity';

    // 파괴의 문양: 이전 공격 실패 시 무조건 치명타
    if (battleState.guaranteedCritNext && !hasCritImmunity) {
      isCrit = true;
    } else if (!hasCritImmunity) {
      isCrit = Math.random() * 100 < critChance;
    }

    // 치명타 데미지 적용 (치명타 무효 보스는 치명타 불가)
    if (isCrit && !hasCritImmunity) {
      const critDamage = 150 + (inscriptionStats.critDamage || 0); // 기본 150%
      baseDamage *= (critDamage / 100);
    }

    // 관통 (방어 무시) - 방어력 감소 공식 완화
    const penetration = inscriptionStats.penetration || 0;
    const effectiveDefense = Math.max(0, bossStats.defense * (1 - penetration / 100));
    // 방어력 감소 최대 30%로 제한 (기존 공식이 너무 강했음)
    const defenseReduction = Math.min(0.3, effectiveDefense / (effectiveDefense + 500));
    baseDamage *= (1 - defenseReduction);

    // 방어율 시스템 적용 (20% + 레벨×2%)
    // defenseRate가 있으면 방관 스탯으로 관통해야 함
    const bossDefenseRate = bossStats.defenseRate || 0;
    if (bossDefenseRate > 0) {
      // 방관 스탯 수집
      const defensePenetrations = [];
      // 전직별 기본 방관 (전직1: 10%, 전직2: 20%, 전직3: 30%, 전직4: 50%)
      const classLevel = gameState.player?.classLevel || 1;
      const basePenetration = classLevel === 1 ? 10 : classLevel === 2 ? 20 : classLevel === 3 ? 30 : 50;
      defensePenetrations.push(basePenetration);
      // 문양에서 방관 수집
      if (inscriptionStats.defensePenetration > 0) {
        defensePenetrations.push(inscriptionStats.defensePenetration);
      }
      // 장비에서 방관 수집
      Object.values(gameState.equipment || {}).forEach(item => {
        if (item && item.stats) {
          item.stats.forEach(stat => {
            if (stat.id === 'defensePenetration' && stat.value > 0) {
              defensePenetrations.push(stat.value);
            }
          });
        }
      });
      // 스킬에서 방관 수집
      const skillEffects = getTotalSkillEffects(gameState.skillLevels || {});
      if (skillEffects.defensePenetration > 0) {
        defensePenetrations.push(skillEffects.defensePenetration);
      }
      // 유물에서 방관 수집
      if (relicEffects.defensePenetration > 0) {
        defensePenetrations.push(relicEffects.defensePenetration);
      }

      // 방어율 적용
      const defenseMultiplier = DEFENSE_FORMULAS.calculateDamageMultiplier(bossDefenseRate, defensePenetrations);
      baseDamage *= defenseMultiplier;
    }

    // 보호막 관련 어빌리티
    let shieldDamage = 0;
    let bypassShield = false;
    let shieldBypassDamage = 0; // 공허 문양: 방어막 관통 추가 데미지

    if (bossPatternState.hasShield) {
      // shield_break: 보호막에 +50% 추가 피해
      if (abilities.includes('shield_break')) {
        shieldDamage = baseDamage * 0.5;
      }
      // shield_double_damage (파괴의 문양): 보호막에 +100% 추가 피해
      if (inscriptionStats?.specialAbility?.type === 'shield_double_damage') {
        shieldDamage = baseDamage * 1.0; // 100% 추가 피해
      }
      // shield_bypass_damage (공허의 문양): 데미지의 30%가 방어막을 무시하고 실제 체력에 피해
      if (inscriptionStats?.specialAbility?.type === 'shield_bypass_damage') {
        const bypassPercent = inscriptionStats.specialAbility.value || 30;
        shieldBypassDamage = baseDamage * (bypassPercent / 100);
      }
    }
    if (abilities.includes('shield_penetration')) {
      bypassShield = true;
    }

    // 유물: 폭풍의 문양 (문양 데미지 보너스 증가) 최종 적용
    baseDamage *= inscriptionDamageBonus;
    shieldDamage *= inscriptionDamageBonus;
    shieldBypassDamage *= inscriptionDamageBonus;

    // 최종 데미지% 적용 (곱연산) - 문양의 finalDamagePercent
    if (inscriptionStats.finalDamagePercent) {
      const finalDamageMultiplier = 1 + (inscriptionStats.finalDamagePercent / 100);
      baseDamage *= finalDamageMultiplier;
      shieldDamage *= finalDamageMultiplier;
      shieldBypassDamage *= finalDamageMultiplier;
    }

    // 파괴 분노: 장비 파괴 시 +50% 데미지 (5초)
    if (bossPatternState.destructionRageActive) {
      baseDamage *= 1.5;
      shieldDamage *= 1.5;
      shieldBypassDamage *= 1.5;
    }

    // 무적 관통 시 30% 데미지만
    if (bossPatternState.isInvincible) {
      baseDamage *= 0.3;
      shieldDamage *= 0.3;
      shieldBypassDamage *= 0.3;
    }

    return {
      damage: Math.floor(baseDamage),
      isMiss: false,
      isCrit,
      shieldDamage: Math.floor(shieldDamage),
      shieldBypassDamage: Math.floor(shieldBypassDamage),
      bypassShield
    };
  };

  // 보스 패턴 활성화 함수
  const activateBossPattern = () => {
    const bossData = RAID_BOSSES[selectedBoss];
    const pattern = bossData.pattern;

    if (!pattern) return;

    setBossPatternState(prev => {
      const newState = { ...prev };

      // 보호막 생성 (네페론)
      if (pattern.shieldRegenRate && Math.random() < 0.3) { // 30% 확률로 보호막 생성
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
        const shieldAmount = bossStats.hp * 0.2; // 최대 HP의 20%
        newState.hasShield = true;
        newState.shieldHP = shieldAmount;
        newState.maxShieldHP = shieldAmount;
        setBattleLog(log => [...log.slice(-5), `🛡️ ${bossData.name}이(가) 보호막을 생성했습니다!`]);
      }

      // 재생 활성화 (로타르)
      if (pattern.regenRate && Math.random() < 0.25) { // 25% 확률로 재생 시작
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
        const regenAmount = bossStats.hp * (pattern.regenRate / 100);
        newState.isRegenerating = true;
        newState.regenAmount = regenAmount;
        setBattleLog(log => [...log.slice(-5), `♻️ ${bossData.name}이(가) 재생을 시작했습니다!`]);
      }

      // 장비 파괴 (베크타) - 5초마다 랜덤 장비 1개 파괴
      if (pattern.type === 'equipment_destroy') {
        // 장비 파괴 면역 체크
        const hasEquipmentImmunity = activeInscriptions.some(inscId => {
          const inscription = ownedInscriptions.find(i => i.id === inscId);
          if (!inscription) return false;
          const inscData = INSCRIPTIONS[inscription.inscriptionId];
          return inscData?.abilities?.some(a => a.type === 'equipment_immunity');
        });

        if (!hasEquipmentImmunity) {
          // 현재 파괴되지 않은 장비 중 랜덤 선택
          const availableSlots = EQUIPMENT_SLOT_KEYS.filter(slot =>
            equipment[slot] && !destroyedEquipments[slot]
          );

          if (availableSlots.length > 0) {
            const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
            const slotName = EQUIPMENT_SLOT_NAMES[randomSlot];

            // 5초간 파괴 상태로 설정
            setDestroyedEquipments(prev => ({
              ...prev,
              [randomSlot]: 5000
            }));

            newState.equipmentDestroyed = true;
            setBattleLog(log => [...log.slice(-5), `💥 ${bossData.name}이(가) ${slotName}을(를) 파괴했습니다! (5초)`]);

            // 분노의 문양: destruction_rage 활성화 (5초간 +50% 데미지)
            const hasDestructionRage = activeInscriptions.some(inscId => {
              const inscription = ownedInscriptions.find(i => i.id === inscId);
              if (!inscription) return false;
              const inscData = INSCRIPTIONS[inscription.inscriptionId];
              return inscData?.specialAbility?.type === 'destruction_rage';
            });

            if (hasDestructionRage) {
              newState.destructionRageActive = true;
              newState.destructionRageRemaining = 5000; // 5초
              setBattleLog(log => [...log.slice(-5), `💢 파괴 분노 발동! 5초간 공격력 +50%!`]);
            }
          }
        }
      }

      // 무적 (에스모드) - 10초마다 5초간 무적
      if (pattern.type === 'invincible' && !newState.isInvincible) {
        // 무적 해제 문양 체크
        const hasInvincibleBreak = activeInscriptions.some(inscId => {
          const inscription = ownedInscriptions.find(i => i.id === inscId);
          if (!inscription) return false;
          const inscData = INSCRIPTIONS[inscription.inscriptionId];
          return inscData?.abilities?.some(a => a.type === 'invincible_break');
        });

        // 무적 지속시간 (문양 있으면 50% 감소)
        const duration = hasInvincibleBreak ? pattern.duration * 0.5 : pattern.duration;

        newState.isInvincible = true;
        newState.invincibleRemaining = duration;
        setBattleLog(log => [...log.slice(-5), `✨ ${bossData.name}이(가) 무적 상태가 되었습니다! (${duration / 1000}초)`]);
      }

      return newState;
    });
  };

  // 봉인구역 상태 초기화
  const {
    tickets = 0,
    ownedInscriptions = [],
    unlockedBosses = ['vecta'], // 기본적으로 베크타만 해금
    unlockedInscriptionSlots = 1 // 기본 1슬롯
  } = sealedZone;

  const [showInscriptionInfo, setShowInscriptionInfo] = useState(false);

  // 데미지 플로팅 텍스트 상태
  const [damageNumbers, setDamageNumbers] = useState([]);
  const damageIdRef = useRef(0);
  const [playerFrame, setPlayerFrame] = useState(0);
  const lastNormalFrame = useRef(0);
  const [isMonsterHit, setIsMonsterHit] = useState(false);
  const [isCriticalHit, setIsCriticalHit] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // 데미지 표시 함수
  const showDamageNumber = (damage, isCrit, isMiss = false, isInvincible = false) => {
    damageIdRef.current += 1;
    const newDamage = {
      id: damageIdRef.current,
      value: damage,
      isCrit,
      isMiss,
      isInvincible,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 20 + Math.random() * 10,
    };
    setDamageNumbers(prev => [...prev.slice(-8), newDamage]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== newDamage.id));
    }, 1000);

    // 히트 이펙트 (무적이면 이펙트 없음)
    if (!isMiss && !isInvincible) {
      if (isCrit) {
        setPlayerFrame(3);
        setIsCriticalHit(true);
        setScreenShake(true);
        setTimeout(() => setIsCriticalHit(false), 300);
        setTimeout(() => setScreenShake(false), 200);
      } else {
        const nextFrame = (lastNormalFrame.current + 1) % 3;
        lastNormalFrame.current = nextFrame;
        setPlayerFrame(nextFrame);
      }
      setTimeout(() => {
        setIsMonsterHit(true);
        setTimeout(() => setIsMonsterHit(false), isCrit ? 250 : 150);
      }, 100);
    }
  };

  // 문양 삭제
  const deleteInscription = (inscriptionId) => {
    if (!confirm('정말로 이 문양을 삭제하시겠습니까?')) return;

    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        ownedInscriptions: (prev.sealedZone?.ownedInscriptions || []).filter(i => i.id !== inscriptionId)
      }
    }));

    // 선택된 문양이면 해제
    setActiveInscriptions(prev => prev.filter(id => id !== inscriptionId));
  };

  const [selectedInscriptionDetail, setSelectedInscriptionDetail] = useState(null);

  // 등급 우선순위 (높을수록 좋음)
  const GRADE_PRIORITY = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    unique: 5,
    legendary: 6,
    mythic: 7
  };

  // 문양의 "좋음" 점수 계산 (등급 + 스탯)
  const getInscriptionScore = (inscriptionId) => {
    const inscription = ownedInscriptions.find(i => i.id === inscriptionId);
    if (!inscription) return 0;
    const grade = migrateGrade(inscription.grade);
    const stats = calculateInscriptionStats(inscription.inscriptionId, grade);
    // 등급 점수 * 1000 + 공격력 (등급이 가장 중요)
    return (GRADE_PRIORITY[grade] || 0) * 10000 + stats.attack;
  };

  // 문양 선택/해제 토글
  const toggleInscriptionSelection = (inscriptionId) => {
    setActiveInscriptions(prev => {
      if (prev.includes(inscriptionId)) {
        // 이미 선택된 문양이면 해제
        return prev.filter(id => id !== inscriptionId);
      } else {
        // 새로 선택
        if (prev.length >= unlockedInscriptionSlots) {
          // 슬롯이 꽉 찼으면 가장 안 좋은 문양과 교체
          const newScore = getInscriptionScore(inscriptionId);

          // 현재 장착된 문양들의 점수 계산
          const equippedScores = prev.map(id => ({
            id,
            score: getInscriptionScore(id)
          }));

          // 가장 낮은 점수의 문양 찾기
          const worstEquipped = equippedScores.reduce((worst, current) =>
            current.score < worst.score ? current : worst
          );

          // 새 문양이 더 좋으면 교체
          if (newScore > worstEquipped.score) {
            return prev.filter(id => id !== worstEquipped.id).concat(inscriptionId);
          } else {
            // 새 문양이 더 안 좋으면 그냥 교체 (사용자가 원하는 것일 수 있음)
            return prev.filter(id => id !== worstEquipped.id).concat(inscriptionId);
          }
        }
        return [...prev, inscriptionId];
      }
    });
  };

  // 전투 시작
  const startBattle = () => {
    if (tickets <= 0) {
      toast.warning('도전권 부족', '도전권이 부족합니다!');
      return;
    }

    if (activeInscriptions.length === 0) {
      toast.warning('문양 선택 필요', '문양을 최소 1개 선택해주세요!');
      return;
    }

    // 봉인구역 전투 중에는 메인 게임 엔진 일시정지
    if (engine) {
      engine.stop();
    }

    // 도전권 차감 - GameEngine 상태도 직접 업데이트
    if (engine && engine.state.sealedZone) {
      engine.state.sealedZone.tickets = (engine.state.sealedZone.tickets || 0) - 1;
    }
    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        tickets: (prev.sealedZone?.tickets || 0) - 1
      }
    }));

    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
    const bossData = RAID_BOSSES[selectedBoss];
    setBossHP(bossStats.hp);
    setHearts(6); // 하트 6개로 초기화
    setHeartAnimations([]);
    setBattleLog([]);
    setBattleState({
      totalAttacks: 0,
      totalMisses: 0,
      lastMissed: false,
      guaranteedCritNext: false
    });

    // 방어막 초기화 (네페론처럼 초기 방어막이 있는 보스)
    const hasInitialShield = bossData?.pattern?.hasInitialShield || false;
    const shieldPercent = bossData?.pattern?.shieldPercent || 0;
    const initialShieldHP = hasInitialShield ? Math.floor(bossStats.hp * (shieldPercent / 100)) : 0;

    setBossPatternState({
      hasShield: hasInitialShield,
      shieldHP: initialShieldHP,
      maxShieldHP: initialShieldHP,
      isRegenerating: false,
      regenAmount: 0,
      equipmentDestroyed: false,
      healReduction: 0,
      isInvincible: false,
      invincibleRemaining: 0,
      destructionRageActive: false,
      destructionRageRemaining: 0
    });
    setDestroyedEquipments({}); // 장비 파괴 상태 초기화
    setInBattle(true);
  };

  // 하트(체력) 시스템 상태
  const [hearts, setHearts] = useState(6); // 6개 하트
  const [heartAnimations, setHeartAnimations] = useState([]); // 하트 깨지는 애니메이션

  // endBattle 함수 최신 참조 유지용 ref
  const endBattleRef = useRef(null);

  // 보스 공격 타이머 (5초마다 하트 1개 감소)
  useEffect(() => {
    if (!inBattle) return;

    const interval = setInterval(() => {
      setHearts(prev => {
        if (prev <= 1) {
          // ref를 통해 최신 endBattle 함수 호출
          if (endBattleRef.current) {
            endBattleRef.current(false); // 하트 모두 소진 패배
          }
          return 0;
        }
        // 하트 깨지는 애니메이션 추가
        setHeartAnimations(anims => [...anims, { id: Date.now(), index: prev - 1 }]);
        setTimeout(() => {
          setHeartAnimations(anims => anims.filter(a => a.index !== prev - 1));
        }, 500);
        return prev - 1;
      });
    }, 5000); // 5초마다 공격

    return () => clearInterval(interval);
  }, [inBattle]);

  // 보스 패턴 활성화 타이머
  useEffect(() => {
    if (!inBattle) return;

    const patternInterval = setInterval(() => {
      activateBossPattern();
    }, 5000); // 5초마다 패턴 발동 시도

    return () => clearInterval(patternInterval);
  }, [inBattle, selectedBoss, selectedDifficulty]);

  // 갈증의 문양: 체력 회복 타이머 (hp_regen)
  useEffect(() => {
    if (!inBattle) return;

    // 장착된 문양 중 hp_regen 능력이 있는지 확인
    const equippedInscriptions = gameState.sealedZone?.equippedInscriptions || [];
    let hasHpRegen = false;
    let regenInterval = 12000; // 기본 12초

    equippedInscriptions.forEach(inscId => {
      if (!inscId) return;
      const inscription = (gameState.sealedZone?.inscriptions || []).find(i => i.id === inscId);
      if (!inscription) return;
      const inscBase = INSCRIPTIONS[inscription.inscriptionId];
      if (inscBase?.specialAbility?.type === 'hp_regen') {
        hasHpRegen = true;
        regenInterval = (inscBase.specialAbility.value || 12) * 1000;
      }
    });

    if (!hasHpRegen) return;

    const interval = setInterval(() => {
      setHearts(prev => {
        if (prev >= 6) return 6; // 최대 6개
        setBattleLog(log => [...log.slice(-5), `💚 갈증의 문양이 체력을 회복! (${prev} → ${prev + 1})`]);
        return prev + 1;
      });
    }, regenInterval);

    return () => clearInterval(interval);
  }, [inBattle, gameState.sealedZone?.equippedInscriptions]);

  // 베크타 장비 파괴 타이머 (100ms마다 업데이트)
  useEffect(() => {
    if (!inBattle) return;

    const timerInterval = setInterval(() => {
      setDestroyedEquipments(prev => {
        const updated = {};
        let hasChanges = false;

        Object.entries(prev).forEach(([slot, remainingTime]) => {
          const newTime = remainingTime - 100;
          if (newTime > 0) {
            updated[slot] = newTime;
          } else {
            hasChanges = true; // 복구됨
          }
        });

        // 복구된 장비가 있으면 로그 추가
        if (hasChanges) {
          const restoredSlots = Object.keys(prev).filter(slot => !updated[slot]);
          restoredSlots.forEach(slot => {
            setBattleLog(log => [...log.slice(-5), `✨ ${EQUIPMENT_SLOT_NAMES[slot]}이(가) 복구되었습니다!`]);
          });
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(timerInterval);
  }, [inBattle]);

  // 에스모드 무적 타이머 (100ms마다 업데이트)
  useEffect(() => {
    if (!inBattle || !bossPatternState.isInvincible) return;

    const invincibleInterval = setInterval(() => {
      setBossPatternState(prev => {
        const newRemaining = prev.invincibleRemaining - 100;
        if (newRemaining <= 0) {
          setBattleLog(log => [...log.slice(-5), `💫 무적 상태가 해제되었습니다!`]);
          return {
            ...prev,
            isInvincible: false,
            invincibleRemaining: 0
          };
        }
        return {
          ...prev,
          invincibleRemaining: newRemaining
        };
      });
    }, 100);

    return () => clearInterval(invincibleInterval);
  }, [inBattle, bossPatternState.isInvincible]);

  // 파괴 분노 타이머 (100ms마다 업데이트)
  useEffect(() => {
    if (!inBattle || !bossPatternState.destructionRageActive) return;

    const rageInterval = setInterval(() => {
      setBossPatternState(prev => {
        const newRemaining = prev.destructionRageRemaining - 100;
        if (newRemaining <= 0) {
          setBattleLog(log => [...log.slice(-5), `💢 파괴 분노가 해제되었습니다.`]);
          return {
            ...prev,
            destructionRageActive: false,
            destructionRageRemaining: 0
          };
        }
        return {
          ...prev,
          destructionRageRemaining: newRemaining
        };
      });
    }, 100);

    return () => clearInterval(rageInterval);
  }, [inBattle, bossPatternState.destructionRageActive]);

  // 보스 재생 처리
  useEffect(() => {
    if (!inBattle || !bossPatternState.isRegenerating) return;

    const regenInterval = setInterval(() => {
      const bossData = RAID_BOSSES[selectedBoss];

      // 치유 감소 (부패 문양) 체크 - specialAbility 기반 + 등급별 배율
      let totalHealReduction = 0;
      activeInscriptions.forEach(inscId => {
        const inscription = ownedInscriptions.find(i => i.id === inscId);
        if (!inscription) return;
        const inscData = INSCRIPTIONS[inscription.inscriptionId];
        if (inscData?.specialAbility?.type === 'heal_reduction') {
          // 기본 30% + 등급 배율 적용
          const gradeData = INSCRIPTION_GRADES[inscription.grade];
          const gradeMultiplier = gradeData?.statMultiplier || 1;
          totalHealReduction += (inscData.specialAbility.value || 30) * gradeMultiplier;
        }
      });
      // 최대 95%로 제한
      totalHealReduction = Math.min(totalHealReduction, 95);

      setBossHP(prevHP => {
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
        let regenAmount = bossPatternState.regenAmount;

        // 치유 감소 적용
        if (totalHealReduction > 0) {
          const reductionMultiplier = 1 - (totalHealReduction / 100);
          regenAmount *= reductionMultiplier;
          setBattleLog(log => [...log.slice(-5), `🚫 치유 감소 ${totalHealReduction.toFixed(0)}%! ${Math.floor(regenAmount).toLocaleString()} 회복`]);
        } else {
          setBattleLog(log => [...log.slice(-5), `♻️ ${bossData.name} 재생: ${Math.floor(regenAmount).toLocaleString()}`]);
        }

        const newHP = Math.min(bossStats.hp, prevHP + regenAmount);
        return newHP;
      });
    }, 2000); // 2초마다 재생

    return () => clearInterval(regenInterval);
  }, [inBattle, bossPatternState.isRegenerating]);

  // 전투 종료
  const endBattle = (victory) => {
    setInBattle(false);

    // 메인 게임 엔진 다시 시작
    if (engine) {
      engine.start();
    }

    // 전투 상태 초기화
    setHearts(6);
    setHeartAnimations([]);
    setBossHP(100);
    setBattleLog([]);
    setDamageNumbers([]);

    // setTimeout으로 감싸서 렌더링 중 setState 방지
    setTimeout(() => {
      if (victory) {
        // 보상 계산 (calculateRaidBossStats 사용)
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
        const rewards = bossStats.rewards;

        // 세트 아이템 드랍 (20% 확률) - 보스별 고정 슬롯
        let droppedSetItem = null;
        const bossData = RAID_BOSSES[selectedBoss];
        if (Math.random() < 0.20 && bossData?.dropSlot) {
          // 보스별 고정 슬롯 사용
          const dropSlot = bossData.dropSlot;
          // 난이도 레벨을 floor로 사용하여 템렙 결정
          droppedSetItem = generateSetItem(dropSlot, selectedDifficulty);
        }

        // GameEngine 상태도 직접 업데이트 (저장을 위해)
        if (engine) {
          engine.state.player.gold += rewards.gold;
          if (!engine.state.sealedZone) {
            engine.state.sealedZone = { tickets: 0, ownedInscriptions: [], unlockedBosses: ['vecta'], unlockedInscriptionSlots: 1, bossCoins: 0 };
          }
          engine.state.sealedZone.bossCoins = (engine.state.sealedZone.bossCoins || 0) + rewards.bossCoins;

          // 드랍된 세트 아이템 인벤토리에 추가
          if (droppedSetItem) {
            if (!engine.state.inventory) {
              engine.state.inventory = [];
            }
            engine.state.inventory.push(droppedSetItem);
          }
        }

        setGameState(prev => {
          const newState = {
            ...prev,
            player: {
              ...prev.player,
              gold: prev.player.gold + rewards.gold
            },
            sealedZone: {
              ...prev.sealedZone,
              bossCoins: (prev.sealedZone?.bossCoins || 0) + rewards.bossCoins
            }
          };

          // 인벤토리에 세트 아이템 추가
          if (droppedSetItem) {
            newState.inventory = [...(prev.inventory || []), droppedSetItem];
          }

          return newState;
        });

        // 알림 메시지 생성
        let notificationMessage = `💰 골드 +${formatNumber(rewards.gold)}\n🪙 보스 코인 +${rewards.bossCoins}`;
        if (droppedSetItem) {
          notificationMessage += `\n\n🎁 세트 아이템 획득!\n${droppedSetItem.name} (Lv.${droppedSetItem.itemLevel})`;
        }

        showNotification(
          '🎉 승리!',
          notificationMessage,
          'success'
        );
      } else {
        // 실패 시 도전권 환불
        if (engine && engine.state.sealedZone) {
          engine.state.sealedZone.tickets = (engine.state.sealedZone.tickets || 0) + 1;
        }
        setGameState(prev => ({
          ...prev,
          sealedZone: {
            ...prev.sealedZone,
            tickets: (prev.sealedZone?.tickets || 0) + 1
          }
        }));

        showNotification('💀 패배', '체력이 모두 소진되었습니다! 도전권이 환불되었습니다.', 'error');
      }
    }, 0);
  };

  // endBattle 함수 참조 업데이트 (보스 공격 타이머에서 사용)
  useEffect(() => {
    endBattleRef.current = endBattle;
  });

  // 문양 공격 (여러 문양 동시 공격)
  useEffect(() => {
    if (!inBattle || activeInscriptions.length === 0) return;
    if (!selectedBoss) return;

    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
    if (!bossStats) return;

    const intervals = activeInscriptions.map(inscriptionId => {
      const inscription = ownedInscriptions.find(i => i.id === inscriptionId);
      if (!inscription) return null;

      const inscriptionStats = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
      const inscBase = INSCRIPTIONS[inscription.inscriptionId];
      const attackInterval = 1000; // 1초마다 공격

      // 영원의 문양: 해당 문양만 추가 타격 (자기 자신에게만 적용)
      const hasExtraHit = inscBase?.specialAbility?.type === 'extra_hit';
      const totalHits = hasExtraHit ? 1 + (inscBase.specialAbility.value || 1) : 1;

      return setInterval(() => {
        // 타수만큼 반복 공격 (영원의 문양만 2타)
        for (let hit = 0; hit < totalHits; hit++) {
          setBossHP(prevHP => {
            if (prevHP <= 0) return 0; // 이미 죽었으면 스킵

            // 데미지 계산 (모든 문양 능력 적용)
            const result = calculateDamage(inscriptionStats, bossStats, prevHP);

          // 전투 상태 업데이트
          setBattleState(prev => ({
            totalAttacks: prev.totalAttacks + 1,
            totalMisses: prev.totalMisses + (result.isMiss ? 1 : 0),
            lastMissed: result.isMiss,
            // 파괴의 문양: 미스 시 다음 공격 무조건 치명타
            guaranteedCritNext: result.isMiss && inscriptionStats.id === 'destruction'
          }));

          // 무적 상태 처리
          if (result.isInvincible) {
            setBattleLog(log => [...log.slice(-5), `✨ 무적! 데미지 무효`]);
            showDamageNumber(0, false, false, true); // isInvincible = true
            return prevHP;
          }

          // 미스 처리
          if (result.isMiss) {
            setBattleLog(log => [...log.slice(-5), `📿 ${inscriptionStats.name} - Miss!`]);
            showDamageNumber(0, false, true);
            return prevHP;
          }

          // 데미지 적용 (방어막 시스템)
          const actualDamage = result.damage;
          let hpDamage = 0;
          let shieldDamageDealt = 0;

          // 방어막 처리 - bossPatternState를 참조하여 처리
          setBossPatternState(prevPattern => {
            if (prevPattern.hasShield && prevPattern.shieldHP > 0) {
              // 방어막 관통 능력이 있으면 체력에 직접 데미지
              if (result.bypassShield) {
                hpDamage = actualDamage;
                return prevPattern;
              } else {
                // 방어막 추가 데미지 적용 (shield_break 능력)
                const totalShieldDamage = actualDamage + (result.shieldDamage || 0);

                // 공허 문양: shieldBypassDamage는 방어막 무시하고 체력에 직접
                if (result.shieldBypassDamage > 0) {
                  hpDamage += result.shieldBypassDamage;
                }

                if (totalShieldDamage >= prevPattern.shieldHP) {
                  // 방어막 파괴
                  shieldDamageDealt = prevPattern.shieldHP;
                  const overflowDamage = totalShieldDamage - prevPattern.shieldHP;
                  hpDamage += overflowDamage; // 초과 데미지는 체력에
                  return { ...prevPattern, hasShield: false, shieldHP: 0 };
                } else {
                  // 방어막에만 데미지
                  shieldDamageDealt = totalShieldDamage;
                  return { ...prevPattern, shieldHP: prevPattern.shieldHP - totalShieldDamage };
                }
              }
            } else {
              // 방어막 없음 - 체력에 직접 데미지
              hpDamage = actualDamage;
              return prevPattern;
            }
          });

          // 데미지 플로팅 텍스트 표시
          showDamageNumber(actualDamage, result.isCrit, false);

          // 로그 추가 (방어막/체력 데미지에 따라 다르게)
          if (result.bypassShield) {
            setBattleLog(log => [...log.slice(-5), `🗡️ 방관! ${formatNumber(actualDamage)} 직접 데미지`]);
          } else if (shieldDamageDealt > 0 && hpDamage === 0) {
            setBattleLog(log => [...log.slice(-5), `🛡️ 방어막 ${formatNumber(shieldDamageDealt)} 피해`]);
          } else if (shieldDamageDealt > 0 && hpDamage > 0) {
            setBattleLog(log => [...log.slice(-5), `💔 방어막 파괴! +${formatNumber(hpDamage)} 데미지`]);
          } else if (result.isCrit) {
            setBattleLog(log => [...log.slice(-5), `💥 치명타! ${formatNumber(actualDamage)} 데미지`]);
          } else {
            setBattleLog(log => [...log.slice(-5), `⚔️ ${formatNumber(actualDamage)} 데미지`]);
          }

          // 실제 체력 데미지 계산 (방어막이 있으면 hpDamage만 적용)
          const finalHpDamage = hpDamage > 0 ? hpDamage : (shieldDamageDealt > 0 ? 0 : actualDamage);
          const newHP = Math.max(0, prevHP - finalHpDamage);

          // 승리 처리를 setTimeout으로 지연시켜 렌더링 중 setState 방지
          if (newHP <= 0) {
            setTimeout(() => endBattle(true), 0);
          }

          return newHP;
          });
        } // for loop end
      }, attackInterval);
    }).filter(Boolean);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [inBattle, activeInscriptions, selectedBoss, selectedDifficulty, ownedInscriptions]);

  // 봉인구역 배경 이미지 경로
  const getSealedZoneBackground = (bossId) => {
    return `${BASE_URL}images/sealed_zone/backgrounds/${bossId}.png`;
  };

  // 전체 오른쪽 영역을 차지하는 전투 화면 (보스 정보 + 문양 선택 영역 전체)
  const renderFullBattleScreen = () => {
    if (!inBattle || !selectedBoss) return null;

    const bossData = RAID_BOSSES[selectedBoss];
    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
    const hpPercent = (bossHP / bossStats.hp) * 100;
    const playerImageSrc = getPlayerImagePath(player.classLevel || 0, playerFrame);

    return (
      <div className="relative rounded-lg overflow-hidden border-2 border-purple-500/70 shadow-lg shadow-purple-500/30" style={{ minHeight: '500px' }}>
        {/* 배경 이미지 + 전투 영역 */}
        <div
          className={`absolute inset-0 ${screenShake ? 'animate-shake' : ''}`}
          style={{
            backgroundImage: `url(${getSealedZoneBackground(selectedBoss)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 배경 이미지 없을 때 기본 그라데이션 */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #1a0a1a 0%, #2d1030 30%, #1a1030 60%, #0d0d1a 100%)',
              zIndex: -1
            }}
          />
        </div>

        {/* 상단 오버레이 (어둡게) */}
        <div className="absolute top-0 left-0 right-0 h-24 z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />

        {/* 하단 오버레이 (어둡게) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-10" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />

        {/* 크리티컬 플래시 효과 */}
        {isCriticalHit && (
          <div
            className="absolute inset-0 z-30 pointer-events-none animate-critFlash"
            style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 60%)' }}
          />
        )}

        {/* 좌상단: 보스 정보 - 더 크고 여유롭게 */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/85 backdrop-blur-sm rounded-xl border-2 border-purple-500/60 p-4 min-w-[280px] shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👹</span>
              <span className="text-lg font-bold text-purple-300">{bossData.name}</span>
              <span className={`text-sm px-2 py-1 rounded-lg ${getDifficultyColor(selectedDifficulty)} bg-gray-800/80 font-bold`}>
                Lv.{selectedDifficulty}
              </span>
            </div>
            {/* 보스 HP 바 - 더 크게 */}
            <div className="relative w-full bg-gray-900 rounded-full h-6 overflow-hidden border-2 border-red-900">
              <div
                className={`h-full transition-all duration-200 ${
                  hpPercent > 50 ? 'bg-gradient-to-r from-red-700 to-red-500' :
                  hpPercent > 25 ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                  'bg-gradient-to-r from-yellow-600 to-yellow-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white drop-shadow-lg">
                  {formatNumber(bossHP)} / {formatNumber(bossStats.hp)}
                </span>
              </div>
            </div>
            {/* 방어막 HP 바 */}
            {bossPatternState.hasShield && bossPatternState.maxShieldHP > 0 && (
              <div className="relative w-full bg-gray-900 rounded-full h-4 overflow-hidden border-2 border-cyan-700 mt-2">
                <div
                  className="h-full transition-all duration-200 bg-gradient-to-r from-cyan-600 to-blue-500"
                  style={{ width: `${(bossPatternState.shieldHP / bossPatternState.maxShieldHP) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    🛡️ {formatNumber(bossPatternState.shieldHP)} / {formatNumber(bossPatternState.maxShieldHP)}
                  </span>
                </div>
              </div>
            )}
            {/* 보스 회피/방어 + 플레이어 명중 표시 */}
            {(() => {
              // 플레이어 총 명중 계산
              const playerBaseAccuracy = gameState.player?.stats?.accuracy || 0;
              let hasTrueHit = false;
              const inscriptionAccuracy = activeInscriptions.reduce((sum, inscId) => {
                const insc = ownedInscriptions.find(i => i.id === inscId);
                if (!insc) return sum;
                const stats = calculateInscriptionStats(insc.inscriptionId, insc.grade);
                // true_hit 능력 체크
                if (stats.abilities && stats.abilities.includes('true_hit')) {
                  hasTrueHit = true;
                }
                return sum + (stats.accuracy || 0);
              }, 0);
              // 동료 명중 계산
              let heroAccuracy = 0;
              // 구 영웅 시스템 제거됨
              const totalPlayerAccuracy = playerBaseAccuracy + inscriptionAccuracy;
              // 백발백중 있으면 100% 명중
              const hitChance = hasTrueHit
                ? 100
                : totalPlayerAccuracy >= bossStats.evasion
                  ? 100
                  : Math.max(10, (totalPlayerAccuracy / bossStats.evasion) * 100);

              // 플레이어 관통율 계산
              const playerPenetrations = [];
              // 전직별 기본 방관 (전직1: 10%, 전직2: 20%, 전직3: 30%, 전직4: 50%)
              const classLevel = gameState.player?.classLevel || 1;
              const basePenetration = classLevel === 1 ? 10 : classLevel === 2 ? 20 : classLevel === 3 ? 30 : 50;
              playerPenetrations.push(basePenetration);
              // 문양에서 관통율 수집
              if (inscriptionStats.defensePenetration) {
                playerPenetrations.push(inscriptionStats.defensePenetration);
              }
              // 장비에서 관통율 수집
              Object.values(gameState.equipment || {}).forEach(item => {
                if (item && item.stats) {
                  item.stats.forEach(stat => {
                    if (stat.id === 'defensePenetration' && stat.value > 0) {
                      playerPenetrations.push(stat.value);
                    }
                  });
                }
              });
              // 스킬에서 관통율 수집
              const skillEffects = gameState.skillEffects || {};
              if (skillEffects.defensePenetration) {
                playerPenetrations.push(skillEffects.defensePenetration);
              }
              // 유물에서 관통율 수집
              const relicEffects = gameState.relicEffects || {};
              if (relicEffects.defensePenetration) {
                playerPenetrations.push(relicEffects.defensePenetration);
              }

              const totalPenetration = DEFENSE_FORMULAS.calculateTotalPenetration(playerPenetrations);
              const bossDefenseRate = bossStats.defenseRate || 0;
              const damageMultiplier = DEFENSE_FORMULAS.calculateDamageMultiplier(bossDefenseRate, playerPenetrations);

              return (
                <div className="flex flex-col gap-1 mt-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">👁️ 회피: <span className="text-yellow-400 font-bold">{formatNumber(bossStats.evasion)}</span></span>
                    <span className="text-gray-400">🛡️ 방어: <span className="text-blue-400 font-bold">{formatNumber(bossStats.defense)}</span></span>
                    <span className="text-gray-400">🔰 방어율: <span className="text-orange-400 font-bold">{bossDefenseRate}%</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">🎯 내 명중: <span className="text-green-400 font-bold">{formatNumber(totalPlayerAccuracy)}</span></span>
                    <span className={`font-bold ${hitChance >= 100 ? 'text-green-400' : hitChance >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      ({hitChance.toFixed(0)}% 명중률){hasTrueHit && <span className="text-yellow-300 font-bold"> ✨백발백중</span>}
                    </span>
                  </div>
                  {bossDefenseRate > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">⚔️ 내 관통: <span className="text-purple-400 font-bold">{totalPenetration.toFixed(1)}%</span></span>
                      <span className={`font-bold ${damageMultiplier >= 0.9 ? 'text-green-400' : damageMultiplier >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        (데미지 {(damageMultiplier * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
            {/* 보스 패턴 상태 */}
            {(bossPatternState.isRegenerating || bossPatternState.isInvincible || bossPatternState.destructionRageActive) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {bossPatternState.isRegenerating && (
                  <div className="bg-green-900/80 border border-green-500 rounded-lg px-2 py-1 text-xs text-green-300 font-bold">
                    ♻️ 재생 중
                  </div>
                )}
                {bossPatternState.isInvincible && (
                  <div className="bg-yellow-900/80 border border-yellow-400 rounded-lg px-2 py-1 text-xs text-yellow-300 font-bold animate-pulse">
                    ✨ 무적 {Math.ceil(bossPatternState.invincibleRemaining / 1000)}s
                  </div>
                )}
                {bossPatternState.destructionRageActive && (
                  <div className="bg-red-900/80 border border-red-400 rounded-lg px-2 py-1 text-xs text-red-300 font-bold animate-pulse">
                    💢 분노 {Math.ceil(bossPatternState.destructionRageRemaining / 1000)}s
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 우상단: 플레이어 체력 - 더 크게 */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/85 backdrop-blur-sm rounded-xl border-2 border-pink-500/60 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-pink-400 font-bold">내 체력</span>
              <span className="text-sm text-gray-400 font-bold">{hearts}/6</span>
            </div>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: 6 }, (_, i) => {
                const isFilled = i < hearts;
                const isBreaking = heartAnimations.some(a => a.index === i);
                return (
                  <span
                    key={i}
                    className={`text-2xl transition-all duration-300 ${isBreaking ? 'animate-pulse scale-125' : ''}`}
                    style={{ opacity: isFilled ? 1 : 0.3 }}
                  >
                    {isFilled ? '❤️' : '🖤'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* 좌하단: 장착 문양 + 장비 (베크타용) */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
          {/* 베크타 전용: 장비 슬롯 표시 */}
          {selectedBoss === 'vecta' && (
            <div className="bg-black/85 backdrop-blur-sm rounded-xl border-2 border-orange-500/60 p-3 shadow-lg">
              <div className="text-xs text-orange-400 font-bold mb-2">⚔️ 장비 상태</div>
              <div className="grid grid-cols-6 gap-1">
                {EQUIPMENT_SLOT_KEYS.map(slot => {
                  const item = equipment[slot];
                  const isDestroyed = destroyedEquipments[slot] > 0;
                  const remainingTime = destroyedEquipments[slot] || 0;
                  const remainingSec = Math.ceil(remainingTime / 1000);

                  return (
                    <div
                      key={slot}
                      className={`relative w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                        isDestroyed
                          ? 'bg-gray-900 border-red-500 animate-pulse'
                          : item
                          ? 'bg-gray-800 border-gray-500'
                          : 'bg-gray-900/50 border-gray-700'
                      }`}
                      style={{
                        filter: isDestroyed ? 'grayscale(100%) brightness(0.5)' : 'none'
                      }}
                    >
                      <span className={`text-lg ${isDestroyed ? 'opacity-30' : ''}`}>
                        {SLOT_ICONS[slot]}
                      </span>
                      <span className={`text-[7px] ${isDestroyed ? 'text-red-400' : 'text-gray-400'}`}>
                        {EQUIPMENT_SLOT_NAMES[slot].substring(0, 2)}
                      </span>
                      {/* 파괴 오버레이 */}
                      {isDestroyed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 rounded-lg">
                          <div className="text-center">
                            <span className="text-red-400 text-xs font-bold">💥</span>
                            <div className="text-red-300 text-[8px] font-bold">{remainingSec}s</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 장착 문양 */}
          <div className="bg-black/85 backdrop-blur-sm rounded-xl border-2 border-purple-500/60 p-3 shadow-lg">
            <div className="text-xs text-purple-400 font-bold mb-2">장착 문양</div>
            <div className="flex gap-1.5">
              {activeInscriptions.slice(0, 5).map(inscId => {
                const inscription = ownedInscriptions.find(i => i.id === inscId);
                if (!inscription) return null;
                const inscData = INSCRIPTIONS[inscription.inscriptionId];
                const inscStats = calculateInscriptionStats(inscription.inscriptionId, migrateGrade(inscription.grade));
                const gradeData = INSCRIPTION_GRADES[migrateGrade(inscription.grade)];
                return (
                  <div
                    key={inscId}
                    className="w-14 bg-gray-900/80 rounded-lg border-2 border-purple-500/50 p-1 flex flex-col items-center"
                    title={`${inscData?.specialAbility?.name}: ${inscData?.specialAbility?.description}`}
                  >
                    <img
                      src={getInscriptionImage(inscription.inscriptionId)}
                      alt=""
                      className="w-8 h-8 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className={`text-[7px] font-bold ${gradeData?.color || 'text-gray-400'}`}>{gradeData?.name}</span>
                    <span className="text-[6px] text-orange-400">+{inscStats?.finalDamagePercent?.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 우하단: 전투 정보 + 포기 버튼 - 더 크게 */}
        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-black/85 backdrop-blur-sm rounded-xl border-2 border-red-500/60 p-4 shadow-lg min-w-[140px]">
            <div className="text-center mb-3">
              <div className="text-xs text-gray-400 mb-1">전투력 (DPS)</div>
              <div className="text-xl font-bold text-cyan-400">{formatNumber(combatPower)}</div>
            </div>
            <button
              onClick={() => endBattle(false)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2 px-6 rounded-lg font-bold text-sm transition-all shadow-lg"
            >
              전투 포기
            </button>
          </div>
        </div>

        {/* 캐릭터 (좌측) - 더 크게 */}
        <div className="absolute z-15" style={{ bottom: '15%', left: '18%' }}>
          <div className="flex items-end justify-center" style={{ width: '140px', height: '140px', filter: 'drop-shadow(4px 8px 16px rgba(0,0,0,0.9))' }}>
            <img
              key={playerImageSrc}
              src={playerImageSrc}
              alt="Player"
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${BASE_URL}images/field/characters/base/player_0.png`;
              }}
            />
          </div>
        </div>

        {/* 보스 (우측) - 더 크게 */}
        <div
          className={`absolute z-15 transition-all duration-150 ${isMonsterHit ? (isCriticalHit ? 'translate-x-4' : 'translate-x-2') : ''}`}
          style={{
            bottom: '15%',
            right: '18%',
            filter: isMonsterHit
              ? 'brightness(2) saturate(0.5)'
              : bossPatternState.isInvincible
              ? 'drop-shadow(0 0 30px #FFD700) drop-shadow(0 0 60px #FFA500) brightness(1.3)'
              : bossPatternState.destructionRageActive
              ? 'drop-shadow(0 0 25px #FF4444) drop-shadow(0 0 50px #FF0000)'
              : 'drop-shadow(0 0 20px #8B5CF6) drop-shadow(0 0 40px #6D28D9)',
          }}
        >
          {/* 무적 이펙트 - 육각형 쉴드 */}
          {bossPatternState.isInvincible && (
            <>
              {/* 외곽 회전 링 */}
              <div
                className="absolute animate-spin"
                style={{
                  inset: '-30px',
                  background: 'conic-gradient(from 0deg, transparent 0%, #FFD700 10%, transparent 20%, #FFA500 30%, transparent 40%, #FFD700 50%, transparent 60%, #FFA500 70%, transparent 80%, #FFD700 90%, transparent 100%)',
                  opacity: 0.7,
                  animationDuration: '3s',
                  borderRadius: '50%',
                }}
              />
              {/* 내부 펄스 */}
              <div
                className="absolute animate-pulse"
                style={{
                  inset: '-15px',
                  background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,165,0,0.2) 50%, transparent 70%)',
                  borderRadius: '50%',
                }}
              />
              {/* 무적 아이콘 떠다니기 */}
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl"
                style={{
                  animation: 'invincibleFloat 1.5s ease-in-out infinite',
                  textShadow: '0 0 10px #FFD700, 0 0 20px #FFA500',
                }}
              >
                ✨
              </div>
            </>
          )}
          {/* 파괴 분노 이펙트 */}
          {bossPatternState.destructionRageActive && (
            <>
              <div
                className="absolute animate-pulse"
                style={{
                  inset: '-20px',
                  background: 'radial-gradient(circle, rgba(255,68,68,0.5) 0%, rgba(255,0,0,0.2) 50%, transparent 70%)',
                  borderRadius: '50%',
                }}
              />
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl"
                style={{
                  animation: 'rageFloat 0.5s ease-in-out infinite',
                  textShadow: '0 0 10px #FF4444, 0 0 20px #FF0000',
                }}
              >
                💢
              </div>
            </>
          )}
          <div className="flex items-end justify-center" style={{ width: '160px', height: '160px' }}>
            <img
              src={getBossImage(selectedBoss)}
              alt={bossData.name}
              className={`w-full h-full object-contain ${bossPatternState.isInvincible ? 'animate-pulse' : ''}`}
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="text-6xl hidden items-center justify-center">{bossData.icon}</div>
          </div>
        </div>

        {/* 데미지 숫자 팝업 - 더 크게 */}
        {damageNumbers.map(dmg => (
          <div
            key={dmg.id}
            className="absolute pointer-events-none z-50"
            style={{
              right: `${22 + (Math.random() - 0.5) * 12}%`,
              top: `${28 + Math.random() * 18}%`,
              textShadow: dmg.isInvincible
                ? '0 0 15px #FFD700, 0 0 30px #FFA500, 3px 3px 6px rgba(0,0,0,1)'
                : dmg.isCrit
                ? '0 0 10px #ff0000, 0 0 20px #ff4444, 3px 3px 6px rgba(0,0,0,1)'
                : dmg.isMiss
                ? '2px 2px 4px rgba(0,0,0,0.9)'
                : '3px 3px 6px rgba(0,0,0,0.9), -3px -3px 6px rgba(0,0,0,0.9)',
              animation: dmg.isInvincible
                ? 'invincibleDamageFloat 1s ease-out forwards'
                : dmg.isCrit
                ? 'critDamageFloat 1s ease-out forwards'
                : 'damageFloat 1s ease-out forwards',
              fontSize: dmg.isInvincible ? '1.5rem' : dmg.isCrit ? '2rem' : dmg.isMiss ? '1.25rem' : '1.5rem',
              color: dmg.isInvincible ? '#FFD700' : dmg.isMiss ? '#888888' : dmg.isCrit ? '#FFD700' : '#FFFFFF',
              fontWeight: 700,
            }}
          >
            {dmg.isInvincible ? (
              <span>✨ 무적 ✨</span>
            ) : dmg.isMiss ? 'MISS' : (
              <>
                {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
                {formatNumber(dmg.value)}
                {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
              </>
            )}
          </div>
        ))}

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes damageFloat {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            50% { opacity: 1; transform: translateY(-30px) scale(1.3); }
            100% { opacity: 0; transform: translateY(-60px) scale(0.9); }
          }
          @keyframes critDamageFloat {
            0% { opacity: 1; transform: translateY(0) scale(1.6); }
            20% { transform: translateY(-15px) scale(2); }
            50% { opacity: 1; transform: translateY(-40px) scale(1.8); }
            100% { opacity: 0; transform: translateY(-80px) scale(1.1); }
          }
          .animate-shake {
            animation: shake 0.2s ease-in-out;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-5px) rotate(-1deg); }
            40% { transform: translateX(5px) rotate(1deg); }
            60% { transform: translateX(-4px) rotate(-0.5deg); }
            80% { transform: translateX(4px) rotate(0.5deg); }
          }
          .animate-critFlash {
            animation: critFlash 0.3s ease-out;
          }
          @keyframes critFlash {
            0% { opacity: 0; }
            30% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes invincibleFloat {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-8px); }
          }
          @keyframes rageFloat {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.3); }
          }
          @keyframes invincibleDamageFloat {
            0% { opacity: 1; transform: translateY(0) scale(1.2); }
            30% { transform: translateY(-20px) scale(1.5); }
            50% { opacity: 1; transform: translateY(-35px) scale(1.3); }
            100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
          }
        `}</style>
      </div>
    );
  };

  return (
      <div className="space-y-4">
      {/* 서브 탭 메뉴 */}
      <div className="flex gap-2 bg-gray-900 p-2 rounded-lg border border-gray-700">
        <button
          onClick={() => setActiveSubTab('boss')}
          className={`flex-1 px-4 py-2 rounded font-bold transition-all ${
            activeSubTab === 'boss'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          ⚔️ 보스 도전
        </button>
        <button
          onClick={() => setActiveSubTab('inscription')}
          className={`flex-1 px-4 py-2 rounded font-bold transition-all ${
            activeSubTab === 'inscription'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📿 문양 관리
        </button>
      </div>

      {/* 보스 도전 탭 */}
      {activeSubTab === 'boss' && (
        <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
      {/* 좌우 레이아웃: 보스 선택 (왼쪽) + 상세정보/전투 (오른쪽) */}
      <div className="flex gap-3">
        {/* 왼쪽: 보스 선택 리스트 (2열) */}
        <div className="w-44 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">도전권: <span className="text-yellow-400 font-bold">{tickets}</span></span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-[350px] overflow-y-auto pr-1">
            {Object.entries(RAID_BOSSES).map(([bossId, boss]) => {
              const unlocked = checkBossUnlock(bossId, player.floor);

              return (
                <button
                  key={bossId}
                  onClick={() => unlocked && !inBattle && setSelectedBoss(bossId)}
                  disabled={!unlocked || inBattle}
                  className={`p-1.5 rounded-lg border-2 relative transition-all ${
                    selectedBoss === bossId
                      ? 'bg-red-900/60 border-red-500 shadow-lg shadow-red-500/40'
                      : unlocked && !inBattle
                      ? 'bg-gray-800/80 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                      : 'bg-gray-900/50 border-gray-800 opacity-40 cursor-not-allowed'
                  }`}
                >
                  {/* 보스 이미지 */}
                  <div className="relative flex justify-center mb-0.5">
                    <img
                      src={getBossImage(bossId)}
                      alt={boss.name}
                      className={`w-10 h-10 object-contain ${!unlocked ? 'grayscale opacity-50' : ''}`}
                      style={{
                        imageRendering: 'pixelated',
                        filter: unlocked && selectedBoss === bossId ? 'drop-shadow(0 0 6px #ef4444)' : undefined
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="text-xl hidden items-center justify-center">{boss.icon}</div>
                  </div>
                  <div className="text-[9px] font-bold text-gray-200 text-center truncate">{boss.name.split(' ').pop()}</div>
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                      <span className="text-[8px] text-gray-400">🔒 {boss.unlockFloor}층</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 전투 중이면 전체 영역을 전투 화면으로 사용 */}
        {inBattle ? (
          // 전투 화면 - 오른쪽 전체 영역 사용
          <div className="flex-1 flex flex-col">
            {renderFullBattleScreen()}
          </div>
        ) : selectedBoss ? (
          <div className="flex-1 bg-gradient-to-r from-red-900/30 to-gray-800/50 border border-red-500/30 rounded-lg p-3">
            <div className="flex gap-3">
              {/* 보스 초상화 (더 크게) */}
              <div className="flex-shrink-0 flex flex-col items-center w-40">
                <div className="relative">
                  <img
                    src={getBossImage(selectedBoss)}
                    alt={RAID_BOSSES[selectedBoss].name}
                    className="w-36 h-36 object-contain"
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 15px #ef4444)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="text-5xl hidden items-center justify-center w-36 h-36">{RAID_BOSSES[selectedBoss].icon}</div>
                </div>
                {/* 난이도 선택 (초상화 아래) */}
                <div className="mt-2 w-full">
                  <div className="text-center mb-1">
                    <span className={`text-base font-bold ${getDifficultyColor(selectedDifficulty)}`}>
                      Lv.{selectedDifficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 10))}
                      className="w-8 h-6 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-[10px]"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 1))}
                      className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-sm"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(selectedDifficulty + 1)}
                      className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(selectedDifficulty + 10)}
                      className="w-8 h-6 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-[10px]"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* 보스 정보 (더 컴팩트하게) */}
              <div className="flex-1 flex flex-col min-w-0 justify-center">
                <h3 className="text-lg font-bold text-red-400 mb-1">{RAID_BOSSES[selectedBoss].name}</h3>
                <div className="text-[10px] text-orange-400 font-bold mb-2 p-1 bg-gray-800/50 rounded truncate">
                  ⚔️ {RAID_BOSSES[selectedBoss].pattern.description}
                </div>
                {/* 예상 클리어 표시 */}
                {(() => {
                  const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
                  const canClear = combatPower >= bossStats.hp;
                  const clearRatio = combatPower > 0 ? (combatPower / bossStats.hp * 100).toFixed(0) : 0;
                  return (
                    <div className="flex flex-col gap-0.5 p-1.5 bg-gray-900/50 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">보스 HP</span>
                        <span className="text-red-400 font-bold">{formatNumber(bossStats.hp)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">전투력</span>
                        <span className="text-cyan-400 font-bold">⚡ {formatNumber(combatPower)}</span>
                      </div>
                      <div className={`text-center py-1 rounded font-bold text-xs ${canClear ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {canClear ? `✓ 클리어 가능 (${clearRatio}%)` : `✗ 클리어 불가 (${clearRatio}%)`}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 문양 슬롯 - 6:4 비율로 더 넓게 */}
              <div className="w-72 flex-shrink-0 border-l border-gray-700 pl-3 flex flex-col">
                {/* 슬롯 헤더 */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-300 font-bold">
                    슬롯 {activeInscriptions.length}/{unlockedInscriptionSlots}
                  </span>
                  {unlockedInscriptionSlots < INSCRIPTION_SLOT_CONFIG.maxSlots && (
                    <button
                      onClick={() => {
                        const nextSlot = unlockedInscriptionSlots + 1;
                        const cost = INSCRIPTION_SLOT_CONFIG.unlockCosts[`slot${nextSlot}`];
                        const bossCoins = sealedZone.bossCoins || 0;
                        if (bossCoins >= cost) {
                          if (confirm(`${nextSlot}번째 슬롯을 ${formatNumber(cost)} 보스코인으로 해금하시겠습니까?`)) {
                            if (engine) {
                              engine.state.sealedZone.bossCoins = (engine.state.sealedZone.bossCoins || 0) - cost;
                              engine.state.sealedZone.unlockedInscriptionSlots = nextSlot;
                            }
                            setGameState(prev => ({
                              ...prev,
                              sealedZone: {
                                ...prev.sealedZone,
                                bossCoins: (prev.sealedZone.bossCoins || 0) - cost,
                                unlockedInscriptionSlots: nextSlot
                              }
                            }));
                          }
                        } else {
                          toast.warning('재화 부족', '보스코인이 부족합니다!');
                        }
                      }}
                      className="text-[9px] bg-yellow-600 hover:bg-yellow-700 text-white px-1 py-0.5 rounded"
                    >
                      🔓 ({formatNumber(INSCRIPTION_SLOT_CONFIG.unlockCosts[`slot${unlockedInscriptionSlots + 1}`])}🪙)
                    </button>
                  )}
                </div>

                {/* 문양 슬롯 목록 - 스탯 표시 추가 */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-40">
                  {Array.from({ length: unlockedInscriptionSlots }).map((_, idx) => {
                    const inscriptionId = activeInscriptions[idx];
                    const inscription = inscriptionId ? ownedInscriptions.find(i => i.id === inscriptionId) : null;
                    const inscriptionData = inscription ? calculateInscriptionStats(inscription.inscriptionId, migrateGrade(inscription.grade)) : null;
                    const slotGradeStyle = inscription ? getGradeCardStyle(migrateGrade(inscription.grade)) : null;
                    const inscriptionBase = inscription ? INSCRIPTIONS[inscription.inscriptionId] : null;

                    return (
                      <div
                        key={idx}
                        className={`border rounded p-1.5 ${
                          inscription
                            ? slotGradeStyle.className
                            : 'bg-gray-800 border-gray-600 border-dashed'
                        }`}
                        style={inscription ? slotGradeStyle.borderStyle : {}}
                      >
                        {inscription ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={getInscriptionImage(inscription.inscriptionId)}
                              alt={inscriptionData.name}
                              className="w-8 h-8 object-contain flex-shrink-0"
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div className="flex-1 min-w-0">
                              {/* 등급 + 이름 */}
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className={`text-[9px] font-bold ${inscriptionData.gradeColor}`}>
                                  {inscriptionData.gradeName}
                                </span>
                                <span className="text-[9px] text-gray-100 truncate">{inscriptionData.name}</span>
                              </div>
                              {/* 스탯 표시 - 최종뎀% + 특수능력 */}
                              <div className="flex items-center gap-2 text-[8px]">
                                <span className="text-orange-300">🔥 +{inscriptionData.finalDamagePercent?.toFixed(1)}%</span>
                                <span className="text-yellow-300 font-bold">{(() => {
                                  const abilityIcons = {
                                    destruction_rage: '💢',      // 파괴 분노
                                    true_hit: '💫',              // 백발백중
                                    accuracy_boost: '🎯',        // 명중 특화
                                    shield_double_damage: '🛡️',  // 보호막 분쇄
                                    invincible_destroy: '⛏️',    // 무적 파괴
                                    shield_bypass_damage: '🗡️',  // 방어막 관통
                                    hp_regen: '❤️',              // 생명력 흡수
                                    heal_reduction: '🚫',        // 치유 감소
                                    pure_damage_boost: '💠',     // 순수 데미지
                                    extra_hit: '🔱'              // 추가 타격
                                  };
                                  const icon = abilityIcons[inscriptionBase?.specialAbility?.type] || '✨';
                                  return `${icon} ${inscriptionBase?.specialAbility?.name}`;
                                })()}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-1">
                            <span className="text-gray-600 text-[9px]">슬롯 {idx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 도전 버튼 */}
                <button
                  onClick={startBattle}
                  disabled={tickets <= 0 || activeInscriptions.length === 0}
                  className={`w-full py-2 mt-2 rounded font-bold text-sm ${
                    tickets <= 0 || activeInscriptions.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  ⚔️ 도전 (도전권 -1)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-800/30 border border-gray-700 rounded-lg p-8">
            <span className="text-gray-500">← 보스를 선택하세요</span>
          </div>
        )}
      </div>

      {selectedBoss && !inBattle && (
        <>
          {/* 보유 문양 선택 - 전투 중이 아닐 때만 표시 */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2">
              문양 선택
            </h3>
            <div className="grid grid-cols-5 gap-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              {(() => {
                // 각 문양별 최고 등급 문양만 추출
                const GRADE_ORDER = ['common', 'uncommon', 'rare', 'epic', 'unique', 'legendary', 'mythic', 'dark'];
                const highestByType = {};

                ownedInscriptions.forEach(inscription => {
                  const migratedGrade = migrateGrade(inscription.grade);
                  const gradeIndex = GRADE_ORDER.indexOf(migratedGrade);
                  const existing = highestByType[inscription.inscriptionId];

                  if (!existing || gradeIndex > GRADE_ORDER.indexOf(existing.grade)) {
                    highestByType[inscription.inscriptionId] = {
                      ...inscription,
                      grade: migratedGrade
                    };
                  }
                });

                // 핵심 특성 짧은 이름 (새 시스템 반영)
                const coreTraits = {
                  rage: { trait: '파괴분노', icon: '💢', desc: '장비파괴 +50%' },
                  precision: { trait: '백발백중', icon: '💫', desc: '회피무시' },
                  shadow: { trait: '명중', icon: '🎯', desc: '+1500명중' },
                  destruction: { trait: '쉴드뎀', icon: '🛡️', desc: '+100%쉴드뎀' },
                  crush: { trait: '무적파괴', icon: '⛏️', desc: '무적해제' },
                  void: { trait: '관통', icon: '🗡️', desc: '30%관통' },
                  thirst: { trait: '회복', icon: '❤️', desc: '12초/HP1' },
                  decay: { trait: '치유감소', icon: '🚫', desc: '보스힐-30%' },
                  chaos: { trait: '순수뎀', icon: '💠', desc: '+12%뎀' },
                  eternity: { trait: '타수', icon: '🔱', desc: '+1타' }
                };

                // 모든 문양 순서대로 표시 - 색상 단순화
                return Object.entries(INSCRIPTIONS).map(([inscriptionId, inscriptionBase]) => {
                  const owned = highestByType[inscriptionId];
                  const isOwned = !!owned;
                  const grade = owned?.grade || 'common';
                  const gradeData = INSCRIPTION_GRADES[grade];
                  const isSelected = owned && activeInscriptions.includes(owned.id);
                  const slotIndex = owned ? activeInscriptions.indexOf(owned.id) : -1;
                  const trait = coreTraits[inscriptionId];

                  // 등급 반영된 실제 스탯 계산
                  const actualStats = isOwned ? calculateInscriptionStats(inscriptionId, grade) : null;

                  return (
                    <button
                      key={inscriptionId}
                      onClick={() => isOwned && toggleInscriptionSelection(owned.id)}
                      disabled={!isOwned}
                      className={`p-2 rounded-lg border relative transition-all ${
                        isSelected
                          ? 'bg-gray-800 border-blue-500 border-2 ring-1 ring-blue-400'
                          : isOwned
                          ? 'bg-gray-800/80 border-gray-600 hover:border-gray-500 hover:bg-gray-700/80'
                          : 'bg-gray-900/30 border-gray-800 opacity-30 cursor-not-allowed'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold z-20">
                          {slotIndex + 1}
                        </div>
                      )}
                      {/* 문양 이미지 */}
                      <div className={`flex justify-center mb-1 ${!isOwned ? 'grayscale opacity-50' : ''}`}>
                        <img
                          src={getInscriptionImage(inscriptionId)}
                          alt={inscriptionBase.name}
                          className="w-12 h-12 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="text-2xl hidden">📿</span>
                      </div>
                      {/* 등급 뱃지 - 작게 */}
                      <div className={`text-[9px] font-medium ${isOwned ? gradeData.color : 'text-gray-600'}`}>
                        {isOwned ? gradeData.name : '미보유'}
                      </div>
                      {/* 문양 이름 */}
                      <div className={`text-[10px] font-medium ${isOwned ? 'text-gray-200' : 'text-gray-600'} truncate`}>
                        {inscriptionBase.name.replace('의 문양', '')}
                      </div>
                      {/* 핵심 특성 - 회색 통일 */}
                      <div className={`text-[9px] mt-0.5 ${isOwned ? 'text-gray-400' : 'text-gray-700'}`} title={trait.desc}>
                        {trait.icon} {trait.trait}
                      </div>
                      {/* 최종뎀% - 회색 통일 */}
                      <div className={`text-[9px] ${isOwned ? 'text-gray-400' : 'text-gray-700'}`}>
                        +{actualStats ? actualStats.finalDamagePercent.toFixed(1) : inscriptionBase.baseStats.finalDamagePercent}%
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </>
      )}

      {/* 구분선 - 선택된 보스 없을때만 표시 */}
      {!selectedBoss && (
        <div className="text-center text-gray-500 text-sm py-8">
          위에서 보스를 선택하세요
        </div>
      )}

        </div>
      )}

      {/* 문양 관리 탭 - 도감 스타일 */}
      {activeSubTab === 'inscription' && (
        <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">📿 문양 도감</h2>
            <div className="text-sm text-gray-400">
              보유: <span className="text-purple-400 font-bold">{ownedInscriptions.length}</span>개
            </div>
          </div>

          {/* 문양 도감 그리드 - 10종 문양 (최고 등급만 표시) */}
          <div className="grid grid-cols-10 gap-2 mb-4">
            {Object.entries(INSCRIPTIONS).map(([inscriptionId, inscriptionBase]) => {
              // 이 문양의 최고 등급 찾기
              const GRADE_ORDER = ['common', 'uncommon', 'rare', 'epic', 'unique', 'legendary', 'mythic', 'dark'];
              const owned = ownedInscriptions.filter(i => i.inscriptionId === inscriptionId);

              let highestGrade = null;
              let highestGradeIndex = -1;
              owned.forEach(i => {
                const grade = migrateGrade(i.grade);
                const idx = GRADE_ORDER.indexOf(grade);
                if (idx > highestGradeIndex) {
                  highestGradeIndex = idx;
                  highestGrade = grade;
                }
              });

              const isSelected = selectedInscriptionDetail === inscriptionId;
              const gradeData = highestGrade ? INSCRIPTION_GRADES[highestGrade] : null;

              return (
                <button
                  key={inscriptionId}
                  onClick={() => setSelectedInscriptionDetail(inscriptionId)}
                  className={`relative p-2 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-purple-900/60 border-purple-500 shadow-lg shadow-purple-500/30'
                      : highestGrade
                      ? 'bg-gray-800 border-gray-600 hover:border-purple-500/50'
                      : 'bg-gray-900/50 border-gray-800 opacity-60'
                  }`}
                >
                  {/* 문양 이미지 */}
                  <div className="flex justify-center mb-1">
                    <img
                      src={getInscriptionImage(inscriptionId)}
                      alt={inscriptionBase.name}
                      className={`w-10 h-10 object-contain ${!highestGrade ? 'grayscale opacity-50' : ''}`}
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="text-xl hidden">📿</span>
                  </div>

                  {/* 문양 이름 */}
                  <div className="text-[10px] font-bold text-gray-200 text-center truncate">
                    {inscriptionBase.name.replace('의 문양', '')}
                  </div>

                  {/* 최고 등급 표시 */}
                  <div className="text-center mt-1">
                    {highestGrade ? (
                      <span className={`text-[9px] font-bold ${gradeData.color}`}>
                        {gradeData.name}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-600">미보유</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 선택된 문양 상세 정보 + 합성 */}
          {selectedInscriptionDetail && (() => {
            const inscriptionBase = INSCRIPTIONS[selectedInscriptionDetail];
            if (!inscriptionBase) return null;

            // 등급별 보유 목록
            const GRADE_ORDER = ['common', 'uncommon', 'rare', 'epic', 'unique', 'legendary', 'mythic', 'dark'];
            const ownedByGrade = {};
            GRADE_ORDER.forEach(g => { ownedByGrade[g] = []; });

            ownedInscriptions
              .filter(i => i.inscriptionId === selectedInscriptionDetail)
              .forEach(i => {
                const migratedGrade = migrateGrade(i.grade);
                if (ownedByGrade[migratedGrade]) {
                  ownedByGrade[migratedGrade].push(i);
                }
              });

            // 합성 함수 (5개 -> 1개 상위 등급) - GameEngine 사용
            const fuseInscriptions = (fromGrade) => {
              const result = engine.fuseInscriptions(selectedInscriptionDetail, fromGrade);

              if (result.success) {
                // GameEngine state를 React state에 반영
                setGameState(prev => ({
                  ...prev,
                  sealedZone: { ...engine.state.sealedZone }
                }));

                const toGradeName = INSCRIPTION_GRADES[result.newGrade]?.name || result.newGrade;
                const fromGradeName = INSCRIPTION_GRADES[fromGrade]?.name || fromGrade;
                showNotification(
                  '✨ 합성 성공!',
                  `${fromGradeName} 5개 → ${toGradeName} 1개`,
                  'success'
                );
              } else {
                showNotification('합성 실패', result.message, 'warning');
              }
            };

            return (
              <div className="bg-gray-800 border border-purple-500/50 rounded-lg p-2">
                {/* 가로 레이아웃: 왼쪽 25% 정보 + 오른쪽 75% 등급별 보유 */}
                <div className="flex gap-2 items-stretch">
                  {/* 왼쪽: 문양 정보 (30%) */}
                  <div className="w-[30%] flex-shrink-0 flex flex-col bg-gray-900 rounded p-3">
                    {/* 헤더 */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={getInscriptionImage(selectedInscriptionDetail)}
                        alt={inscriptionBase.name}
                        className="w-14 h-14 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-purple-300">{inscriptionBase.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">{inscriptionBase.description}</p>
                      </div>
                    </div>

                    {/* 특수 능력 박스 */}
                    <div className="bg-gray-800/80 rounded-lg p-2 mb-2 border border-yellow-500/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-yellow-400 text-xs">✨</span>
                        <span className="text-yellow-300 text-xs font-bold">{inscriptionBase.specialAbility.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed">
                        {inscriptionBase.specialAbility.description}
                      </p>
                    </div>

                    {/* 기본 스탯 */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="text-orange-400">🔥 최종뎀 +{inscriptionBase.baseStats.finalDamagePercent}%</span>
                      {inscriptionBase.baseStats.accuracy && (
                        <span className="text-blue-400">🎯 명중 +{inscriptionBase.baseStats.accuracy}</span>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽: 등급별 보유 및 합성 (75%) */}
                  <div className="flex-1 flex flex-col">
                    <div className="text-[9px] font-bold text-gray-300 mb-1">등급별 보유 및 합성</div>
                    <div className="flex gap-1 flex-1">
                      {GRADE_ORDER.map((grade, idx) => {
                        const gradeData = INSCRIPTION_GRADES[grade];
                        const count = ownedByGrade[grade].length;
                        const canFuse = count >= 5 && idx < GRADE_ORDER.length - 1;
                        const nextGrade = GRADE_ORDER[idx + 1];
                        const nextGradeData = nextGrade ? INSCRIPTION_GRADES[nextGrade] : null;
                        const stats = calculateInscriptionStats(selectedInscriptionDetail, grade);

                        // 등급별 글로우 색상
                        const glowColors = {
                          common: '',
                          uncommon: 'shadow-[0_0_8px_rgba(74,222,128,0.6)]',
                          rare: 'shadow-[0_0_10px_rgba(59,130,246,0.7)]',
                          epic: 'shadow-[0_0_12px_rgba(168,85,247,0.7)]',
                          unique: 'shadow-[0_0_14px_rgba(234,179,8,0.7)]',
                          legendary: 'shadow-[0_0_16px_rgba(249,115,22,0.8)]',
                          mythic: 'shadow-[0_0_18px_rgba(239,68,68,0.8)]',
                          dark: 'shadow-[0_0_20px_rgba(217,70,239,0.9)]'
                        };

                        return (
                          <div
                            key={grade}
                            className={`flex-1 flex flex-col items-center p-2 pt-3 rounded-lg border-2 transition-all ${
                              count > 0
                                ? `bg-gray-900 border-gray-600 ${glowColors[grade]}`
                                : 'bg-gray-900/30 border-gray-800 opacity-50'
                            }`}
                          >
                            {/* 문양 아이콘 */}
                            <div className={`relative mb-2 ${count > 0 ? '' : 'grayscale'}`}>
                              <img
                                src={getInscriptionImage(selectedInscriptionDetail)}
                                alt={inscriptionBase.name}
                                className="w-12 h-12 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>

                            {/* 등급명 */}
                            <div className={`text-sm font-bold mb-1 ${count > 0 ? gradeData.color : 'text-gray-600'}`}>
                              {gradeData.name}
                            </div>

                            {/* 스탯 표시 - 최종 데미지% */}
                            <div className={`text-sm font-bold ${count > 0 ? 'text-orange-300' : 'text-gray-600'}`}>
                              🔥 {stats.finalDamagePercent?.toFixed(1) || 0}%
                            </div>

                            {/* 명중 (있으면) */}
                            {inscriptionBase.baseStats.accuracy > 0 && (
                              <div className={`text-xs ${count > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                                🎯 +{Math.floor(stats.accuracy || 0)}
                              </div>
                            )}

                            {/* 보유 수량 + 합성 */}
                            <div className="mt-auto w-full pt-2">
                              {idx < GRADE_ORDER.length - 1 ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('합성 버튼 클릭:', grade, 'canFuse:', canFuse, 'count:', count);
                                    fuseInscriptions(grade);
                                  }}
                                  disabled={!canFuse}
                                  className={`w-full py-1 rounded text-xs font-bold transition-all ${
                                    canFuse
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white cursor-pointer'
                                      : count > 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                  }`}
                                  title={canFuse ? `5개 합성 → ${nextGradeData?.name} 1개` : '5개 필요'}
                                >
                                  {count}/5
                                </button>
                              ) : (
                                <div className={`text-center text-xs font-bold py-1 ${count > 0 ? 'text-fuchsia-400' : 'text-gray-600'}`}>
                                  {count}개
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 알림 모달 */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default SealedZone;
