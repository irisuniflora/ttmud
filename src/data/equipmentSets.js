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
    color: '#4B0082', // 남색
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
    color: '#32CD32', // 라임
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
    color: '#9400D3', // 진보라
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

// ===== 기본 스탯 (템렙 1 기준) =====
export const BASE_STATS = {
  // 딜링 스탯 (무기, 갑옷, 장갑)
  attack: { base: 10, name: '공격력', suffix: '' },
  critChance: { base: 0.5, name: '치명타 확률', suffix: '%' },
  critDmg: { base: 2, name: '치명타 데미지', suffix: '%' },
  attackPercent: { base: 0.5, name: '공격력', suffix: '%' },
  bossDamageIncrease: { base: 1, name: '보스 추가 데미지', suffix: '%' },
  normalMonsterDamageIncrease: { base: 1, name: '일반몹 추가 데미지', suffix: '%' },

  // 유틸 스탯 (신발, 목걸이, 반지)
  goldBonus: { base: 1, name: '골드 획득', suffix: '%' },
  expBonus: { base: 1, name: '경험치 획득', suffix: '%' },
  dropRate: { base: 0.5, name: '드랍률', suffix: '%' },
  skipChance: { base: 0.3, name: '스킵 확률', suffix: '%' }
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

// 딜링 스탯 목록
export const DAMAGE_STAT_IDS = ['attack', 'critChance', 'critDmg', 'attackPercent', 'bossDamageIncrease', 'normalMonsterDamageIncrease'];

// 유틸 스탯 목록
export const UTILITY_STAT_IDS = ['goldBonus', 'expBonus', 'dropRate', 'skipChance'];

// ===== 템렙 시스템 =====
export const ITEM_LEVEL_CONFIG = {
  // 템렙 스탯 공식: 기본값 × (1 + 템렙 × multiplier)
  statMultiplier: 0.02, // 템렙당 2% 증가

  // 기본 업글 횟수
  defaultUpgradesLeft: 10,

  // 업글 비용 공식: (totalUpgrades + 1) × baseCost
  baseCost: 5
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
  return (item.upgradesLeft || 0) > 0;
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

// 스탯 값 계산 (템렙 기반)
export const calculateStatValue = (statId, itemLevel) => {
  const statConfig = BASE_STATS[statId];
  if (!statConfig) return 0;

  const multiplier = 1 + (itemLevel * ITEM_LEVEL_CONFIG.statMultiplier);
  return statConfig.base * multiplier;
};

// 노말 아이템 생성
export const generateNormalItem = (slot, floor) => {
  const statType = SLOT_STAT_TYPES[slot];
  const statIds = statType === 'damage' ? DAMAGE_STAT_IDS : UTILITY_STAT_IDS;
  const itemLevel = getDropLevel(floor);

  // 랜덤 스탯 3개 선택 (중복 가능)
  const stats = [];
  for (let i = 0; i < 3; i++) {
    const statId = statIds[Math.floor(Math.random() * statIds.length)];
    const statConfig = BASE_STATS[statId];
    const value = calculateStatValue(statId, itemLevel);

    // 옵션 등급 (0.8x ~ 1.5x)
    const optionMultiplier = 0.8 + (Math.random() * 0.7);
    const finalValue = value * optionMultiplier;

    stats.push({
      id: statId,
      name: statConfig.name,
      value: finalValue,
      suffix: statConfig.suffix,
      optionGrade: optionMultiplier
    });
  }

  return {
    id: `normal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'normal',
    slot,
    name: EQUIPMENT_SLOT_NAMES[slot],
    itemLevel,
    baseItemLevel: itemLevel,
    dropFloor: floor,
    upgradesLeft: ITEM_LEVEL_CONFIG.defaultUpgradesLeft,
    totalUpgrades: 0,
    stats,
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
  const statIds = statType === 'damage' ? DAMAGE_STAT_IDS : UTILITY_STAT_IDS;

  // 랜덤 스탯 3개 선택
  const stats = [];
  for (let i = 0; i < 3; i++) {
    const statId = statIds[Math.floor(Math.random() * statIds.length)];
    const statConfig = BASE_STATS[statId];
    const value = calculateStatValue(statId, itemLevel);

    // 세트템은 옵션 등급이 조금 더 좋음 (0.9x ~ 1.5x)
    const optionMultiplier = 0.9 + (Math.random() * 0.6);
    const finalValue = value * optionMultiplier;

    stats.push({
      id: statId,
      name: statConfig.name,
      value: finalValue,
      suffix: statConfig.suffix,
      optionGrade: optionMultiplier
    });
  }

  return {
    id: `set_${selectedSetId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    });
  });

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

  item.stats.forEach(stat => {
    const baseValue = calculateStatValue(stat.id, item.baseItemLevel);
    const newMultiplier = 1 + (newLevel * ITEM_LEVEL_CONFIG.statMultiplier);
    const baseMultiplier = 1 + (item.baseItemLevel * ITEM_LEVEL_CONFIG.statMultiplier);
    stat.value = baseValue * stat.optionGrade * (newMultiplier / baseMultiplier);
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
  item.upgradesLeft = ITEM_LEVEL_CONFIG.defaultUpgradesLeft;
  return {
    success: true,
    message: `장비가 각성되었습니다! 업그레이드 횟수가 ${ITEM_LEVEL_CONFIG.defaultUpgradesLeft}회로 복구되었습니다.`
  };
};
