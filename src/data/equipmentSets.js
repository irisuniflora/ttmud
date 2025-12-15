// 새로운 장비 시스템 - 세트 아이템 & 템렙

// ===== 장비 슬롯 =====
export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'];

export const EQUIPMENT_SLOT_NAMES = {
  weapon: '무기',
  armor: '갑옷',
  gloves: '장갑',
  boots: '신발',
  necklace: '목걸이',
  ring: '반지'
};

// ===== 세트 아이템 10종 =====
export const EQUIPMENT_SETS = {
  berserker: {
    id: 'berserker',
    name: '심연의 광전사',
    description: '심연에서 태어난 광기의 전사',
    color: '#FF4444', // 빨강
    icon: '🔥',
    setBonus: {
      3: {
        name: '광전사의 분노',
        effects: { attackPercent: 30 },
        description: '공격력 +30%'
      },
      6: {
        name: '심연의 광기',
        effects: { attackPercent: 30, critDmg: 100 },
        description: '공격력 +30%, 치명타 데미지 +100%'
      }
    }
  },
  reaper: {
    id: 'reaper',
    name: '죽음을 부르는 자',
    description: '죽음의 그림자를 두른 암살자',
    color: '#8B00FF', // 보라
    icon: '💀',
    setBonus: {
      3: {
        name: '죽음의 속삭임',
        effects: { critChance: 15 },
        description: '치명타 확률 +15%'
      },
      6: {
        name: '사신의 낫',
        effects: { critChance: 15, doubleStrike: true },
        description: '치명타 확률 +15%, 치명타 시 2회 공격'
      }
    }
  },
  golden: {
    id: 'golden',
    name: '황금빛 수집가',
    description: '부를 향한 끝없는 욕망',
    color: '#FFD700', // 금색
    icon: '💰',
    setBonus: {
      3: {
        name: '황금의 축복',
        effects: { goldBonus: 50 },
        description: '골드 획득 +50%'
      },
      6: {
        name: '미다스의 손',
        effects: { goldBonus: 150, bossGoldMultiplier: 2 },
        description: '골드 획득 +150%, 보스 골드 2배'
      }
    }
  },
  sage: {
    id: 'sage',
    name: '영원의 현자',
    description: '시간을 초월한 지식의 수호자',
    color: '#00BFFF', // 하늘색
    icon: '📚',
    setBonus: {
      3: {
        name: '현자의 가르침',
        effects: { expBonus: 50 },
        description: '경험치 +50%'
      },
      6: {
        name: '영원의 지혜',
        effects: { expBonus: 150, cooldownReduction: 20 },
        description: '경험치 +150%, 스킬 쿨타임 -20%'
      }
    }
  },
  wind: {
    id: 'wind',
    name: '바람을 삼킨 자',
    description: '바람보다 빠른 전설의 추격자',
    color: '#00FF7F', // 연두
    icon: '⚡',
    setBonus: {
      3: {
        name: '질풍의 발걸음',
        effects: { monstersPerStageReduction: 5 },
        description: '스테이지 몬스터 -5'
      },
      6: {
        name: '폭풍의 현신',
        effects: { monstersPerStageReduction: 15, bossSkipChance: 10 },
        description: '스테이지 몬스터 -15, 보스 스킵 +10%'
      }
    }
  },
  destroyer: {
    id: 'destroyer',
    name: '파멸의 인도자',
    description: '보스를 사냥하는 최강의 사냥꾼',
    color: '#FF6600', // 주황
    icon: '🛡️',
    setBonus: {
      3: {
        name: '파멸의 징조',
        effects: { bossDamageIncrease: 50 },
        description: '보스 데미지 +50%'
      },
      6: {
        name: '종말의 선고',
        effects: { bossDamageIncrease: 150, bossTimeBonus: 10 },
        description: '보스 데미지 +150%, 보스 타이머 +10초'
      }
    }
  },
  shadow: {
    id: 'shadow',
    name: '어둠의 추적자',
    description: '그림자 속에서 보물을 찾는 자',
    color: '#9CA3AF', // 반짝이는 회색
    icon: '🌙',
    setBonus: {
      3: {
        name: '어둠의 눈',
        effects: { dropRate: 30 },
        description: '드랍률 +30%'
      },
      6: {
        name: '심연의 사냥꾼',
        effects: { dropRate: 80, setDropRate: 5 },
        description: '드랍률 +80%, 세트템 드랍률 +5%'
      }
    }
  },
  star: {
    id: 'star',
    name: '별을 쏘는 자',
    description: '별의 힘을 다루는 마법사',
    color: '#FF69B4', // 핑크
    icon: '🔮',
    setBonus: {
      3: {
        name: '별의 가호',
        effects: { skillDamage: 50 },
        description: '스킬 데미지 +50%'
      },
      6: {
        name: '유성우',
        effects: { skillDamage: 150, cooldownReduction: 30 },
        description: '스킬 데미지 +150%, 스킬 쿨타임 -30%'
      }
    }
  },
  fortune: {
    id: 'fortune',
    name: '운명의 유랑자',
    description: '행운을 타고난 방랑자',
    color: '#9B2335', // 와인/루비
    icon: '💎',
    setBonus: {
      3: {
        name: '행운의 바람',
        effects: { allBonus: 20 },
        description: '모든 획득량 +20%'
      },
      6: {
        name: '운명의 장난',
        effects: { allBonus: 50, perfectOptionChance: 2 },
        description: '모든 획득량 +50%, 극옵 확률 2배'
      }
    }
  },
  dimension: {
    id: 'dimension',
    name: '차원의 방랑자',
    description: '차원을 넘나드는 초월자',
    color: '#00CED1', // 청록/시안
    icon: '🌀',
    setBonus: {
      3: {
        name: '차원의 틈새',
        effects: { ppBonus: 30 },
        description: 'PP 획득 +30%'
      },
      6: {
        name: '시공의 지배자',
        effects: { ppBonus: 80, prestigeStartFloor: 5 },
        description: 'PP 획득 +80%, 환생 시 5층 시작'
      }
    }
  }
};

// ===== 기본 옵션 (슬롯별 고정, 옵션등급 없음) =====
// 무기/갑옷: 복리 20% 성장
// 장갑/악세서리: 선형 증가
export const MAIN_STATS = {
  // 딜링 슬롯
  weapon: { id: 'attack', name: '공격력', base: 100, suffix: '', roundTo: 0, growth: 'compound', compoundRate: 0.20 },
  armor: { id: 'accuracy', name: '명중치', base: 30, suffix: '', roundTo: 0, growth: 'compound', compoundRate: 0.20 },
  gloves: { id: 'critChance', name: '치명타 확률', base: 5, perLevel: 1, suffix: '%', roundTo: 0, max: 100, growth: 'linear' }, // 5% + 1%/레벨
  // 악세서리 슬롯 (선형 증가)
  boots: { id: 'monstersPerStageReduction', name: '몬스터 감소', base: 5, perLevel: 1, suffix: '', roundTo: 0, growth: 'linear', isReduction: true },
  necklace: { id: 'skipChance', name: '스킵 확률', base: 5, perLevel: 0.5, suffix: '%', roundTo: 1, growth: 'linear' },
  ring: { id: 'ppBonus', name: '환생 포인트', base: 10, perLevel: 2, suffix: '%', roundTo: 0, growth: 'linear' }
};

// ===== 잠재 옵션 (랜덤) =====
export const POTENTIAL_STATS = {
  // 딜링 잠재옵션 (무기, 갑옷, 장갑)
  // 10레벨 구간마다 tierGrowth만큼 추가 (Lv.1-10: base, Lv.11-20: base+tierGrowth, ...)
  attackPercent: { base: 9, tierGrowth: 3, name: '공격력%', suffix: '%' },
  critDmg: { base: 6, tierGrowth: 2, name: '치명타 데미지', suffix: '%' },
  bossDamageIncrease: { base: 6, tierGrowth: 2, name: '보스 추가 데미지', suffix: '%' },

  // 유틸 잠재옵션 (신발, 목걸이, 반지)
  goldBonus: { base: 20, tierGrowth: 5, name: '골드 획득량', suffix: '%' },
  expBonus: { base: 20, tierGrowth: 5, name: '경험치 획득량', suffix: '%' },
  dropRate: { base: 10, tierGrowth: 2, name: '드랍률', suffix: '%' }
};

// 치명타 확률 최대치 (100% 초과분은 치명타 데미지 2배로 전환)
export const CRIT_CHANCE_CAP = 100;

// ===== 옵션 등급 시스템 =====
// 옵션 등급: 0=하옵(80%), 1=중옵(90%), 2=극옵(100%)
export const OPTION_GRADES = {
  LOW: 0,    // 하옵 80%
  MID: 1,    // 중옵 90%
  HIGH: 2    // 극옵 100%
};

export const OPTION_GRADE_MULTIPLIERS = {
  [OPTION_GRADES.LOW]: 0.8,
  [OPTION_GRADES.MID]: 0.9,
  [OPTION_GRADES.HIGH]: 1.0
};

// 노말템 확률: 극옵 20%, 중옵 40%, 하옵 40%
// 세트템 확률: 극옵 25%, 중옵 50%, 하옵 25%
export const rollOptionGrade = (isSetItem = false) => {
  const roll = Math.random() * 100;
  if (isSetItem) {
    // 세트템: 극옵 25%, 중옵 50%, 하옵 25%
    if (roll < 25) return OPTION_GRADES.HIGH;
    if (roll < 75) return OPTION_GRADES.MID;
    return OPTION_GRADES.LOW;
  } else {
    // 노말템: 극옵 20%, 중옵 40%, 하옵 40%
    if (roll < 20) return OPTION_GRADES.HIGH;
    if (roll < 60) return OPTION_GRADES.MID;
    return OPTION_GRADES.LOW;
  }
};

export const getGradeMultiplier = (optionGrade) => {
  return OPTION_GRADE_MULTIPLIERS[optionGrade] ?? OPTION_GRADE_MULTIPLIERS[OPTION_GRADES.LOW];
};

// 슬롯별 스탯 타입
export const SLOT_STAT_TYPES = {
  weapon: 'damage',
  armor: 'damage',
  gloves: 'damage',
  boots: 'utility',
  necklace: 'utility',
  ring: 'utility'
};

// 딜링 잠재옵션 목록
export const DAMAGE_POTENTIAL_IDS = ['attackPercent', 'critDmg', 'bossDamageIncrease'];

// 유틸 잠재옵션 목록
export const UTILITY_POTENTIAL_IDS = ['goldBonus', 'expBonus', 'dropRate'];

// 기존 호환용 (deprecated)
export const BASE_STATS = { ...POTENTIAL_STATS };
export const DAMAGE_STAT_IDS = DAMAGE_POTENTIAL_IDS;
export const UTILITY_STAT_IDS = UTILITY_POTENTIAL_IDS;

// ===== 템렙 시스템 =====
export const ITEM_LEVEL_CONFIG = {
  // 기본옵션 증가율: 업그레이드당 5%
  mainStatMultiplier: 0.05,

  // 잠재옵션 증가율: 업그레이드당 2%
  potentialMultiplier: 0.02,

  // 기본 업글 횟수
  defaultUpgradesLeft: 10,

  // 업글 비용 공식: (totalUpgrades + 1) × baseCost
  baseCost: 5
};

// ===== 각성 시스템 =====
export const AWAKENING_CONFIG = {
  // 각성석 가격 (보스 코인)
  stoneCost: 100,
  // 각성 시 복구되는 업그레이드 횟수
  upgradesRestored: 10
};

// 드랍 레벨 계산 (층수 기반)
export const getDropLevel = (floor) => {
  return Math.ceil(floor / 10);
};

// 템렙 강화 비용 계산 (업글 횟수에 따라 증가)
export const getUpgradeCost = (item) => {
  const totalUpgrades = item.totalUpgrades || 0;
  return (totalUpgrades + 1) * ITEM_LEVEL_CONFIG.baseCost;
};

// 업글 가능 여부 확인
export const canUpgradeItem = (item) => {
  // upgradesLeft가 undefined면 기본값(10) 사용
  const upgradesLeft = item.upgradesLeft ?? ITEM_LEVEL_CONFIG.defaultUpgradesLeft;
  return upgradesLeft > 0;
};

// ===== 장비조각 시스템 =====
export const FRAGMENT_CONFIG = {
  // 노말템 분해 시 획득 조각
  normalDisassemble: {
    base: 1,
    perFloor: 0.1 // 템렙 10당 +1개
  },

  // 세트템 분해 시 획득 조각
  setDisassemble: 50
};

// 노말템 분해 시 획득 조각 계산
export const getDisassembleFragments = (item) => {
  if (item.setId) {
    return FRAGMENT_CONFIG.setDisassemble;
  }
  const { base, perFloor } = FRAGMENT_CONFIG.normalDisassemble;
  return Math.floor(base + (item.itemLevel * perFloor));
};

// ===== 드랍률 =====
export const DROP_RATES = {
  // 노말템 드랍률
  normal: {
    monster: 0.15,  // 15%
    boss: 0.80      // 80%
  },

  // 세트템 드랍률
  set: {
    monster: 0.003, // 0.3%
    boss: 0.03      // 3%
  }
};

// ===== 아이템 생성 =====

// 기본옵션 값 계산 (슬롯 + 템렙 기반)
// 딜링 슬롯: 복리 20% 성장
// 악세서리 슬롯: 선형 증가
export const calculateMainStatValue = (slot, itemLevel) => {
  const mainStat = MAIN_STATS[slot];
  if (!mainStat) return 0;

  let rawValue;

  if (mainStat.growth === 'linear') {
    // 선형 증가: base + perLevel * (itemLevel - 1)
    // Lv.1은 기본값, Lv.2부터 perLevel씩 증가
    rawValue = mainStat.base + (mainStat.perLevel || 0) * Math.max(0, itemLevel - 1);
  } else {
    // 복리 성장: base * (1 + rate)^(itemLevel-1)
    // Lv.1은 기본값, Lv.2부터 복리 적용
    const rate = mainStat.compoundRate || 0.20; // 기본 20%
    const compoundMultiplier = Math.pow(1 + rate, Math.max(0, itemLevel - 1));
    rawValue = mainStat.base * compoundMultiplier;
  }

  // 올림 처리 (roundTo: 0 = 일의자리, 1 = 소수점 첫째자리)
  const roundTo = mainStat.roundTo ?? 1;
  const factor = Math.pow(10, roundTo);
  return Math.ceil(rawValue * factor) / factor;
};

// 잠재옵션 값 계산 (템렙 기반, 10레벨 구간 시스템)
// Lv.1-10: base, Lv.11-20: base+tierGrowth, Lv.21-30: base+tierGrowth*2, ...
export const calculatePotentialValue = (statId, itemLevel) => {
  const statConfig = POTENTIAL_STATS[statId];
  if (!statConfig) return 0;

  // 10레벨 단위 구간 계산 (Lv.1-10 = tier 0, Lv.11-20 = tier 1, ...)
  const tier = Math.floor((itemLevel - 1) / 10);
  const tierBonus = tier * (statConfig.tierGrowth || 0);

  return statConfig.base + tierBonus;
};

// 기존 호환용
export const calculateStatValue = calculatePotentialValue;

// 노말 아이템 생성 (세트템 대비 60% 성능)
export const generateNormalItem = (slot, floor) => {
  const statType = SLOT_STAT_TYPES[slot];
  const potentialIds = statType === 'damage' ? DAMAGE_POTENTIAL_IDS : UTILITY_POTENTIAL_IDS;
  const itemLevel = getDropLevel(floor);

  // 기본옵션 생성 (세트템의 60%)
  const mainStatConfig = MAIN_STATS[slot];
  const mainStat = {
    id: mainStatConfig.id,
    name: mainStatConfig.name,
    value: calculateMainStatValue(slot, itemLevel) * 0.6,
    suffix: mainStatConfig.suffix,
    isMain: true,
    max: mainStatConfig.max ? mainStatConfig.max * 0.6 : null
  };

  // 잠재옵션 3개 (세트템과 동일 개수, 하지만 최대치가 60%)
  const potentials = [];
  for (let i = 0; i < 3; i++) {
    const statId = potentialIds[Math.floor(Math.random() * potentialIds.length)];
    const statConfig = POTENTIAL_STATS[statId];
    const baseValue = calculatePotentialValue(statId, itemLevel);
    const optionGrade = rollOptionGrade(false); // 노말템
    const gradeMultiplier = getGradeMultiplier(optionGrade);

    // 노말템 60% 페널티 적용 + 반올림(소수점 첫째자리)
    const rawValue = baseValue * gradeMultiplier * 0.6;
    const finalValue = Math.round(rawValue * 10) / 10;

    potentials.push({
      id: statId,
      name: statConfig.name,
      value: Math.max(0, finalValue),
      suffix: statConfig.suffix,
      optionGrade,
      isMain: false
    });
  }

  // stats 배열에 기본옵션 + 잠재옵션 합침
  const stats = [mainStat, ...potentials];

  return {
    id: `normal_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    type: 'normal',
    slot,
    name: EQUIPMENT_SLOT_NAMES[slot],
    itemLevel,
    baseItemLevel: itemLevel,
    dropFloor: floor,
    upgradesLeft: ITEM_LEVEL_CONFIG.defaultUpgradesLeft,
    totalUpgrades: 0,
    stats,
    mainStat, // 기본옵션 별도 저장
    potentials, // 잠재옵션 별도 저장
    createdAt: Date.now()
  };
};

// 세트 아이템 생성
export const generateSetItem = (slot, floor, setId = null) => {
  // 세트 랜덤 선택 (지정되지 않은 경우)
  const setIds = Object.keys(EQUIPMENT_SETS);
  const selectedSetId = setId || setIds[Math.floor(Math.random() * setIds.length)];
  const setData = EQUIPMENT_SETS[selectedSetId];
  const itemLevel = getDropLevel(floor);

  const statType = SLOT_STAT_TYPES[slot];
  const potentialIds = statType === 'damage' ? DAMAGE_POTENTIAL_IDS : UTILITY_POTENTIAL_IDS;

  // 기본옵션 생성
  const mainStatConfig = MAIN_STATS[slot];
  const mainStat = {
    id: mainStatConfig.id,
    name: mainStatConfig.name,
    value: calculateMainStatValue(slot, itemLevel),
    suffix: mainStatConfig.suffix,
    isMain: true,
    max: mainStatConfig.max || null
  };

  // 세트템 잠재옵션 3개 (세트템은 하옵 확률 낮춤)
  const potentials = [];
  for (let i = 0; i < 3; i++) {
    const statId = potentialIds[Math.floor(Math.random() * potentialIds.length)];
    const statConfig = POTENTIAL_STATS[statId];
    const baseValue = calculatePotentialValue(statId, itemLevel);
    const optionGrade = rollOptionGrade(true); // 세트템
    const gradeMultiplier = getGradeMultiplier(optionGrade);

    // 반올림(소수점 첫째자리)
    const rawValue = baseValue * gradeMultiplier;
    const finalValue = Math.round(rawValue * 10) / 10;

    potentials.push({
      id: statId,
      name: statConfig.name,
      value: Math.max(0, finalValue),
      suffix: statConfig.suffix,
      optionGrade,
      isMain: false
    });
  }

  // stats 배열에 기본옵션 + 잠재옵션 합침
  const stats = [mainStat, ...potentials];

  return {
    id: `set_${selectedSetId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    type: 'set',
    setId: selectedSetId,
    setName: setData.name,
    setColor: setData.color,
    setIcon: setData.icon,
    slot,
    name: `${setData.name} ${EQUIPMENT_SLOT_NAMES[slot]}`,
    itemLevel,
    baseItemLevel: itemLevel,
    dropFloor: floor,
    upgradesLeft: ITEM_LEVEL_CONFIG.defaultUpgradesLeft,
    totalUpgrades: 0,
    stats,
    mainStat, // 기본옵션 별도 저장
    potentials, // 잠재옵션 별도 저장
    createdAt: Date.now()
  };
};

// 아이템 드랍 롤 (몬스터 처치 시)
export const rollItemDrop = (floor, isBoss = false, setDropBonus = 0) => {
  const items = [];

  // 세트템 드랍 체크
  const setDropRate = isBoss ? DROP_RATES.set.boss : DROP_RATES.set.monster;
  const finalSetDropRate = setDropRate * (1 + setDropBonus / 100);

  if (Math.random() < finalSetDropRate) {
    const slots = EQUIPMENT_SLOTS;
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    items.push(generateSetItem(randomSlot, floor));
  }

  // 노말템 드랍 체크
  const normalDropRate = isBoss ? DROP_RATES.normal.boss : DROP_RATES.normal.monster;
  if (Math.random() < normalDropRate) {
    const slots = EQUIPMENT_SLOTS;
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    items.push(generateNormalItem(randomSlot, floor));
  }

  return items;
};

// ===== 세트 효과 계산 =====

// 장착 중인 세트 개수 계산
export const calculateSetCounts = (equippedItems) => {
  const setCounts = {};

  Object.values(equippedItems).forEach(item => {
    if (item && item.setId) {
      setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
    }
  });

  return setCounts;
};

// 활성화된 세트 효과 가져오기
export const getActiveSetBonuses = (equippedItems) => {
  const setCounts = calculateSetCounts(equippedItems);
  const activeBonuses = [];

  Object.entries(setCounts).forEach(([setId, count]) => {
    const setData = EQUIPMENT_SETS[setId];
    if (!setData) return;

    // 6셋 효과
    if (count >= 6 && setData.setBonus[6]) {
      activeBonuses.push({
        setId,
        setName: setData.name,
        tier: 6,
        ...setData.setBonus[6]
      });
    }
    // 3셋 효과 (6셋이 아닐 때만)
    else if (count >= 3 && setData.setBonus[3]) {
      activeBonuses.push({
        setId,
        setName: setData.name,
        tier: 3,
        ...setData.setBonus[3]
      });
    }
  });

  return activeBonuses;
};

// 세트 효과 합산
export const calculateTotalSetEffects = (equippedItems) => {
  const activeBonuses = getActiveSetBonuses(equippedItems);
  const totalEffects = {};

  activeBonuses.forEach(bonus => {
    Object.entries(bonus.effects).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        totalEffects[key] = value;
      } else {
        totalEffects[key] = (totalEffects[key] || 0) + value;
      }
    });
  });

  return totalEffects;
};

// ===== 장비 스탯 합산 =====

// 장착 장비의 총 스탯 계산
export const calculateEquipmentStats = (equippedItems) => {
  const totalStats = {};

  Object.values(equippedItems).forEach(item => {
    if (!item || !item.stats) return;

    item.stats.forEach(stat => {
      totalStats[stat.id] = (totalStats[stat.id] || 0) + stat.value;

      // 치명타 확률 오버플로우 → 치명타 데미지로 전환
      if (stat.overflowCritDmg) {
        totalStats['critDmg'] = (totalStats['critDmg'] || 0) + stat.overflowCritDmg;
      }
    });
  });

  // 치명타 확률 최대 50% 캡 적용
  if (totalStats['critChance'] > CRIT_CHANCE_CAP) {
    const overflow = totalStats['critChance'] - CRIT_CHANCE_CAP;
    totalStats['critChance'] = CRIT_CHANCE_CAP;
    totalStats['critDmg'] = (totalStats['critDmg'] || 0) + (overflow * 2);
  }

  return totalStats;
};

// 전체 장비 효과 계산 (스탯 + 세트효과)
export const calculateTotalEquipmentEffects = (equippedItems) => {
  const baseStats = calculateEquipmentStats(equippedItems);
  const setEffects = calculateTotalSetEffects(equippedItems);

  return {
    baseStats,
    setEffects,
    combined: { ...baseStats, ...setEffects }
  };
};

// ===== 템렙 강화 =====

// 템렙 강화
export const upgradeItemLevel = (item, fragments) => {
  // 업글 횟수 체크
  if (!canUpgradeItem(item)) {
    return { success: false, message: '업그레이드 횟수가 남아있지 않습니다' };
  }

  const cost = getUpgradeCost(item);

  if (fragments < cost) {
    return { success: false, message: `장비조각이 부족합니다 (필요: ${cost}개)` };
  }

  // 스탯 재계산
  const oldLevel = item.itemLevel;
  const newLevel = item.itemLevel + 1;
  item.itemLevel = newLevel;
  item.upgradesLeft = (item.upgradesLeft || ITEM_LEVEL_CONFIG.defaultUpgradesLeft) - 1;
  item.totalUpgrades = (item.totalUpgrades || 0) + 1;

  // 잠재옵션 구간 계산 (Lv.1-10 = tier 0, Lv.11-20 = tier 1, ...)
  // Lv.10 → Lv.11 올리면 바로 티어업!
  const oldPotentialTier = Math.floor(oldLevel / 10);
  const newPotentialTier = Math.floor(newLevel / 10);
  const potentialTierUp = newPotentialTier > oldPotentialTier;

  item.stats.forEach(stat => {
    if (stat.isMain) {
      // 기본옵션: 딜링 슬롯은 복리 5%, 악세서리는 선형 증가
      const mainStatConfig = MAIN_STATS[item.slot];
      // 노말템 60% 패널티 적용
      const normalPenalty = item.type === 'normal' ? 0.6 : 1;
      const rawValue = calculateMainStatValue(item.slot, newLevel) * normalPenalty;
      // 올림 처리 (악세서리는 이미 calculateMainStatValue에서 처리됨)
      const roundTo = mainStatConfig.roundTo ?? 1;
      const factor = Math.pow(10, roundTo);
      stat.value = Math.ceil(rawValue * factor) / factor;

      // 치명타 확률 캡 체크 (100% 초과 시 치명타 데미지로 전환)
      if (stat.id === 'critChance' && stat.value > CRIT_CHANCE_CAP) {
        const overflow = stat.value - CRIT_CHANCE_CAP;
        stat.value = CRIT_CHANCE_CAP;
        stat.overflowCritDmg = overflow * 2;
      }
    } else if (potentialTierUp) {
      // 잠재옵션: 10레벨 구간 돌파 시 tierGrowth만큼 증가
      const statConfig = POTENTIAL_STATS[stat.id];
      const tierBonus = newPotentialTier * (statConfig?.tierGrowth || 0);
      const newBase = statConfig.base + tierBonus;
      const gradeMultiplier = getGradeMultiplier(stat.optionGrade);
      const normalPenalty = item.type === 'normal' ? 0.6 : 1;
      const rawValue = newBase * gradeMultiplier * normalPenalty;
      stat.value = Math.max(0, Math.round(rawValue * 10) / 10);
    }
  });

  return {
    success: true,
    cost,
    oldLevel,
    newLevel,
    upgradesLeft: item.upgradesLeft,
    message: `Lv.${oldLevel} → Lv.${newLevel} 강화 성공! (남은 횟수: ${item.upgradesLeft})`
  };
};

// 장비 각성 (업글 횟수 리셋)
export const awakenItem = (item) => {
  // 각성 횟수 증가 (없으면 0에서 시작)
  item.awakeningCount = (item.awakeningCount || 0) + 1;
  item.upgradesLeft = AWAKENING_CONFIG.upgradesRestored;
  return {
    success: true,
    message: `장비가 ${item.awakeningCount}차 각성되었습니다! 업그레이드 횟수가 ${AWAKENING_CONFIG.upgradesRestored}회로 복구되었습니다.`
  };
};

// 장비 오브로 잠재옵션 재굴림
// 아이템의 현재 템렙 기준으로 잠재옵션을 새로 굴림
// 옵션 등급: 극옵 100% (20% 확률, 빨간색), 중옵 90% (40% 확률, 연두색), 하옵 80% (40% 확률, 회색)
export const rerollItemPotentials = (item) => {
  if (!item || !item.stats) {
    return false;
  }

  const statType = SLOT_STAT_TYPES[item.slot];
  const potentialIds = statType === 'damage' ? DAMAGE_POTENTIAL_IDS : UTILITY_POTENTIAL_IDS;
  const itemLevel = item.itemLevel || 1;
  const isSetItem = item.type === 'set';
  const normalPenalty = isSetItem ? 1 : 0.6;

  // 잠재옵션만 재굴림 (기본옵션은 유지)
  const newPotentials = [];
  for (let i = 0; i < 3; i++) {
    const statId = potentialIds[Math.floor(Math.random() * potentialIds.length)];
    const statConfig = POTENTIAL_STATS[statId];
    const baseValue = calculatePotentialValue(statId, itemLevel);
    const optionGrade = rollOptionGrade(isSetItem);
    const gradeMultiplier = getGradeMultiplier(optionGrade);

    const rawValue = baseValue * gradeMultiplier * normalPenalty;
    const finalValue = Math.round(rawValue * 10) / 10;

    newPotentials.push({
      id: statId,
      name: statConfig.name,
      value: Math.max(0, finalValue),
      suffix: statConfig.suffix,
      optionGrade
    });
  }

  // stats 배열에서 기본옵션(isMain)만 유지하고 잠재옵션 교체
  const mainStat = item.stats.find(s => s.isMain);
  item.stats = mainStat ? [mainStat, ...newPotentials] : newPotentials;
  item.potentials = newPotentials;

  return true;
};

// 완벽의 정수로 잠재옵션 1개를 극옵(100%)으로 변경
export const perfectPotentialStat = (item, statIndex) => {
  if (!item || !item.stats || !item.stats[statIndex]) {
    return false;
  }

  const stat = item.stats[statIndex];

  // 기본옵션(isMain)은 변경 불가
  if (stat.isMain) {
    return false;
  }

  // 몬스터 감소 옵션은 불가
  if (stat.id === 'monstersPerStageReduction') {
    return false;
  }

  // 이미 극옵이면 불가
  if (stat.optionGrade === OPTION_GRADES.HIGH) {
    return false;
  }

  const statConfig = POTENTIAL_STATS[stat.id];
  if (!statConfig) {
    return false;
  }

  const itemLevel = item.itemLevel || 1;
  const baseValue = calculatePotentialValue(stat.id, itemLevel);
  const normalPenalty = item.type === 'normal' ? 0.6 : 1;
  const gradeMultiplier = getGradeMultiplier(OPTION_GRADES.HIGH);

  const rawValue = baseValue * gradeMultiplier * normalPenalty;
  const finalValue = Math.round(rawValue * 10) / 10;

  stat.value = Math.max(0, finalValue);
  stat.optionGrade = OPTION_GRADES.HIGH;

  return true;
};
