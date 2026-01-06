/**
 * 게임 수식 문서
 * 모든 효과의 계산 공식을 정리한 파일
 */

// ============================================
// 유물 효과 수식
// ============================================

export const RELIC_FORMULAS = {
  // === 귀환 & 고대 유물 관련 ===
  relicFragmentPercent: {
    name: '심연의 서',
    description: '귀환당 고대 유물 획득량 증가',
    formula: '고대유물 = 기본획득량 × (1 + relicFragmentPercent / 100)',
    effectPerLevel: { mythic: 30 }, // %
    location: 'GameEngine.prestige()'
  },
  relicUpgradeCostReduction: {
    name: '망각의 가면',
    description: '유물 업그레이드 비용 감소',
    formula: '비용 = 기본비용 × (1 - reduction / 100)',
    effectPerLevel: { mythic: 15 }, // %
    maxReduction: 90, // 최대 90% 감소
    location: 'GameEngine.upgradeRelic()'
  },
  damagePerRelic: {
    name: '별의 파편',
    description: '보유 유물 개수당 모든 데미지 증가',
    formula: '데미지 × (1 + 보유유물수 × damagePerRelic / 100)',
    effectPerLevel: { mythic: 5 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },

  // === 골드 관련 ===
  goldPercent: {
    name: '황금의 예언서',
    description: '모든 골드 획득량 증가',
    formula: 'goldBonus += goldPercent × goldRelicMultiplier',
    effectPerLevel: { mythic: 70 }, // %
    location: 'GameEngine.killMonster()'
  },
  normalMonsterGold: {
    name: '탐욕의 그릇',
    description: '일반 몬스터 골드 증가',
    formula: 'goldBonus += normalMonsterGold × goldRelicMultiplier (일반몬스터만)',
    effectPerLevel: { mythic: 100 }, // %
    location: 'GameEngine.killMonster()'
  },
  bossGold: {
    name: '군주의 금고',
    description: '보스 골드 증가',
    formula: 'goldBonus += bossGold × goldRelicMultiplier (보스만)',
    effectPerLevel: { mythic: 130 }, // %
    location: 'GameEngine.killMonster()'
  },
  rareMonsterGold: {
    name: '요정의 축복',
    description: '희귀/전설 몬스터 골드 증가',
    formula: 'goldBonus += rareMonsterGold × goldRelicMultiplier (희귀/전설만)',
    effectPerLevel: { mythic: 160 }, // %
    location: 'GameEngine.killMonster()'
  },
  goldRelicBonus: {
    name: '부의 보물상자',
    description: '골드 관련 모든 유물 효과 증가',
    formula: 'goldRelicMultiplier = 1 + goldRelicBonus / 100',
    effectPerLevel: { mythic: 30 }, // %
    location: 'GameEngine.killMonster()'
  },
  gold10xChance: {
    name: '기적의 성배',
    description: '확률로 골드 10배 획득',
    formula: 'if (random < gold10xChance) gold × 10',
    effectPerLevel: { mythic: 10 }, // %
    maxLevel: 20,
    location: 'GameEngine.killMonster()'
  },

  // === 데미지 관련 ===
  damagePercent: {
    name: '파멸의 칼날',
    description: '모든 데미지 증가',
    formula: '데미지 × (1 + damagePercent × damageRelicMultiplier / 100)',
    effectPerLevel: { mythic: 70 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  critDmg: {
    name: '보복자의 인장',
    description: '크리티컬 데미지 증가',
    formula: 'critDmg += critDmg유물 × damageRelicMultiplier',
    effectPerLevel: { mythic: 140 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  bossDamage: {
    name: '거인 학살자',
    description: '보스 데미지 증가',
    formula: '보스한정: 데미지 × (1 + bossDamage × damageRelicMultiplier / 100)',
    effectPerLevel: { mythic: 110 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  critChance: {
    name: '살육의 도끼',
    description: '크리티컬 확률 증가',
    formula: 'critChance += critChance유물 × damageRelicMultiplier',
    effectPerLevel: { mythic: 8 }, // %
    maxLevel: 30,
    location: 'GameEngine.calculateTotalDPS()'
  },
  damageRelicBonus: {
    name: '고대의 렌즈',
    description: '데미지 관련 모든 유물 효과 증가',
    formula: 'damageRelicMultiplier = 1 + damageRelicBonus / 100',
    effectPerLevel: { mythic: 30 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },

  // === 장비 관련 ===
  equipmentPercent: {
    name: '발견의 나침반',
    description: '모든 장비 능력치 증가',
    formula: 'relicSlotBonus = 1 + equipmentPercent/100 + slotBonuses[slot]',
    effectPerLevel: { mythic: 30 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  weaponPercent: {
    name: '전쟁의 각인',
    description: '무기 능력치 증가',
    formula: 'slotBonuses.weapon += weaponPercent / 100',
    effectPerLevel: { mythic: 45 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  helmetPercent: {
    name: '광기의 투구',
    description: '투구 능력치 증가',
    formula: 'slotBonuses.helmet += helmetPercent / 100',
    effectPerLevel: { mythic: 45 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  armorPercent: {
    name: '티타늄 갑옷',
    description: '갑옷 능력치 증가',
    formula: 'slotBonuses.armor += armorPercent / 100',
    effectPerLevel: { mythic: 45 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  bootsPercent: {
    name: '질주의 신발',
    description: '신발 능력치 증가',
    formula: 'slotBonuses.boots += bootsPercent / 100',
    effectPerLevel: { mythic: 45 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  necklacePercent: {
    name: '달빛 목걸이',
    description: '목걸이 능력치 증가',
    formula: 'slotBonuses.necklace += necklacePercent / 100',
    effectPerLevel: { mythic: 45 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  ringPercent: {
    name: '영원의 반지',
    description: '반지 능력치 증가',
    formula: 'slotBonuses.ring += ringPercent / 100',
    effectPerLevel: { mythic: 45 }, // %
    location: 'GameEngine.calculateTotalDPS()'
  },
  equipmentUpgradeCostReduction: {
    name: '찬란한 홀',
    description: '장비 업그레이드 비용 감소',
    formula: '비용 = 기본비용 × (1 - reduction / 100)',
    effectPerLevel: { mythic: 15 }, // %
    location: '미구현 - 추후 슬롯 강화에 적용 예정'
  },

  // === 문양 관련 ===
  inscriptionDamage: {
    name: '폭풍의 문양',
    description: '문양 데미지 보너스 증가',
    formula: '문양최종데미지 × inscriptionDamageBonus (= 1 + inscriptionDamage/100)',
    effectPerLevel: { mythic: 70 }, // %
    location: 'SealedZone.calculateDamage()'
  },
  inscriptionStats: {
    name: '문양의 정수',
    description: '문양 기본 스탯 증가',
    formula: '문양스탯 × inscriptionStatsBonus (= 1 + inscriptionStats/100)',
    effectPerLevel: { mythic: 30 }, // %
    location: 'SealedZone.calculateDamage()'
  },
  inscriptionDropRate: {
    name: '소환의 부적',
    description: '문양 드랍 확률 증가',
    formula: 'dropRate × (1 + inscriptionDropRate / 100), 최대 95%',
    effectPerLevel: { mythic: 30 }, // %
    location: 'GameEngine.tryDropInscription()'
  },

  // === 도감 관련 ===
  collectionGoldBonus: {
    name: '수집가의 휘장',
    description: '도감 수집률 1%당 골드 증가',
    formula: 'goldBonus += 도감수집률% × collectionGoldBonus',
    effectPerLevel: { mythic: 3 }, // % per 1% collection
    note: '도감수집률 = (희귀+전설 수집수) / 200 × 100',
    location: 'GameEngine.calculateCollectionBonus()'
  },
  collectionDamageBonus: {
    name: '탐험가의 일지',
    description: '도감 수집률 1%당 데미지 증가',
    formula: 'attack += 도감수집률% × collectionDamageBonus',
    effectPerLevel: { mythic: 3 }, // % per 1% collection
    note: '도감수집률 = (희귀+전설 수집수) / 200 × 100',
    location: 'GameEngine.calculateCollectionBonus()'
  },

  // === 몬스터 관련 ===
  monsterHpReduction: {
    name: '정복자의 창',
    description: '모든 몬스터 HP 감소 (골드는 원래 HP 기준)',
    formula: 'HP = maxHp × (1 - monsterHpReduction / 100), 최소 1',
    effectPerLevel: { mythic: 15 }, // %
    note: 'originalMaxHp 저장하여 골드는 원래 HP 기준 계산',
    location: 'GameEngine.spawnMonster()'
  },
  monstersPerStageReduction: {
    name: '암흑의 장막',
    description: '스테이지당 몬스터 수 감소',
    formula: 'actualMonsters = max(5, 기본몬스터수 - 장비감소 - 도감감소 - 유물감소)',
    effectPerLevel: { mythic: 8 }, // 마리
    maxLevel: 30,
    location: 'GameEngine.killMonster(), enterBossBattle()'
  },
  rareMonsterSpawn: {
    name: '행운의 알',
    description: '희귀 몬스터 출현 확률 증가',
    formula: 'rareSpawnBonus = rareMonsterSpawn',
    effectPerLevel: { mythic: 15 }, // %
    maxLevel: 50,
    location: 'GameEngine.spawnMonster()'
  },
  legendaryMonsterSpawn: {
    name: '구미호의 구슬',
    description: '전설 몬스터 출현 확률 증가',
    formula: 'legendarySpawnBonus = legendaryMonsterSpawn',
    effectPerLevel: { mythic: 10 }, // %
    maxLevel: 50,
    location: 'GameEngine.spawnMonster()'
  },

  // === 유틸리티 ===
  bossSkipChance: {
    name: '차원의 문',
    description: '보스 층 스킵 확률',
    formula: 'if (random < bossSkipChance) 보스스킵 + 보상획득',
    effectPerLevel: { mythic: 10 }, // %
    maxLevel: 30,
    location: 'GameEngine.enterBossBattle()'
  },
  bossTimeLimit: {
    name: '시간의 모래시계',
    description: '보스 처치 제한시간 증가',
    formula: 'bossTimer = FLOOR_CONFIG.bossTimeLimit + bossTimeLimit',
    effectPerLevel: { mythic: 8 }, // 초
    maxLevel: 50,
    note: '기본 10초 + 유물 효과',
    location: 'GameEngine.enterBossBattle(), killMonster()'
  },
  raidTicketDropRate: {
    name: '도전의 증표',
    description: '봉인구역 도전권 획득 확률 증가',
    formula: 'dropRate = 10 × (1 + raidTicketDropRate / 100)',
    effectPerLevel: { mythic: 30 }, // %
    note: '기본 10% 드랍률',
    location: 'GameEngine.tryDropRaidTicket()'
  }
};

// ============================================
// 유물 가챠/업그레이드 수식
// ============================================

export const RELIC_GACHA_FORMULAS = {
  gachaCost: {
    description: '유물 가챠 비용 (이전 올림 비용 × 1.4)',
    formula: `
      if (gachaCount === 0) return 1;
      let cost = 1;
      for (let i = 0; i < gachaCount; i++) {
        cost = Math.ceil(cost * 1.4);
      }
      return cost;
    `,
    sequence: '1 → 2 → 3 → 5 → 7 → 10 → 14 → 20 → 28 → 40 → ...',
    location: 'prestigeRelics.getRelicGachaCost()'
  },
  upgradeCost: {
    description: '유물 업그레이드 비용',
    formula: `
      baseCost = Math.floor(1 + currentLevel × 0.5);
      reduction = min(relicUpgradeCostReduction, 90);
      cost = max(1, baseCost × (1 - reduction / 100));
    `,
    example: 'Lv1→2: 1개, Lv5→6: 3개, Lv10→11: 6개',
    location: 'prestigeRelics.getRelicUpgradeCost()'
  },
  relicEffect: {
    description: '유물 효과 계산',
    formula: 'effect = effectPerLevel[mythic] × level',
    note: 'mythic 등급의 effectPerLevel 값 사용',
    location: 'prestigeRelics.calculateRelicEffect()'
  }
};

// ============================================
// 귀환 고대유물 획득 수식
// ============================================

export const PRESTIGE_FORMULAS = {
  fragmentsGained: {
    description: '귀환 시 고대 유물 획득량',
    formula: `
      baseFragments = 5;
      floorBonus = floor(player.floor / 20);
      highFloorBonus = floor > 100 ? floor((floor - 100) / 10) : 0;
      fragments = (base + floorBonus + highFloorBonus) × (1 + relicFragmentPercent/100);
    `,
    examples: {
      '50층': '5 + 2 + 0 = 7개',
      '100층': '5 + 5 + 0 = 10개',
      '200층': '5 + 10 + 10 = 25개',
      '500층': '5 + 25 + 40 = 70개'
    },
    location: 'GameEngine.prestige()'
  }
};

// ============================================
// 방어력/방어관통 계산 수식
// ============================================

export const DEFENSE_FORMULAS = {
  // 방어력 적용 공식
  // 실제 데미지 = 원래 데미지 × (1 - 남은 방어율)
  // 남은 방어율 = 방어력 × (1 - 관통1) × (1 - 관통2) × ...

  /**
   * 방어력 관통 후 최종 데미지 배율 계산
   * @param {number} defenseRate - 몬스터 방어율 (0~100, %)
   * @param {number[]} penetrations - 방관 수치 배열 (각각 0~100, %)
   * @returns {number} - 데미지 배율 (0~1)
   */
  calculateDamageMultiplier: (defenseRate, penetrations = []) => {
    // 방어율이 0이면 100% 데미지
    if (defenseRate <= 0) return 1;

    // 방관 수치들을 곱연산으로 적용
    let remainingDefense = defenseRate / 100; // 0~1 범위로 변환

    for (const pen of penetrations) {
      if (pen > 0) {
        remainingDefense *= (1 - pen / 100);
      }
    }

    // 남은 방어율만큼 데미지 감소
    const damageMultiplier = 1 - remainingDefense;

    // 최소 1% 데미지는 보장
    return Math.max(0.01, damageMultiplier);
  },

  /**
   * 총 관통률 계산 (합연산이 아닌 곱연산 결과)
   * @param {number[]} penetrations - 방관 수치 배열 (각각 0~100, %)
   * @returns {number} - 실제 관통률 (0~100, %)
   */
  calculateTotalPenetration: (penetrations = []) => {
    if (penetrations.length === 0) return 0;

    let remainingDefense = 1; // 100% 방어
    for (const pen of penetrations) {
      if (pen > 0) {
        remainingDefense *= (1 - pen / 100);
      }
    }

    // 관통된 비율 반환
    return (1 - remainingDefense) * 100;
  },

  // 방어력 적용 대상
  targets: {
    normalMonster: {
      name: '일반 몬스터',
      defenseRate: 0, // 방어력 없음
    },
    sealedZoneBoss: {
      name: '봉인구역 보스',
      getDefenseRate: (level) => 20 + (level - 1) * 2, // Lv1: 20%, Lv10: 38%, Lv20: 58%
      description: '20% + (레벨-1) × 2%',
    },
    dummyDefense: {
      name: '허수아비 (월요일)',
      defenseRate: 100, // 100% 방어 - 방관 필수
      description: '방관 없으면 데미지 불가',
    },
  },

  // 허수아비 요일별 특성
  // 0: 일요일, 1: 월요일, 2: 화요일, 3: 수요일, 4: 목요일, 5: 금요일, 6: 토요일
  dummyDailyModifiers: {
    0: { // 일요일 - 일반
      name: '자유 수련',
      icon: '☀️',
      description: '제약 없는 자유로운 훈련',
      defenseRate: 0,
      evasionStat: 0, // 회피치 (플레이어 명중과 비교)
      critResist: 0,
    },
    1: { // 월요일 - 방어율 100%
      name: '철벽 수련',
      icon: '🛡️',
      description: '허수아비가 100% 방어율을 가집니다. 방어 관통 스탯이 필요합니다!',
      defenseRate: 100,
      evasionStat: 0,
      critResist: 0,
    },
    2: { // 화요일 - 방어율 100%
      name: '철벽 수련',
      icon: '🛡️',
      description: '허수아비가 100% 방어율을 가집니다. 방어 관통 스탯이 필요합니다!',
      defenseRate: 100,
      evasionStat: 0,
      critResist: 0,
    },
    3: { // 수요일 - 회피
      name: '유령 수련',
      icon: '👻',
      description: '허수아비가 높은 회피치를 가집니다. 명중 스탯이 필요합니다!',
      defenseRate: 0,
      evasionStat: 5000, // 회피치 (플레이어 명중과 비교해서 명중률 계산)
      critResist: 0,
    },
    4: { // 목요일 - 회피
      name: '유령 수련',
      icon: '👻',
      description: '허수아비가 높은 회피치를 가집니다. 명중 스탯이 필요합니다!',
      defenseRate: 0,
      evasionStat: 5000,
      critResist: 0,
    },
    5: { // 금요일 - 크리티컬 저항
      name: '강철 수련',
      icon: '🪨',
      description: '허수아비에게 크리티컬이 50% 확률로만 적용됩니다.',
      defenseRate: 0,
      evasionStat: 0,
      critResist: 50,
    },
    6: { // 토요일 - 크리티컬 저항
      name: '강철 수련',
      icon: '🪨',
      description: '허수아비에게 크리티컬이 50% 확률로만 적용됩니다.',
      defenseRate: 0,
      evasionStat: 0,
      critResist: 50,
    },
  },

  // 현재 요일의 허수아비 특성 가져오기
  getDailyDummyModifier: () => {
    const dayOfWeek = new Date().getDay(); // 0~6
    return DEFENSE_FORMULAS.dummyDailyModifiers[dayOfWeek];
  },

  // 방관 획득처 (예정)
  penetrationSources: {
    equipment: '장비 잠재옵션 (5~15%)',
    setBonus: '세트 효과 (10~20%)',
    inscription: '문양 (5~10%)',
    skill: '스킬 트리 (5~15%)',
    relic: '유물 (10~25%)',
  },
};

// ============================================
// 데미지 계산 종합 수식
// ============================================

export const DAMAGE_CALCULATION = {
  totalDPS: {
    description: '총 데미지 계산 순서',
    steps: [
      '1. 기본 공격력 = player.stats.baseAtk',
      '2. 장비 공격력 추가 (슬롯 강화 + 유물 장비 보너스 적용)',
      '3. 스킬 공격력% 적용',
      '4. 영웅 버프 적용',
      '5. 도감 보너스 적용 (수집가 휘장/탐험가 일지 포함)',
      '6. 방생 보너스 적용',
      '7. 별의 파편 적용 (보유 유물 × damagePerRelic%)',
      '8. 파멸의 칼날 적용 (damagePercent × damageRelicMultiplier)',
      '9. 거인 학살자 적용 (보스한정, bossDamage × damageRelicMultiplier)',
      '10. 체력% 데미지 (다크 리퍼)',
      '11. 도트 데미지 (아크메이지)',
      '12. 크리티컬 적용 (유물 크리확률/데미지 포함)'
    ],
    location: 'GameEngine.calculateTotalDPS()'
  }
};

// ============================================
// 골드 계산 종합 수식
// ============================================

export const GOLD_CALCULATION = {
  goldGained: {
    description: '골드 획득 계산 순서',
    steps: [
      '1. 기본 골드 = 몬스터 originalMaxHp (정복자의 창으로 감소된 HP가 아닌 원래 HP)',
      '2. 기적의 성배 발동 시 × 10',
      '3. goldRelicMultiplier = 1 + goldRelicBonus/100',
      '4. totalGoldBonus 계산:',
      '   - 기본 goldBonus + 장비 + 스킬 + 영웅버프',
      '   - + 황금의 예언서 (goldPercent × goldRelicMultiplier)',
      '   - + 몬스터유형별 (bossGold/rareMonsterGold/normalMonsterGold × goldRelicMultiplier)',
      '5. 최종 골드 = floor(goldGained × (1 + totalGoldBonus/100))'
    ],
    location: 'GameEngine.killMonster()'
  }
};
