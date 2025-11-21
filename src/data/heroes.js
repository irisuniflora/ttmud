import { HERO_CONFIG, calculateUpgradeCost } from './gameBalance.js';

// 영웅 등급 시스템 (gameBalance.js에서 가져옴)
export const HERO_GRADES = HERO_CONFIG.grades;
export const GRADE_ORDER = HERO_CONFIG.gradeOrder;

// 영웅 타입
export const HERO_TYPES = {
  CRIT_CHANCE: 'crit_chance',
  CRIT_DMG: 'crit_dmg',
  HP_PERCENT_DMG: 'hp_percent_dmg',
  DOT_DMG: 'dot_dmg',
  STAGE_SKIP: 'stage_skip',
  DROP_RATE: 'drop_rate',
  GOLD_BONUS: 'gold_bonus',
  EXP_BONUS: 'exp_bonus'
};

// 영웅 데이터
export const HEROES = [
  // === 딜러 ===
  {
    id: 'shadow_assassin',
    name: '섀도우 어쌔신',
    type: HERO_TYPES.CRIT_CHANCE,
    category: 'dealer',
    description: '그림자 속에서 치명적인 일격을 노린다.',
    image: '/images/heroes/shadow_assassin.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      critChance: HERO_CONFIG.critChanceDealerBase,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      critChance: HERO_CONFIG.critChanceDealerPerGrade,
    }
  },
  {
    id: 'berserker',
    name: '버서커',
    type: HERO_TYPES.CRIT_DMG,
    category: 'dealer',
    description: '분노로 적을 압도하는 광전사.',
    image: '/images/heroes/berserker.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      critDmg: HERO_CONFIG.critDmgDealerBase,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      critDmg: HERO_CONFIG.critDmgDealerPerGrade,
    }
  },
  {
    id: 'dark_reaper',
    name: '다크 리퍼',
    type: HERO_TYPES.HP_PERCENT_DMG,
    category: 'dealer',
    description: '죽음의 낫으로 적의 생명력을 갉아먹는다.',
    image: '/images/heroes/dark_reaper.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      hpPercentDmgChance: HERO_CONFIG.hpPercentDmgDealerBase,
      hpPercentDmgValue: HERO_CONFIG.hpPercentDmgValue,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      hpPercentDmgChance: HERO_CONFIG.hpPercentDmgDealerPerGrade,
      hpPercentDmgValue: HERO_CONFIG.hpPercentDmgValuePerGrade,
    }
  },
  {
    id: 'archmage',
    name: '아크메이지',
    type: HERO_TYPES.DOT_DMG,
    category: 'dealer',
    description: '저주의 마법으로 적을 서서히 태운다.',
    image: '/images/heroes/archmage.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      dotDmgPercent: HERO_CONFIG.dotDmgDealerBase,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      dotDmgPercent: HERO_CONFIG.dotDmgDealerPerGrade,
    }
  },

  // === 버퍼 ===
  {
    id: 'time_walker',
    name: '타임 워커',
    type: HERO_TYPES.STAGE_SKIP,
    category: 'buffer',
    description: '시간을 조종하여 스테이지를 건너뛴다.',
    image: '/images/heroes/time_walker.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      stageSkipChance: HERO_CONFIG.stageSkipBufferBase,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      stageSkipChance: HERO_CONFIG.stageSkipBufferPerGrade,
    }
  },
  {
    id: 'fortune_hunter',
    name: '포춘 헌터',
    type: HERO_TYPES.DROP_RATE,
    category: 'buffer',
    description: '행운으로 더 많은 아이템을 찾아낸다.',
    image: '/images/heroes/fortune_hunter.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      dropRate: HERO_CONFIG.dropRateBufferBase,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      dropRate: HERO_CONFIG.dropRateBufferPerGrade,
    }
  },
  {
    id: 'gold_merchant',
    name: '골드 머천트',
    type: HERO_TYPES.GOLD_BONUS,
    category: 'buffer',
    description: '상술로 더 많은 골드를 획득한다.',
    image: '/images/heroes/gold_merchant.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      goldBonus: HERO_CONFIG.goldBufferBase,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      goldBonus: HERO_CONFIG.goldBufferPerGrade,
    }
  },
  {
    id: 'sage',
    name: '현자',
    type: HERO_TYPES.EXP_BONUS,
    category: 'buffer',
    description: '지혜로 경험치 획득을 가속화한다.',
    image: '/images/heroes/sage.png',
    baseStats: {
      attack: HERO_CONFIG.heroBaseAttack,
      expBonus: HERO_CONFIG.expBufferBase,
    },
    gradeStats: {
      attack: HERO_CONFIG.heroAttackPerGrade,
      expBonus: HERO_CONFIG.expBufferPerGrade,
    }
  }
];

// 등급 인덱스 가져오기
export const getGradeIndex = (gradeId) => {
  return GRADE_ORDER.indexOf(gradeId);
};

// 다음 등급 가져오기
export const getNextGrade = (currentGradeId) => {
  const currentIndex = getGradeIndex(currentGradeId);
  if (currentIndex >= GRADE_ORDER.length - 1) return null;
  return GRADE_ORDER[currentIndex + 1];
};

// 영웅의 현재 스탯 계산 (등급 + 별 고려)
export const getHeroStats = (hero, gradeId, stars) => {
  const gradeIndex = getGradeIndex(gradeId);
  const stats = {};

  Object.keys(hero.baseStats).forEach(statKey => {
    if (statKey === 'attack') {
      // 공격력: 기본값 * (2^등급인덱스) + (별당증가값 * (2^등급인덱스) * 별개수)
      const baseAttack = HERO_CONFIG.heroBaseAttack * Math.pow(2, gradeIndex);
      const starBonus = HERO_CONFIG.heroAttackPerStar * Math.pow(2, gradeIndex) * stars;
      stats.attack = baseAttack + starBonus;
    } else if (statKey === 'critChance') {
      // 크리확: 이전 등급 5별 수치 + 등급업 보너스 + (현재 별 * 현재 등급 별당 증가)
      // 각 등급의 0별 기준값 = 이전 등급 최대치 + 등급업 보너스(2%)
      let baseForGrade = HERO_CONFIG.critChanceDealerBase;
      for (let i = 0; i < gradeIndex; i++) {
        // 이전 등급의 최대치 (5별) 계산
        const prevStarBonus = HERO_CONFIG.critChanceDealerBaseStar + (i * HERO_CONFIG.critChanceDealerStarPerGrade);
        baseForGrade += prevStarBonus * 5; // 5별 보너스
        baseForGrade += HERO_CONFIG.critChanceDealerPerGrade; // 등급업 보너스 (+2%)
      }
      const currentStarBonus = HERO_CONFIG.critChanceDealerBaseStar + (gradeIndex * HERO_CONFIG.critChanceDealerStarPerGrade);
      stats.critChance = baseForGrade + (currentStarBonus * stars);
    } else if (statKey === 'hpPercentDmgChance') {
      // 체력 퍼센트 데미지 확률: 기본값 + (별당 증가 * 별개수)
      const baseChance = HERO_CONFIG.hpPercentDmgDealerBase;
      const starBonus = HERO_CONFIG.hpPercentDmgDealerBaseStar * stars;
      stats.hpPercentDmgChance = baseChance + starBonus;
    } else if (statKey === 'critDmg') {
      // 크리데미지: 이전 등급 5별 수치 + 등급업 보너스 + (현재 별 * 현재 등급 별당 증가)
      let baseForGrade = HERO_CONFIG.critDmgDealerBase;
      for (let i = 0; i < gradeIndex; i++) {
        // 이전 등급의 최대치 (5별) 계산
        const prevStarBonus = HERO_CONFIG.critDmgDealerBaseStar + (i * HERO_CONFIG.critDmgDealerStarPerGrade);
        baseForGrade += prevStarBonus * 5; // 5별 보너스
        baseForGrade += HERO_CONFIG.critDmgDealerPerGrade; // 등급업 보너스 (+15%)
      }
      const currentStarBonus = HERO_CONFIG.critDmgDealerBaseStar + (gradeIndex * HERO_CONFIG.critDmgDealerStarPerGrade);
      stats.critDmg = baseForGrade + (currentStarBonus * stars);
    } else {
      // 다른 스탯: 기존 방식 유지
      const baseValue = hero.baseStats[statKey];
      const gradeBonus = hero.gradeStats[statKey] * gradeIndex;
      const starBonus = hero.gradeStats[statKey] * stars * HERO_CONFIG.starBonusMultiplier;
      stats[statKey] = baseValue + gradeBonus + starBonus;
    }
  });

  return stats;
};

// 등급업에 필요한 코인 수
export const getUpgradeCost = (gradeId) => {
  const gradeIndex = getGradeIndex(gradeId);
  return HERO_CONFIG.upgradeCostByGrade[gradeIndex] || 0;
};

// 별 업그레이드에 필요한 카드 수 (등급에 따라 다름)
export const getStarUpgradeCost = (gradeId) => {
  const gradeIndex = getGradeIndex(gradeId);
  return HERO_CONFIG.starUpgradeCostByGrade[gradeIndex] || 0;
};

// ID로 영웅 찾기
export const getHeroById = (heroId) => {
  return HEROES.find(h => h.id === heroId);
};
