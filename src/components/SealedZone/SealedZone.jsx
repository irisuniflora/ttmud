import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { RAID_BOSSES, calculateRaidBossStats, INSCRIPTION_SLOT_CONFIG, checkBossUnlock, getDifficultyName, getDifficultyColor, getDifficultyMultiplier } from '../../data/raidBosses';
import { INSCRIPTIONS, INSCRIPTION_GRADES, INSCRIPTION_ABILITIES, calculateInscriptionStats, migrateGrade } from '../../data/inscriptions';
import { getTotalRelicEffects } from '../../data/prestigeRelics';
import { formatNumber, formatPercent } from '../../utils/formatter';
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
  const { player, sealedZone = {} } = gameState;

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
    const inscription = INSCRIPTIONS[inscriptionStats.id];

    // 유물 효과: 문양 스탯/데미지 증가
    const relicEffects = getTotalRelicEffects(gameState.prestigeRelics || {});
    const inscriptionStatsBonus = 1 + (relicEffects.inscriptionStats || 0) / 100;
    const inscriptionDamageBonus = 1 + (relicEffects.inscriptionDamage || 0) / 100;

    // 캐릭터 기본 DPS (전체 DPS가 각 문양 공격에 추가됨)
    const playerDPS = engine ? engine.calculateTotalDPS() : 0;

    // 문양 공격력 (유물: 문양의 정수 적용)
    let inscriptionDamage = inscriptionStats.attack * inscriptionStatsBonus;

    // 공격력 % 증가 (유물 보너스 적용)
    if (inscriptionStats.attackPercent) {
      inscriptionDamage *= (1 + (inscriptionStats.attackPercent * inscriptionStatsBonus) / 100);
    }

    // 기본 데미지 = 캐릭터 전체 DPS + 문양 데미지
    let baseDamage = playerDPS + inscriptionDamage;

    // 어빌리티: true_hit (필중 - 회피 무시)
    const hasTrueHit = inscription?.abilities?.some(a => a.type === 'true_hit');

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
    const specialAbility = INSCRIPTIONS[inscriptionStats.id]?.specialAbility;

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

    // 어빌리티 적용
    const abilities = inscription?.abilities || [];
    let shieldDamage = 0;
    let bypassShield = false;

    abilities.forEach(ability => {
      switch (ability.type) {
        case 'shield_break': // 보호막에 추가 피해
          if (bossPatternState.hasShield) {
            shieldDamage = baseDamage * (ability.value / 100);
          }
          break;

        case 'shield_penetration': // 보호막 무시
          bypassShield = true;
          break;

        case 'crit_chance_boost': // 치명타 확률 증가
          // 이미 critChance에 반영되어 있음
          break;

        case 'crit_damage_boost': // 치명타 데미지 증가
          // 이미 critDamage에 반영되어 있음
          break;

        case 'attack_boost': // 공격력 증가
          // 이미 attack에 반영되어 있음
          break;

        case 'accuracy_boost': // 명중률 증가
          // 이미 accuracy에 반영되어 있음
          break;

        case 'penetration': // 방어 관통
          // 이미 penetration에 반영되어 있음
          break;

        case 'penetration_boost': // 추가 방어 관통
          // 이미 penetration에 반영되어 있음
          break;
      }
    });

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

    if (victory) {
      // 보상 계산 (calculateRaidBossStats 사용)
      const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
      const rewards = bossStats.rewards;

      // GameEngine 상태도 직접 업데이트 (저장을 위해)
      if (engine) {
        engine.state.player.gold += rewards.gold;
        if (!engine.state.sealedZone) {
          engine.state.sealedZone = { tickets: 0, ownedInscriptions: [], unlockedBosses: ['vecta'], unlockedInscriptionSlots: 1, bossCoins: 0 };
        }
        engine.state.sealedZone.bossCoins = (engine.state.sealedZone.bossCoins || 0) + rewards.bossCoins;
      }

      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold + rewards.gold
        },
        sealedZone: {
          ...prev.sealedZone,
          bossCoins: (prev.sealedZone?.bossCoins || 0) + rewards.bossCoins
        }
      }));

      showNotification(
        '🎉 승리!',
        `💰 골드 +${formatNumber(rewards.gold)}\n🪙 보스 코인 +${rewards.bossCoins}`,
        'success'
      );
    } else {
      showNotification('💀 패배', '시간 초과! 다시 도전하세요.', 'error');
    }
  };

  // 문양 공격 (여러 문양 동시 공격)
  useEffect(() => {
    if (!inBattle || activeInscriptions.length === 0) return;

    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);

    const intervals = activeInscriptions.map(inscriptionId => {
      const inscription = ownedInscriptions.find(i => i.id === inscriptionId);
      if (!inscription) return null;

      const inscriptionStats = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
      const attackInterval = 1000; // 1초마다 공격

      return setInterval(() => {
        setBossHP(prevHP => {
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

          // 보호막 처리
          let actualDamage = result.damage;

          if (!result.isMiss) {
            setBossPatternState(prev => {
              let newState = { ...prev };

              // 보호막이 있고 무시하지 않는 경우
              if (prev.hasShield && !result.bypassShield) {
                const totalShieldDamage = result.damage + result.shieldDamage;

                if (prev.shieldHP > totalShieldDamage) {
                  // 보호막이 데미지를 흡수
                  newState.shieldHP = prev.shieldHP - totalShieldDamage;
                  actualDamage = 0;
                  setBattleLog(log => [...log.slice(-5), `🛡️ 보호막 흡수: ${totalShieldDamage.toLocaleString()}`]);
                } else {
                  // 보호막 파괴 후 남은 데미지는 본체에
                  actualDamage = totalShieldDamage - prev.shieldHP;
                  newState.hasShield = false;
                  newState.shieldHP = 0;
                  setBattleLog(log => [...log.slice(-5), `💥 보호막 파괴! 관통 ${actualDamage.toLocaleString()}`]);
                }
              } else if (result.bypassShield) {
                // 보호막 무시
                setBattleLog(log => [...log.slice(-5), `⚡ 보호막 관통: ${result.damage.toLocaleString()}`]);
              }

              return newState;
            });
          }

          // 로그 추가
          if (result.isMiss) {
            setBattleLog(log => [...log.slice(-5), `📿 ${inscriptionStats.name} - Miss!`]);
          } else if (result.isCrit && actualDamage > 0) {
            setBattleLog(log => [...log.slice(-5), `📿 ${inscriptionStats.name} - ${actualDamage.toLocaleString()} 💥 치명타!`]);
          } else if (actualDamage > 0) {
            setBattleLog(log => [...log.slice(-5), `📿 ${inscriptionStats.name} - ${actualDamage.toLocaleString()} 데미지`]);
          }

          const newHP = Math.max(0, prevHP - actualDamage);

          if (newHP <= 0) {
            endBattle(true);
          }

          return newHP;
        });
      }, attackInterval);
    }).filter(Boolean);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [inBattle, activeInscriptions, battleState]);

  if (inBattle) {
    // 전투 화면
    const bossData = RAID_BOSSES[selectedBoss];
    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty);
    const hpPercent = (bossHP / bossStats.hp) * 100;

    return (
      <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
        {/* 보스 헤더 (이미지 + 이름 + 타이머) */}
        <div className="flex items-center gap-4 mb-4">
          {/* 보스 이미지 */}
          <div className="relative flex-shrink-0">
            <img
              src={getBossImage(selectedBoss)}
              alt={bossData.name}
              className="w-16 h-16 object-contain animate-pulse"
              style={{
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 8px #ef4444)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="text-4xl hidden items-center justify-center w-16 h-16">{bossData.icon}</div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-100">{bossData.name}</h2>
            <div className="text-xs text-gray-400">{bossData.description}</div>
          </div>
          <div className="text-2xl font-bold text-red-400">⏱️ {battleTimer}초</div>
        </div>

        {/* 보스 HP 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">HP</span>
            <span className="text-gray-300">{formatNumber(bossHP)} / {formatNumber(bossStats.hp)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-200"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* 보스 패턴 상태 표시 */}
        {(bossPatternState.hasShield || bossPatternState.isRegenerating || bossPatternState.equipmentDestroyed) && (
          <div className="mb-4 flex gap-2 flex-wrap">
            {bossPatternState.hasShield && (
              <div className="bg-blue-900 border border-blue-500 rounded px-3 py-1 text-sm">
                <span className="text-blue-400">🛡️ 보호막: {formatNumber(Math.floor(bossPatternState.shieldHP))} / {formatNumber(Math.floor(bossPatternState.maxShieldHP))}</span>
              </div>
            )}
            {bossPatternState.isRegenerating && (
              <div className="bg-green-900 border border-green-500 rounded px-3 py-1 text-sm">
                <span className="text-green-400">♻️ 재생 중 ({Math.floor(bossPatternState.regenAmount).toLocaleString()}/2초)</span>
              </div>
            )}
            {bossPatternState.equipmentDestroyed && (
              <div className="bg-red-900 border border-red-500 rounded px-3 py-1 text-sm">
                <span className="text-red-400">⚠️ 장비 파괴됨!</span>
              </div>
            )}
          </div>
        )}

        {/* 보스 패턴 설명 */}
        <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-4">
          <div className="text-sm text-gray-300">
            <div className="font-bold text-orange-400 mb-1">{bossData.pattern.icon} {bossData.pattern.name}</div>
            <div>{bossData.pattern.description}</div>
          </div>
        </div>

        {/* 버프/디버프 상태창 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 보스 버프/디버프 */}
          <div className="bg-gray-800 border border-gray-700 rounded p-3">
            <h4 className="text-xs font-bold text-red-400 mb-2">👹 보스 상태</h4>
            <div className="space-y-1">
              {bossPatternState.hasShield && (
                <div
                  className="flex items-center gap-1 text-xs cursor-help"
                  title="보스의 보호막이 활성화되어 있습니다. 보호막을 먼저 파괴해야 본체에 데미지를 입힐 수 있습니다."
                >
                  <span className="text-blue-400">🛡️</span>
                  <span className="text-blue-300">보호막 ({Math.floor((bossPatternState.shieldHP / bossPatternState.maxShieldHP) * 100)}%)</span>
                </div>
              )}
              {bossPatternState.isRegenerating && (
                <div
                  className="flex items-center gap-1 text-xs cursor-help"
                  title={`보스가 재생 중입니다. 2초마다 ${Math.floor(bossPatternState.regenAmount).toLocaleString()} HP를 회복합니다.`}
                >
                  <span className="text-green-400">♻️</span>
                  <span className="text-green-300">재생 중</span>
                </div>
              )}
              {bossData.pattern?.evasionRate > 0 && (
                <div
                  className="flex items-center gap-1 text-xs cursor-help"
                  title={`보스가 ${bossData.pattern.evasionRate}% 확률로 공격을 회피합니다. 명중률이나 필중 효과로 대응하세요.`}
                >
                  <span className="text-purple-400">💨</span>
                  <span className="text-purple-300">회피 {bossData.pattern.evasionRate}%</span>
                </div>
              )}
              {bossData.pattern?.type === 'crit_immunity' && (
                <div
                  className="flex items-center gap-1 text-xs cursor-help"
                  title="모든 치명타 공격이 일반 공격으로 변환됩니다. 치명타에 의존하지 않는 순수 공격력/관통 빌드가 유리합니다."
                >
                  <span className="text-yellow-400">⚙️</span>
                  <span className="text-yellow-300">치명타 무효</span>
                </div>
              )}
              {/* 치유 감소 디버프 체크 */}
              {(() => {
                const hasHealReduction = activeInscriptions.some(inscId => {
                  const inscription = ownedInscriptions.find(i => i.id === inscId);
                  if (!inscription) return false;
                  const inscData = INSCRIPTIONS[inscription.inscriptionId];
                  return inscData?.abilities?.some(a => a.type === 'heal_reduction');
                });
                return hasHealReduction && bossPatternState.isRegenerating && (
                  <div
                    className="flex items-center gap-1 text-xs cursor-help"
                    title="부패의 문양 효과: 보스의 재생 효과가 70% 감소합니다."
                  >
                    <span className="text-purple-400">🚫</span>
                    <span className="text-purple-300">치유 감소 -70%</span>
                  </div>
                );
              })()}
              {!bossPatternState.hasShield && !bossPatternState.isRegenerating && !bossData.pattern?.evasionRate && bossData.pattern?.type !== 'crit_immunity' && (
                <div className="text-xs text-gray-500">효과 없음</div>
              )}
            </div>
          </div>

          {/* 내 버프/디버프 */}
          <div className="bg-gray-800 border border-gray-700 rounded p-3">
            <h4 className="text-xs font-bold text-blue-400 mb-2">⚔️ 내 상태</h4>
            <div className="space-y-1">
              {/* 캐릭터 DPS 표시 */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-cyan-400">⚔️</span>
                <span className="text-gray-300">캐릭터 DPS: <span className="text-cyan-300 font-bold">{formatNumber(engine?.calculateTotalDPS() || 0)}</span></span>
              </div>
              {/* 장비 파괴 디버프 */}
              {bossPatternState.equipmentDestroyed && (
                <div
                  className="flex items-center gap-1 text-xs cursor-help"
                  title="장비가 일시적으로 파괴되어 장비의 모든 효과(공격력, 방어력, 옵션)가 무효화됩니다. 전투가 끝나면 자동으로 복구됩니다."
                >
                  <span className="text-red-400">⚠️</span>
                  <span className="text-red-300">장비 파괴됨</span>
                </div>
              )}

              {/* 활성화된 문양 어빌리티 표시 */}
              {activeInscriptions.map(inscId => {
                const inscription = ownedInscriptions.find(i => i.id === inscId);
                if (!inscription) return null;
                const inscData = INSCRIPTIONS[inscription.inscriptionId];

                // 주요 어빌리티만 표시
                const hasShieldPenetration = inscData?.abilities?.some(a => a.type === 'shield_penetration');
                const hasTrueHit = inscData?.abilities?.some(a => a.type === 'true_hit');
                const hasEquipmentImmunity = inscData?.abilities?.some(a => a.type === 'equipment_immunity');

                return (
                  <React.Fragment key={inscId}>
                    {hasShieldPenetration && (
                      <div
                        className="flex items-center gap-1 text-xs cursor-help"
                        title="심판의 문양 효과: 보스의 보호막을 무시하고 직접 본체에 데미지를 입힐 수 있습니다."
                      >
                        <span className="text-yellow-400">⚡</span>
                        <span className="text-yellow-300">보호막 관통</span>
                      </div>
                    )}
                    {hasTrueHit && (
                      <div
                        className="flex items-center gap-1 text-xs cursor-help"
                        title="유성의 문양 효과: 모든 공격이 적중하여 보스의 회피를 무시합니다."
                      >
                        <span className="text-orange-400">🎯</span>
                        <span className="text-orange-300">필중</span>
                      </div>
                    )}
                    {hasEquipmentImmunity && (
                      <div
                        className="flex items-center gap-1 text-xs cursor-help"
                        title="수호의 문양 효과: 보스의 장비 파괴 공격에 면역이 되어 장비가 절대 파괴되지 않습니다."
                      >
                        <span className="text-green-400">🔰</span>
                        <span className="text-green-300">장비 파괴 면역</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* 파괴의 문양 - 다음 공격 치명타 보장 */}
              {battleState.guaranteedCritNext && (
                <div
                  className="flex items-center gap-1 text-xs cursor-help"
                  title="파괴의 문양 효과: 다음 공격이 100% 확률로 치명타로 적중합니다. 공격 후 효과가 소멸됩니다."
                >
                  <span className="text-red-400">💥</span>
                  <span className="text-red-300">다음 공격 치명타!</span>
                </div>
              )}

              {!bossPatternState.equipmentDestroyed &&
               !battleState.guaranteedCritNext &&
               activeInscriptions.length === 0 && (
                <div className="text-xs text-gray-500">효과 없음</div>
              )}
            </div>
          </div>
        </div>

        {/* 전투 로그 */}
        <div className="bg-gray-900 border border-gray-700 rounded p-2 h-32 overflow-y-auto">
          {battleLog.map((log, i) => (
            <div key={i} className="text-xs text-gray-400">{log}</div>
          ))}
        </div>

        <button
          onClick={() => endBattle(false)}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          포기
        </button>
      </div>
    );
  }

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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">🔒 봉인구역</h2>
            <div className="text-sm text-gray-300">
              도전권: <span className="text-yellow-400 font-bold">{tickets}</span>
            </div>
          </div>

      {/* 보스 선택 - 가로 스크롤 탭 */}
      <div className="mb-4 -mx-1 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2 px-1 scrollbar-thin scrollbar-thumb-gray-600">
          {Object.entries(RAID_BOSSES).map(([bossId, boss]) => {
            const unlocked = checkBossUnlock(bossId, player.floor);

            return (
              <button
                key={bossId}
                onClick={() => unlocked && setSelectedBoss(bossId)}
                disabled={!unlocked}
                className={`flex-shrink-0 w-20 p-2 rounded-lg border-2 relative transition-all ${
                  selectedBoss === bossId
                    ? 'bg-red-900/60 border-red-500 shadow-lg shadow-red-500/40 scale-105 z-10'
                    : unlocked
                    ? 'bg-gray-800/80 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    : 'bg-gray-900/50 border-gray-800 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* 보스 이미지 - 크게 */}
                <div className="relative flex justify-center mb-1">
                  <img
                    src={getBossImage(bossId)}
                    alt={boss.name}
                    className={`w-14 h-14 object-contain ${!unlocked ? 'grayscale opacity-50' : ''}`}
                    style={{
                      imageRendering: 'pixelated',
                      filter: unlocked && selectedBoss === bossId ? 'drop-shadow(0 0 8px #ef4444)' : undefined
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="text-3xl hidden items-center justify-center">{boss.icon}</div>
                </div>
                <div className="text-[10px] font-bold text-gray-200 text-center truncate">{boss.name.split(' ').pop()}</div>
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-[10px] text-gray-400">🔒 {boss.unlockFloor}층</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 보스 상세 정보 + 문양 슬롯 */}
      {selectedBoss && (
        <div className="mb-4 bg-gradient-to-r from-red-900/30 to-gray-800/50 border border-red-500/30 rounded-lg p-4 overflow-visible">
          <div className="flex gap-4 overflow-visible">
            {/* 왼쪽: 보스 초상화 + 정보 */}
            <div className="flex items-center gap-4 flex-1">
              {/* 큰 초상화 */}
              <div className="flex-shrink-0 p-2">
                <img
                  src={getBossImage(selectedBoss)}
                  alt={RAID_BOSSES[selectedBoss].name}
                  className="w-28 h-28 object-contain"
                  style={{
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 0 10px #ef4444)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="text-5xl hidden items-center justify-center w-28 h-28">{RAID_BOSSES[selectedBoss].icon}</div>
              </div>
              {/* 보스 정보 */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-400">{RAID_BOSSES[selectedBoss].name}</h3>
                <div className="text-xs text-gray-400 mb-2">{RAID_BOSSES[selectedBoss].description}</div>
                <div className="text-sm text-orange-400 font-bold mb-1">
                  ⚔️ {RAID_BOSSES[selectedBoss].pattern.description}
                </div>
                <div className="text-xs text-gray-500">
                  HP: {formatNumber(calculateRaidBossStats(selectedBoss, selectedDifficulty).hp)}
                </div>

                {/* 난이도 선택 */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 10))}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-xs"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 1))}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-xs"
                    >
                      -1
                    </button>
                    <div className="flex-1 text-center">
                      <div className={`text-sm font-bold ${getDifficultyColor(selectedDifficulty)}`}>
                        {getDifficultyName(selectedDifficulty)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        배율: x{getDifficultyMultiplier(selectedDifficulty).toFixed(1)}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDifficulty(selectedDifficulty + 1)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-xs"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty(selectedDifficulty + 10)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold text-xs"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 문양 슬롯 */}
            <div className="w-80 flex-shrink-0 border-l border-gray-700 pl-4 overflow-visible relative z-20 flex flex-col">
              {/* 슬롯 헤더 */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-300 font-bold">
                  슬롯: {activeInscriptions.length}/{unlockedInscriptionSlots}
                </span>
                {unlockedInscriptionSlots < INSCRIPTION_SLOT_CONFIG.maxSlots && (
                  <button
                    onClick={() => {
                      const nextSlot = unlockedInscriptionSlots + 1;
                      const cost = INSCRIPTION_SLOT_CONFIG.unlockCosts[`slot${nextSlot}`];
                      const bossCoins = sealedZone.bossCoins || 0;
                      if (bossCoins >= cost) {
                        if (confirm(`${nextSlot}번째 슬롯을 ${formatNumber(cost)} 보스코인으로 해금하시겠습니까?`)) {
                          // GameEngine 상태도 직접 업데이트
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
                    className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-0.5 rounded"
                  >
                    🔓 해금 ({formatNumber(INSCRIPTION_SLOT_CONFIG.unlockCosts[`slot${unlockedInscriptionSlots + 1}`])} 🪙)
                  </button>
                )}
              </div>

              {/* 문양 슬롯 (컴팩트) */}
              <div className="space-y-1.5 max-h-32 overflow-visible p-1">
                {Array.from({ length: unlockedInscriptionSlots }).map((_, idx) => {
                  const inscriptionId = activeInscriptions[idx];
                  const inscription = inscriptionId ? ownedInscriptions.find(i => i.id === inscriptionId) : null;
                  const inscriptionData = inscription ? calculateInscriptionStats(inscription.inscriptionId, migrateGrade(inscription.grade)) : null;
                  const inscriptionBase = inscription ? INSCRIPTIONS[inscription.inscriptionId] : null;
                  const slotGradeStyle = inscription ? getGradeCardStyle(migrateGrade(inscription.grade)) : null;

                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-2 ${
                        inscription
                          ? slotGradeStyle.className
                          : 'bg-gray-800 border-gray-600 border-dashed'
                      }`}
                      style={inscription ? slotGradeStyle.borderStyle : {}}
                    >
                      {inscription ? (
                        <div className="flex items-center gap-2">
                          {/* 문양 이미지 */}
                          <img
                            src={getInscriptionImage(inscription.inscriptionId)}
                            alt={inscriptionData.name}
                            className="w-8 h-8 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          {/* 문양 정보 (간략) */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-bold ${inscriptionData.gradeColor}`}>
                                {inscriptionData.gradeName}
                              </span>
                              <span className="text-[10px] text-gray-100 truncate">{inscriptionData.name}</span>
                            </div>
                            <div className="text-[9px] text-gray-400">
                              ATK +{formatNumber(inscriptionData.attack)} | 치확 +{inscriptionData.critChance.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-1">
                          <span className="text-gray-600 text-[10px]">슬롯 {idx + 1} - 비어있음</span>
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
                className={`w-full py-2 mt-auto rounded font-bold text-sm ${
                  tickets <= 0 || activeInscriptions.length === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                ⚔️ 도전하기 (도전권 -1)
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBoss && (
        <>
          {/* 보유 문양 선택 - 모든 문양 표시 (미보유는 비활성화) */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2">문양 선택 (클릭: 선택/해제)</h3>
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
                      onClick={() => isOwned && toggleInscriptionSelection(owned.id)}
                      disabled={!isOwned}
                      className={`p-1.5 rounded-lg border-2 relative transition-all ${
                        isSelected
                          ? 'bg-blue-900/80 border-blue-400 ring-2 ring-blue-400 scale-105 z-10'
                          : isOwned
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
