import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../store/GameContext';
import { RAID_BOSSES, calculateRaidBossStats, INSCRIPTION_SLOT_CONFIG, checkBossUnlock, getDifficultyName, getDifficultyColor } from '../../data/raidBosses';
import { INSCRIPTIONS, INSCRIPTION_GRADES, INSCRIPTION_ABILITIES, calculateInscriptionStats, migrateGrade } from '../../data/inscriptions';
import { getTotalRelicEffects } from '../../data/prestigeRelics';
import { generateSetItem, EQUIPMENT_SLOTS } from '../../data/equipmentSets';
import { EQUIPMENT_CONFIG } from '../../data/gameBalance';
import { formatNumber, formatPercent } from '../../utils/formatter';
import { getTotalSkillEffects } from '../../data/skills';
import { getHeroById, getHeroStats } from '../../data/heroes';
import NotificationModal from '../UI/NotificationModal';

// GitHub Pages 배포용 BASE_URL
const BASE_URL = import.meta.env.BASE_URL || '/';

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
  const { player, sealedZone = {}, equipment = {}, skillLevels = {}, slotEnhancements = {}, heroes = {}, relics = {} } = gameState;

  // 전투력 계산 (PlayerInfo와 동일한 로직)
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

    const relicDamageMultiplier = 1 + (relicEffects.damagePercent || 0) / 100;
    return Math.floor(avgDamagePerHit * 10 * 30 * relicDamageMultiplier);
  };

  const combatPower = calculateCombatPower();

  const [selectedBoss, setSelectedBoss] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(1); // 숫자 레벨 (1부터 시작)
  const [activeInscriptions, setActiveInscriptions] = useState([]); // 문양 배열
  const [inBattle, setInBattle] = useState(false);
  const [battleTimer, setBattleTimer] = useState(30);
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
    healReduction: 0 // 치유 감소 %
  });

  // 알림 모달 상태
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  // 데미지 계산 함수 (캐릭터 데미지 + 문양 능력 전부 적용)
  const calculateDamage = (inscriptionStats, bossStats, currentBossHP) => {
    const bossData = RAID_BOSSES[selectedBoss];
    if (!bossData) return { damage: 0, isMiss: false, isCrit: false, shieldDamage: 0 };

    // 유물 효과: 문양 스탯/데미지 증가
    const relicEffects = getTotalRelicEffects(gameState.prestigeRelics || {});
    const inscriptionStatsBonus = 1 + (relicEffects.inscriptionStats || 0) / 100;
    const inscriptionDamageBonus = 1 + (relicEffects.inscriptionDamage || 0) / 100;

    // 캐릭터 기본 DPS (전체 DPS가 각 문양 공격에 추가됨)
    // calculateTotalDPS()는 { damage, isCrit } 객체를 반환함
    const dpsResult = engine ? engine.calculateTotalDPS() : null;
    const playerDPS = dpsResult ? dpsResult.damage : 0;

    // 문양 공격력 (유물: 문양의 정수 적용)
    let inscriptionDamage = (inscriptionStats.attack || 0) * inscriptionStatsBonus;

    // 공격력 % 증가 (유물 보너스 적용)
    if (inscriptionStats.attackPercent) {
      inscriptionDamage *= (1 + (inscriptionStats.attackPercent * inscriptionStatsBonus) / 100);
    }

    // 기본 데미지 = 캐릭터 전체 DPS + 문양 데미지
    let baseDamage = playerDPS + inscriptionDamage;

    // 어빌리티: true_hit (필중 - 회피 무시) - abilities는 문자열 배열임
    const abilities = inscriptionStats.abilities || [];
    const hasTrueHit = abilities.includes('true_hit');

    // 명중률 체크 (보스 회피율 vs 문양 명중률)
    const bossEvasion = bossData.pattern?.evasionRate || 0;
    let hitChance = 100;

    if (!hasTrueHit) {
      hitChance = Math.max(10, 100 - bossEvasion + (inscriptionStats.accuracy || 0));
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

    // 특수 능력 적용
    const specialAbility = inscriptionStats.specialAbility;

    if (specialAbility) {
      switch (specialAbility.type) {
        case 'hp_percent_damage': // 갈증의 문양: 보스 최대 HP 5% 추가 피해
          baseDamage += bossStats.maxHp * (specialAbility.value / 100);
          break;

        case 'hp_execute': // 영원의 문양: 보스 HP 20% 이하시 데미지 2배
          if (currentBossHP <= bossStats.maxHp * 0.2) {
            baseDamage *= 2;
          }
          break;
      }
    }

    // 보호막 관련 어빌리티
    let shieldDamage = 0;
    let bypassShield = false;

    if (abilities.includes('shield_break') && bossPatternState.hasShield) {
      shieldDamage = baseDamage * 0.5; // 50% 추가 피해
    }
    if (abilities.includes('shield_penetration')) {
      bypassShield = true;
    }

    // 유물: 폭풍의 문양 (문양 데미지 보너스 증가) 최종 적용
    baseDamage *= inscriptionDamageBonus;
    shieldDamage *= inscriptionDamageBonus;

    return {
      damage: Math.floor(baseDamage),
      isMiss: false,
      isCrit,
      shieldDamage: Math.floor(shieldDamage),
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

      // 장비 파괴 (베크타)
      if (pattern.equipmentBreakChance && Math.random() * 100 < pattern.equipmentBreakChance) {
        // 장비 파괴 면역 체크
        const hasEquipmentImmunity = activeInscriptions.some(inscId => {
          const inscription = ownedInscriptions.find(i => i.id === inscId);
          if (!inscription) return false;
          const inscData = INSCRIPTIONS[inscription.inscriptionId];
          return inscData?.abilities?.some(a => a.type === 'equipment_immunity');
        });

        if (!hasEquipmentImmunity) {
          newState.equipmentDestroyed = true;
          setBattleLog(log => [...log.slice(-5), `⚠️ ${bossData.name}이(가) 장비를 파괴했습니다!`]);
        }
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
  const showDamageNumber = (damage, isCrit, isMiss = false) => {
    damageIdRef.current += 1;
    const newDamage = {
      id: damageIdRef.current,
      value: damage,
      isCrit,
      isMiss,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 20 + Math.random() * 10,
    };
    setDamageNumbers(prev => [...prev.slice(-8), newDamage]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== newDamage.id));
    }, 1000);

    // 히트 이펙트
    if (!isMiss) {
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
      alert('도전권이 부족합니다!');
      return;
    }

    if (activeInscriptions.length === 0) {
      alert('문양을 최소 1개 선택해주세요!');
      return;
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
    setBossHP(bossStats.hp);
    setBattleTimer(30);
    setBattleLog([]);
    setBattleState({
      totalAttacks: 0,
      totalMisses: 0,
      lastMissed: false,
      guaranteedCritNext: false
    });
    setBossPatternState({
      hasShield: false,
      shieldHP: 0,
      maxShieldHP: 0,
      isRegenerating: false,
      regenAmount: 0,
      equipmentDestroyed: false,
      healReduction: 0
    });
    setInBattle(true);
  };

  // 전투 타이머
  useEffect(() => {
    if (!inBattle) return;

    const interval = setInterval(() => {
      setBattleTimer(prev => {
        if (prev <= 1) {
          endBattle(false); // 시간 초과 패배
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

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

  // 보스 재생 처리
  useEffect(() => {
    if (!inBattle || !bossPatternState.isRegenerating) return;

    const regenInterval = setInterval(() => {
      const bossData = RAID_BOSSES[selectedBoss];

      // 치유 감소 어빌리티 체크
      const hasHealReduction = activeInscriptions.some(inscId => {
        const inscription = ownedInscriptions.find(i => i.id === inscId);
        if (!inscription) return false;
        const inscData = INSCRIPTIONS[inscription.inscriptionId];
        return inscData?.abilities?.some(a => a.type === 'heal_reduction');
      });

      setBossHP(prevHP => {
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
        let regenAmount = bossPatternState.regenAmount;

        // 치유 감소 적용
        if (hasHealReduction) {
          regenAmount *= 0.3; // 70% 감소
          setBattleLog(log => [...log.slice(-5), `🚫 치유 감소! ${Math.floor(regenAmount).toLocaleString()} 회복`]);
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
    // 전투 상태 초기화
    setBattleTimer(30);
    setBossHP(100);
    setBattleLog([]);
    setDamageNumbers([]);

    // setTimeout으로 감싸서 렌더링 중 setState 방지
    setTimeout(() => {
      if (victory) {
        // 보상 계산 (calculateRaidBossStats 사용)
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
        const rewards = bossStats.rewards;

        // 세트 아이템 드랍 (20% 확률)
        let droppedSetItem = null;
        if (Math.random() < 0.20) {
          // 랜덤 슬롯 선택
          const slots = Object.keys(EQUIPMENT_SLOTS);
          const randomSlot = slots[Math.floor(Math.random() * slots.length)];
          // 난이도 레벨을 floor로 사용하여 템렙 결정
          droppedSetItem = generateSetItem(randomSlot, selectedDifficulty);
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

        showNotification('💀 패배', '시간 초과! 도전권이 환불되었습니다.', 'error');
      }
    }, 0);
  };

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
      const attackInterval = 1000; // 1초마다 공격

      return setInterval(() => {
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

          // 미스 처리
          if (result.isMiss) {
            setBattleLog(log => [...log.slice(-5), `📿 ${inscriptionStats.name} - Miss!`]);
            showDamageNumber(0, false, true);
            return prevHP;
          }

          // 데미지 적용
          const actualDamage = result.damage;

          // 데미지 플로팅 텍스트 표시
          showDamageNumber(actualDamage, result.isCrit, false);

          // 로그 추가
          if (result.isCrit) {
            setBattleLog(log => [...log.slice(-5), `📿 ${inscriptionStats.name} - ${actualDamage.toLocaleString()} 💥 치명타!`]);
          } else {
            setBattleLog(log => [...log.slice(-5), `📿 ${inscriptionStats.name} - ${actualDamage.toLocaleString()} 데미지`]);
          }

          const newHP = Math.max(0, prevHP - actualDamage);

          // 승리 처리를 setTimeout으로 지연시켜 렌더링 중 setState 방지
          if (newHP <= 0) {
            setTimeout(() => endBattle(true), 0);
          }

          return newHP;
        });
      }, attackInterval);
    }).filter(Boolean);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [inBattle, activeInscriptions, selectedBoss, selectedDifficulty, ownedInscriptions]);

  // 전투 화면 컴포넌트 (인라인용)
  const renderBattlePanel = () => {
    if (!inBattle || !selectedBoss) return null;

    const bossData = RAID_BOSSES[selectedBoss];
    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
    const hpPercent = (bossHP / bossStats.hp) * 100;
    const timerPercent = (battleTimer / 30) * 100;
    const playerImageSrc = getPlayerImagePath(player.classLevel || 0, playerFrame);

    // HP 구간 계산 (클리어 가능성 판단) - 전투력 기반
    // 남은 시간 비율만큼의 전투력으로 남은 HP를 처리할 수 있는지 확인
    const remainingPower = combatPower * (battleTimer / 30);
    const canClear = remainingPower >= bossHP;

    return (
      <div className="flex-1 bg-gradient-to-r from-red-900/30 to-gray-800/50 border border-red-500/30 rounded-lg p-3">
        {/* 상단 정보 바 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-red-400">{bossData.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getDifficultyColor(selectedDifficulty)} bg-gray-800`}>
              Lv.{selectedDifficulty}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-xs font-bold ${canClear ? 'text-green-400' : 'text-red-400'}`}>
              {canClear ? '✓ 클리어 가능' : '✗ 클리어 불가'}
            </span>
          </div>
        </div>

        {/* 좌우 레이아웃: 전투화면 | 정보패널 */}
        <div className="flex gap-3">
          {/* 좌측: 전투 화면 (캐릭터 vs 보스) */}
          <div
            className={`flex-1 relative overflow-hidden rounded-lg border border-purple-900/50 ${screenShake ? 'animate-shake' : ''}`}
            style={{ height: '200px', background: 'linear-gradient(180deg, #0d0d1a 0%, #1a1025 40%, #251530 70%, #0d0d15 100%)' }}
          >
            {/* 크리티컬 플래시 효과 */}
            {isCriticalHit && (
              <div
                className="absolute inset-0 z-20 pointer-events-none animate-critFlash"
                style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)' }}
              />
            )}

            {/* 바닥 그라데이션 */}
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(13,13,26,0.9) 100%)' }} />

            {/* 캐릭터 (좌측) */}
            <div className="absolute" style={{ bottom: '10%', left: '12%' }}>
              <div className="flex items-end justify-center" style={{ width: '80px', height: '70px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.7))' }}>
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

            {/* 보스 (우측) */}
            <div
              className={`absolute transition-all duration-150 ${isMonsterHit ? (isCriticalHit ? 'translate-x-3' : 'translate-x-1') : ''}`}
              style={{
                bottom: '10%',
                right: '12%',
                filter: isMonsterHit
                  ? 'brightness(2) saturate(0.5)'
                  : 'drop-shadow(0 0 10px #8B5CF6) drop-shadow(0 0 20px #6D28D9)',
              }}
            >
              <div className="flex items-end justify-center" style={{ width: '90px', height: '80px' }}>
                <img
                  src={getBossImage(selectedBoss)}
                  alt={bossData.name}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="text-4xl hidden items-center justify-center">{bossData.icon}</div>
              </div>
            </div>

            {/* 데미지 숫자 팝업 */}
            {damageNumbers.map(dmg => (
              <div
                key={dmg.id}
                className="absolute pointer-events-none z-50"
                style={{
                  right: `${dmg.x - 20}%`,
                  top: `${dmg.y}%`,
                  textShadow: dmg.isCrit
                    ? '0 0 8px #ff0000, 0 0 16px #ff4444, 2px 2px 4px rgba(0,0,0,1)'
                    : dmg.isMiss
                    ? '1px 1px 2px rgba(0,0,0,0.9)'
                    : '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9)',
                  animation: dmg.isCrit ? 'critDamageFloat 1s ease-out forwards' : 'damageFloat 1s ease-out forwards',
                  fontSize: dmg.isCrit ? '1.2rem' : dmg.isMiss ? '0.8rem' : '1rem',
                  color: dmg.isMiss ? '#888888' : dmg.isCrit ? '#FFD700' : '#FFFFFF',
                  fontWeight: 700,
                }}
              >
                {dmg.isMiss ? 'MISS' : (
                  <>
                    {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
                    {formatNumber(dmg.value)}
                    {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
                  </>
                )}
              </div>
            ))}

            {/* 활성 문양 표시 (우측 상단) */}
            <div className="absolute top-1 right-1 flex gap-0.5">
              {activeInscriptions.slice(0, 5).map(inscId => {
                const inscription = ownedInscriptions.find(i => i.id === inscId);
                if (!inscription) return null;
                return (
                  <div key={inscId} className="w-6 h-6 bg-black/50 rounded border border-purple-500/50 p-0.5">
                    <img
                      src={getInscriptionImage(inscription.inscriptionId)}
                      alt=""
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                );
              })}
            </div>

            {/* 보스 패턴 상태 (좌측 상단) */}
            <div className="absolute top-1 left-1 flex flex-col gap-0.5">
              {bossPatternState.hasShield && (
                <div className="bg-blue-900/80 border border-blue-500 rounded px-1 py-0.5 text-[8px] text-blue-300">
                  🛡️ {Math.floor((bossPatternState.shieldHP / bossPatternState.maxShieldHP) * 100)}%
                </div>
              )}
              {bossPatternState.isRegenerating && (
                <div className="bg-green-900/80 border border-green-500 rounded px-1 py-0.5 text-[8px] text-green-300">
                  ♻️ 재생
                </div>
              )}
            </div>

            {/* CSS 애니메이션 */}
            <style>{`
              @keyframes damageFloat {
                0% { opacity: 1; transform: translateY(0) scale(1); }
                50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
                100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
              }
              @keyframes critDamageFloat {
                0% { opacity: 1; transform: translateY(0) scale(1.5); }
                20% { transform: translateY(-10px) scale(1.8); }
                50% { opacity: 1; transform: translateY(-25px) scale(1.6); }
                100% { opacity: 0; transform: translateY(-50px) scale(1); }
              }
              .animate-shake {
                animation: shake 0.2s ease-in-out;
              }
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-4px) rotate(-1deg); }
                40% { transform: translateX(4px) rotate(1deg); }
                60% { transform: translateX(-3px) rotate(-0.5deg); }
                80% { transform: translateX(3px) rotate(0.5deg); }
              }
              .animate-critFlash {
                animation: critFlash 0.3s ease-out;
              }
              @keyframes critFlash {
                0% { opacity: 0; }
                30% { opacity: 1; }
                100% { opacity: 0; }
              }
            `}</style>
          </div>

          {/* 우측: 정보 패널 (HP, 타이머, 로그, 포기버튼) */}
          <div className="w-48 flex flex-col">
            {/* HP 바 */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-red-400 font-bold">HP</span>
                <span className="text-gray-300">{formatNumber(bossHP)} / {formatNumber(bossStats.hp)}</span>
              </div>
              <div className="relative w-full bg-gray-800 rounded-full h-5 overflow-hidden border border-gray-600">
                <div
                  className={`h-full transition-all duration-200 ${
                    hpPercent > 50 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                    hpPercent > 25 ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                    'bg-gradient-to-r from-yellow-600 to-yellow-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
                <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-white/30" />
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/40" />
                <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-white/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white drop-shadow-lg">{hpPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 타이머 바 */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-yellow-400 font-bold">⏱️ 시간</span>
                <span className={`font-bold ${battleTimer <= 10 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
                  {battleTimer}초
                </span>
              </div>
              <div className="relative w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-600">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timerPercent > 50 ? 'bg-gradient-to-r from-green-600 to-green-500' :
                    timerPercent > 25 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                    'bg-gradient-to-r from-red-600 to-red-500 animate-pulse'
                  }`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
            </div>

            {/* 전투 로그 */}
            <div className="flex-1 bg-gray-900/50 border border-gray-700 rounded p-1.5 overflow-y-auto mb-2" style={{ minHeight: '80px' }}>
              {battleLog.slice(-6).map((log, i) => (
                <div key={i} className="text-[9px] text-gray-400">{log}</div>
              ))}
            </div>

            {/* 포기 버튼 */}
            <button
              onClick={() => endBattle(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold text-sm"
            >
              포기
            </button>
          </div>
        </div>
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

        {/* 오른쪽: 전투 중이면 전투 화면, 아니면 보스 상세 정보 */}
        {inBattle ? (
          // 전투 화면
          renderBattlePanel()
        ) : selectedBoss ? (
          <div className="flex-1 bg-gradient-to-r from-red-900/30 to-gray-800/50 border border-red-500/30 rounded-lg p-3">
            <div className="flex gap-4">
              {/* 보스 초상화 (컴팩트) */}
              <div className="flex-shrink-0 flex flex-col items-center w-24">
                <div className="relative">
                  <img
                    src={getBossImage(selectedBoss)}
                    alt={RAID_BOSSES[selectedBoss].name}
                    className="w-20 h-20 object-contain"
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 10px #ef4444)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="text-3xl hidden items-center justify-center w-20 h-20">{RAID_BOSSES[selectedBoss].icon}</div>
                </div>
                {/* 난이도 선택 (초상화 아래) */}
                <div className="mt-1 w-full">
                  <div className="text-center mb-0.5">
                    <span className={`text-xs font-bold ${getDifficultyColor(selectedDifficulty)}`}>
                      Lv.{selectedDifficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 10))}
                      className="w-6 h-4 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-[8px]"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 1))}
                      className="w-4 h-4 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-[9px]"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(selectedDifficulty + 1)}
                      className="w-4 h-4 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-[9px]"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(selectedDifficulty + 10)}
                      className="w-6 h-4 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-[8px]"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* 보스 정보 (더 컴팩트하게) */}
              <div className="flex-1 flex flex-col min-w-0">
                <h3 className="text-base font-bold text-red-400">{RAID_BOSSES[selectedBoss].name}</h3>
                <div className="text-[10px] text-orange-400 font-bold mb-1 p-1.5 bg-gray-800/50 rounded truncate">
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
                      <div className={`text-center py-0.5 rounded font-bold text-[10px] ${canClear ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
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
                          alert('보스코인이 부족합니다!');
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
                              {/* 스탯 표시 - 공격력 + 특수능력 */}
                              <div className="flex items-center gap-2 text-[8px]">
                                <span className="text-orange-300">⚔️ {formatNumber(inscriptionData.attack)}</span>
                                <span className="text-cyan-400">{inscriptionBase?.specialAbility?.name}</span>
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

      {selectedBoss && (
        <>
          {/* 보유 문양 선택 - 전투 중에도 표시 (선택은 비활성화) */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2">
              문양 선택 {inBattle && <span className="text-yellow-400 text-xs">(전투 중)</span>}
            </h3>
            <div className="grid grid-cols-10 gap-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700">
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

                // 핵심 특성 짧은 이름
                const coreTraits = {
                  rage: { trait: '깡공', icon: '⚔️' },
                  precision: { trait: '치확', icon: '🎯' },
                  shadow: { trait: '명중', icon: '👁️' },
                  destruction: { trait: '장비보호', icon: '🛡️' },
                  crush: { trait: '관통', icon: '💥' },
                  void: { trait: '방무', icon: '🗡️' },
                  thirst: { trait: 'HP%뎀', icon: '💀' },
                  decay: { trait: '힐감', icon: '🚫' },
                  chaos: { trait: '치뎀', icon: '💢' },
                  eternity: { trait: '처형', icon: '⚡' }
                };

                // 등급별 글로우 색상
                const glowColors = {
                  common: '',
                  uncommon: 'shadow-[0_0_10px_rgba(74,222,128,0.7)]',
                  rare: 'shadow-[0_0_12px_rgba(59,130,246,0.8)]',
                  epic: 'shadow-[0_0_14px_rgba(168,85,247,0.8)]',
                  unique: 'shadow-[0_0_16px_rgba(234,179,8,0.8)]',
                  legendary: 'shadow-[0_0_18px_rgba(249,115,22,0.9)]',
                  mythic: 'shadow-[0_0_20px_rgba(239,68,68,0.9)]',
                  dark: 'shadow-[0_0_22px_rgba(217,70,239,1)]'
                };

                // 모든 문양 순서대로 표시
                return Object.entries(INSCRIPTIONS).map(([inscriptionId, inscriptionBase]) => {
                  const owned = highestByType[inscriptionId];
                  const isOwned = !!owned;
                  const grade = owned?.grade || 'common';
                  const gradeData = INSCRIPTION_GRADES[grade];
                  const isSelected = owned && activeInscriptions.includes(owned.id);
                  const slotIndex = owned ? activeInscriptions.indexOf(owned.id) : -1;
                  const trait = coreTraits[inscriptionId];

                  return (
                    <button
                      key={inscriptionId}
                      onClick={() => isOwned && !inBattle && toggleInscriptionSelection(owned.id)}
                      disabled={!isOwned || inBattle}
                      className={`p-1.5 rounded-lg border-2 relative transition-all ${
                        isSelected
                          ? 'bg-blue-900/80 border-blue-400 ring-2 ring-blue-400 scale-105 z-10'
                          : isOwned && !inBattle
                          ? `bg-gray-900 border-gray-600 hover:scale-105 hover:z-10 ${glowColors[grade]}`
                          : 'bg-gray-900/30 border-gray-800 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-md border border-blue-300 z-20">
                          {slotIndex + 1}
                        </div>
                      )}
                      {/* 문양 이미지 */}
                      <div className={`flex justify-center mb-1 ${!isOwned ? 'grayscale' : ''}`}>
                        <img
                          src={getInscriptionImage(inscriptionId)}
                          alt={inscriptionBase.name}
                          className="w-9 h-9 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="text-xl hidden">📿</span>
                      </div>
                      {/* 등급 */}
                      <div className={`text-[9px] font-bold ${isOwned ? gradeData.color : 'text-gray-600'}`}>
                        {isOwned ? gradeData.name : '미보유'}
                      </div>
                      {/* 문양 이름 */}
                      <div className={`text-[8px] ${isOwned ? 'text-gray-200' : 'text-gray-600'} truncate`}>
                        {inscriptionBase.name.replace('의 문양', '')}
                      </div>
                      {/* 핵심 특성 */}
                      <div className={`text-[8px] mt-0.5 ${isOwned ? 'text-cyan-400' : 'text-gray-700'}`}>
                        {trait.icon} {trait.trait}
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

            // 합성 함수 (5개 -> 1개 상위 등급)
            const fuseInscriptions = (fromGrade) => {
              const gradeIndex = GRADE_ORDER.indexOf(fromGrade);
              if (gradeIndex >= GRADE_ORDER.length - 1) return; // 신화는 합성 불가

              const toGrade = GRADE_ORDER[gradeIndex + 1];
              const items = ownedByGrade[fromGrade];

              if (items.length < 5) {
                showNotification('합성 실패', `${INSCRIPTION_GRADES[fromGrade].name} 등급 문양이 5개 필요합니다.`, 'warning');
                return;
              }

              // 5개 제거하고 1개 상위 등급 추가
              const itemsToRemove = items.slice(0, 5).map(i => i.id);

              setGameState(prev => {
                const newInscriptions = prev.sealedZone.ownedInscriptions.filter(
                  i => !itemsToRemove.includes(i.id)
                );

                // 새 상위 등급 문양 추가
                const newInscription = {
                  id: `${selectedInscriptionDetail}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  inscriptionId: selectedInscriptionDetail,
                  grade: toGrade
                };

                return {
                  ...prev,
                  sealedZone: {
                    ...prev.sealedZone,
                    ownedInscriptions: [...newInscriptions, newInscription]
                  }
                };
              });

              showNotification(
                '✨ 합성 성공!',
                `${INSCRIPTION_GRADES[fromGrade].name} 5개 → ${INSCRIPTION_GRADES[toGrade].name} 1개`,
                'success'
              );
            };

            return (
              <div className="bg-gray-800 border border-purple-500/50 rounded-lg p-2">
                {/* 가로 레이아웃: 왼쪽 25% 정보 + 오른쪽 75% 등급별 보유 */}
                <div className="flex gap-2 items-stretch">
                  {/* 왼쪽: 문양 정보 (25%) */}
                  <div className="w-[25%] flex-shrink-0 flex flex-col justify-between bg-gray-900 rounded p-2">
                    {/* 헤더 */}
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={getInscriptionImage(selectedInscriptionDetail)}
                        alt={inscriptionBase.name}
                        className="w-10 h-10 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div>
                        <h3 className="text-xs font-bold text-purple-300">{inscriptionBase.name}</h3>
                        <p className="text-[9px] text-gray-400">{inscriptionBase.description}</p>
                      </div>
                    </div>

                    {/* 특수 능력 + 보스 대응 능력 (한 줄) */}
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-cyan-400 whitespace-nowrap">✨ {inscriptionBase.specialAbility.name}</span>
                      <span className="text-gray-600">|</span>
                      {inscriptionBase.abilities.map(abilityId => {
                        const ability = INSCRIPTION_ABILITIES[abilityId];
                        return (
                          <span key={abilityId} className="text-purple-400 whitespace-nowrap">{ability.icon} {ability.name}</span>
                        );
                      })}
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

                            {/* 스탯 표시 - 공격력 */}
                            <div className={`text-sm font-bold ${count > 0 ? 'text-orange-300' : 'text-gray-600'}`}>
                              ⚔️ {formatNumber(stats.attack)}
                            </div>

                            {/* 치명타 확률 */}
                            <div className={`text-xs ${count > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>
                              🎯 {stats.critChance.toFixed(1)}%
                            </div>

                            {/* 보유 수량 + 합성 */}
                            <div className="mt-auto w-full pt-2">
                              {idx < GRADE_ORDER.length - 1 ? (
                                <button
                                  onClick={() => fuseInscriptions(grade)}
                                  disabled={!canFuse}
                                  className={`w-full py-1 rounded text-xs font-bold transition-all ${
                                    canFuse
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                                      : count > 0 ? 'bg-gray-700 text-gray-400' : 'bg-gray-800 text-gray-600'
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
