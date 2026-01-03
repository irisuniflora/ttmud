// 유물 등급 시스템 제거 - 이제 유물은 도감처럼 개별 관리됨
// 가챠로 랜덤 유물을 얻으며, 중복 획득 시 자동 레벨업

// 고대 유물 목록 (36개)
export const PRESTIGE_RELICS = {
  // === 귀환 & 유물 관련 ===
  book_of_abyss: {
    id: 'book_of_abyss',
    name: '심연의 서',
    description: '귀환당 고대 유물 획득량 증가',
    icon: '📖',
    category: 'prestige',
    effectPerLevel: {
      common: 5,
      rare: 8,
      epic: 12,
      legendary: 18,
      mythic: 30
    },
    effectType: 'relicFragmentPercent'
  },

  mask_of_oblivion: {
    id: 'mask_of_oblivion',
    name: '망각의 가면',
    description: '유물 업그레이드 비용 감소',
    icon: '🎭',
    category: 'prestige',
    effectPerLevel: {
      common: 2,
      rare: 3,
      epic: 5,
      legendary: 8,
      mythic: 15
    },
    effectType: 'relicUpgradeCostReduction'
  },

  stellar_fragment: {
    id: 'stellar_fragment',
    name: '별의 파편',
    description: '보유 유물 개수당 모든 데미지 증가',
    icon: '⭐',
    category: 'prestige',
    effectPerLevel: {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 3,
      mythic: 5
    },
    effectType: 'damagePerRelic'
  },

  // === 골드 관련 ===
  golden_prophecy: {
    id: 'golden_prophecy',
    name: '황금의 예언서',
    description: '모든 골드 획득량 증가',
    icon: '📜',
    category: 'gold',
    effectPerLevel: {
      common: 10,
      rare: 15,
      epic: 25,
      legendary: 40,
      mythic: 70
    },
    effectType: 'goldPercent'
  },

  bowl_of_greed: {
    id: 'bowl_of_greed',
    name: '탐욕의 그릇',
    description: '일반 몬스터 골드 증가',
    icon: '🏺',
    category: 'gold',
    effectPerLevel: {
      common: 15,
      rare: 25,
      epic: 40,
      legendary: 60,
      mythic: 100
    },
    effectType: 'normalMonsterGold'
  },

  lords_treasury: {
    id: 'lords_treasury',
    name: '군주의 금고',
    description: '보스 골드 증가',
    icon: '💰',
    category: 'gold',
    effectPerLevel: {
      common: 20,
      rare: 30,
      epic: 50,
      legendary: 80,
      mythic: 130
    },
    effectType: 'bossGold'
  },

  fairys_blessing: {
    id: 'fairys_blessing',
    name: '요정의 축복',
    description: '희귀/전설 몬스터 골드 증가',
    icon: '🧚',
    category: 'gold',
    effectPerLevel: {
      common: 25,
      rare: 40,
      epic: 65,
      legendary: 100,
      mythic: 160
    },
    effectType: 'rareMonsterGold'
  },

  treasure_chest: {
    id: 'treasure_chest',
    name: '부의 보물상자',
    description: '골드 관련 모든 유물 효과 증가',
    icon: '🎁',
    category: 'gold',
    effectPerLevel: {
      common: 5,
      rare: 8,
      epic: 12,
      legendary: 18,
      mythic: 30
    },
    effectType: 'goldRelicBonus'
  },

  chalice_of_miracle: {
    id: 'chalice_of_miracle',
    name: '기적의 성배',
    description: '확률로 골드 10배 획득',
    icon: '🏆',
    category: 'gold',
    maxLevel: 20,
    effectPerLevel: {
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 10
    },
    effectType: 'gold10xChance'
  },

  // === 데미지 관련 ===
  blade_of_ruin: {
    id: 'blade_of_ruin',
    name: '파멸의 칼날',
    description: '모든 데미지 증가',
    icon: '⚔️',
    category: 'damage',
    effectPerLevel: {
      common: 10,
      rare: 15,
      epic: 25,
      legendary: 40,
      mythic: 70
    },
    effectType: 'damagePercent'
  },

  seal_of_vengeance: {
    id: 'seal_of_vengeance',
    name: '보복자의 인장',
    description: '크리티컬 데미지 증가',
    icon: '🔱',
    category: 'damage',
    effectPerLevel: {
      common: 20,
      rare: 30,
      epic: 50,
      legendary: 80,
      mythic: 140
    },
    effectType: 'critDmg'
  },

  giant_slayer: {
    id: 'giant_slayer',
    name: '거인 학살자',
    description: '보스 데미지 증가',
    icon: '🗡️',
    category: 'damage',
    effectPerLevel: {
      common: 15,
      rare: 25,
      epic: 40,
      legendary: 65,
      mythic: 110
    },
    effectType: 'bossDamage'
  },

  axe_of_carnage: {
    id: 'axe_of_carnage',
    name: '살육의 도끼',
    description: '크리티컬 확률 증가',
    icon: '🪓',
    category: 'damage',
    maxLevel: 30,
    effectPerLevel: {
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 8
    },
    effectType: 'critChance'
  },

  ancient_lens: {
    id: 'ancient_lens',
    name: '고대의 렌즈',
    description: '데미지 관련 모든 유물 효과 증가',
    icon: '🔍',
    category: 'damage',
    effectPerLevel: {
      common: 5,
      rare: 8,
      epic: 12,
      legendary: 18,
      mythic: 30
    },
    effectType: 'damageRelicBonus'
  },

  // === 장비 관련 ===
  compass_of_discovery: {
    id: 'compass_of_discovery',
    name: '발견의 나침반',
    description: '모든 장비 능력치 증가',
    icon: '🧭',
    category: 'equipment',
    effectPerLevel: {
      common: 5,
      rare: 8,
      epic: 12,
      legendary: 18,
      mythic: 30
    },
    effectType: 'equipmentPercent'
  },

  sigil_of_war: {
    id: 'sigil_of_war',
    name: '전쟁의 각인',
    description: '무기 능력치 증가',
    icon: '⚔️',
    category: 'equipment',
    effectPerLevel: {
      common: 8,
      rare: 12,
      epic: 18,
      legendary: 28,
      mythic: 45
    },
    effectType: 'weaponPercent'
  },

  helm_of_madness: {
    id: 'helm_of_madness',
    name: '광기의 투구',
    description: '투구 능력치 증가',
    icon: '⛑️',
    category: 'equipment',
    effectPerLevel: {
      common: 8,
      rare: 12,
      epic: 18,
      legendary: 28,
      mythic: 45
    },
    effectType: 'helmetPercent'
  },

  titanium_armor: {
    id: 'titanium_armor',
    name: '티타늄 갑옷',
    description: '갑옷 능력치 증가',
    icon: '🛡️',
    category: 'equipment',
    effectPerLevel: {
      common: 8,
      rare: 12,
      epic: 18,
      legendary: 28,
      mythic: 45
    },
    effectType: 'armorPercent'
  },

  boots_of_haste: {
    id: 'boots_of_haste',
    name: '질주의 신발',
    description: '신발 능력치 증가',
    icon: '👢',
    category: 'equipment',
    effectPerLevel: {
      common: 8,
      rare: 12,
      epic: 18,
      legendary: 28,
      mythic: 45
    },
    effectType: 'bootsPercent'
  },

  moonlight_necklace: {
    id: 'moonlight_necklace',
    name: '달빛 목걸이',
    description: '목걸이 능력치 증가',
    icon: '📿',
    category: 'equipment',
    effectPerLevel: {
      common: 8,
      rare: 12,
      epic: 18,
      legendary: 28,
      mythic: 45
    },
    effectType: 'necklacePercent'
  },

  ring_of_eternity: {
    id: 'ring_of_eternity',
    name: '영원의 반지',
    description: '반지 능력치 증가',
    icon: '💍',
    category: 'equipment',
    effectPerLevel: {
      common: 8,
      rare: 12,
      epic: 18,
      legendary: 28,
      mythic: 45
    },
    effectType: 'ringPercent'
  },

  staff_of_brilliance: {
    id: 'staff_of_brilliance',
    name: '찬란한 홀',
    description: '장비 업그레이드 비용 감소',
    icon: '🪄',
    category: 'equipment',
    effectPerLevel: {
      common: 2,
      rare: 3,
      epic: 5,
      legendary: 8,
      mythic: 15
    },
    effectType: 'equipmentUpgradeCostReduction'
  },

  // === 문양 관련 ===
  sigil_of_storm: {
    id: 'sigil_of_storm',
    name: '폭풍의 문양',
    description: '문양 데미지 보너스 증가',
    icon: '⚡',
    category: 'inscription',
    effectPerLevel: {
      common: 10,
      rare: 15,
      epic: 25,
      legendary: 40,
      mythic: 70
    },
    effectType: 'inscriptionDamage'
  },

  essence_of_sigil: {
    id: 'essence_of_sigil',
    name: '문양의 정수',
    description: '문양 기본 스탯 증가',
    icon: '🔮',
    category: 'inscription',
    effectPerLevel: {
      common: 5,
      rare: 8,
      epic: 12,
      legendary: 18,
      mythic: 30
    },
    effectType: 'inscriptionStats'
  },

  talisman_of_summoning: {
    id: 'talisman_of_summoning',
    name: '소환의 부적',
    description: '문양 드랍 확률 증가',
    icon: '🎴',
    category: 'inscription',
    effectPerLevel: {
      common: 5,
      rare: 8,
      epic: 12,
      legendary: 18,
      mythic: 30
    },
    effectType: 'inscriptionDropRate'
  },

  // === 도감 관련 ===
  collectors_badge: {
    id: 'collectors_badge',
    name: '수집가의 휘장',
    description: '도감 수집률 1%당 골드 +0.5%',
    icon: '🏅',
    category: 'collection',
    effectPerLevel: {
      common: 0.5,
      rare: 0.8,
      epic: 1.2,
      legendary: 1.8,
      mythic: 3
    },
    effectType: 'collectionGoldBonus'
  },

  explorers_journal: {
    id: 'explorers_journal',
    name: '탐험가의 일지',
    description: '도감 수집률 1%당 데미지 +0.5%',
    icon: '📔',
    category: 'collection',
    effectPerLevel: {
      common: 0.5,
      rare: 0.8,
      epic: 1.2,
      legendary: 1.8,
      mythic: 3
    },
    effectType: 'collectionDamageBonus'
  },

  // === 몬스터 관련 ===
  spear_of_conquest: {
    id: 'spear_of_conquest',
    name: '정복자의 창',
    description: '모든 몬스터 HP 감소 (골드는 원래 HP 기준)',
    icon: '🔱',
    category: 'monster',
    effectPerLevel: {
      common: 2,
      rare: 3,
      epic: 5,
      legendary: 8,
      mythic: 15
    },
    effectType: 'monsterHpReduction'
  },

  veil_of_shadow: {
    id: 'veil_of_shadow',
    name: '암흑의 장막',
    description: '스테이지당 몬스터 수 감소 (5마리에서 시작)',
    icon: '🌑',
    category: 'monster',
    maxLevel: 30,
    effectPerLevel: {
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 8
    },
    effectType: 'monstersPerStageReduction'
  },

  lucky_egg: {
    id: 'lucky_egg',
    name: '행운의 알',
    description: '희귀 몬스터 출현 확률 증가',
    icon: '🥚',
    category: 'monster',
    maxLevel: 50,
    effectPerLevel: {
      common: 2,
      rare: 3,
      epic: 5,
      legendary: 8,
      mythic: 15
    },
    effectType: 'rareMonsterSpawn'
  },

  fox_spirit_orb: {
    id: 'fox_spirit_orb',
    name: '구미호의 구슬',
    description: '전설 몬스터 출현 확률 증가',
    icon: '🦊',
    category: 'monster',
    maxLevel: 50,
    effectPerLevel: {
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 10
    },
    effectType: 'legendaryMonsterSpawn'
  },

  // === 봉인구역 관련 ===
  dimensional_gate: {
    id: 'dimensional_gate',
    name: '차원의 문',
    description: '보스 층 스킵 확률 증가',
    icon: '🌀',
    category: 'utility',
    maxLevel: 30,
    effectPerLevel: {
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 10
    },
    effectType: 'bossSkipChance'
  },

  hourglass_of_time: {
    id: 'hourglass_of_time',
    name: '시간의 모래시계',
    description: '보스 처치 제한시간 증가 (10초 시작)',
    icon: '⏳',
    category: 'utility',
    maxLevel: 50,
    effectPerLevel: {
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 8
    },
    effectType: 'bossTimeLimit'
  },

  token_of_challenge: {
    id: 'token_of_challenge',
    name: '도전의 증표',
    description: '봉인구역 도전권 획득 확률 증가',
    icon: '🎫',
    category: 'utility',
    effectPerLevel: {
      common: 5,
      rare: 8,
      epic: 12,
      legendary: 18,
      mythic: 30
    },
    effectType: 'raidTicketDropRate'
  }
};

// 유물 효과 계산 (등급 시스템 제거, level만 사용)
export const calculateRelicEffect = (relicId, level) => {
  const relic = PRESTIGE_RELICS[relicId];
  if (!relic) return { value: 0, type: null };

  // effectPerLevel이 객체면 mythic 값 사용, 아니면 그대로 사용
  const baseValue = typeof relic.effectPerLevel === 'object'
    ? (relic.effectPerLevel.mythic || relic.effectPerLevel.legendary || relic.effectPerLevel.epic || relic.effectPerLevel.common)
    : relic.effectPerLevel;

  return {
    value: baseValue * level,
    type: relic.effectType
  };
};

// 유물 레벨업 비용 (Relic 조각)
export const getRelicUpgradeCost = (currentLevel, hasReduction = 0) => {
  const baseCost = Math.floor(1 + currentLevel * 0.5);
  const reduction = Math.min(hasReduction, 90); // 최대 90% 감소
  return Math.max(1, Math.floor(baseCost * (1 - reduction / 100)));
};

// 유물 가챠 비용 계산 (Relic 조각) - 이전 올림 비용 × 1.4
// 1 → 2 → 3 → 5 → 7 → 10 → 14 → 20 → ...
export const getRelicGachaCost = (gachaCount) => {
  if (gachaCount === 0) return 1;
  let cost = 1;
  for (let i = 0; i < gachaCount; i++) {
    cost = Math.ceil(cost * 1.4);
  }
  return cost;
};

// 모든 유물 효과 합산
export const getTotalRelicEffects = (relics) => {
  const effects = {
    // 귀환 & 유물
    relicFragmentPercent: 0,
    relicUpgradeCostReduction: 0,
    damagePerRelic: 0,

    // 골드
    goldPercent: 0,
    normalMonsterGold: 0,
    bossGold: 0,
    rareMonsterGold: 0,
    goldRelicBonus: 0,
    gold10xChance: 0,

    // 데미지
    damagePercent: 0,
    critDmg: 0,
    bossDamage: 0,
    critChance: 0,
    damageRelicBonus: 0,

    // 장비
    equipmentPercent: 0,
    weaponPercent: 0,
    helmetPercent: 0,
    armorPercent: 0,
    bootsPercent: 0,
    necklacePercent: 0,
    ringPercent: 0,
    equipmentUpgradeCostReduction: 0,

    // 문양
    inscriptionDamage: 0,
    inscriptionStats: 0,
    inscriptionDropRate: 0,

    // 도감
    collectionGoldBonus: 0,
    collectionDamageBonus: 0,

    // 몬스터
    monsterHpReduction: 0,
    monstersPerStageReduction: 0,
    rareMonsterSpawn: 0,
    legendaryMonsterSpawn: 0,

    // 유틸리티
    bossSkipChance: 0,
    bossTimeLimit: 0,
    raidTicketDropRate: 0
  };

  Object.values(relics).forEach(relic => {
    const effect = calculateRelicEffect(relic.relicId, relic.level);
    if (effect.type && effects.hasOwnProperty(effect.type)) {
      effects[effect.type] += effect.value;
    }
  });

  return effects;
};
