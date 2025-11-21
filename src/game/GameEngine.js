import { getMonsterForStage, getCollectionBonus, RARE_MONSTER_COLLECTION_CHANCE, LEGENDARY_MONSTER_COLLECTION_CHANCE } from '../data/monsters.js';
import { HEROES, getHeroById, getHeroStats, getNextGrade, getUpgradeCost, getStarUpgradeCost } from '../data/heroes.js';
import { generateItem, GEAR_CORE_DROP_RATE, upgradeItemStatToMax } from '../data/items.js';
import { getTotalSkillEffects } from '../data/skills.js';
import {
  GAME_CONFIG,
  PLAYER_BASE_STATS,
  EXP_CONFIG,
  DROP_CONFIG,
  FLOOR_CONFIG,
  EQUIPMENT_CONFIG,
  calculateExpToNextLevel,
  calculateHeroCardDropChance,
  calculateUpgradeCoinDropChance,
  calculateUpgradeCoinAmount
} from '../data/gameBalance.js';

export class GameEngine {
  constructor(initialState) {
    this.state = initialState || this.getDefaultState();
    this.tickInterval = null;
    this.tickRate = GAME_CONFIG.tickRate;

    // 초기 몬스터가 없으면 생성
    if (!this.state.currentMonster) {
      this.state.currentMonster = getMonsterForStage(this.state.player.floor, false, false, false, this.state.collection);
    }
  }

  getDefaultState() {
    return {
      player: {
        level: PLAYER_BASE_STATS.level,
        exp: PLAYER_BASE_STATS.exp,
        expToNextLevel: PLAYER_BASE_STATS.expToNextLevel,
        gold: PLAYER_BASE_STATS.gold,
        prestigePoints: 0,
        totalPrestiges: 0,
        floor: 1, // 층 (기존 stage 대체)
        highestFloor: 1, // 최고 층
        monstersKilledInFloor: 0, // 현재 층에서 잡은 몬스터 수
        floorState: 'farming', // 'farming', 'boss_ready', 'boss_battle'
        bossTimer: 0, // 보스 타이머 (초)
        hasFailedBoss: false, // 이번 층에서 보스 실패한 적 있는지
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
      inventory: [],
      upgradeCoins: 5000, // 등급업 코인 (테스트용 5000개)
      gearCores: 0, // 기어 코어 (장비 옵션 최대치 강화 아이템)
      skillLevels: {},
      settings: {
        autoSellEnabled: false, // 자동 판매 활성화 여부
        autoSellRarity: 'common' // 자동 판매할 최대 등급
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
        }
      },
      statistics: {
        totalDamageDealt: 0,
        totalGoldEarned: 0,
        totalMonstersKilled: 0,
        totalBossesKilled: 0,
        totalItemsFound: 0,
        totalHeroCardsFound: 0
      }
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

    // 희귀/전설 몬스터 타이머 체크 (5초 = 5000ms)
    if (currentMonster && (currentMonster.isRare || currentMonster.isLegendary) && !currentMonster.isBoss) {
      const elapsedTime = Date.now() - currentMonster.spawnTime;
      if (elapsedTime >= 5000) {
        // 5초 경과 시 몬스터 도망
        this.monsterEscaped();
        return;
      }
    }

    const damage = this.calculateTotalDPS();
    this.dealDamage(damage);
  }

  // 몬스터 도망 (희귀/전설)
  monsterEscaped() {
    const { currentMonster, collection } = this.state;
    const monsterType = currentMonster.isLegendary ? '전설' : '희귀';
    this.addCombatLog(`💨 ${monsterType} 몬스터가 도망갔습니다! ${currentMonster.name}`, 'rare_monster');

    // 새로운 일반 몬스터 생성
    this.state.currentMonster = getMonsterForStage(this.state.player.floor, false, false, false, collection);
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

    Object.entries(equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          if (stat.id === 'attack') {
            equipmentAttackFlat += stat.value * enhancementBonus;
          } else if (stat.id === 'attackPercent') {
            equipmentAttackPercent += stat.value * enhancementBonus;
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

    // 영웅 공격력 추가
    const totalDmg = playerDmg + heroBuffs.attack;

    // 장비 스탯 적용 (크리티컬 등)
    let equipmentCritChance = 0;
    let equipmentCritDmg = 0;
    Object.entries(equipment).forEach(([slot, item]) => {
      if (item) {
        const enhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          if (stat.id === 'critChance') {
            equipmentCritChance += stat.value * enhancementBonus;
          } else if (stat.id === 'critDmg') {
            equipmentCritDmg += stat.value * enhancementBonus;
          }
        });
      }
    });

    // 크리티컬 계산 (장비 + 영웅 버프 포함)
    const critChance = player.stats.critChance + equipmentCritChance + (skillEffects.critChance || 0) + heroBuffs.critChance;
    const critDmg = player.stats.critDmg + equipmentCritDmg + (skillEffects.critDmg || 0) + heroBuffs.critDmg;

    let finalDmg = totalDmg;

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
    if (Math.random() * 100 < critChance) {
      return Math.floor(finalDmg * (critDmg / 100));
    }

    return Math.floor(finalDmg);
  }

  // 데미지 적용
  dealDamage(damage) {
    const { currentMonster, statistics } = this.state;
    
    currentMonster.hp -= damage;
    statistics.totalDamageDealt += damage;
    
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
        const enhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          if (stat.id === 'goldBonus') {
            equipmentGoldBonus += stat.value * enhancementBonus;
          } else if (stat.id === 'expBonus') {
            equipmentExpBonus += stat.value * enhancementBonus;
          } else if (stat.id === 'skipChance') {
            equipmentSkipChance += stat.value * enhancementBonus;
          } else if (stat.id === 'monstersPerStageReduction') {
            equipmentMonsterReduction += stat.value; // 고정값이므로 enhancementBonus 미적용
          }
        });
      }
    });

    // 골드 획득 (장비 + 영웅 버프 포함)
    let goldGained = currentMonster.gold;
    goldGained *= (1 + (player.stats.goldBonus + equipmentGoldBonus + (skillEffects.goldPercent || 0) + (skillEffects.permanentGoldPercent || 0) + heroBuffs.goldBonus) / 100);
    goldGained = Math.floor(goldGained);

    player.gold += goldGained;
    statistics.totalGoldEarned += goldGained;
    statistics.totalMonstersKilled++;

    if (currentMonster.isBoss) {
      statistics.totalBossesKilled++;
    }

    // 경험치 획득 (장비 + 영웅 버프 포함)
    const expGained = Math.floor(EXP_CONFIG.baseExpPerKill * (1 + ((skillEffects.expPercent || 0) + equipmentExpBonus + heroBuffs.expBonus) / 100));
    this.gainExp(expGained);
    
    // 아이템 드랍
    this.tryDropItem();

    // 영웅 카드 드랍
    this.tryDropHeroCard();

    // 등급업 코인 드랍
    this.tryDropUpgradeCoin();

    // 기어 코어 드랍
    this.tryDropGearCore();

    // 희귀 몬스터 도감 등록 (30% 확률)
    if (currentMonster.isRare && !currentMonster.isBoss && currentMonster.monsterIndex !== undefined) {
      // 새로운 ID 형식: rare_floorStart_monsterIndex
      const rangeStart = currentMonster.rangeStart || Math.floor((currentMonster.stage - 1) / 5) * 5 + 1;
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
          this.addCombatLog(`✨ 희귀 몬스터 수집 완료! ${currentMonster.name}`, 'rare_monster');
        } else {
          this.addCombatLog(`⚔️ 희귀 몬스터 처치! ${currentMonster.name} (미수집)`, 'rare_monster');
        }
      }
    }

    // 희귀 보스 도감 등록 (30% 확률)
    if (currentMonster.isRare && currentMonster.isBoss) {
      // ID 형식: rare_boss_floorStart
      const rangeStart = currentMonster.rangeStart || Math.floor((currentMonster.stage - 1) / 5) * 5 + 1;
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
      const rangeStart = currentMonster.rangeStart || Math.floor((currentMonster.stage - 1) / 5) * 5 + 1;
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

    // 장비로 인한 몬스터 감소 적용 (최소 5마리는 유지)
    const actualMonstersPerFloor = Math.max(5, FLOOR_CONFIG.monstersPerFloor - equipmentMonsterReduction);

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
      // 보스 처치 성공 -> 다음 층으로 진행
      player.floor++;
      if (player.floor > player.highestFloor) {
        player.highestFloor = player.floor;
      }
      player.monstersKilledInFloor = 0;
      player.floorState = 'farming';
      player.bossTimer = 0;
      player.hasFailedBoss = false; // 새 층 시작 시 초기화

      // 새 층의 일반 몬스터 생성
      this.state.currentMonster = getMonsterForStage(player.floor, false, false, false, collection);
    } else {
      // 일반 몬스터 처치
      player.monstersKilledInFloor++;

      // 필요한 마리수 처치 시
      if (player.monstersKilledInFloor >= actualMonstersPerFloor) {
        // 처음 도달한 경우 자동으로 보스방 입장
        if (!player.hasFailedBoss) {
          player.floorState = 'boss_battle';
          player.bossTimer = FLOOR_CONFIG.bossTimeLimit;
          // 보스 몬스터 생성
          this.state.currentMonster = getMonsterForStage(player.floor, true, false, false, collection);
        } else {
          // 실패한 적이 있으면 boss_ready 상태로 (수동 입장 대기)
          player.floorState = 'boss_ready';
          // 일반 몬스터 생성
          this.state.currentMonster = getMonsterForStage(player.floor, false, false, false, collection);
        }
      } else {
        // 다음 몬스터 생성 (같은 층)
        this.state.currentMonster = getMonsterForStage(player.floor, false, false, false, collection);
      }
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
        const enhancementBonus = 1 + ((slotEnhancements[slot] || 0) * EQUIPMENT_CONFIG.enhancement.statBonusPerLevel / 100);
        item.stats.forEach(stat => {
          if (stat.id === 'dropRate') {
            equipmentDropRate += stat.value * enhancementBonus;
          }
        });
      }
    });

    const dropChance = player.stats.dropRate + equipmentDropRate + (skillEffects.dropRate || 0) + heroDropRateBonus;
    
    if (Math.random() * 100 < dropChance) {
      const slots = ['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'];
      const randomSlot = slots[Math.floor(Math.random() * slots.length)];
      const item = generateItem(randomSlot, player.floor);

      // 자동 판매 체크
      const settings = this.state.settings || {};
      if (settings.autoSellEnabled) {
        const rarityOrder = ['common', 'rare', 'epic', 'unique', 'legendary', 'mythic', 'dark'];
        const itemRarityIndex = rarityOrder.indexOf(item.rarity);
        const maxRarityIndex = rarityOrder.indexOf(settings.autoSellRarity || 'common');

        // 설정한 등급 이하면 즉시 판매
        if (itemRarityIndex <= maxRarityIndex && itemRarityIndex !== -1) {
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

          player.gold += price;
          // 자동 판매된 아이템은 인벤토리에 추가하지 않음
          this.addCombatLog(`${item.name} 자동 판매 +${price.toLocaleString()}G`, 'sold', item.rarity);
        } else {
          // 설정한 등급보다 높으면 인벤토리에 추가
          inventory.push(item);
          this.addCombatLog(`${item.name} 획득!`, 'acquired', item.rarity);
        }
      } else {
        // 자동 판매 비활성화 시 인벤토리에 추가
        inventory.push(item);
        this.addCombatLog(`${item.name} 획득!`, 'acquired', item.rarity);
      }

      statistics.totalItemsFound++;

      // 도감 등록
      const itemKey = `${item.slot}_${item.rarity}`;
      if (!collection.items[itemKey]) {
        collection.items[itemKey] = {
          slot: item.slot,
          rarity: item.rarity,
          name: item.name,
          count: 0
        };
      }
      collection.items[itemKey].count++;
    }
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

  // 등급업 코인 드랍 시도
  tryDropUpgradeCoin() {
    const { player } = this.state;

    // 드랍 확률 계산
    const dropChance = calculateUpgradeCoinDropChance(player.floor);

    if (Math.random() * 100 < dropChance) {
      // 코인 수량 계산
      const coinAmount = calculateUpgradeCoinAmount(player.floor);
      this.state.upgradeCoins += coinAmount;

      return coinAmount;
    }

    return 0;
  }

  // 기어 코어 드랍 시도
  tryDropGearCore() {
    // 0.003% 확률
    if (Math.random() * 100 < GEAR_CORE_DROP_RATE) {
      this.state.gearCores += 1;
      this.addCombatLog('⚙️ 기어 코어 획득!', 'gear_core');
      return true;
    }
    return false;
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
    }
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

    // 리셋 (일부 제외)
    const newState = this.getDefaultState();
    newState.player.prestigePoints = player.prestigePoints;
    newState.player.totalPrestiges = player.totalPrestiges;
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
    
    const cost = Math.floor(skill.costPerLevel * Math.pow(skill.costMultiplier, currentLevel));
    const costType = skill.costType || 'gold';
    
    if (costType === 'pp') {
      if (player.prestigePoints >= cost) {
        player.prestigePoints -= cost;
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
    const { player, equipment, slotEnhancements } = this.state;

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

    const actualMonstersPerFloor = Math.max(5, FLOOR_CONFIG.monstersPerFloor - equipmentMonsterReduction);

    // 보스방 입장 가능 조건: 필요한 몬스터 수 처치
    if (player.monstersKilledInFloor < actualMonstersPerFloor) {
      return false;
    }

    // 보스 전투 시작
    player.floorState = 'boss_battle';
    player.bossTimer = FLOOR_CONFIG.bossTimeLimit;

    // 보스 몬스터 생성
    this.state.currentMonster = getMonsterForStage(player.floor, true, false, false, this.state.collection);

    return true;
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
    this.state.currentMonster = getMonsterForStage(player.floor, false, false, false, collection);
  }

  // 슬롯 강화
  enhanceSlot(slot) {
    const { player } = this.state;
    const slotEnhancements = this.state.slotEnhancements || {};
    const currentLevel = slotEnhancements[slot] || 0;

    // 최대 레벨 체크
    if (currentLevel >= EQUIPMENT_CONFIG.enhancement.maxLevel) {
      return { success: false, message: '최대 강화 레벨입니다' };
    }

    // 비용 계산
    const cost = Math.floor(
      EQUIPMENT_CONFIG.enhancement.baseCost *
      Math.pow(EQUIPMENT_CONFIG.enhancement.costMultiplier, currentLevel)
    );

    // 골드 확인
    if (player.gold < cost) {
      return { success: false, message: '골드가 부족합니다', cost };
    }

    // 강화 실행
    player.gold -= cost;

    // slotEnhancements가 없으면 초기화
    if (!this.state.slotEnhancements) {
      this.state.slotEnhancements = {};
    }

    this.state.slotEnhancements[slot] = currentLevel + 1;

    return {
      success: true,
      message: '강화 성공!',
      newLevel: this.state.slotEnhancements[slot],
      cost
    };
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

  // 설정 업데이트
  updateSettings(newSettings) {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings
    };
  }

  // 기어 코어 사용 (장비의 특정 옵션을 최대값으로 강화)
  useGearCore(slot, statIndex) {
    const { equipment } = this.state;

    // 기어 코어 소지 확인
    if (this.state.gearCores < 1) {
      return { success: false, message: '기어 코어가 부족합니다' };
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

    // 옵션 강화
    const success = upgradeItemStatToMax(item, statIndex);
    if (!success) {
      return { success: false, message: '강화에 실패했습니다' };
    }

    // 기어 코어 소모
    this.state.gearCores -= 1;

    return {
      success: true,
      message: `${item.stats[statIndex].name} 옵션을 최대치로 강화했습니다!`,
      stat: item.stats[statIndex]
    };
  }

  // 도감 보너스 계산 (층별 5층 단위로 보너스 누적)
  calculateCollectionBonus() {
    const { collection, player } = this.state;
    let totalBonus = { attack: 0, goldBonus: 0, expBonus: 0 };

    // rareMonsters가 없으면 초기화
    if (!collection.rareMonsters) {
      collection.rareMonsters = {};
    }

    // 희귀 몬스터 도감 기준으로 10층 구간별 보너스 계산
    const maxFloorRange = Math.floor(player.highestFloor / 10) * 10;

    for (let floorStart = 1; floorStart <= maxFloorRange; floorStart += 10) {
      // 해당 10층 구간의 희귀 몬스터들 (2마리: floorStart와 floorStart+5)
      const rare1Id = `rare_${floorStart}`;
      const rare2Id = `rare_${floorStart + 5}`;

      let collectedCount = 0;
      if (collection.rareMonsters[rare1Id]?.unlocked) collectedCount++;
      if (collection.rareMonsters[rare2Id]?.unlocked) collectedCount++;

      const totalCount = 2; // 10층 구간당 희귀 몬스터 2마리

      // 해당 구간의 보너스 계산
      const bonus = getCollectionBonus(collectedCount, totalCount);
      totalBonus.attack += bonus.attack;
      totalBonus.goldBonus += bonus.goldBonus;
      totalBonus.expBonus += bonus.expBonus;
    }

    return totalBonus;
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

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = newState;
  }
}
