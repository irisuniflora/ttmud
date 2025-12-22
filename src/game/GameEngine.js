import { getMonsterForStage, getCollectionBonus, getBossCollectionBonus, RARE_MONSTER_COLLECTION_CHANCE, LEGENDARY_MONSTER_COLLECTION_CHANCE } from '../data/monsters.js';
import { HEROES, getHeroById, getHeroStats, getNextGrade, getUpgradeCost, getStarUpgradeCost } from '../data/heroes.js';
// import { generateItem } from '../data/items.js'; // 구 시스템 - 사용 안함
import { getTotalSkillEffects, getSkillCost } from '../data/skills.js';
import { getTotalRelicEffects, PRESTIGE_RELICS, getRelicGachaCost, getRelicUpgradeCost } from '../data/prestigeRelics.js';
import {
  GAME_CONFIG,
  PLAYER_BASE_STATS,
  EXP_CONFIG,
  DROP_CONFIG,
  FLOOR_CONFIG,
  EQUIPMENT_CONFIG,
  calculateExpToNextLevel,
  calculateHeroCardDropChance,
  calculateHeroScrollDropChance,
  calculateHeroScrollAmount,
  getMonstersPerFloor
} from '../data/gameBalance.js';
// import { isWorldBossActive, WORLD_BOSS_CONFIG, AUCTION_CONFIG, AUCTION_ITEMS } from '../data/worldBoss.js'; // 월드보스 시스템 비활성화
// 새 장비 시스템
import {
  EQUIPMENT_SLOTS,
  EQUIPMENT_SETS,
  generateNormalItem,
  generateSetItem,
  rollItemDrop,
  calculateEquipmentStats,
  calculateTotalSetEffects,
  getActiveSetBonuses,
  calculateSetCounts,
  getDisassembleFragments,
  upgradeItemLevel,
  getUpgradeCost as getEquipmentUpgradeCost,
  canUpgradeItem,
  awakenItem,
  rerollItemPotentials,
  perfectPotentialStat,
  OPTION_GRADES
} from '../data/equipmentSets.js';
import { ACHIEVEMENTS, checkAchievements } from '../data/achievements.js';

export class GameEngine {
  constructor(initialState) {
    this.state = initialState || this.getDefaultState();
    this.tickInterval = null;
    this.tickRate = GAME_CONFIG.tickRate;

    // 데이터 마이그레이션: orbs 초기화
    if (this.state.orbs === undefined || this.state.orbs === null || isNaN(this.state.orbs)) {
      this.state.orbs = 0;
    }
    // gearCores 삭제 (완벽의 정수로 통합)
    if (this.state.gearCores !== undefined) {
      delete this.state.gearCores;
    }
    if (!this.state.consumables) {
      this.state.consumables = {};
    }
    // 스킬 포인트 초기화
    if (this.state.player && (this.state.player.skillPoints === undefined || this.state.player.skillPoints === null || isNaN(this.state.player.skillPoints))) {
      this.state.player.skillPoints = 0;
    }

    // 초기 몬스터가 없으면 생성
    if (!this.state.currentMonster) {
      this.state.currentMonster = this.spawnMonster(this.state.player.floor, false, false, false, this.state.collection);
      // 희귀 몬스터 스폰 체크 (초기화)
      if (this.state.currentMonster.isRare && !this.state.currentMonster.isBoss) {
        if (!this.state.statistics) {
          this.state.statistics = { rareMonstersMet: 0, rareMonstersCaptured: 0 };
        }
        if (!this.state.statistics.rareMonstersMet) {
          this.state.statistics.rareMonstersMet = 0;
        }
        this.state.statistics.rareMonstersMet++;
      }
    }
  }

  getDefaultState() {
    return {
      player: {
        level: PLAYER_BASE_STATS.level,
        exp: PLAYER_BASE_STATS.exp,
        expToNextLevel: PLAYER_BASE_STATS.expToNextLevel,
        gold: PLAYER_BASE_STATS.gold,
        skillPoints: 0, // 스킬 포인트
        prestigePoints: 0,
        totalPrestiges: 0,
        floor: 1, // 층 (기존 stage 대체)
        highestFloor: 1, // 최고 층
        monstersKilledInFloor: 0, // 현재 층에서 잡은 몬스터 수
        floorState: 'farming', // 'farming', 'boss_ready', 'boss_battle'
        bossTimer: 0, // 보스 타이머 (초)
        hasFailedBoss: false, // 이번 층에서 보스 실패한 적 있는지
        floorLocked: false, // 층 고정 여부
        stats: {
          baseAtk: PLAYER_BASE_STATS.baseAtk,
          critChance: PLAYER_BASE_STATS.critChance,
          critDmg: PLAYER_BASE_STATS.critDmg,
          goldBonus: PLAYER_BASE_STATS.goldBonus,
          dropRate: PLAYER_BASE_STATS.dropRate,
        }
      },
      currentMonster: null, // 초기화 후에 생성됨
      heroes: {
        // heroId: { grade: 'normal', stars: 0, inscribed: false }
      },
      equipment: {
        weapon: null,
        armor: null,
        gloves: null,
        boots: null,
        necklace: null,
        ring: null
      },
      slotEnhancements: {
        weapon: 0,
        armor: 0,
        gloves: 0,
        boots: 0,
        necklace: 0,
        ring: 0
      },
      inventory: [], // 기존 아이템 인벤토리 (레거시)
      newInventory: [], // 새 장비 시스템 인벤토리
      equipmentFragments: 100, // 장비조각 (테스트용 100개)
      upgradeCoins: 5000, // 등급업 코인 (테스트용 5000개)
      orbs: 0, // 오브 (아이템 옵션 재조정 아이템)
      skillLevels: {},
      settings: {
        autoSellEnabled: false, // 자동 판매 활성화 여부
        autoSellRarity: 'common', // 자동 판매할 최대 등급
        autoDisassemble: false, // 노말템 자동 분해 여부
        autoDisassembleGrades: ['white', 'blue', 'purple'] // 자동 분해할 등급 목록
      },
      combatLog: [], // 전투 로그
      collection: {
        monsters: {}, // 구버전 호환용 (제거 예정)
        rareMonsters: {}, // 희귀 몬스터 도감
        rareBosses: {}, // 희귀 보스 도감
        legendaryMonsters: {}, // 전설 몬스터 도감
        heroes: {},
        items: {},
        heroCards: {
          // 테스트용: 섀도우 어쌔신 500장
          shadow_assassin: {
            name: '섀도우 어쌔신',
            count: 500,
            totalObtained: 500
          }
        },
        // 방생 시스템
        release: {
          // 층별 방생 데이터 (rare_1_0, rare_1_1 등)
          releasedMonsters: {},
          // 누적 방생 통계
          totalRareReleased: 0,
          totalLegendaryReleased: 0,
          // 보상 아이템
          legendaryScrolls: 0, // 전설 몬스터 소환권
          legendaryChoiceTokens: 0, // 전설 몬스터 도감 선택권
          mysteryTokens: 0 // 수수께끼 토큰
        }
      },
      statistics: {
        totalDamageDealt: 0,
        totalGoldEarned: 0,
        totalMonstersKilled: 0,
        totalBossesKilled: 0,
        totalItemsFound: 0,
        totalHeroCardsFound: 0,
        rareMonstersMet: 0, // 만난 희귀 몬스터 수
        rareMonstersCaptured: 0 // 수집한 희귀 몬스터 수
      },
      lastDailyRecharge: null, // 마지막 일일 충전 시간 (Date.now())
      // 고대 유물 시스템
      relicFragments: 500, // 테스트용 고대 유물 500개
      relicGachaCount: 0,
      prestigeRelics: {}
    };
  }

  // 게임 루프 시작
  start() {
    if (this.tickInterval) return;
    
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.tickRate);
  }

  // 게임 루프 정지
  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // 매 틱마다 실행
  tick() {
    const { currentMonster } = this.state;

    // 일일 충전 체크 (60초마다 체크)
    if (!this.lastDailyRechargeCheck || Date.now() - this.lastDailyRechargeCheck >= 60000) {
      this.checkDailyRecharge();
      this.lastDailyRechargeCheck = Date.now();
    }

    // 업적 체크 (5초마다)
    if (!this.lastAchievementCheck || Date.now() - this.lastAchievementCheck >= 5000) {
      this.checkAndCompleteAchievements();
      this.lastAchievementCheck = Date.now();
    }

    // 월드보스/경매 체크 (비활성화)
    // if (!this.lastWorldBossCheck || Date.now() - this.lastWorldBossCheck >= 10000) {
    //   this.checkWorldBossAndAuction();
    //   this.lastWorldBossCheck = Date.now();
    // }

    // 희귀/전설 몬스터 타이머 체크 (5초 = 5000ms)
    if (currentMonster && (currentMonster.isRare || currentMonster.isLegendary) && !currentMonster.isBoss) {
      const elapsedTime = Date.now() - currentMonster.spawnTime;
      if (elapsedTime >= 5000) {
        // 5초 경과 시 몬스터 도망
        this.monsterEscaped();
        return;
      }
    }

    const { damage, isCrit } = this.calculateTotalDPS();
    this.dealDamage(damage, isCrit);

    // 월드보스 데미지 누적 (비활성화)
    // this.tickWorldBossDamage();
  }

  // 몬스터 도망 (희귀/전설)
  monsterEscaped() {
    const { currentMonster, collection } = this.state;
    const monsterType = currentMonster.isLegendary ? '전설' : '희귀';
    this.addCombatLog(`💨 ${monsterType} 몬스터가 도망갔습니다! ${currentMonster.name}`, 'rare_monster');

    // 새로운 일반 몬스터 생성
    this.state.currentMonster = this.spawnMonster(this.state.player.floor, false, false, false, collection);
    this.checkRareMonsterSpawn(); // 희귀 몬스터 스폰 체크
  }

  // 총 DPS 계산
  calculateTotalDPS() {
    const { player, heroes, equipment, skillLevels } = this.state;
    const skillEffects = getTotalSkillEffects(skillLevels);

    // 플레이어 기본 데미지
    let playerDmg = player.stats.baseAtk;

    // 장비 보너스 (슬롯 강화 포함)
    const slotEnhancements = this.state.slotEnhancements || {};
    let equipmentAttackFlat = 0;
    let equipmentAttackPercent = 0;

    // 유물 효과: 장비 능력치 증가
    const equipRelicEffects = this.getRelicEffects();
    const equipmentPercentBonus = (equipRelicEffects.equipmentPercent || 0) / 100; // 모든 장비
    const slotBonuses = {
      weapon: (equipRelicEffects.weaponPercent || 0) / 100,
      helmet: (equipRelicEffects.helmetPercent || 0) / 100,
      armor: (equipRelicEffects.armorPercent || 0) / 100,
      boots: (equipRelicEffects.bootsPercent || 0) / 100,
      necklace: (equipRelicEffects.necklacePercent || 0) / 100,
      ring: (equipRelicEffects.ringPercent || 0) / 100,
      gloves: 0 // 장갑은 별도 유물 없음
    };

    Object.entries(equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementLevel = slotEnhancements[slot] || 0;
        const enhancementBonus = 1 + (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        // 유물 슬롯별 보너스 + 전체 장비 보너스
        const relicSlotBonus = 1 + equipmentPercentBonus + (slotBonuses[slot] || 0);

        item.stats.forEach(stat => {
          // 크리티컬 스탯은 강화 효과 제외
          const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats.includes(stat.id);
          const bonus = isExcluded ? 1 : enhancementBonus;

          if (stat.id === 'attack') {
            equipmentAttackFlat += stat.value * bonus * relicSlotBonus;
          } else if (stat.id === 'attackPercent') {
            equipmentAttackPercent += stat.value * bonus * relicSlotBonus;
          }
        });
      }
    });

    // 고정 공격력 먼저 추가
    playerDmg += equipmentAttackFlat;

    // 스킬 보너스 + 장비 공격력% 보너스
    playerDmg *= (1 + (skillEffects.atkPercent || 0) / 100);
    playerDmg *= (1 + (skillEffects.permanentDmgPercent || 0) / 100);
    playerDmg *= (1 + equipmentAttackPercent / 100);

    // 영웅 버프 계산
    let heroBuffs = {
      attack: 0,
      critChance: 0,
      critDmg: 0,
      goldBonus: 0,
      dropRate: 0,
      expBonus: 0,
      dotDmgPercent: 0,
      hpPercentDmgChance: 0,
      hpPercentDmgValue: 0,
      stageSkipChance: 0
    };

    Object.entries(heroes).forEach(([heroId, heroState]) => {
      if (heroState && heroState.inscribed) {
        const heroData = getHeroById(heroId);
        if (heroData) {
          const stats = getHeroStats(heroData, heroState.grade, heroState.stars);

          // 영웅 스탯을 버프에 추가
          Object.keys(stats).forEach(statKey => {
            if (heroBuffs.hasOwnProperty(statKey)) {
              heroBuffs[statKey] += stats[statKey];
            }
          });
        }
      }
    });

    // 도감 보너스 계산 (층별 5층 단위로)
    const collectionBonus = this.calculateCollectionBonus();
    heroBuffs.attack += collectionBonus.attack;
    heroBuffs.goldBonus += collectionBonus.goldBonus;
    heroBuffs.expBonus += collectionBonus.expBonus;

    // 영웅(동료) 공격력에 스킬 보너스 적용 (heroDmgPercent: 동료 강화 스킬)
    let heroAttack = heroBuffs.attack;
    if (skillEffects.heroDmgPercent > 0) {
      heroAttack *= (1 + skillEffects.heroDmgPercent / 100);
    }

    // 영웅 공격력 추가
    let totalDmg = playerDmg + heroAttack;

    // 방생 보너스 곱연산 적용 (101층 이상은 1-100층으로 매핑)
    const baseFloor = player.floor > 100 ? ((player.floor - 1) % 100) + 1 : player.floor;
    const rangeStart = Math.floor((baseFloor - 1) / 5) * 5 + 1;
    const releaseBonus = this.calculateReleaseBonus(rangeStart);
    if (releaseBonus.damageBonus > 0) {
      totalDmg *= (1 + releaseBonus.damageBonus / 100);
    }

    // 보스 도감 보너스 적용 (전설 보스 수집 시 데미지 증가)
    const bossCollectionBonus = this.calculateBossCollectionBonus();
    if (bossCollectionBonus.damageBonus > 0) {
      totalDmg *= (1 + bossCollectionBonus.damageBonus / 100);
    }

    // 유물 효과 가져오기
    const relicEffects = this.getRelicEffects();
    const relicCount = Object.keys(this.state.prestigeRelics || {}).length;

    // 유물: 별의 파편 (보유 유물 개수당 데미지 증가)
    if (relicEffects.damagePerRelic > 0) {
      const relicDamageBonus = relicCount * relicEffects.damagePerRelic;
      totalDmg *= (1 + relicDamageBonus / 100);
    }

    // 유물: 파멸의 칼날 (모든 데미지 증가%)
    // damageRelicBonus(고대의 렌즈)로 효과 증폭
    const damageRelicMultiplier = 1 + (relicEffects.damageRelicBonus || 0) / 100;
    if (relicEffects.damagePercent > 0) {
      totalDmg *= (1 + (relicEffects.damagePercent * damageRelicMultiplier) / 100);
    }

    // 장비 스탯 적용 (크리티컬, 보스데미지 등) - 유물 장비 보너스 포함
    let equipmentCritChance = 0;
    let equipmentCritDmg = 0;
    let equipmentBossDamageIncrease = 0;
    Object.entries(equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementLevel = slotEnhancements[slot] || 0;
        const enhancementBonus = 1 + (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        // 유물 슬롯별 보너스 + 전체 장비 보너스
        const relicSlotBonus = 1 + equipmentPercentBonus + (slotBonuses[slot] || 0);

        item.stats.forEach(stat => {
          // 크리티컬 스탯은 강화 효과 제외
          const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats.includes(stat.id);
          const bonus = isExcluded ? 1 : enhancementBonus;

          if (stat.id === 'critChance') {
            equipmentCritChance += stat.value * bonus * relicSlotBonus;
          } else if (stat.id === 'critDmg') {
            equipmentCritDmg += stat.value * bonus * relicSlotBonus;
          } else if (stat.id === 'bossDamageIncrease') {
            equipmentBossDamageIncrease += stat.value * bonus * relicSlotBonus;
          }
        });
      }
    });

    // 크리티컬 계산 (장비 + 영웅 버프 + 유물 포함)
    // 유물: 살육의 도끼 (크리티컬 확률 증가)
    const relicCritChance = (relicEffects.critChance || 0) * damageRelicMultiplier;
    // 유물: 보복자의 인장 (크리티컬 데미지 증가)
    const relicCritDmg = (relicEffects.critDmg || 0) * damageRelicMultiplier;

    // 치명타 확률 합산 (장비 + 영웅 + 스킬 + 유물)
    let critChance = player.stats.critChance + equipmentCritChance + (skillEffects.critChance || 0) + heroBuffs.critChance + relicCritChance;
    let critDmg = player.stats.critDmg + equipmentCritDmg + (skillEffects.critDmg || 0) + heroBuffs.critDmg + relicCritDmg;

    // 치명타 확률 100% 캡 - 초과분은 치명타 데미지로 전환
    // 100~200%: 초과 1%당 치뎀 3%
    // 200% 이상: 초과 1%당 치뎀 5%
    const CRIT_CHANCE_CAP = 100;
    const CRIT_CHANCE_TIER2 = 200;
    if (critChance > CRIT_CHANCE_CAP) {
      if (critChance <= CRIT_CHANCE_TIER2) {
        // 100~200% 구간: 1%당 3% 치뎀
        const overflow = critChance - CRIT_CHANCE_CAP;
        critDmg += overflow * 3;
      } else {
        // 200% 초과: 100~200 구간 + 200% 초과 구간
        const tier1Overflow = CRIT_CHANCE_TIER2 - CRIT_CHANCE_CAP; // 100%
        const tier2Overflow = critChance - CRIT_CHANCE_TIER2;
        critDmg += tier1Overflow * 3; // 100% * 3 = 300%
        critDmg += tier2Overflow * 5; // 초과분 * 5
      }
      critChance = CRIT_CHANCE_CAP;
    }

    let finalDmg = totalDmg;

    // 보스 데미지 증가 (유물 + 장비)
    if (this.state.currentMonster?.isBoss) {
      // 유물: 거인 학살자 (보스 데미지 증가)
      if (relicEffects.bossDamage > 0) {
        finalDmg *= (1 + (relicEffects.bossDamage * damageRelicMultiplier) / 100);
      }
      // 장비: bossDamageIncrease 스탯
      if (equipmentBossDamageIncrease > 0) {
        finalDmg *= (1 + equipmentBossDamageIncrease / 100);
      }
    }

    // 체력 퍼센트 데미지 (다크 리퍼)
    if (heroBuffs.hpPercentDmgChance > 0 && Math.random() * 100 < heroBuffs.hpPercentDmgChance) {
      const hpPercentDmg = Math.floor(this.state.currentMonster.maxHp * (heroBuffs.hpPercentDmgValue / 100));
      finalDmg += hpPercentDmg;
    }

    // 도트 데미지 (아크메이지)
    if (heroBuffs.dotDmgPercent > 0) {
      const dotDmg = Math.floor(totalDmg * (heroBuffs.dotDmgPercent / 100));
      finalDmg += dotDmg;
    }

    // 크리티컬 발동 체크
    const isCrit = Math.random() * 100 < critChance;
    const finalDamage = isCrit ? Math.floor(finalDmg * (critDmg / 100)) : Math.floor(finalDmg);

    return { damage: finalDamage, isCrit };
  }

  // 데미지 적용
  dealDamage(damage, isCrit = false) {
    const { currentMonster, statistics } = this.state;

    currentMonster.hp -= damage;
    statistics.totalDamageDealt += damage;

    // 매 틱마다 데미지 로그 추가 (BattleField 애니메이션용)
    const formattedDamage = damage.toLocaleString();
    if (isCrit) {
      this.addCombatLog(`💥 치명타! ${formattedDamage} 데미지`, 'critical');
    } else {
      this.addCombatLog(`⚔️ ${formattedDamage} 데미지`, 'damage');
    }

    if (currentMonster.hp <= 0) {
      this.killMonster();
    }

    this.state = { ...this.state };
  }

  // 몬스터 처치
  killMonster() {
    const { currentMonster, player, statistics, collection, skillLevels, heroes } = this.state;
    const skillEffects = getTotalSkillEffects(skillLevels);

    // 영웅 버프 계산
    let heroBuffs = {
      goldBonus: 0,
      dropRate: 0,
      expBonus: 0,
      stageSkipChance: 0
    };

    Object.entries(heroes).forEach(([heroId, heroState]) => {
      if (heroState && heroState.inscribed) {
        const heroData = getHeroById(heroId);
        if (heroData) {
          const stats = getHeroStats(heroData, heroState.grade, heroState.stars);
          Object.keys(stats).forEach(statKey => {
            if (heroBuffs.hasOwnProperty(statKey)) {
              heroBuffs[statKey] += stats[statKey];
            }
          });
        }
      }
    });

    // 장비 보조 스탯 계산 (골드, 경험치, 스킵 등)
    let equipmentGoldBonus = 0;
    let equipmentExpBonus = 0;
    let equipmentSkipChance = 0;
    let equipmentMonsterReduction = 0;
    const slotEnhancements = this.state.slotEnhancements || {};
    Object.entries(this.state.equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementLevel = slotEnhancements[slot] || 0;
        const enhancementBonus = 1 + (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          // 크리티컬 스탯은 강화 효과 제외
          const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats.includes(stat.id);
          const bonus = isExcluded ? 1 : enhancementBonus;

          if (stat.id === 'goldBonus') {
            equipmentGoldBonus += stat.value * bonus;
          } else if (stat.id === 'expBonus') {
            equipmentExpBonus += stat.value * bonus;
          } else if (stat.id === 'skipChance') {
            equipmentSkipChance += stat.value * bonus;
          } else if (stat.id === 'monstersPerStageReduction') {
            equipmentMonsterReduction += stat.value; // 고정값이므로 enhancementBonus 미적용
          }
        });
      }
    });

    // 골드 획득 = 몬스터 최대 체력 기반 (체력 = 골드)
    // 정복자의 창 유물로 HP가 감소되었을 경우, 골드는 원래 HP 기준으로 계산
    let goldGained = currentMonster.originalMaxHp || currentMonster.maxHp;

    // 유물 효과 가져오기
    const relicEffects = this.getRelicEffects();

    // 기적의 성배: 골드 10배 확률
    const gold10xChance = relicEffects.gold10xChance || 0;
    const isGold10x = Math.random() * 100 < gold10xChance;

    if (isGold10x) {
      goldGained *= 10;
      this.addCombatLog('🏆 기적의 성배 발동! 골드 10배!', 'gold_10x');
    }

    // 기본 골드 보너스
    let totalGoldBonus = player.stats.goldBonus + equipmentGoldBonus + (skillEffects.goldPercent || 0) + (skillEffects.permanentGoldPercent || 0) + heroBuffs.goldBonus;

    // 유물: 황금의 예언서 (모든 골드 획득량 증가)
    // goldRelicBonus(부의 보물상자)로 골드 유물 효과 증폭
    const goldRelicMultiplier = 1 + (relicEffects.goldRelicBonus || 0) / 100;
    totalGoldBonus += (relicEffects.goldPercent || 0) * goldRelicMultiplier;

    // 유물: 몬스터 유형별 골드 보너스
    if (currentMonster.isBoss) {
      // 군주의 금고: 보스 골드
      totalGoldBonus += (relicEffects.bossGold || 0) * goldRelicMultiplier;
    } else if (currentMonster.isRare || currentMonster.isLegendary) {
      // 요정의 축복: 희귀/전설 몬스터 골드
      totalGoldBonus += (relicEffects.rareMonsterGold || 0) * goldRelicMultiplier;
    } else {
      // 탐욕의 그릇: 일반 몬스터 골드
      totalGoldBonus += (relicEffects.normalMonsterGold || 0) * goldRelicMultiplier;
    }

    // 보스 도감 보너스 (희귀 보스 수집 시 골드 증가)
    const bossCollectionBonus = this.calculateBossCollectionBonus();
    totalGoldBonus += bossCollectionBonus.goldBonus;

    goldGained *= (1 + totalGoldBonus / 100);
    goldGained = Math.floor(goldGained);

    player.gold += goldGained;
    statistics.totalGoldEarned += goldGained;
    statistics.totalMonstersKilled++;

    if (currentMonster.isBoss) {
      statistics.totalBossesKilled++;

      // 보스방(각 층의 마지막 보스)에서 층별 문양 직접 드랍
      this.tryDropInscription();

      // 보스방(각 층의 마지막 보스)에서 봉인구역 도전권 드랍 (10% 확률)
      this.tryDropRaidTicket();
    }

    // 경험치 획득 (장비 + 영웅 버프 포함)
    const expGained = Math.floor(EXP_CONFIG.baseExpPerKill * (1 + ((skillEffects.expPercent || 0) + equipmentExpBonus + heroBuffs.expBonus) / 100));
    this.gainExp(expGained);
    
    // 아이템 드랍 (기존 시스템)
    this.tryDropItem();

    // 새 장비 드랍 (새 시스템)
    this.tryDropNewItem(currentMonster.isBoss);

    // 영웅 카드 드랍
    this.tryDropHeroCard();

    // 등급업 코인 드랍
    this.tryDropUpgradeCoin();

    // 오브 드랍
    this.tryDropOrb();

    // 완벽의 정수 드랍 (글로벌 드랍)
    this.tryDropStatMaxItem();

    // 희귀 몬스터 도감 등록 (30% 확률)
    if (currentMonster.isRare && !currentMonster.isBoss && currentMonster.monsterIndex !== undefined) {
      // 새로운 ID 형식: rare_floorStart_monsterIndex
      // 101층 이상은 1-100으로 매핑 (접두사만 다르고 같은 몬스터)
      const baseFloor = ((currentMonster.stage - 1) % 100) + 1;
      const rangeStart = Math.floor((baseFloor - 1) / 5) * 5 + 1;
      const rareId = `rare_${rangeStart}_${currentMonster.monsterIndex}`;

      // 도감에 없으면 초기화
      if (!collection.rareMonsters[rareId]) {
        collection.rareMonsters[rareId] = {
          name: currentMonster.name,
          count: 0,
          unlocked: false
        };
      }

      // 처치 횟수 증가
      collection.rareMonsters[rareId].count++;

      // 아직 미수집 상태면 30% 확률로 수집
      if (!collection.rareMonsters[rareId].unlocked) {
        if (Math.random() * 100 < RARE_MONSTER_COLLECTION_CHANCE) {
          collection.rareMonsters[rareId].unlocked = true;
          statistics.rareMonstersCaptured++; // 통계: 수집한 희귀 몬스터 수 증가
          this.addCombatLog(`✨ 희귀 몬스터 수집 완료! ${currentMonster.name}`, 'rare_monster');
        } else {
          this.addCombatLog(`⚔️ 희귀 몬스터 처치! ${currentMonster.name} (미수집)`, 'rare_monster');
        }
      }
    }

    // 희귀 보스 도감 등록 (30% 확률)
    if (currentMonster.isRare && currentMonster.isBoss) {
      // ID 형식: rare_boss_floorStart
      // 101층 이상은 1-100으로 매핑 (접두사만 다르고 같은 보스)
      const baseFloor = ((currentMonster.stage - 1) % 100) + 1;
      const rangeStart = Math.floor((baseFloor - 1) / 5) * 5 + 1;
      const rareId = `rare_boss_${rangeStart}`;

      // 도감에 없으면 초기화
      if (!collection.rareBosses) {
        collection.rareBosses = {};
      }

      if (!collection.rareBosses[rareId]) {
        collection.rareBosses[rareId] = {
          name: currentMonster.name,
          count: 0,
          unlocked: false
        };
      }

      // 처치 횟수 증가
      collection.rareBosses[rareId].count++;

      // 아직 미수집 상태면 30% 확률로 수집
      if (!collection.rareBosses[rareId].unlocked) {
        if (Math.random() * 100 < RARE_MONSTER_COLLECTION_CHANCE) {
          collection.rareBosses[rareId].unlocked = true;
          this.addCombatLog(`✨ 희귀 보스 수집 완료! ${currentMonster.name}`, 'rare_boss');
        } else {
          this.addCombatLog(`⚔️ 희귀 보스 처치! ${currentMonster.name} (미수집)`, 'rare_boss');
        }
      }
    }

    // 전설 몬스터 도감 등록 (30% 확률)
    if (currentMonster.isLegendary && !currentMonster.isBoss && currentMonster.monsterIndex !== undefined) {
      // 101층 이상은 1-100으로 매핑 (접두사만 다르고 같은 몬스터)
      const baseFloor = ((currentMonster.stage - 1) % 100) + 1;
      const rangeStart = Math.floor((baseFloor - 1) / 5) * 5 + 1;
      const legendaryId = `legendary_${rangeStart}_${currentMonster.monsterIndex}`;

      // 도감에 없으면 초기화
      if (!collection.legendaryMonsters) {
        collection.legendaryMonsters = {};
      }

      if (!collection.legendaryMonsters[legendaryId]) {
        collection.legendaryMonsters[legendaryId] = {
          name: currentMonster.name,
          count: 0,
          unlocked: false
        };
      }

      // 처치 횟수 증가
      collection.legendaryMonsters[legendaryId].count++;

      // 아직 미수집 상태면 30% 확률로 수집
      if (!collection.legendaryMonsters[legendaryId].unlocked) {
        if (Math.random() * 100 < LEGENDARY_MONSTER_COLLECTION_CHANCE) {
          collection.legendaryMonsters[legendaryId].unlocked = true;
          this.addCombatLog(`🌟 전설 몬스터 수집 완료! ${currentMonster.name}`, 'legendary_monster');
        } else {
          this.addCombatLog(`⚔️ 전설 몬스터 처치! ${currentMonster.name} (미수집)`, 'legendary_monster');
        }
      }
    }

    // 전설 보스 도감 등록 (30% 확률)
    if (currentMonster.isLegendary && currentMonster.isBoss) {
      // ID 형식: legendary_boss_floorStart
      // 101층 이상은 1-100으로 매핑 (접두사만 다르고 같은 보스)
      const baseFloor = ((currentMonster.stage - 1) % 100) + 1;
      const rangeStart = Math.floor((baseFloor - 1) / 5) * 5 + 1;
      const legendaryId = `legendary_boss_${rangeStart}`;

      // 도감에 없으면 초기화
      if (!collection.legendaryBosses) {
        collection.legendaryBosses = {};
      }

      if (!collection.legendaryBosses[legendaryId]) {
        collection.legendaryBosses[legendaryId] = {
          name: currentMonster.name,
          count: 0,
          unlocked: false
        };
      }

      // 처치 횟수 증가
      collection.legendaryBosses[legendaryId].count++;

      // 아직 미수집 상태면 30% 확률로 수집
      if (!collection.legendaryBosses[legendaryId].unlocked) {
        if (Math.random() * 100 < LEGENDARY_MONSTER_COLLECTION_CHANCE) {
          collection.legendaryBosses[legendaryId].unlocked = true;
          this.addCombatLog(`🌟 전설 보스 수집 완료! ${currentMonster.name}`, 'legendary_boss');
        } else {
          this.addCombatLog(`⚔️ 전설 보스 처치! ${currentMonster.name} (미수집)`, 'legendary_boss');
        }
      }
    }

    // 도감 보너스 계산
    const collectionBonus = this.calculateCollectionBonus();

    // 유물: 암흑의 장막 (스테이지당 몬스터 수 감소)
    const killRelicEffects = this.getRelicEffects();
    const relicMonsterReduction = killRelicEffects.monstersPerStageReduction || 0;

    // 장비 + 도감 + 유물로 인한 몬스터 감소 적용 (최소 5마리는 유지)
    const baseMonstersPerFloor = getMonstersPerFloor(player.floor);
    const actualMonstersPerFloor = Math.max(5, baseMonstersPerFloor - equipmentMonsterReduction - collectionBonus.monsterReduction - relicMonsterReduction);

    // 스테이지 스킵 확률 체크 (일반 몬스터만, 보스는 제외) - 장비 + 영웅 버프
    let skipCount = 0;
    const totalSkipChance = equipmentSkipChance + heroBuffs.stageSkipChance;
    if (player.floorState !== 'boss_battle' && totalSkipChance > 0) {
      while (Math.random() * 100 < totalSkipChance) {
        player.monstersKilledInFloor++;
        skipCount++;
        // 보스 직전까지만 스킵 가능
        if (player.monstersKilledInFloor >= actualMonstersPerFloor - 1) {
          break;
        }
      }
    }

    // 층 시스템 처리
    if (player.floorState === 'boss_battle') {
      // 보스 처치 성공
      if (!player.floorLocked) {
        // 층 고정이 아니면 다음 층으로 진행
        player.floor++;
        if (player.floor > player.highestFloor) {
          player.highestFloor = player.floor;
          // 층수 업적 체크
          this.checkFloorAchievements();
        }
      }
      // 층 고정이든 아니든 상태 초기화
      player.monstersKilledInFloor = 0;
      player.floorState = 'farming';
      player.bossTimer = 0;
      player.hasFailedBoss = false; // 새 층 시작 시 초기화

      // 현재 층의 일반 몬스터 생성
      this.state.currentMonster = this.spawnMonster(player.floor, false, false, false, collection);
      this.checkRareMonsterSpawn(); // 희귀 몬스터 스폰 체크
    } else {
      // 일반 몬스터 처치
      player.monstersKilledInFloor++;

      // 필요한 마리수 처치 시
      if (player.monstersKilledInFloor >= actualMonstersPerFloor) {
        // 처음 도달한 경우 자동으로 보스방 입장
        if (!player.hasFailedBoss) {
          player.floorState = 'boss_battle';
          // 유물: 시간의 모래시계 (보스 제한시간 증가)
          const bossRelicEffects = this.getRelicEffects();
          player.bossTimer = FLOOR_CONFIG.bossTimeLimit + (bossRelicEffects.bossTimeLimit || 0);
          // 보스 몬스터 생성
          this.state.currentMonster = this.spawnMonster(player.floor, true, false, false, collection);
          this.checkRareMonsterSpawn(); // 희귀 몬스터 스폰 체크
        } else {
          // 실패한 적이 있으면 boss_ready 상태로 (수동 입장 대기)
          player.floorState = 'boss_ready';
          // 일반 몬스터 생성
          this.state.currentMonster = this.spawnMonster(player.floor, false, false, false, collection);
          this.checkRareMonsterSpawn(); // 희귀 몬스터 스폰 체크
        }
      } else {
        // 다음 몬스터 생성 (같은 층)
        this.state.currentMonster = this.spawnMonster(player.floor, false, false, false, collection);
        this.checkRareMonsterSpawn(); // 희귀 몬스터 스폰 체크
      }
    }
  }

  // 희귀 몬스터 스폰 체크 (만난 횟수 증가)
  checkRareMonsterSpawn() {
    const { currentMonster, statistics } = this.state;

    // 희귀 몬스터가 스폰되었을 때 통계 증가
    if (currentMonster.isRare && !currentMonster.isBoss) {
      statistics.rareMonstersMet++;
    }
  }

  // 아이템 드랍 시도
  tryDropItem() {
    const { player, inventory, statistics, collection, skillLevels, heroes } = this.state;
    const skillEffects = getTotalSkillEffects(skillLevels);

    // 영웅 드랍율 버프 계산
    let heroDropRateBonus = 0;
    Object.entries(heroes).forEach(([heroId, heroState]) => {
      if (heroState && heroState.inscribed) {
        const heroData = getHeroById(heroId);
        if (heroData) {
          const stats = getHeroStats(heroData, heroState.grade, heroState.stars);
          heroDropRateBonus += stats.dropRate || 0;
        }
      }
    });

    // 장비 드랍율 보너스 계산
    let equipmentDropRate = 0;
    const slotEnhancements = this.state.slotEnhancements || {};
    Object.entries(this.state.equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementLevel = slotEnhancements[slot] || 0;
        const enhancementBonus = 1 + (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          // 크리티컬 스탯은 강화 효과 제외
          const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats.includes(stat.id);
          const bonus = isExcluded ? 1 : enhancementBonus;

          if (stat.id === 'dropRate') {
            equipmentDropRate += stat.value * bonus;
          }
        });
      }
    });

    let dropChance = player.stats.dropRate + equipmentDropRate + (skillEffects.dropRate || 0) + heroDropRateBonus;

    // 방생 보너스 곱연산 적용 (101층 이상은 1-100층으로 매핑)
    const baseFloorForDrop = player.floor > 100 ? ((player.floor - 1) % 100) + 1 : player.floor;
    const rangeStartForDrop = Math.floor((baseFloorForDrop - 1) / 5) * 5 + 1;
    const releaseBonus = this.calculateReleaseBonus(rangeStartForDrop);
    if (releaseBonus.dropRateBonus > 0) {
      dropChance *= (1 + releaseBonus.dropRateBonus / 100);
    }

    // 구 장비 드랍 시스템 제거됨 - 새 시스템(rollItemDrop)은 processNewItemDrops에서 처리
  }

  // 경험치 획득
  gainExp(exp) {
    const { player } = this.state;

    player.exp += exp;

    while (player.exp >= player.expToNextLevel) {
      player.exp -= player.expToNextLevel;
      player.level++;
      player.expToNextLevel = calculateExpToNextLevel(player.level);

      // 레벨업 보너스
      player.stats.baseAtk += EXP_CONFIG.atkPerLevel;

      // 스킬 포인트 지급 (레벨당 1포인트)
      player.skillPoints = (player.skillPoints || 0) + 1;
    }
  }

  // 영웅 카드 드랍 시도
  tryDropHeroCard() {
    const { player, statistics, collection } = this.state;

    // 드랍 확률 계산
    const dropChance = calculateHeroCardDropChance(player.floor);

    if (Math.random() * 100 < dropChance) {
      // 랜덤 영웅 선택 (모든 영웅 균등 확률)
      const randomHero = HEROES[Math.floor(Math.random() * HEROES.length)];

      console.log(`[드랍] 영웅 카드 획득: ${randomHero.name} (확률: ${dropChance}%)`);

      statistics.totalHeroCardsFound++;

      // 영웅 카드 컬렉션 초기화
      if (!collection.heroCards) {
        collection.heroCards = {};
      }

      // 해당 영웅 카드가 없으면 초기화
      if (!collection.heroCards[randomHero.id]) {
        collection.heroCards[randomHero.id] = {
          name: randomHero.name,
          count: 0,
          totalObtained: 0
        };
      }

      // 카드 1장 추가
      collection.heroCards[randomHero.id].count++;
      collection.heroCards[randomHero.id].totalObtained++;

      // 로그 추가
      this.addCombatLog(`🎴 영웅 카드 획득! ${randomHero.name} (보유: ${collection.heroCards[randomHero.id].count}장)`, 'hero_card');

      return { type: 'hero_card', hero: randomHero, count: collection.heroCards[randomHero.id].count };
    }

    return null;
  }

  // 영웅 각인 (도감에서 영웅을 활성화)
  inscribeHero(heroId) {
    const { heroes, collection } = this.state;

    const heroData = getHeroById(heroId);
    if (!heroData) return false;

    // 영웅 카드가 있고, 아직 각인되지 않은 경우
    if (collection.heroCards && collection.heroCards[heroId] && collection.heroCards[heroId].count > 0) {
      // 이미 각인된 경우 false 반환
      if (heroes[heroId] && heroes[heroId].inscribed) {
        return false;
      }

      // 카드 1장 소모
      collection.heroCards[heroId].count -= 1;

      // 영웅 각인
      heroes[heroId] = {
        grade: 'normal', // 기본 등급
        stars: 0, // 별 0개
        inscribed: true
      };

      return true;
    }

    return false;
  }

  // 영웅 카드로 별 올리기 (각인된 영웅에 카드 사용)
  upgradeHeroStar(heroId) {
    const { heroes, collection } = this.state;

    const heroData = getHeroById(heroId);
    if (!heroData) return false;

    // 각인되지 않은 영웅은 별 업그레이드 불가
    if (!heroes[heroId] || !heroes[heroId].inscribed) {
      return false;
    }

    // 카드가 있는지 확인
    if (!collection.heroCards || !collection.heroCards[heroId]) {
      return false;
    }

    // 이미 별 5개인 경우 더 올릴 수 없음
    if (heroes[heroId].stars >= 5) {
      return false;
    }

    // 필요한 카드 수 확인 (등급별 피보나치 수열)
    const currentGrade = heroes[heroId].grade;
    const requiredCards = getStarUpgradeCost(currentGrade);

    if (collection.heroCards[heroId].count < requiredCards) {
      return false;
    }

    // 카드 소모하고 별 1개 증가
    collection.heroCards[heroId].count -= requiredCards;
    heroes[heroId].stars += 1;

    return true;
  }

  // 영웅 등급업 (별 5개 + 코인 소모)
  upgradeHeroGrade(heroId) {
    const { heroes } = this.state;

    if (!heroes[heroId]) return false;

    const heroData = heroes[heroId];

    // 별이 5개이고, 다음 등급이 존재하는 경우
    if (heroData.stars === 5) {
      const nextGrade = getNextGrade(heroData.grade);
      if (!nextGrade) return false; // 이미 최고 등급

      const cost = getUpgradeCost(heroData.grade);

      if (this.state.upgradeCoins >= cost) {
        this.state.upgradeCoins -= cost;
        heroData.grade = nextGrade;
        heroData.stars = 0; // 별 초기화

        return true;
      }
    }

    return false;
  }

  // 영웅의 서 드랍 시도 (100층마다 1.2배 복리, 고정 1개)
  tryDropUpgradeCoin() {
    const { player } = this.state;

    // 드랍 확률 계산 (100층마다 1.2배 복리)
    const dropChance = calculateHeroScrollDropChance(player.floor);

    if (Math.random() * 100 < dropChance) {
      // 고정 1개 드랍
      const scrollAmount = calculateHeroScrollAmount();
      this.state.upgradeCoins += scrollAmount;

      // 로그 추가
      this.addCombatLog(`📖 영웅의 서 획득! +${scrollAmount}개`, 'upgrade_coin');

      return scrollAmount;
    }

    return 0;
  }

  // 오브 드랍 시도
  tryDropOrb() {
    // 0.5% 확률
    if (Math.random() * 100 < 0.5) {
      this.state.orbs += 1;
      this.addCombatLog('🔮 오브 획득!', 'orb');
      return true;
    }
    return false;
  }

  // 완벽의 정수 드랍 시도 (글로벌 드랍)
  tryDropStatMaxItem() {
    const { player } = this.state;
    // 기본 확률: 0.00001%
    // 층수에 따른 가중치: sqrt(floor)
    const baseRate = 0.00001; // 0.00001%
    const floorWeight = Math.sqrt(player.floor);
    const dropRate = baseRate * floorWeight;

    if (Math.random() * 100 < dropRate) {
      if (!this.state.consumables) {
        this.state.consumables = {};
      }
      this.state.consumables.stat_max_item = (this.state.consumables.stat_max_item || 0) + 1;
      this.addCombatLog('⚙️ 완벽의 정수 획득!', 'stat_max');
      return true;
    }
    return false;
  }

  // 문양 드랍 (보스방에서만, 층별로 특정 문양 드랍)
  tryDropInscription() {
    // 동적 import 대신 직접 함수 구현
    const getInscriptionIdByFloor = (floor) => {
      const INSCRIPTION_DROP_TABLE = {
        1: { inscriptionId: 'rage', name: '분노', baseDropRate: 0.10 },
        11: { inscriptionId: 'precision', name: '정밀', baseDropRate: 0.10 },
        21: { inscriptionId: 'shadow', name: '그림자', baseDropRate: 0.10 },
        31: { inscriptionId: 'chaos', name: '혼돈', baseDropRate: 0.10 },
        41: { inscriptionId: 'decay', name: '부패', baseDropRate: 0.10 },
        51: { inscriptionId: 'crush', name: '분쇄', baseDropRate: 0.10 },
        61: { inscriptionId: 'void', name: '공허', baseDropRate: 0.10 },
        71: { inscriptionId: 'thirst', name: '갈증', baseDropRate: 0.10 },
        81: { inscriptionId: 'destruction', name: '파괴', baseDropRate: 0.10 },
        91: { inscriptionId: 'eternity', name: '영원', baseDropRate: 0.10 }
      };

      const normalizedFloor = ((floor - 1) % 100) + 1;
      const rangeStart = Math.floor((normalizedFloor - 1) / 10) * 10 + 1;
      return INSCRIPTION_DROP_TABLE[rangeStart];
    };

    // 문양 드랍률: 100층마다 1.2배 복리 (10% → 12% → 14.4% → ...)
    const getInscriptionDropRate = (floor) => {
      const dropInfo = getInscriptionIdByFloor(floor);
      if (!dropInfo) return 0;

      const hundredBlock = Math.floor((floor - 1) / 100);
      const dropRate = dropInfo.baseDropRate * Math.pow(1.2, hundredBlock);
      return Math.min(dropRate, 0.50); // 최대 50%
    };

    // 문양 등급: 100층마다 고급 등급 1.5배 복리 증가
    const rollInscriptionGrade = (floor) => {
      // 기본 드랍률 (1-100층 기준)
      const BASE_RATES = {
        common: 0.50,     // 50%
        uncommon: 0.27,   // 27% (희귀)
        rare: 0.15,       // 15% (레어)
        unique: 0.05,     // 5%
        legendary: 0.025, // 2.5%
        mythic: 0.005     // 0.5%
      };

      // 100층마다 고급 등급(unique 이상) 1.5배 복리
      const hundredBlock = Math.floor((floor - 1) / 100);
      const highGradeMultiplier = Math.pow(1.5, hundredBlock);

      // 고급 등급 확률 증가
      let adjustedRates = { ...BASE_RATES };
      adjustedRates.unique *= highGradeMultiplier;
      adjustedRates.legendary *= highGradeMultiplier;
      adjustedRates.mythic *= highGradeMultiplier;

      // 증가분만큼 일반 등급에서 차감
      const extraHighGrade = (adjustedRates.unique - BASE_RATES.unique) +
                             (adjustedRates.legendary - BASE_RATES.legendary) +
                             (adjustedRates.mythic - BASE_RATES.mythic);
      adjustedRates.common = Math.max(0.10, BASE_RATES.common - extraHighGrade);

      // 정규화 (합이 1이 되도록)
      const total = Object.values(adjustedRates).reduce((a, b) => a + b, 0);
      for (const key in adjustedRates) {
        adjustedRates[key] /= total;
      }

      const roll = Math.random();
      let cumulative = 0;

      for (const [grade, rate] of Object.entries(adjustedRates)) {
        cumulative += rate;
        if (roll <= cumulative) return grade;
      }

      return 'common';
    };

    const floor = this.state.player.floor;
    const dropInfo = getInscriptionIdByFloor(floor);
    let dropRate = getInscriptionDropRate(floor);

    // 유물: 소환의 부적 (문양 드랍 확률 증가)
    const relicEffects = this.getRelicEffects();
    if (relicEffects.inscriptionDropRate > 0) {
      dropRate *= (1 + relicEffects.inscriptionDropRate / 100);
      dropRate = Math.min(dropRate, 0.95); // 최대 95%
    }

    if (!dropInfo) return false;

    // 드랍 확률 체크 - 문양 직접 드랍
    if (Math.random() < dropRate) {
      if (!this.state.sealedZone) {
        this.state.sealedZone = {
          tickets: 0,
          ownedInscriptions: [],
          unlockedBosses: ['vecta'],
          unlockedInscriptionSlots: 1
        };
      }

      // 문양 등급 결정 (층수에 따라 고급 등급 확률 증가)
      const grade = rollInscriptionGrade(floor);

      const INSCRIPTION_GRADES = {
        common: { name: '일반', color: 'text-gray-400', sellDust: 1 },
        uncommon: { name: '희귀', color: 'text-blue-400', sellDust: 3 },
        rare: { name: '레어', color: 'text-purple-400', sellDust: 8 },
        unique: { name: '유니크', color: 'text-yellow-400', sellDust: 20 },
        legendary: { name: '레전드', color: 'text-orange-400', sellDust: 50 },
        mythic: { name: '신화', color: 'text-red-400', sellDust: 150 }
      };
      const GRADE_ORDER = ['common', 'uncommon', 'rare', 'unique', 'legendary', 'mythic'];

      // 자동판매 설정 체크
      const autoSellGrade = this.state.sealedZone?.autoSellGrade;
      if (autoSellGrade) {
        const autoSellIndex = GRADE_ORDER.indexOf(autoSellGrade);
        const droppedIndex = GRADE_ORDER.indexOf(grade);
        if (droppedIndex <= autoSellIndex) {
          // 자동판매 - 문양가루 획득
          const dustAmount = INSCRIPTION_GRADES[grade]?.sellDust || 1;
          this.state.sealedZone.inscriptionDust = (this.state.sealedZone.inscriptionDust || 0) + dustAmount;
          const gradeName = INSCRIPTION_GRADES[grade]?.name || '일반';
          this.addCombatLog(`📿 ${dropInfo.name}의 문양 (${gradeName}) → 자동판매 +${dustAmount}✨`, 'inscription');
          return true;
        }
      }

      // 문양 인스턴스 생성
      const newInscription = {
        id: `inscription_${Date.now()}_${Math.random()}`,
        inscriptionId: dropInfo.inscriptionId,
        grade,
        level: 1
      };

      // 문양 추가
      this.state.sealedZone.ownedInscriptions = [
        ...(this.state.sealedZone.ownedInscriptions || []),
        newInscription
      ];

      const gradeName = INSCRIPTION_GRADES[grade]?.name || '일반';
      this.addCombatLog(`📿 ${dropInfo.name}의 문양 (${gradeName}) 획득!`, 'inscription');
      return true;
    }
    return false;
  }

  // 봉인구역 도전권 드랍 (보스몬스터 처치 시)
  tryDropRaidTicket() {
    // 모든 보스 몬스터에서 10% 확률로 1개 드랍
    let dropRate = 10;

    // 유물: 도전의 증표 (봉인구역 도전권 획득 확률 증가)
    const relicEffects = this.getRelicEffects();
    if (relicEffects.raidTicketDropRate > 0) {
      dropRate *= (1 + relicEffects.raidTicketDropRate / 100);
    }

    if (Math.random() * 100 < dropRate) {
      if (!this.state.sealedZone) {
        this.state.sealedZone = {
          tickets: 0,
          ownedInscriptions: [],
          unlockedBosses: ['vecta'],
          unlockedInscriptionSlots: 1,
          bossCoins: 0
        };
      }

      // 도전권 1개 획득
      this.state.sealedZone.tickets = (this.state.sealedZone.tickets || 0) + 1;
      this.addCombatLog('🎫 봉인구역 도전권 획득!', 'ticket');
      return true;
    }
    return false;
  }

  // 일일 자동 충전 체크 (한국시간 기준 자정)
  checkDailyRecharge() {
    const now = Date.now();
    const koreaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

    // 마지막 충전 시간이 없으면 초기화
    if (!this.state.lastDailyRecharge) {
      this.state.lastDailyRecharge = now;
      return;
    }

    const lastRecharge = new Date(this.state.lastDailyRecharge);
    const lastRechargeKorea = new Date(lastRecharge.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

    // 날짜가 바뀌었는지 확인 (한국시간 기준)
    const lastDay = lastRechargeKorea.getDate();
    const currentDay = koreaTime.getDate();
    const lastMonth = lastRechargeKorea.getMonth();
    const currentMonth = koreaTime.getMonth();
    const lastYear = lastRechargeKorea.getFullYear();
    const currentYear = koreaTime.getFullYear();

    // 날짜가 변경되었으면 충전
    if (lastDay !== currentDay || lastMonth !== currentMonth || lastYear !== currentYear) {
      if (!this.state.sealedZone) {
        this.state.sealedZone = {
          tickets: 0,
          ownedInscriptions: [],
          unlockedBosses: ['vecta'],
          unlockedInscriptionSlots: 1
        };
      }

      // 도전권 2개 충전
      this.state.sealedZone.tickets = (this.state.sealedZone.tickets || 0) + 2;
      this.state.lastDailyRecharge = now;

      this.addCombatLog('🎫 일일 충전! 봉인구역 도전권 2개 획득!', 'ticket');
    }
  }

  // 일괄 별 업그레이드
  bulkUpgradeHeroStars() {
    const { heroes, collection } = this.state;
    let upgradedCount = 0;

    Object.keys(heroes).forEach(heroId => {
      const heroData = heroes[heroId];
      if (!heroData || !heroData.inscribed) return;

      // 별이 5개 미만인 영웅만
      while (heroData.stars < 5) {
        const cost = getStarUpgradeCost(heroData.grade);
        const cardData = collection.heroCards?.[heroId];

        if (!cardData || cardData.count < cost) break;

        // 별 업그레이드 실행
        cardData.count -= cost;
        heroData.stars++;
        upgradedCount++;
      }
    });

    return { success: true, upgradedCount };
  }

  // 일괄 등급 업그레이드
  bulkUpgradeHeroGrades() {
    const { heroes } = this.state;
    let upgradedCount = 0;

    Object.keys(heroes).forEach(heroId => {
      const heroData = heroes[heroId];
      if (!heroData || !heroData.inscribed) return;

      // 별이 5개이고 다음 등급이 존재하는 경우
      if (heroData.stars === 5) {
        const nextGrade = getNextGrade(heroData.grade);
        if (!nextGrade) return;

        const cost = getUpgradeCost(heroData.grade);
        if (this.state.upgradeCoins >= cost) {
          this.state.upgradeCoins -= cost;
          heroData.grade = nextGrade;
          heroData.stars = 0;
          upgradedCount++;
        }
      }
    });

    return { success: true, upgradedCount };
  }

  // 장비 장착
  equipItem(item) {
    const { equipment, inventory } = this.state;
    
    // 기존 장비 해제
    if (equipment[item.slot]) {
      equipment[item.slot].equipped = false;
      inventory.push(equipment[item.slot]);
      this.sortInventory();
    }
    
    // 새 장비 장착
    equipment[item.slot] = item;
    item.equipped = true;
    
    // 인벤토리에서 제거
    const index = inventory.findIndex(i => i.id === item.id);
    if (index !== -1) {
      inventory.splice(index, 1);
    }
  }

  // 장비 해제
  unequipItem(slot) {
    const { equipment, inventory } = this.state;

    if (equipment[slot]) {
      equipment[slot].equipped = false;
      inventory.push(equipment[slot]);
      equipment[slot] = null;
      this.sortInventory();
    }
  }

  // 인벤토리 정렬 (등급 높은 순)
  sortInventory() {
    const { inventory } = this.state;
    const rarityOrder = { dark: 7, mythic: 6, legendary: 5, unique: 4, epic: 3, rare: 2, common: 1 };
    inventory.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
  }

  // 새 장비 인벤토리 정렬 (품질 순: 세트 > 노말, 고대 > 일반, 등급순, 템렙순)
  sortNewInventory() {
    if (!this.state.newInventory) return;

    // 등급 우선순위 (높은 순)
    const normalGradeOrder = { purple: 3, blue: 2, white: 1 };

    this.state.newInventory.sort((a, b) => {
      // 1. 세트템 우선
      if (a.type === 'set' && b.type !== 'set') return -1;
      if (a.type !== 'set' && b.type === 'set') return 1;

      // 2. 고대 아이템 우선
      if (a.isAncient && !b.isAncient) return -1;
      if (!a.isAncient && b.isAncient) return 1;

      // 3. 노말템끼리는 등급순 (보라 > 파랑 > 흰색)
      if (a.type !== 'set' && b.type !== 'set') {
        const gradeA = normalGradeOrder[a.normalGrade] || 0;
        const gradeB = normalGradeOrder[b.normalGrade] || 0;
        if (gradeA !== gradeB) return gradeB - gradeA;
      }

      // 4. 템렙 높은 순
      return (b.itemLevel || 0) - (a.itemLevel || 0);
    });
  }

  // 자동 장착 (슬롯별 가장 높은 등급)
  autoEquipAll() {
    const { inventory, equipment } = this.state;
    const slots = ['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'];

    // 등급 우선순위 (높은 순서)
    const rarityOrder = ['dark', 'mythic', 'legendary', 'unique', 'epic', 'rare', 'common'];

    slots.forEach(slot => {
      // 해당 슬롯의 인벤토리 아이템들 찾기
      const slotItems = inventory.filter(item => item.slot === slot && !item.equipped);

      if (slotItems.length === 0) return;

      // 등급순으로 정렬
      slotItems.sort((a, b) => {
        const aIndex = rarityOrder.indexOf(a.rarity);
        const bIndex = rarityOrder.indexOf(b.rarity);
        return aIndex - bIndex;
      });

      const bestItem = slotItems[0];
      const equippedItem = equipment[slot];

      // 현재 장착된 아이템과 비교
      if (!equippedItem) {
        // 아무것도 장착되지 않았으면 바로 장착
        this.equipItem(bestItem);
      } else {
        const equippedRarityIndex = rarityOrder.indexOf(equippedItem.rarity);
        const bestRarityIndex = rarityOrder.indexOf(bestItem.rarity);

        // 더 높은 등급일 때만 교체 (낮은 인덱스 = 더 높은 등급)
        if (bestRarityIndex < equippedRarityIndex) {
          this.unequipItem(slot);
          this.equipItem(bestItem);
        }
      }
    });

    return true;
  }

  // 환생
  prestige() {
    const { player } = this.state;

    if (player.floor < 50) return false;

    // PP 획득 계산
    const ppGained = Math.floor(player.floor / 10);
    player.prestigePoints += ppGained;
    player.totalPrestiges++;

    // 고대 유물 획득 공식: 기본 5 + floor / 20 + (floor > 100 ? (floor - 100) / 10 : 0)
    // 50층: 5 + 2 = 7개
    // 100층: 5 + 5 = 10개
    // 200층: 5 + 10 + 10 = 25개
    // 500층: 5 + 25 + 40 = 70개
    const baseFragments = 5;
    const floorBonus = Math.floor(player.floor / 20);
    const highFloorBonus = player.floor > 100 ? Math.floor((player.floor - 100) / 10) : 0;
    let fragmentsGained = baseFragments + floorBonus + highFloorBonus;

    // 유물 효과 가져오기
    const relicEffects = this.getRelicEffects();

    // 반지 장비의 ppBonus 스탯 (고대 유물 획득량 증가%)
    const { equipment } = this.state;
    let ringPpBonus = 0;
    if (equipment.ring) {
      const ppBonusStat = equipment.ring.stats.find(s => s.id === 'ppBonus');
      if (ppBonusStat) {
        // 유물 ringPercent 보너스 적용
        const ringRelicBonus = 1 + (relicEffects.ringPercent || 0) / 100;
        ringPpBonus = ppBonusStat.value * ringRelicBonus;
      }
    }

    // 유물: 심연의 서 (환생당 고대 유물 획득량 증가%)
    let totalBonus = 1;
    if (relicEffects.relicFragmentPercent > 0) {
      totalBonus += relicEffects.relicFragmentPercent / 100;
    }
    // 반지 ppBonus 적용
    if (ringPpBonus > 0) {
      totalBonus += ringPpBonus / 100;
    }

    fragmentsGained = Math.floor(fragmentsGained * totalBonus);

    // 리셋 (일부 제외)
    const newState = this.getDefaultState();
    newState.player.prestigePoints = player.prestigePoints;
    newState.player.totalPrestiges = player.totalPrestiges;
    newState.relicFragments = (this.state.relicFragments || 0) + fragmentsGained;
    newState.relicGachaCount = this.state.relicGachaCount || 0;
    newState.prestigeRelics = this.state.prestigeRelics || {};
    newState.skillLevels = { ...this.state.skillLevels };
    // 컬렉션 복사하되 영웅 카드와 영웅 데이터는 초기화
    newState.collection = {
      ...this.state.collection,
      heroCards: {}, // 영웅 카드 초기화
    };
    newState.heroes = {}; // 영웅 각인 데이터 초기화
    newState.statistics.totalPrestiges = player.totalPrestiges;

    // 환생 스킬 효과 적용
    const skillEffects = getTotalSkillEffects(this.state.skillLevels);
    newState.player.gold += skillEffects.startingGold || 0;
    newState.player.level += skillEffects.startingLevel || 0;

    this.state = newState;
    return true;
  }

  // 스킬 레벨업
  upgradeSkill(skillId, tree) {
    const { player, skillLevels } = this.state;
    const skill = tree.skills.find(s => s.id === skillId);

    if (!skill) return false;

    const currentLevel = skillLevels[skillId] || 0;
    if (currentLevel >= skill.maxLevel) return false;

    const cost = getSkillCost(skill, currentLevel);
    const costType = skill.costType || 'gold';

    if (costType === 'pp') {
      if (player.prestigePoints >= cost) {
        player.prestigePoints -= cost;
        skillLevels[skillId] = currentLevel + 1;
        return true;
      }
    } else if (costType === 'sp') {
      if ((player.skillPoints || 0) >= cost) {
        player.skillPoints = (player.skillPoints || 0) - cost;
        skillLevels[skillId] = currentLevel + 1;
        return true;
      }
    } else {
      if (player.gold >= cost) {
        player.gold -= cost;
        skillLevels[skillId] = currentLevel + 1;
        return true;
      }
    }

    return false;
  }

  // 보스방 입장
  enterBossBattle() {
    const { player, equipment, slotEnhancements, collection } = this.state;

    if (player.floorState !== 'boss_ready' && player.floorState !== 'farming') {
      return false;
    }

    // 장비로 인한 몬스터 감소 계산
    let equipmentMonsterReduction = 0;
    Object.entries(equipment || {}).forEach(([slot, item]) => {
      if (item) {
        item.stats.forEach(stat => {
          if (stat.id === 'monstersPerStageReduction') {
            equipmentMonsterReduction += stat.value;
          }
        });
      }
    });

    // 도감 보너스 계산
    const collectionBonus = this.calculateCollectionBonus();

    // 유물: 암흑의 장막 (스테이지당 몬스터 수 감소)
    const enterRelicEffects = this.getRelicEffects();
    const relicMonsterReduction = enterRelicEffects.monstersPerStageReduction || 0;

    const baseMonstersPerFloor = getMonstersPerFloor(player.floor);
    const totalReduction = equipmentMonsterReduction + collectionBonus.monsterReduction + relicMonsterReduction;
    const actualMonstersPerFloor = Math.max(5, baseMonstersPerFloor - totalReduction);

    // 몬스터 감소가 스테이지 몬스터 수보다 크면 바로 보스방
    if (totalReduction >= baseMonstersPerFloor) {
      // 바로 보스방으로 진입 가능
      player.monstersKilledInFloor = actualMonstersPerFloor;
    }

    // 보스방 입장 가능 조건: 필요한 몬스터 수 처치
    if (player.monstersKilledInFloor < actualMonstersPerFloor) {
      return false;
    }

    // 유물 효과: 보스 스킵 확률 체크 (차원의 문)
    const relicEffects = this.getRelicEffects();
    const bossSkipChance = relicEffects.bossSkipChance || 0;

    if (bossSkipChance > 0 && Math.random() * 100 < bossSkipChance) {
      // 보스 스킵 성공! 보스 처치 보상 획득 + 다음 층으로 즉시 이동
      this.skipBoss();
      return true;
    }

    // 보스 전투 시작
    player.floorState = 'boss_battle';

    // 유물: 시간의 모래시계 (보스 제한시간 증가)
    const bossTimeBonus = relicEffects.bossTimeLimit || 0;
    player.bossTimer = FLOOR_CONFIG.bossTimeLimit + bossTimeBonus;

    // 보스 몬스터 생성
    this.state.currentMonster = this.spawnMonster(player.floor, true, false, false, collection);
    this.checkRareMonsterSpawn(); // 희귀 몬스터 스폰 체크

    return true;
  }

  // 보스 스킵 (차원의 문 유물 효과)
  skipBoss() {
    const { player, statistics, collection, skillLevels, heroes } = this.state;

    // 보스 몬스터 생성 (보상 계산용)
    const bossMonster = this.spawnMonster(player.floor, true, false, false, collection);

    // 통계 증가
    statistics.totalBossesKilled++;
    statistics.totalMonstersKilled++;

    // 골드 획득 계산
    const skillEffects = getTotalSkillEffects(skillLevels);
    const relicEffects = this.getRelicEffects();

    // 영웅 버프 계산
    let heroBuffs = {
      goldBonus: 0,
      expBonus: 0
    };

    Object.entries(heroes).forEach(([heroId, heroState]) => {
      if (heroState && heroState.inscribed) {
        const heroData = getHeroById(heroId);
        if (heroData) {
          const stats = getHeroStats(heroData, heroState.grade, heroState.stars);
          heroBuffs.goldBonus += stats.goldBonus || 0;
          heroBuffs.expBonus += stats.expBonus || 0;
        }
      }
    });

    // 장비 보조 스탯 계산
    let equipmentGoldBonus = 0;
    let equipmentExpBonus = 0;
    const slotEnhancements = this.state.slotEnhancements || {};
    Object.entries(this.state.equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementLevel = slotEnhancements[slot] || 0;
        const enhancementBonus = 1 + (enhancementLevel * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          const isExcluded = EQUIPMENT_CONFIG.enhancement.excludedStats.includes(stat.id);
          const bonus = isExcluded ? 1 : enhancementBonus;

          if (stat.id === 'goldBonus') {
            equipmentGoldBonus += stat.value * bonus;
          } else if (stat.id === 'expBonus') {
            equipmentExpBonus += stat.value * bonus;
          }
        });
      }
    });

    // 골드 획득 (원본 HP 기준)
    let goldGained = bossMonster.originalMaxHp || bossMonster.maxHp;

    // 기적의 성배: 골드 10배 확률
    const gold10xChance = relicEffects.gold10xChance || 0;
    const isGold10x = Math.random() * 100 < gold10xChance;

    if (isGold10x) {
      goldGained *= 10;
      this.addCombatLog('🏆 기적의 성배 발동! 골드 10배!', 'gold_10x');
    }

    // 기본 골드 보너스
    let totalGoldBonus = player.stats.goldBonus + equipmentGoldBonus + (skillEffects.goldPercent || 0) + (skillEffects.permanentGoldPercent || 0) + heroBuffs.goldBonus;

    // 유물: 보스 골드 보너스 (군주의 금고)
    totalGoldBonus += (relicEffects.bossGold || 0);

    // 보스 도감 보너스 (희귀 보스 수집 시 골드 증가)
    const bossCollectionBonus = this.calculateBossCollectionBonus();
    totalGoldBonus += bossCollectionBonus.goldBonus;

    goldGained *= (1 + totalGoldBonus / 100);
    goldGained = Math.floor(goldGained);

    player.gold += goldGained;
    statistics.totalGoldEarned += goldGained;

    // 경험치 획득
    const expGained = Math.floor(EXP_CONFIG.baseExpPerKill * (1 + ((skillEffects.expPercent || 0) + equipmentExpBonus + heroBuffs.expBonus) / 100));
    this.gainExp(expGained);

    // 보스 아이템 드랍 (문양, 봉인구역 도전권)
    this.tryDropInscription();
    this.tryDropRaidTicket();

    // 일반 아이템 드랍
    this.tryDropItem();
    this.tryDropHeroCard();
    this.tryDropUpgradeCoin();
    this.tryDropOrb();
    this.tryDropStatMaxItem();

    // 다음 층으로 진행
    player.floor++;
    if (player.floor > player.highestFloor) {
      player.highestFloor = player.floor;
      // 층수 업적 체크
      this.checkFloorAchievements();
    }
    player.monstersKilledInFloor = 0;
    player.floorState = 'farming';
    player.bossTimer = 0;
    player.hasFailedBoss = false;

    // 새 층의 일반 몬스터 생성
    this.state.currentMonster = this.spawnMonster(player.floor, false, false, false, collection);
    this.checkRareMonsterSpawn();

    // 보스 스킵 알림
    this.addCombatLog(`🌀 차원의 문 발동! ${player.floor - 1}층 보스를 스킵했습니다!`, 'boss_skip');
  }

  // 보스 타이머 업데이트 (매 초마다 호출)
  updateBossTimer() {
    const { player } = this.state;

    if (player.floorState !== 'boss_battle') return;

    player.bossTimer -= 1;

    // 시간 초과 시 보스 전투 실패
    if (player.bossTimer <= 0) {
      this.failBossBattle();
    }
  }

  // 보스 전투 실패
  failBossBattle() {
    const { player, collection } = this.state;

    // farming 상태로 전환 (무한 사냥 가능)
    player.floorState = 'farming';
    player.bossTimer = 0;
    player.hasFailedBoss = true; // 실패 플래그 설정 (다음부턴 수동 입장)

    // 일반 몬스터로 교체
    this.state.currentMonster = this.spawnMonster(player.floor, false, false, false, collection);
    this.checkRareMonsterSpawn(); // 희귀 몬스터 스폰 체크
  }

  // 층 고정 토글
  toggleFloorLock() {
    const { player } = this.state;
    player.floorLocked = !player.floorLocked;
    return player.floorLocked;
  }

  // 이전 층으로 내려가기
  goDownFloor() {
    const { player, collection } = this.state;

    // 1층이면 더 내려갈 수 없음
    if (player.floor <= 1) {
      return { success: false, message: '1층에서는 더 내려갈 수 없습니다' };
    }

    // 보스 전투 중이면 불가
    if (player.floorState === 'boss_battle') {
      return { success: false, message: '보스 전투 중에는 층을 이동할 수 없습니다' };
    }

    // 층 감소 및 상태 초기화
    player.floor--;
    player.monstersKilledInFloor = 0;
    player.floorState = 'farming';
    player.hasFailedBoss = false;

    // 새 층의 일반 몬스터 생성
    this.state.currentMonster = this.spawnMonster(player.floor, false, false, false, collection);
    this.checkRareMonsterSpawn();

    return { success: true, floor: player.floor };
  }

  // 슬롯 강화
  enhanceSlot(slot) {
    const { player } = this.state;
    const slotEnhancements = this.state.slotEnhancements || {};
    const currentLevel = slotEnhancements[slot] || 0;

    // 유물: 장비 강화 비용 감소
    const relicEffects = this.getRelicEffects();
    const costReduction = (relicEffects.equipmentUpgradeCostReduction || 0) / 100;

    // 비용 계산 (유물 비용 감소 적용)
    const baseCost = EQUIPMENT_CONFIG.enhancement.baseCost *
      Math.pow(EQUIPMENT_CONFIG.enhancement.costMultiplier, currentLevel);
    const cost = Math.floor(baseCost * (1 - costReduction));

    // 골드 확인
    if (player.gold < cost) {
      return { success: false, message: '골드가 부족합니다', cost };
    }

    // 성공률 계산
    const { baseSuccessRate, successRateDecayPerLevel, minSuccessRate } = EQUIPMENT_CONFIG.enhancement;
    const successRate = Math.max(
      minSuccessRate,
      baseSuccessRate - (currentLevel * successRateDecayPerLevel)
    );

    // 골드 차감
    player.gold -= cost;

    // 강화 시도
    const roll = Math.random() * 100;
    const success = roll < successRate;

    if (success) {
      // slotEnhancements가 없으면 초기화
      if (!this.state.slotEnhancements) {
        this.state.slotEnhancements = {};
      }

      this.state.slotEnhancements[slot] = currentLevel + 1;

      return {
        success: true,
        message: '강화 성공!',
        newLevel: this.state.slotEnhancements[slot],
        cost,
        successRate
      };
    } else {
      return {
        success: false,
        message: '강화 실패! (레벨 유지)',
        currentLevel,
        cost,
        successRate
      };
    }
  }

  // 아이템 자동 판매 (특정 등급 이하 아이템 판매)
  autoSellItems(maxRarity) {
    const { inventory, player } = this.state;
    const rarityOrder = ['common', 'rare', 'epic', 'unique', 'legendary', 'mythic', 'dark'];
    const maxRarityIndex = rarityOrder.indexOf(maxRarity);

    if (maxRarityIndex === -1) {
      return { success: false, message: '잘못된 등급입니다', soldCount: 0, totalGold: 0 };
    }

    let soldCount = 0;
    let totalGold = 0;

    // 판매할 아이템 필터링
    const itemsToSell = inventory.filter(item => {
      const itemRarityIndex = rarityOrder.indexOf(item.rarity);
      return itemRarityIndex <= maxRarityIndex && itemRarityIndex !== -1;
    });

    // 아이템 판매 가격 계산 (등급별로 다른 가격)
    const rarityPrices = {
      common: 10,
      rare: 50,
      epic: 200,
      unique: 800,
      legendary: 3000,
      mythic: 12000,
      dark: 50000
    };

    itemsToSell.forEach(item => {
      const basePrice = rarityPrices[item.rarity] || 10;
      // 스탯에 따라 가격 증가
      const statBonus = item.stats.reduce((sum, stat) => sum + stat.value, 0) * 2;
      const price = Math.floor(basePrice + statBonus);

      totalGold += price;
      soldCount++;

      // 판매 로그 추가 (등급 정보 포함)
      this.addCombatLog(`${item.name} 판매 +${price.toLocaleString()}G`, 'sold', item.rarity);
    });

    // 인벤토리에서 판매한 아이템 제거
    this.state.inventory = inventory.filter(item => !itemsToSell.includes(item));

    // 골드 추가
    player.gold += totalGold;

    return {
      success: true,
      message: `${soldCount}개 아이템 판매 완료!`,
      soldCount,
      totalGold
    };
  }

  // 개별 아이템 판매
  sellItem(itemId) {
    const { inventory, player } = this.state;
    const itemIndex = inventory.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return { success: false, message: '아이템을 찾을 수 없습니다' };
    }

    const item = inventory[itemIndex];

    // 판매 가격 계산
    const rarityPrices = {
      common: 10,
      rare: 50,
      epic: 200,
      unique: 800,
      legendary: 3000,
      mythic: 12000,
      dark: 50000
    };

    const basePrice = rarityPrices[item.rarity] || 10;
    const statBonus = item.stats.reduce((sum, stat) => sum + stat.value, 0) * 2;
    const price = Math.floor(basePrice + statBonus);

    // 인벤토리에서 제거
    this.state.inventory.splice(itemIndex, 1);

    // 골드 추가
    player.gold += price;

    return {
      success: true,
      message: `${item.name} 판매 완료!`,
      gold: price
    };
  }

  // 설정 업데이트
  updateSettings(newSettings) {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings
    };
  }

  // 완벽의 정수 사용 (장비의 특정 옵션 1개를 극옵으로 변경)
  usePerfectEssence(slot, statIndex) {
    const { equipment, consumables = {} } = this.state;

    // 완벽의 정수 소지 확인
    if (!consumables.stat_max_item || consumables.stat_max_item < 1) {
      return { success: false, message: '완벽의 정수가 부족합니다' };
    }

    // 장비 착용 확인
    const item = equipment[slot];
    if (!item) {
      return { success: false, message: '해당 슬롯에 장비가 없습니다' };
    }

    // 옵션 인덱스 확인
    if (!item.stats || !item.stats[statIndex]) {
      return { success: false, message: '잘못된 옵션입니다' };
    }

    const stat = item.stats[statIndex];

    // 이미 극옵인지 확인
    if (stat.optionGrade === OPTION_GRADES.HIGH) {
      return { success: false, message: '이미 극옵 상태입니다' };
    }

    // 옵션 극옵화 (새 장비 시스템)
    const success = perfectPotentialStat(item, statIndex);
    if (!success) {
      return { success: false, message: '극옵화에 실패했습니다 (기본옵션/몬스터감소 불가)' };
    }

    // 완벽의 정수 소모
    this.state.consumables.stat_max_item -= 1;

    return {
      success: true,
      message: `${stat.name} 옵션을 극옵으로 변경했습니다!`,
      stat: item.stats[statIndex]
    };
  }

  // 오브로 아이템 옵션 재조정
  useOrb(slot) {
    const { equipment, player } = this.state;

    // 오브 소지 확인
    if (this.state.orbs < 1) {
      return { success: false, message: '오브가 부족합니다' };
    }

    // 장비 착용 확인
    const item = equipment[slot];
    if (!item) {
      return { success: false, message: '해당 슬롯에 장비가 없습니다' };
    }

    // 아이템 재조정 (새 장비 시스템 - potentials 재굴림)
    const success = rerollItemPotentials(item);
    if (!success) {
      return { success: false, message: '재조정에 실패했습니다' };
    }

    // 오브 소모
    this.state.orbs -= 1;

    return {
      success: true,
      message: `${item.name}의 옵션을 재조정했습니다!`,
      item: item
    };
  }

  // 도감 보너스 계산 (층별 5층 단위로)
  calculateCollectionBonus() {
    const { collection, player } = this.state;
    let totalBonus = { monsterReduction: 0, attack: 0, goldBonus: 0, expBonus: 0, dropRate: 0 };

    // rareMonsters가 없으면 초기화
    if (!collection.rareMonsters) {
      collection.rareMonsters = {};
    }

    // legendaryMonsters가 없으면 초기화
    if (!collection.legendaryMonsters) {
      collection.legendaryMonsters = {};
    }

    // 현재 층의 5층 구간 계산 (101+ 층도 1-100으로 매핑)
    const baseFloor = ((player.floor - 1) % 100) + 1;
    const rangeStart = Math.floor((baseFloor - 1) / 5) * 5 + 1;

    // 해당 5층 구간의 희귀 몬스터 10마리 확인
    let rareCollectedCount = 0;
    for (let i = 0; i < 10; i++) {
      const rareId = `rare_${rangeStart}_${i}`;
      if (collection.rareMonsters[rareId]?.unlocked) {
        rareCollectedCount++;
      }
    }

    // 해당 5층 구간의 전설 몬스터 10마리 확인
    let legendaryCollectedCount = 0;
    for (let i = 0; i < 10; i++) {
      const legendaryId = `legendary_${rangeStart}_${i}`;
      if (collection.legendaryMonsters[legendaryId]?.unlocked) {
        legendaryCollectedCount++;
      }
    }

    const totalCount = 10; // 5층 구간당 몬스터 10마리

    // 희귀 보너스 계산
    const rareBonus = getCollectionBonus(rareCollectedCount, totalCount);

    // 전설 보너스 계산 (2셋 -2, 5셋 -7, 10셋 -20)
    const legendaryBonus = {
      monsterReduction: legendaryCollectedCount >= 10 ? 20 : legendaryCollectedCount >= 5 ? 7 : legendaryCollectedCount >= 2 ? 2 : 0,
      attack: 0,
      goldBonus: 0,
      expBonus: 0,
      dropRate: 0
    };

    // 희귀 + 전설 보너스 합산
    totalBonus.monsterReduction = rareBonus.monsterReduction + legendaryBonus.monsterReduction;
    totalBonus.attack = rareBonus.attack + legendaryBonus.attack;
    totalBonus.goldBonus = rareBonus.goldBonus + legendaryBonus.goldBonus;
    totalBonus.expBonus = rareBonus.expBonus + legendaryBonus.expBonus;

    // 유물: 수집가의 휘장, 탐험가의 일지 (도감 수집률당 골드/데미지 증가)
    // 전체 도감 수집률 계산 (희귀 + 전설 몬스터 100마리씩 = 200마리 기준)
    const totalRareUnlocked = Object.values(collection.rareMonsters || {}).filter(m => m.unlocked).length;
    const totalLegendaryUnlocked = Object.values(collection.legendaryMonsters || {}).filter(m => m.unlocked).length;
    const totalCollectionRate = ((totalRareUnlocked + totalLegendaryUnlocked) / 200) * 100; // 퍼센트

    const relicEffects = this.getRelicEffects();
    // 수집가의 휘장: 도감 수집률 1%당 골드 증가
    if (relicEffects.collectionGoldBonus > 0) {
      totalBonus.goldBonus += totalCollectionRate * relicEffects.collectionGoldBonus;
    }
    // 탐험가의 일지: 도감 수집률 1%당 데미지 증가
    if (relicEffects.collectionDamageBonus > 0) {
      totalBonus.attack += totalCollectionRate * relicEffects.collectionDamageBonus;
    }

    // 방생 보너스는 이제 곱연산으로 calculateTotalDPS()와 tryDropItem()에서 직접 적용됨

    return totalBonus;
  }

  // 보스 도감 보너스 계산
  calculateBossCollectionBonus() {
    const { collection } = this.state;

    // 희귀/전설 보스 수집 수 계산
    let rareCount = 0;
    let legendaryCount = 0;

    if (collection.rareBosses) {
      rareCount = Object.values(collection.rareBosses).filter(b => b.unlocked).length;
    }
    if (collection.legendaryBosses) {
      legendaryCount = Object.values(collection.legendaryBosses).filter(b => b.unlocked).length;
    }

    return getBossCollectionBonus(rareCount, legendaryCount);
  }

  // 방생 보너스 계산 (해당 구간, 방생 횟수 반영)
  calculateReleaseBonus(rangeStart) {
    const { collection } = this.state;

    if (!collection.release) {
      collection.release = {
        releasedMonsters: {},
        totalRareReleased: 0,
        totalLegendaryReleased: 0,
        legendaryScrolls: 0,
        legendaryChoiceTokens: 0,
        mysteryTokens: 0
      };
    }

    let damageBonus = 0;
    let dropRateBonus = 0;

    // 해당 구간의 방생된 몬스터 확인
    Object.entries(collection.release.releasedMonsters).forEach(([monsterId, data]) => {
      // monsterId 형식: rare_1_0, legendary_1_0 등
      const parts = monsterId.split('_');
      const type = parts[0]; // 'rare' or 'legendary'
      const floor = parseInt(parts[1]);

      // 현재 구간에 속하는지 확인
      if (floor === rangeStart) {
        const releaseCount = data.releaseCount || 0;
        if (type === 'rare') {
          // 희귀: 1회당 +5% (최대 3회 = +15%)
          damageBonus += 5 * releaseCount;
          dropRateBonus += 5 * releaseCount;
        } else if (type === 'legendary') {
          // 전설: 1회당 +20% (최대 3회 = +60%)
          damageBonus += 20 * releaseCount;
          dropRateBonus += 20 * releaseCount;
        }
      }
    });

    return { damageBonus, dropRateBonus };
  }

  // 몬스터 방생 (최대 1회)
  releaseMonster(monsterId, type = 'rare') {
    const { collection } = this.state;

    // release 초기화
    if (!collection.release) {
      collection.release = {
        releasedMonsters: {}, // { monsterId: { name, releaseCount, releasedAt } }
        totalRareReleased: 0,
        totalLegendaryReleased: 0,
        legendaryScrolls: 0,
        legendaryChoiceTokens: 0,
        mysteryTokens: 0
      };
    }

    // 몬스터가 수집되어 있는지 확인
    if (type === 'rare') {
      if (!collection.rareMonsters[monsterId]?.unlocked) {
        return { success: false, message: '수집되지 않은 몬스터입니다' };
      }

      // 방생 횟수 확인 (최대 1회)
      const rareReleaseData = collection.release.releasedMonsters[monsterId];
      const rareReleaseCount = rareReleaseData?.releaseCount || 0;

      // 방생 횟수 확인 (최대 1회)
      if (rareReleaseCount >= 1) {
        return { success: false, message: '최대 방생 횟수(1회)에 도달했습니다!' };
      }

      // 방생 처리
      const monsterName = collection.rareMonsters[monsterId].name;
      collection.rareMonsters[monsterId].unlocked = false;

      if (!collection.release.releasedMonsters[monsterId]) {
        collection.release.releasedMonsters[monsterId] = {
          name: monsterName,
          releaseCount: 0,
          releasedAt: Date.now()
        };
      }
      collection.release.releasedMonsters[monsterId].releaseCount++;
      collection.release.releasedMonsters[monsterId].releasedAt = Date.now();
      collection.release.totalRareReleased++;

      // 마일스톤 보상 체크
      this.checkReleaseMilestones();

      this.addCombatLog(`🕊️ ${monsterName}을(를) 방생했습니다!`, 'release');

      return {
        success: true,
        message: `${monsterName}을(를) 방생했습니다!`,
        damageBonus: 5,
        dropRateBonus: 5
      };
    } else if (type === 'legendary') {
      if (!collection.legendaryMonsters[monsterId]?.unlocked) {
        return { success: false, message: '수집되지 않은 몬스터입니다' };
      }

      // 방생 횟수 확인 (최대 1회)
      const legendaryReleaseData = collection.release.releasedMonsters[monsterId];
      const legendaryReleaseCount = legendaryReleaseData?.releaseCount || 0;

      if (legendaryReleaseCount >= 1) {
        return { success: false, message: '최대 방생 횟수(1회)에 도달했습니다!' };
      }

      // 방생 처리
      const monsterName = collection.legendaryMonsters[monsterId].name;
      collection.legendaryMonsters[monsterId].unlocked = false;

      if (!collection.release.releasedMonsters[monsterId]) {
        collection.release.releasedMonsters[monsterId] = {
          name: monsterName,
          releaseCount: 0,
          releasedAt: Date.now()
        };
      }
      collection.release.releasedMonsters[monsterId].releaseCount++;
      collection.release.releasedMonsters[monsterId].releasedAt = Date.now();
      collection.release.totalLegendaryReleased++;

      // 마일스톤 보상 체크
      this.checkReleaseMilestones();

      this.addCombatLog(`🕊️ ${monsterName}을(를) 방생했습니다!`, 'release');

      return {
        success: true,
        message: `${monsterName}을(를) 방생했습니다!`,
        damageBonus: 20,
        dropRateBonus: 20
      };
    }

    return { success: false, message: '잘못된 몬스터 타입입니다' };
  }

  // 모두 방생 (방생 가능한 모든 몬스터 방생)
  releaseAllMonsters() {
    const { collection } = this.state;

    // release 초기화
    if (!collection.release) {
      collection.release = {
        releasedMonsters: {},
        totalRareReleased: 0,
        totalLegendaryReleased: 0,
        legendaryScrolls: 0,
        legendaryChoiceTokens: 0,
        mysteryTokens: 0
      };
    }

    let totalReleased = 0;
    let totalDamageBonus = 0;
    let totalDropRateBonus = 0;

    // 전설 먼저 방생 (전설 우선 규칙 때문에)
    if (collection.legendaryMonsters) {
      Object.entries(collection.legendaryMonsters).forEach(([monsterId, data]) => {
        if (data.unlocked) {
          const releaseData = collection.release.releasedMonsters[monsterId];
          const releaseCount = releaseData?.releaseCount || 0;

          if (releaseCount < 1) {
            // 방생 처리
            data.unlocked = false;

            if (!collection.release.releasedMonsters[monsterId]) {
              collection.release.releasedMonsters[monsterId] = {
                name: data.name,
                releaseCount: 0,
                releasedAt: Date.now()
              };
            }
            collection.release.releasedMonsters[monsterId].releaseCount++;
            collection.release.releasedMonsters[monsterId].releasedAt = Date.now();
            collection.release.totalLegendaryReleased++;

            totalReleased++;
            totalDamageBonus += 20;
            totalDropRateBonus += 20;
          }
        }
      });
    }

    // 레어 방생
    if (collection.rareMonsters) {
      Object.entries(collection.rareMonsters).forEach(([monsterId, data]) => {
        if (data.unlocked) {
          const releaseData = collection.release.releasedMonsters[monsterId];
          const releaseCount = releaseData?.releaseCount || 0;

          // 전설 우선 방생 확인 (전설이 수집되어 있고 아직 방생 안 했으면 방생 불가)
          const legendaryId = monsterId.replace('rare_', 'legendary_');
          const legendaryCollected = collection.legendaryMonsters?.[legendaryId]?.unlocked || false;
          const legendaryReleaseData = collection.release.releasedMonsters[legendaryId];
          const legendaryReleased = (legendaryReleaseData?.releaseCount || 0) >= 1;

          // 전설이 없거나 전설이 방생되었으면 방생 가능
          const canRelease = releaseCount < 1 && (!legendaryCollected || legendaryReleased);

          if (canRelease) {
            // 방생 처리
            data.unlocked = false;

            if (!collection.release.releasedMonsters[monsterId]) {
              collection.release.releasedMonsters[monsterId] = {
                name: data.name,
                releaseCount: 0,
                releasedAt: Date.now()
              };
            }
            collection.release.releasedMonsters[monsterId].releaseCount++;
            collection.release.releasedMonsters[monsterId].releasedAt = Date.now();
            collection.release.totalRareReleased++;

            totalReleased++;
            totalDamageBonus += 5;
            totalDropRateBonus += 5;
          }
        }
      });
    }

    if (totalReleased === 0) {
      return { success: false, message: '방생할 몬스터가 없습니다!' };
    }

    // 마일스톤 보상 체크
    this.checkReleaseMilestones();

    this.addCombatLog(`🕊️ ${totalReleased}마리를 방생했습니다!`, 'release');

    return {
      success: true,
      message: `${totalReleased}마리를 방생했습니다!`,
      totalReleased,
      damageBonus: totalDamageBonus,
      dropRateBonus: totalDropRateBonus
    };
  }

  // 몬스터 선택권으로 몬스터 도감 등록
  unlockMonsterWithTicket(monsterId, type, monsterName) {
    const { collection, consumables } = this.state;

    // 선택권 보유 확인
    if (!consumables.monster_selection_ticket || consumables.monster_selection_ticket <= 0) {
      return { success: false, message: '몬스터 도감 선택권이 없습니다!' };
    }

    // 이미 수집된 몬스터인지 확인
    if (type === 'rare') {
      if (collection.rareMonsters[monsterId]?.unlocked) {
        return { success: false, message: '이미 수집된 몬스터입니다!' };
      }

      // 몬스터 초기화 (아직 없다면)
      if (!collection.rareMonsters[monsterId]) {
        collection.rareMonsters[monsterId] = {
          name: monsterName,
          count: 0,
          unlocked: false
        };
      }

      // 몬스터 해금
      collection.rareMonsters[monsterId].unlocked = true;
      consumables.monster_selection_ticket--;

      this.addCombatLog(`✨ 몬스터 선택권 사용! ${monsterName}을(를) 도감에 등록했습니다!`, 'rare_monster');
      return {
        success: true,
        message: `${monsterName}을(를) 도감에 등록했습니다!`
      };

    } else if (type === 'legendary') {
      if (collection.legendaryMonsters[monsterId]?.unlocked) {
        return { success: false, message: '이미 수집된 몬스터입니다!' };
      }

      // 몬스터 초기화 (아직 없다면)
      if (!collection.legendaryMonsters[monsterId]) {
        collection.legendaryMonsters[monsterId] = {
          name: monsterName,
          count: 0,
          unlocked: false
        };
      }

      // 몬스터 해금
      collection.legendaryMonsters[monsterId].unlocked = true;
      consumables.monster_selection_ticket--;

      this.addCombatLog(`🌟 몬스터 선택권 사용! ${monsterName}을(를) 도감에 등록했습니다!`, 'legendary_monster');
      return {
        success: true,
        message: `${monsterName}을(를) 도감에 등록했습니다!`
      };
    }

    return { success: false, message: '잘못된 몬스터 타입입니다' };
  }

  // 방생 마일스톤 보상 체크
  checkReleaseMilestones() {
    const { collection } = this.state;
    const { totalRareReleased, totalLegendaryReleased } = collection.release;

    // 희귀 몬스터 마일스톤
    const rareMilestones = [
      { count: 5, scrolls: 1 },
      { count: 10, scrolls: 2 },
      { count: 25, scrolls: 3 },
      { count: 50, scrolls: 5 }
    ];

    rareMilestones.forEach(milestone => {
      if (totalRareReleased === milestone.count) {
        collection.release.legendaryScrolls += milestone.scrolls;
        this.addCombatLog(`🎁 희귀 방생 ${milestone.count}마리 달성! 전설 소환권 ${milestone.scrolls}개 획득!`, 'milestone');
      }
    });

    // 전설 몬스터 마일스톤
    const legendaryMilestones = [
      { count: 5, tokens: 1 },
      { count: 10, tokens: 2 },
      { count: 25, tokens: 3, mystery: true },
      { count: 50, tokens: 5 }
    ];

    legendaryMilestones.forEach(milestone => {
      if (totalLegendaryReleased === milestone.count) {
        collection.release.legendaryChoiceTokens += milestone.tokens;
        if (milestone.mystery) {
          collection.release.mysteryTokens += 1;
          this.addCombatLog(`🎁 전설 방생 ${milestone.count}마리 달성! 전설 선택권 ${milestone.tokens}개 + 수수께끼 토큰 획득!`, 'milestone');
        } else {
          this.addCombatLog(`🎁 전설 방생 ${milestone.count}마리 달성! 전설 선택권 ${milestone.tokens}개 획득!`, 'milestone');
        }
      }
    });
  }

  // 방생으로 인한 출현율 보너스 계산
  getReleaseSpawnBonus() {
    const { collection } = this.state;

    if (!collection.release) {
      return { rareSpawnBonus: 0, legendarySpawnBonus: 0 };
    }

    const { totalRareReleased, totalLegendaryReleased } = collection.release;

    let rareSpawnBonus = 0;
    let legendarySpawnBonus = 0;

    // 희귀 방생에 따른 희귀 출현율 증가
    if (totalRareReleased >= 50) rareSpawnBonus = 200;
    else if (totalRareReleased >= 25) rareSpawnBonus = 150;
    else if (totalRareReleased >= 10) rareSpawnBonus = 100;
    else if (totalRareReleased >= 5) rareSpawnBonus = 50;

    // 희귀 50마리 이상 방생 시 전설 출현율도 증가
    if (totalRareReleased >= 50) legendarySpawnBonus += 25;

    // 전설 방생에 따른 전설 출현율 증가
    if (totalLegendaryReleased >= 50) legendarySpawnBonus += 200;
    else if (totalLegendaryReleased >= 25) legendarySpawnBonus += 150;
    else if (totalLegendaryReleased >= 10) legendarySpawnBonus += 100;
    else if (totalLegendaryReleased >= 5) legendarySpawnBonus += 50;

    return { rareSpawnBonus, legendarySpawnBonus };
  }

  // 전투 로그 추가
  addCombatLog(message, type = 'info', rarity = null) {
    const log = {
      id: Date.now() + Math.random(),
      message,
      type, // 'info', 'damage', 'critical', 'gold', 'item', 'level', 'boss', 'acquired', 'sold', 'gear_core', 'rare_monster'
      rarity, // 아이템 등급 (색상 구분용)
      timestamp: Date.now()
    };

    this.state.combatLog.unshift(log);

    // 최대 50개까지만 유지 (획득 10개 + 판매 10개 여유있게)
    if (this.state.combatLog.length > 50) {
      this.state.combatLog = this.state.combatLog.slice(0, 50);
    }
  }

  /* ===== 월드보스 시스템 (비활성화) =====

  // 월드보스 전투 시작
  startWorldBossBattle() { ... }
  // 월드보스 전투 틱 (매 틱마다 데미지 누적)
  tickWorldBossDamage() { ... }
  // 월드보스 전투 종료
  endWorldBossBattle() { ... }
  // 월드보스 수동 제어 (관리자)
  toggleWorldBoss(forceState = null) { ... }
  // 월드보스 보상 분배
  distributeWorldBossRewards() { ... }

  ===== 경매 시스템 (비활성화) =====

  // 경매 시작
  startAuction() { ... }
  // 입찰하기
  placeBid(itemId, amount, playerId, playerName) { ... }
  // 경매 종료 및 아이템 분배
  endAuction() { ... }
  // 월드보스/경매 상태 자동 체크
  checkWorldBossAndAuction() { ... }

  */

  // 유물 효과 가져오기
  getRelicEffects() {
    const { prestigeRelics = {} } = this.state;
    return getTotalRelicEffects(prestigeRelics);
  }

  // 몬스터 생성 (유물 효과 적용)
  spawnMonster(floor, isBoss, isRare, isLegendary, collection) {
    // 유물 효과 가져오기
    const relicEffects = this.getRelicEffects();

    // 행운의 알: 희귀 몬스터 출현 확률 증가
    const rareSpawnBonus = relicEffects.rareMonsterSpawn || 0;

    // 구미호의 구슬: 전설 몬스터 출현 확률 증가
    const legendarySpawnBonus = relicEffects.legendaryMonsterSpawn || 0;

    // 몬스터 생성 (스폰율 보너스 적용)
    const monster = getMonsterForStage(floor, isBoss, isRare, isLegendary, collection, rareSpawnBonus, legendarySpawnBonus);

    // 정복자의 창: 몬스터 HP 감소 (골드는 원래 HP 기준)
    const hpReduction = relicEffects.monsterHpReduction || 0;

    if (hpReduction > 0) {
      // 원본 HP를 따로 저장 (골드 계산용)
      monster.originalMaxHp = monster.maxHp;

      // HP 감소 적용 (최소 1은 유지)
      const reducedMaxHp = Math.max(1, Math.floor(monster.maxHp * (1 - hpReduction / 100)));
      monster.maxHp = reducedMaxHp;
      monster.hp = reducedMaxHp;
    } else {
      // HP 감소가 없으면 originalMaxHp를 maxHp와 동일하게 설정
      monster.originalMaxHp = monster.maxHp;
    }

    return monster;
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = newState;
  }

  // 유물 가챠 (중복 없이 랜덤 획득)
  gachaRelic() {
    const { relicFragments = 0, relicGachaCount = 0, prestigeRelics = {} } = this.state;

    // 미보유 유물 목록
    const unownedRelicIds = Object.keys(PRESTIGE_RELICS).filter(id => !prestigeRelics[id]);

    if (unownedRelicIds.length === 0) {
      return { success: false, message: '모든 유물을 보유하고 있습니다!' };
    }

    const cost = getRelicGachaCost(relicGachaCount);

    if (relicFragments < cost) {
      return { success: false, message: `고대 유물이 부족합니다! (필요: ${cost}개)` };
    }

    // 랜덤 유물 선택
    const randomRelicId = unownedRelicIds[Math.floor(Math.random() * unownedRelicIds.length)];
    const relic = PRESTIGE_RELICS[randomRelicId];

    // 상태 업데이트
    this.state.relicFragments = relicFragments - cost;
    this.state.relicGachaCount = relicGachaCount + 1;
    this.state.prestigeRelics = {
      ...prestigeRelics,
      [randomRelicId]: {
        relicId: randomRelicId,
        level: 1
      }
    };

    return {
      success: true,
      relic: relic,
      message: `${relic.icon} ${relic.name} 획득!`
    };
  }

  // 유물 레벨업
  upgradeRelic(relicId) {
    const { relicFragments = 0, prestigeRelics = {} } = this.state;
    const relicInstance = prestigeRelics[relicId];

    if (!relicInstance) {
      return { success: false, message: '보유하지 않은 유물입니다.' };
    }

    const relic = PRESTIGE_RELICS[relicId];

    // 만렙 체크
    if (relic.maxLevel && relicInstance.level >= relic.maxLevel) {
      return { success: false, message: '이미 최대 레벨입니다!' };
    }

    // 유물 효과로 비용 감소 계산
    const relicEffects = this.getRelicEffects();
    const costReduction = relicEffects.relicUpgradeCostReduction || 0;
    const cost = getRelicUpgradeCost(relicInstance.level, costReduction);

    if (relicFragments < cost) {
      return { success: false, message: `고대 유물이 부족합니다! (필요: ${cost}개)` };
    }

    // 상태 업데이트
    this.state.relicFragments = relicFragments - cost;
    this.state.prestigeRelics = {
      ...prestigeRelics,
      [relicId]: {
        ...relicInstance,
        level: relicInstance.level + 1
      }
    };

    return {
      success: true,
      newLevel: relicInstance.level + 1,
      message: `${relic.icon} ${relic.name} Lv.${relicInstance.level + 1} 달성!`
    };
  }

  // ===== 새 장비 시스템 메서드들 =====

  // 새 장비 장착
  equipNewItem(itemId) {
    const { newInventory = [], equipment } = this.state;
    const itemIndex = newInventory.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return { success: false, message: '아이템을 찾을 수 없습니다' };
    }

    const item = newInventory[itemIndex];
    const slot = item.slot;

    // 기존 장착 아이템이 있으면 인벤토리로 이동
    const currentEquipped = equipment[slot];
    if (currentEquipped) {
      newInventory.push(currentEquipped);
    }

    // 새 아이템 장착
    equipment[slot] = item;

    // 인벤토리에서 제거
    newInventory.splice(itemIndex, 1);

    // 인벤토리 정렬
    this.sortNewInventory();

    this.addCombatLog(`⚔️ ${item.name} 장착!`, 'equipment');

    return {
      success: true,
      message: `${item.name} 장착 완료!`,
      item,
      unequipped: currentEquipped
    };
  }

  // 새 장비 해제
  unequipNewItem(slot) {
    const { equipment, newInventory = [] } = this.state;
    const item = equipment[slot];

    if (!item) {
      return { success: false, message: '장착된 아이템이 없습니다' };
    }

    // 인벤토리로 이동
    if (!this.state.newInventory) {
      this.state.newInventory = [];
    }
    this.state.newInventory.push(item);
    this.sortNewInventory();

    // 슬롯 비우기
    equipment[slot] = null;

    return {
      success: true,
      message: `${item.name} 해제 완료!`,
      item
    };
  }

  // 새 아이템 분해 (장비조각 획득)
  disassembleNewItem(itemId) {
    const { newInventory = [] } = this.state;
    const itemIndex = newInventory.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return { success: false, message: '아이템을 찾을 수 없습니다' };
    }

    const item = newInventory[itemIndex];
    const fragments = getDisassembleFragments(item);

    // 인벤토리에서 제거
    newInventory.splice(itemIndex, 1);

    // 장비조각 추가
    this.state.equipmentFragments = (this.state.equipmentFragments || 0) + fragments;

    const itemType = item.setId ? '세트' : '노말';
    this.addCombatLog(`🔨 ${item.name} 분해 → 장비조각 +${fragments}`, 'disassemble');

    return {
      success: true,
      message: `${item.name} 분해! 장비조각 +${fragments}`,
      fragments,
      totalFragments: this.state.equipmentFragments
    };
  }

  // 아이템 잠금 토글
  toggleItemLock(itemId) {
    const { newInventory = [] } = this.state;
    const itemIndex = newInventory.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return { success: false, message: '아이템을 찾을 수 없습니다' };
    }

    const item = newInventory[itemIndex];
    const newLockState = !item.locked;

    this.state.newInventory = newInventory.map((it, idx) =>
      idx === itemIndex ? { ...it, locked: newLockState } : it
    );

    this.addCombatLog(`🔒 ${item.name} ${newLockState ? '잠금' : '잠금 해제'}`, 'lock');

    return {
      success: true,
      message: `${item.name} ${newLockState ? '잠금됨' : '잠금 해제됨'}`,
      locked: newLockState
    };
  }

  // 일괄 분해 (옵션: 등급 선택, 잠금 아이템 보호)
  // options: { grades: ['white', 'blue', 'purple'] } - 분해할 등급 선택 (기본: 전체 노말)
  disassembleAllNormal(options = {}) {
    const { newInventory = [] } = this.state;
    const { grades = null } = options; // null이면 전체 노말템

    // type이 없거나 'normal'인 경우, 또는 setId가 없는 경우 노말템으로 판단
    const isNormalItem = (item) => {
      if (item.type === 'set' || item.setId) return false;
      return item.type === 'normal' || !item.type;
    };

    // 분해 대상 필터링: 노말템 + 잠금 안된 것 + (등급 선택 시 해당 등급만)
    const targetItems = newInventory.filter(item => {
      if (!isNormalItem(item)) return false;
      if (item.locked) return false; // 잠금된 아이템은 제외
      if (grades && grades.length > 0) {
        // 등급 필터링 (white/blue/purple)
        return grades.includes(item.normalGrade);
      }
      return true;
    });

    if (targetItems.length === 0) {
      return { success: false, message: '분해할 아이템이 없습니다 (잠금 아이템 제외)' };
    }

    let totalFragments = 0;
    targetItems.forEach(item => {
      totalFragments += getDisassembleFragments(item);
    });

    // 대상 아이템 ID 목록
    const targetIds = new Set(targetItems.map(item => item.id));

    // 대상 아이템 제거
    this.state.newInventory = newInventory.filter(item => !targetIds.has(item.id));

    // 장비조각 추가
    this.state.equipmentFragments = (this.state.equipmentFragments || 0) + totalFragments;

    const gradeLabel = grades ? grades.join('/') + ' 등급' : '노말템';
    this.addCombatLog(`🔨 ${gradeLabel} ${targetItems.length}개 일괄 분해 → 장비조각 +${totalFragments}`, 'disassemble');

    return {
      success: true,
      message: `${gradeLabel} ${targetItems.length}개 분해! 장비조각 +${totalFragments}`,
      count: targetItems.length,
      fragments: totalFragments,
      totalFragments: this.state.equipmentFragments
    };
  }

  // 장비 템렙 강화
  upgradeEquipmentLevel(slot) {
    const { equipment, equipmentFragments = 0 } = this.state;
    const item = equipment[slot];

    if (!item) {
      return { success: false, message: '장착된 아이템이 없습니다' };
    }

    const result = upgradeItemLevel(item, equipmentFragments);

    if (result.success) {
      this.state.equipmentFragments = equipmentFragments - result.cost;
      this.addCombatLog(`⬆️ ${item.name} ${result.message}`, 'upgrade');
    }

    return result;
  }

  // 장비 각성 (업글 횟수 리셋, 각성석 사용)
  awakenEquipment(slot) {
    const { equipment, consumables = {} } = this.state;
    const awakeningStones = consumables.awakening_stone || 0;
    const item = equipment[slot];

    if (!item) {
      return { success: false, message: '장착된 아이템이 없습니다' };
    }

    if (awakeningStones < 1) {
      return { success: false, message: '각성석이 부족합니다! (상점에서 구매)' };
    }

    const result = awakenItem(item);

    if (result.success) {
      this.state.consumables = {
        ...this.state.consumables,
        awakening_stone: awakeningStones - 1
      };
      this.addCombatLog(`✨ ${item.name} ${result.message}`, 'upgrade');
    }

    return result;
  }

  // 세트 선택권 사용 (원하는 세트 + 슬롯 선택)
  useSetSelector(selectorType, setId, slot) {
    const { setSelectors = {} } = this.state;
    const count = setSelectors[selectorType] || 0;

    if (count <= 0) {
      return { success: false, message: '세트 선택권이 없습니다' };
    }

    // 선택권 타입에 따른 드랍층 결정
    const floorMap = {
      'floor50': 50,
      'floor100': 100,
      'floor200': 200
    };
    const floor = floorMap[selectorType] || 50;

    // 세트 아이템 생성
    const newItem = generateSetItem(slot, floor, setId);

    // 인벤토리에 추가
    if (!this.state.newInventory) {
      this.state.newInventory = [];
    }
    this.state.newInventory.push(newItem);
    this.sortNewInventory();

    // 선택권 차감
    this.state.setSelectors = {
      ...setSelectors,
      [selectorType]: count - 1
    };

    this.addCombatLog(`🎁 세트 선택권으로 ${newItem.name} 획득!`, 'reward');

    return {
      success: true,
      item: newItem,
      message: `${newItem.name} (Lv.${newItem.itemLevel}) 획득!`
    };
  }

  // 세트 선택권 지급 (업적 보상 등에서 호출)
  grantSetSelector(selectorType, amount = 1) {
    if (!this.state.setSelectors) {
      this.state.setSelectors = {};
    }
    this.state.setSelectors[selectorType] = (this.state.setSelectors[selectorType] || 0) + amount;
    return { success: true };
  }

  // 층수 업적 체크 (50/100/200층)
  checkFloorAchievements() {
    const { player, achievements = {} } = this.state;

    if (!this.state.achievements) {
      this.state.achievements = {};
    }

    const floorRewards = [
      { floor: 50, key: 'floor50', selector: 'floor50' },
      { floor: 100, key: 'floor100', selector: 'floor100' },
      { floor: 200, key: 'floor200', selector: 'floor200' }
    ];

    const newRewards = [];

    floorRewards.forEach(({ floor, key, selector }) => {
      if (player.highestFloor >= floor && !this.state.achievements[key]) {
        this.state.achievements[key] = true;
        this.grantSetSelector(selector, 1);
        newRewards.push({ floor, selector });
        this.addCombatLog(`🏆 ${floor}층 달성! 세트 선택권 획득!`, 'achievement');
      }
    });

    return newRewards;
  }

  // 세트 효과 가져오기
  getSetBonuses() {
    const { equipment } = this.state;
    return getActiveSetBonuses(equipment);
  }

  // 세트 개수 가져오기
  getSetCounts() {
    const { equipment } = this.state;
    return calculateSetCounts(equipment);
  }

  // 장비 총 스탯 계산
  getEquipmentTotalStats() {
    const { equipment } = this.state;
    return calculateEquipmentStats(equipment);
  }

  // 세트 효과 총합 계산
  getTotalSetEffects() {
    const { equipment } = this.state;
    return calculateTotalSetEffects(equipment);
  }

  // 새 아이템 드랍 시도 (몬스터 처치 시)
  tryDropNewItem(isBoss = false) {
    const { player, newInventory = [], settings = {} } = this.state;

    // 세트 드랍률 보너스 계산
    const setEffects = this.getTotalSetEffects();
    const setDropBonus = setEffects.setDropRate || 0;

    // 아이템 드랍
    const droppedItems = rollItemDrop(player.floor, isBoss, setDropBonus);

    if (droppedItems.length === 0) {
      return { dropped: false, items: [] };
    }

    // 자동 분해 설정 확인
    const processedItems = [];
    let autoFragments = 0;

    // 슬롯별 최대 인벤토리 개수 (3줄 * 약 10개 = 30개, 장착 포함하면 29개 인벤)
    const MAX_ITEMS_PER_SLOT = 30;

    droppedItems.forEach(item => {
      // 자동 분해: 노말템이고, 자동분해 설정이 켜져있고, 해당 등급이 자동분해 대상인 경우
      const autoDisassembleGrades = settings.autoDisassembleGrades || ['white', 'blue', 'purple'];
      const shouldAutoDisassemble = settings.autoDisassemble &&
        item.type === 'normal' &&
        autoDisassembleGrades.includes(item.normalGrade);

      if (shouldAutoDisassemble) {
        // 노말템 자동 분해 (선택된 등급만)
        const fragments = getDisassembleFragments(item);
        autoFragments += fragments;
      } else {
        // 인벤토리에 추가
        if (!this.state.newInventory) {
          this.state.newInventory = [];
        }

        // 슬롯별 현재 아이템 개수 확인 (장착 포함)
        const slotItemCount = this.state.newInventory.filter(i => i.slot === item.slot).length +
          (this.state.equipment[item.slot] ? 1 : 0);

        if (slotItemCount >= MAX_ITEMS_PER_SLOT) {
          // 인벤토리 가득 참 - 가장 낮은 가치 아이템 자동 분해 (잠금 아이템 제외)
          const slotItems = this.state.newInventory.filter(i => i.slot === item.slot && !i.locked);

          // 정렬: 일반템 먼저, 그 다음 템렙 낮은 순
          const sortedItems = [...slotItems].sort((a, b) => {
            // 세트템은 보존 우선
            if (a.type === 'set' && b.type !== 'set') return 1;
            if (a.type !== 'set' && b.type === 'set') return -1;
            // 템렙 낮은 순
            return a.itemLevel - b.itemLevel;
          });

          // 가장 낮은 가치 아이템 분해
          const toDisassemble = sortedItems[0];
          if (toDisassemble) {
            const fragments = getDisassembleFragments(toDisassemble);
            autoFragments += fragments;
            this.state.newInventory = this.state.newInventory.filter(i => i.id !== toDisassemble.id);
          }
        }

        this.state.newInventory.push(item);
        processedItems.push(item);

        // 로그
        if (item.type === 'set') {
          this.addCombatLog(`✨ [세트] ${item.name} 획득! (Lv.${item.itemLevel})`, 'set_item');
        } else {
          this.addCombatLog(`📦 ${item.name} 획득 (Lv.${item.itemLevel})`, 'normal_item');
        }
      }
    });

    // 인벤토리 정렬 (품질순)
    this.sortNewInventory();

    // 자동 분해 조각 추가
    if (autoFragments > 0) {
      this.state.equipmentFragments = (this.state.equipmentFragments || 0) + autoFragments;
    }

    return {
      dropped: true,
      items: processedItems,
      autoDisassembled: droppedItems.length - processedItems.length,
      autoFragments
    };
  }

  // 인벤토리 정렬 (새 시스템)
  sortNewInventory(sortBy = 'itemLevel') {
    if (!this.state.newInventory) return;

    this.state.newInventory.sort((a, b) => {
      // 세트템 우선
      if (a.type === 'set' && b.type !== 'set') return -1;
      if (a.type !== 'set' && b.type === 'set') return 1;

      // 그 다음 정렬 기준
      if (sortBy === 'itemLevel') {
        return b.itemLevel - a.itemLevel;
      } else if (sortBy === 'slot') {
        const slotOrder = ['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'];
        return slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot);
      }
      return 0;
    });
  }

  // 새 인벤토리 최대 템렙 아이템 가져오기 (슬롯별)
  getBestItemsPerSlot() {
    const { newInventory = [], equipment } = this.state;
    const bestItems = {};

    EQUIPMENT_SLOTS.forEach(slot => {
      const slotItems = newInventory.filter(item => item.slot === slot);
      const equipped = equipment[slot];

      // 인벤토리 + 장착 중인 아이템 중 최고 템렙
      let best = equipped;
      slotItems.forEach(item => {
        if (!best || item.itemLevel > best.itemLevel) {
          best = item;
        }
      });

      bestItems[slot] = best;
    });

    return bestItems;
  }

  // ===== 업적 시스템 =====

  // 업적 체크 및 자동 완료 처리
  checkAndCompleteAchievements() {
    if (!this.state.completedAchievements) {
      this.state.completedAchievements = {};
    }

    const newlyCompleted = checkAchievements(this.state, this.state.completedAchievements);

    newlyCompleted.forEach(achievement => {
      this.state.completedAchievements[achievement.id] = {
        completedAt: Date.now()
      };
      this.addCombatLog(`🏆 업적 달성: ${achievement.name}!`, 'achievement');
    });

    return newlyCompleted;
  }

  // 업적 보상 수령
  claimAchievementReward(achievementId) {
    const { completedAchievements = {}, claimedAchievements = {} } = this.state;

    // 업적이 완료되지 않은 경우
    if (!completedAchievements[achievementId]) {
      return { success: false, message: '아직 달성하지 않은 업적입니다' };
    }

    // 이미 보상을 수령한 경우
    if (claimedAchievements[achievementId]) {
      return { success: false, message: '이미 보상을 수령했습니다' };
    }

    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
      return { success: false, message: '존재하지 않는 업적입니다' };
    }

    // 보상 지급
    const { type, amount } = achievement.reward;

    switch (type) {
      case 'gold':
        this.state.player.gold += amount;
        break;
      case 'fragments':
        this.state.equipmentFragments = (this.state.equipmentFragments || 0) + amount;
        break;
      case 'bossCoins':
        if (!this.state.sealedZone) this.state.sealedZone = {};
        this.state.sealedZone.bossCoins = (this.state.sealedZone.bossCoins || 0) + amount;
        break;
      case 'orbs':
        this.state.orbs = (this.state.orbs || 0) + amount;
        break;
      case 'relicFragments':
        this.state.relicFragments = (this.state.relicFragments || 0) + amount;
        break;
      case 'setSelector':
        this.grantSetSelector('floor100', amount);
        break;
      default:
        break;
    }

    // 수령 완료 표시
    if (!this.state.claimedAchievements) {
      this.state.claimedAchievements = {};
    }
    this.state.claimedAchievements[achievementId] = {
      claimedAt: Date.now()
    };

    this.addCombatLog(`🎁 업적 보상 수령: ${achievement.name}`, 'reward');

    return { success: true, message: `${achievement.name} 보상을 수령했습니다!` };
  }
}
