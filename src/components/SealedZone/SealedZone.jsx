import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { RAID_BOSSES, calculateRaidBossStats, INSCRIPTION_SLOT_CONFIG, checkBossUnlock, getDifficultyName, getDifficultyColor, getDifficultyMultiplier } from '../../data/raidBosses';
import { INSCRIPTIONS, INSCRIPTION_GRADES, INSCRIPTION_ABILITIES, calculateInscriptionStats, migrateGrade } from '../../data/inscriptions';
import { getTotalRelicEffects } from '../../data/prestigeRelics';
import { formatNumber, formatPercent } from '../../utils/formatter';

// 보스 이미지 경로 가져오기
const getBossImage = (bossId) => {
  return `/images/raid_bosses/${bossId}.png`;
};

const SealedZone = () => {
  const [activeSubTab, setActiveSubTab] = useState('boss'); // 'boss' 또는 'inscription'
  const { gameState, setGameState } = useGame();
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

  // 데미지 계산 함수 (문양 능력 전부 적용)
  const calculateDamage = (inscriptionStats, bossStats, currentBossHP) => {
    const bossData = RAID_BOSSES[selectedBoss];
    const inscription = INSCRIPTIONS[inscriptionStats.id];

    // 유물 효과: 문양 스탯/데미지 증가
    const relicEffects = getTotalRelicEffects(gameState.prestigeRelics || {});
    const inscriptionStatsBonus = 1 + (relicEffects.inscriptionStats || 0) / 100;
    const inscriptionDamageBonus = 1 + (relicEffects.inscriptionDamage || 0) / 100;

    // 기본 공격력 (유물: 문양의 정수 적용)
    let baseDamage = inscriptionStats.attack * inscriptionStatsBonus;

    // 공격력 % 증가 (유물 보너스 적용)
    if (inscriptionStats.attackPercent) {
      baseDamage *= (1 + (inscriptionStats.attackPercent * inscriptionStatsBonus) / 100);
    }

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

    // 파괴의 문양: 이전 공격 실패 시 무조건 치명타
    if (battleState.guaranteedCritNext) {
      isCrit = true;
    } else {
      isCrit = Math.random() * 100 < critChance;
    }

    // 치명타 데미지 적용
    if (isCrit) {
      const critDamage = 150 + (inscriptionStats.critDamage || 0); // 기본 150%
      baseDamage *= (critDamage / 100);
    }

    // 관통 (방어 무시)
    const penetration = inscriptionStats.penetration || 0;
    const effectiveDefense = Math.max(0, bossStats.defense * (1 - penetration / 100));
    const defenseReduction = effectiveDefense / (effectiveDefense + 100);
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
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor);
        const shieldAmount = bossStats.hp * 0.2; // 최대 HP의 20%
        newState.hasShield = true;
        newState.shieldHP = shieldAmount;
        newState.maxShieldHP = shieldAmount;
        setBattleLog(log => [...log.slice(-5), `🛡️ ${bossData.name}이(가) 보호막을 생성했습니다!`]);
      }

      // 재생 활성화 (로타르)
      if (pattern.regenRate && Math.random() < 0.25) { // 25% 확률로 재생 시작
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor);
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

  // 문양 선택/해제 토글
  const toggleInscriptionSelection = (inscriptionId) => {
    setActiveInscriptions(prev => {
      if (prev.includes(inscriptionId)) {
        // 이미 선택된 문양이면 해제
        return prev.filter(id => id !== inscriptionId);
      } else {
        // 새로 선택
        if (prev.length >= unlockedInscriptionSlots) {
          alert(`최대 ${unlockedInscriptionSlots}개까지 선택할 수 있습니다!`);
          return prev;
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

    // 도전권 차감
    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        tickets: (prev.sealedZone?.tickets || 0) - 1
      }
    }));

    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor);
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
        const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor);
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
      const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor);
      const rewards = bossStats.rewards;

      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold + rewards.gold,
          exp: prev.player.exp + rewards.exp
        },
        sealedZone: {
          ...prev.sealedZone,
          bossCoins: (prev.sealedZone?.bossCoins || 0) + rewards.bossCoins
        }
      }));

      alert(`승리! 골드 +${formatNumber(rewards.gold)}, 경험치 +${formatNumber(rewards.exp)}, 보스 코인 +${rewards.bossCoins}`);
    } else {
      alert('시간 초과! 패배했습니다.');
    }
  };

  // 문양 공격 (여러 문양 동시 공격)
  useEffect(() => {
    if (!inBattle || activeInscriptions.length === 0) return;

    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor);

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
    const bossStats = calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor);
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
              {!bossPatternState.hasShield && !bossPatternState.isRegenerating && bossData.pattern?.evasionRate === 0 && (
                <div className="text-xs text-gray-500">효과 없음</div>
              )}
            </div>
          </div>

          {/* 내 버프/디버프 */}
          <div className="bg-gray-800 border border-gray-700 rounded p-3">
            <h4 className="text-xs font-bold text-blue-400 mb-2">⚔️ 내 상태</h4>
            <div className="space-y-1">
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
        <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">🔒 봉인구역</h2>
            <div className="text-sm text-gray-300">
              도전권: <span className="text-yellow-400 font-bold">{tickets}</span>
            </div>
          </div>

      {/* 보스 선택 - 가로 스크롤 탭 */}
      <div className="mb-4 -mx-1">
        <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-gray-600">
          {Object.entries(RAID_BOSSES).map(([bossId, boss]) => {
            const unlocked = checkBossUnlock(bossId, player.floor);

            return (
              <button
                key={bossId}
                onClick={() => unlocked && setSelectedBoss(bossId)}
                disabled={!unlocked}
                className={`flex-shrink-0 w-20 p-2 rounded-lg border-2 relative overflow-hidden transition-all ${
                  selectedBoss === bossId
                    ? 'bg-red-900/60 border-red-500 shadow-lg shadow-red-500/40 scale-105'
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

      {/* 선택된 보스 상세 정보 */}
      {selectedBoss && (
        <div className="mb-4 bg-gradient-to-r from-red-900/30 to-gray-800/50 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center gap-4">
            {/* 큰 초상화 */}
            <div className="flex-shrink-0">
              <img
                src={getBossImage(selectedBoss)}
                alt={RAID_BOSSES[selectedBoss].name}
                className="w-24 h-24 object-contain"
                style={{
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 0 10px #ef4444)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="text-5xl hidden items-center justify-center w-24 h-24">{RAID_BOSSES[selectedBoss].icon}</div>
            </div>
            {/* 보스 정보 */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-400">{RAID_BOSSES[selectedBoss].name}</h3>
              <div className="text-xs text-gray-400 mb-2">{RAID_BOSSES[selectedBoss].description}</div>
              <div className="text-sm text-orange-400 font-bold mb-1">
                ⚔️ {RAID_BOSSES[selectedBoss].pattern.description}
              </div>
              <div className="text-xs text-gray-500">
                HP: {formatNumber(calculateRaidBossStats(selectedBoss, selectedDifficulty, player.floor).hp)}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBoss && (
        <>
          {/* 난이도 선택 */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2">난이도 선택</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 10))}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold"
              >
                -10
              </button>
              <button
                onClick={() => setSelectedDifficulty(Math.max(1, selectedDifficulty - 1))}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold"
              >
                -1
              </button>
              <div className="flex-1 text-center">
                <div className={`text-xl font-bold ${getDifficultyColor(selectedDifficulty)}`}>
                  {getDifficultyName(selectedDifficulty)}
                </div>
                <div className="text-xs text-gray-400">
                  배율: x{getDifficultyMultiplier(selectedDifficulty).toFixed(1)}
                </div>
              </div>
              <button
                onClick={() => setSelectedDifficulty(selectedDifficulty + 1)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold"
              >
                +1
              </button>
              <button
                onClick={() => setSelectedDifficulty(selectedDifficulty + 10)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 font-bold"
              >
                +10
              </button>
            </div>
          </div>

          {/* 문양 슬롯 해금 상태 */}
          <div className="mb-2 bg-gray-800 border border-gray-700 rounded p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">
                문양 슬롯: {activeInscriptions.length}/{unlockedInscriptionSlots} (최대 {INSCRIPTION_SLOT_CONFIG.maxSlots})
              </span>
              {unlockedInscriptionSlots < INSCRIPTION_SLOT_CONFIG.maxSlots && (
                <button
                  onClick={() => {
                    const nextSlot = unlockedInscriptionSlots + 1;
                    const cost = INSCRIPTION_SLOT_CONFIG.unlockCosts[`slot${nextSlot}`];
                    const bossCoins = sealedZone.bossCoins || 0;
                    if (bossCoins >= cost) {
                      if (confirm(`${nextSlot}번째 슬롯을 ${formatNumber(cost)} 보스코인으로 해금하시겠습니까?`)) {
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
                  className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                >
                  🔓 다음 슬롯 해금 ({formatNumber(INSCRIPTION_SLOT_CONFIG.unlockCosts[`slot${unlockedInscriptionSlots + 1}`])} 🪙)
                </button>
              )}
            </div>
          </div>

          {/* 문양 슬롯 시각화 */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2">문양 슬롯</h3>
            <div className="flex gap-2 mb-3">
              {Array.from({ length: unlockedInscriptionSlots }).map((_, idx) => {
                const inscriptionId = activeInscriptions[idx];
                const inscription = inscriptionId ? ownedInscriptions.find(i => i.id === inscriptionId) : null;
                const inscriptionData = inscription ? calculateInscriptionStats(inscription.inscriptionId, inscription.grade) : null;

                return (
                  <div
                    key={idx}
                    className={`flex-1 border-2 rounded-lg p-2 text-center ${
                      inscription
                        ? 'bg-blue-900 border-blue-500 shadow-lg shadow-blue-500/30'
                        : 'bg-gray-800 border-gray-600 border-dashed'
                    }`}
                  >
                    <div className="text-xs text-gray-400 mb-1">슬롯 {idx + 1}</div>
                    {inscription ? (
                      <>
                        <div className="text-2xl mb-1">📿</div>
                        <div className={`text-xs font-bold ${inscriptionData.gradeColor}`}>
                          {inscriptionData.gradeName}
                        </div>
                        <div className="text-xs text-gray-300 truncate">{inscriptionData.name}</div>
                      </>
                    ) : (
                      <div className="text-gray-600 text-xs py-2">비어있음</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 문양 선택 - 스택으로 표시 */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2">보유 문양 (클릭: 선택, 다시 클릭: 해제)</h3>
            {ownedInscriptions.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4">
                보유한 문양이 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                {(() => {
                  // 동일 문양 그룹화 (inscriptionId + grade 기준)
                  const groupedInscriptions = {};
                  ownedInscriptions.forEach(inscription => {
                    const key = `${inscription.inscriptionId}_${inscription.grade}`;
                    if (!groupedInscriptions[key]) {
                      groupedInscriptions[key] = {
                        inscriptionId: inscription.inscriptionId,
                        grade: inscription.grade,
                        items: []
                      };
                    }
                    groupedInscriptions[key].items.push(inscription);
                  });

                  return Object.entries(groupedInscriptions).map(([key, group]) => {
                    const inscriptionData = calculateInscriptionStats(group.inscriptionId, group.grade);
                    // 선택된 아이템들 찾기
                    const selectedItems = group.items.filter(item => activeInscriptions.includes(item.id));
                    const selectedCount = selectedItems.length;
                    const totalCount = group.items.length;
                    // 첫 번째 미선택 아이템
                    const nextToSelect = group.items.find(item => !activeInscriptions.includes(item.id));

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (selectedCount > 0) {
                            // 선택된 게 있으면 마지막 선택 해제
                            toggleInscriptionSelection(selectedItems[selectedItems.length - 1].id);
                          } else {
                            // 미선택: 첫 번째 아이템 선택
                            toggleInscriptionSelection(group.items[0].id);
                          }
                        }}
                        className={`p-1.5 rounded border relative transition-all ${
                          selectedCount > 0
                            ? 'bg-blue-900 border-blue-500 ring-1 ring-blue-400 shadow-lg'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {/* 수량 표시 */}
                        {totalCount > 1 && (
                          <div className="absolute -top-1 -left-1 bg-gray-700 text-white text-[9px] min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center font-bold shadow-md border border-gray-500">
                            {selectedCount > 0 ? `${selectedCount}/${totalCount}` : `x${totalCount}`}
                          </div>
                        )}
                        {/* 선택 슬롯 번호 */}
                        {selectedCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">
                            {activeInscriptions.indexOf(selectedItems[0].id) + 1}
                          </div>
                        )}
                        <div className="text-lg mb-0.5">📿</div>
                        <div className={`text-[9px] font-bold ${inscriptionData.gradeColor}`}>
                          {inscriptionData.gradeName}
                        </div>
                        <div className="text-[9px] text-gray-300 truncate">{inscriptionData.name}</div>
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* 도전 버튼 */}
          <button
            onClick={startBattle}
            disabled={tickets <= 0 || activeInscriptions.length === 0}
            className={`w-full py-3 rounded font-bold ${
              tickets <= 0 || activeInscriptions.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            도전하기 (도전권 -1)
          </button>
        </>
      )}
        </div>
      )}

      {/* 문양 관리 탭 */}
      {activeSubTab === 'inscription' && (
        <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">📿 문양 관리</h2>
            <button
              onClick={() => setShowInscriptionInfo(!showInscriptionInfo)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm"
            >
              ℹ️ 문양 정보
            </button>
          </div>

          {/* 문양 드랍 정보 모달 */}
          {showInscriptionInfo && (
            <div className="mb-4 bg-gray-800 border border-blue-500 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-blue-400">문양 드랍 정보</h3>
                <button
                  onClick={() => setShowInscriptionInfo(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* 등급별 확률 */}
              <div className="mb-4 bg-gray-900 rounded p-3">
                <div className="text-sm font-bold text-gray-300 mb-2">등급별 확률</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {Object.entries(INSCRIPTION_GRADES).map(([gradeId, grade]) => (
                    <div key={gradeId} className="flex items-center justify-between">
                      <span className={`${grade.color} font-bold`}>{grade.name}:</span>
                      <span className="text-gray-300 font-bold">
                        {gradeId === 'common' ? '50%' :
                         gradeId === 'rare' ? '30%' :
                         gradeId === 'epic' ? '15%' :
                         gradeId === 'unique' ? '4%' :
                         gradeId === 'legendary' ? '0.9%' :
                         gradeId === 'mythic' ? '0.1%' : '0%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 층별 문양 드랍 정보 */}
              <div className="bg-gray-900 rounded p-3">
                <div className="text-sm font-bold text-gray-300 mb-2">층별 문양 드랍</div>
                <div className="space-y-1 text-xs max-h-64 overflow-y-auto">
                  <div className="flex justify-between py-1 border-b border-gray-700">
                    <span className="text-gray-400 font-bold">층 범위</span>
                    <span className="text-gray-400 font-bold">드랍 문양</span>
                  </div>
                  {Object.entries({
                    '1~10층': '분노의 문양',
                    '11~20층': '정밀의 문양',
                    '21~30층': '그림자의 문양',
                    '31~40층': '혼돈의 문양',
                    '41~50층': '부패의 문양',
                    '51~60층': '분쇄의 문양',
                    '61~70층': '공허의 문양',
                    '71~80층': '갈증의 문양',
                    '81~90층': '파괴의 문양',
                    '91~100층': '영원의 문양'
                  }).map(([range, inscription]) => (
                    <div key={range} className="flex justify-between py-1">
                      <span className="text-cyan-400">{range}</span>
                      <span className="text-yellow-400">{inscription}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  ※ 보스 처치 시 해당 층의 문양이 드랍됩니다<br/>
                  ※ 기본 드랍률: 10% (100층마다 2배 증가, 최대 80%)
                </div>
              </div>
            </div>
          )}

          {/* 보유 문양 목록 */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-200 mb-2">보유 문양 ({ownedInscriptions.length})</h3>
            {ownedInscriptions.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-8">
                보유한 문양이 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {ownedInscriptions.map(inscription => {
                  const inscriptionData = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
                  return (
                    <button
                      key={inscription.id}
                      onClick={() => setSelectedInscriptionDetail(inscription.id)}
                      className={`p-2 rounded border ${
                        selectedInscriptionDetail === inscription.id
                          ? 'bg-blue-900 border-blue-500'
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">📿</div>
                      <div className={`text-xs font-bold ${inscriptionData.gradeColor}`}>
                        {inscriptionData.gradeName}
                      </div>
                      <div className="text-xs text-gray-300 truncate">{inscriptionData.name}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 문양 상세 정보 */}
          {selectedInscriptionDetail && (() => {
            const inscription = ownedInscriptions.find(i => i.id === selectedInscriptionDetail);
            if (!inscription) return null;

            const inscriptionData = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
            const inscriptionBase = INSCRIPTIONS[inscription.inscriptionId];

            return (
              <div className="bg-gray-800 border border-gray-700 rounded p-3">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-2xl mb-1">📿</div>
                    <div className={`text-sm font-bold ${inscriptionData.gradeColor}`}>
                      {inscriptionData.gradeName}
                    </div>
                    <div className="text-sm text-gray-200">{inscriptionData.name}</div>
                  </div>
                  <button
                    onClick={() => deleteInscription(inscription.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                  >
                    삭제
                  </button>
                </div>

                {/* 설명 */}
                <div className="text-xs text-gray-400 mb-3">{inscriptionBase.description}</div>

                {/* 기본 스탯 */}
                <div className="mb-3 bg-gray-900 rounded p-2">
                  <div className="text-xs font-bold text-gray-300 mb-1">기본 스탯</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">공격력</span>
                      <span className="text-red-400">{formatNumber(inscriptionData.attack)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">공격력 %</span>
                      <span className="text-red-400">{inscriptionData.attackPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">치명타 확률</span>
                      <span className="text-yellow-400">{inscriptionData.critChance.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">치명타 데미지</span>
                      <span className="text-orange-400">{inscriptionData.critDamage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">명중률</span>
                      <span className="text-blue-400">{inscriptionData.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">관통</span>
                      <span className="text-purple-400">{inscriptionData.penetration.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* 특수 능력 */}
                <div className="mb-3 bg-gray-900 rounded p-2">
                  <div className="text-xs font-bold text-gray-300 mb-1">특수 능력</div>
                  <div className="text-xs">
                    <div className="text-cyan-400 font-bold mb-1">
                      ✨ {inscriptionBase.specialAbility.name}
                    </div>
                    <div className="text-gray-400">{inscriptionBase.specialAbility.description}</div>
                  </div>
                </div>

                {/* 보스 대응 능력 */}
                <div className="bg-gray-900 rounded p-2">
                  <div className="text-xs font-bold text-gray-300 mb-1">보스 대응 능력</div>
                  <div className="space-y-1">
                    {inscriptionBase.abilities.map(abilityId => {
                      const ability = INSCRIPTION_ABILITIES[abilityId];
                      return (
                        <div key={abilityId} className="text-xs">
                          <div className="text-purple-400 font-bold">
                            {ability.icon} {ability.name}
                          </div>
                          <div className="text-gray-400">{ability.description}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SealedZone;
