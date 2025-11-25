// 봉인구역 전용 문양 시스템

// 문양 등급 (동료 등급 색상과 통일)
export const INSCRIPTION_GRADES = {
  common: { name: '일반', color: 'text-gray-400', statMultiplier: 1, sellDust: 1 },
  uncommon: { name: '희귀', color: 'text-blue-400', statMultiplier: 1.5, sellDust: 3 },
  rare: { name: '레어', color: 'text-purple-400', statMultiplier: 2, sellDust: 8 },
  unique: { name: '유니크', color: 'text-yellow-400', statMultiplier: 3, sellDust: 20 },
  legendary: { name: '레전드', color: 'text-orange-400', statMultiplier: 5, sellDust: 50 },
  mythic: { name: '신화', color: 'text-red-400', statMultiplier: 8, sellDust: 150 }
};

// 문양 강화 설정
export const INSCRIPTION_UPGRADE_CONFIG = {
  maxLevel: 10,
  // 레벨당 강화 비용 (문양가루)
  getCost: (currentLevel) => Math.floor(10 * Math.pow(1.5, currentLevel - 1)),
  // 레벨당 스탯 배율 (레벨 1 = 1.0, 레벨 10 = 2.0)
  getStatMultiplier: (level) => 1 + (level - 1) * 0.11,
  // 강화 성공률 (항상 100%)
  getSuccessRate: (currentLevel) => 100
};

// 문양 특수 능력
export const INSCRIPTION_ABILITIES = {
  // 베크타 대응 (장비 파괴)
  equipment_immunity: {
    id: 'equipment_immunity',
    name: '장비 파괴 면역',
    description: '장비 파괴 효과를 받지 않음',
    icon: '🛡️',
    counters: ['vecta']
  },
  equipment_restore: {
    id: 'equipment_restore',
    name: '장비 복원',
    description: '파괴된 장비를 3초 뒤 자동 복원',
    icon: '♻️',
    counters: ['vecta']
  },
  destruction_rage: {
    id: 'destruction_rage',
    name: '파괴 분노',
    description: '장비 파괴 시 공격력 +50% (5초)',
    icon: '💢',
    counters: ['vecta']
  },

  // 네페론 대응 (보호막)
  shield_break: {
    id: 'shield_break',
    name: '보호막 파괴',
    description: '보호막에 추가 피해 +50%',
    icon: '💥',
    counters: ['nepheron']
  },
  shield_penetration: {
    id: 'shield_penetration',
    name: '보호막 관통',
    description: '보호막을 무시하고 데미지를 줌',
    icon: '🗡️',
    counters: ['nepheron']
  },
  shield_rage: {
    id: 'shield_rage',
    name: '보호막 분노',
    description: '보스에게 보호막이 있을 때 공격 속도 +50%',
    icon: '⚡',
    counters: ['nepheron']
  },

  // 로타르 대응 (재생)
  heal_reduction: {
    id: 'heal_reduction',
    name: '치유 감소',
    description: '보스의 치유량 -70%',
    icon: '🚫',
    counters: ['rothar']
  },
  true_damage: {
    id: 'true_damage',
    name: '고정 피해',
    description: '보스 최대 체력의 3%만큼 고정 피해',
    icon: '💢',
    counters: ['rothar']
  },
  heal_counter: {
    id: 'heal_counter',
    name: '회복 역습',
    description: '보스가 회복할 때마다 반응 공격',
    icon: '⚔️',
    counters: ['rothar']
  },

  // 에스모드 대응 (디버프)
  debuff_duration_reduce: {
    id: 'debuff_duration_reduce',
    name: '디버프 저항',
    description: '디버프 지속시간 -70%',
    icon: '🛡️',
    counters: ['esmode']
  },
  debuff_cleanse: {
    id: 'debuff_cleanse',
    name: '디버프 정화',
    description: '디버프 자동 해제',
    icon: '✨',
    counters: ['esmode']
  },
  debuff_power: {
    id: 'debuff_power',
    name: '디버프 역전',
    description: '디버프 걸릴 때마다 공격력 +10%',
    icon: '💪',
    counters: ['esmode']
  },

  // 실렌 대응 (회피)
  accuracy_up: {
    id: 'accuracy_up',
    name: '명중 증가',
    description: '명중률 +60%',
    icon: '🎯',
    counters: ['silen']
  },
  true_hit: {
    id: 'true_hit',
    name: '필중',
    description: '회피 무시 효과 (모든 공격 명중)',
    icon: '✨',
    counters: ['silen']
  },
  miss_power: {
    id: 'miss_power',
    name: '회피 분노',
    description: '미스 날 때마다 다음 공격 데미지 +30%',
    icon: '💥',
    counters: ['silen']
  }
};

// 문양 정의 (10가지)
export const INSCRIPTIONS = {
  rage: {
    id: 'rage',
    name: '분노의 문양',
    image: '/images/inscriptions/rage.png',
    description: '분노가 폭발하는 문양',
    abilities: ['destruction_rage', 'miss_power'],
    baseStats: {
      attack: 150,        // 깡 공격력
      critChance: 2,      // 치명타 확률
      accuracy: 3,        // 명중률
      attackPercent: 0,   // 공격력 %
      critDamage: 0,      // 치명타 데미지
      penetration: 0      // 관통
    },
    specialAbility: {
      type: 'attack_boost',
      name: '깡 공격력 증가',
      description: '추가 공격력 +150'
    }
  },
  precision: {
    id: 'precision',
    name: '정밀의 문양',
    image: '/images/inscriptions/precision.png',
    description: '정확한 일격을 가하는 문양',
    abilities: ['accuracy_up', 'true_hit'],
    baseStats: {
      attack: 95,
      critChance: 8,      // 치명타 확률 증가
      accuracy: 20,
      attackPercent: 10,
      critDamage: 40,
      penetration: 10
    },
    specialAbility: {
      type: 'crit_chance',
      name: '치명타 확률 증가',
      description: '치명타 확률 +8%'
    }
  },
  shadow: {
    id: 'shadow',
    name: '그림자의 문양',
    image: '/images/inscriptions/shadow.png',
    description: '회피를 무력화하는 문양',
    abilities: ['true_hit', 'accuracy_up'],
    baseStats: {
      attack: 100,
      critChance: 5,
      accuracy: 15,       // 명중률 증가
      attackPercent: 10,
      critDamage: 30,
      penetration: 8
    },
    specialAbility: {
      type: 'accuracy_boost',
      name: '명중률 증가',
      description: '명중률 +15%'
    }
  },
  destruction: {
    id: 'destruction',
    name: '파괴의 문양',
    image: '/images/inscriptions/destruction.png',
    description: '장비 파괴를 극복하는 문양',
    abilities: ['equipment_immunity', 'destruction_rage'],
    baseStats: {
      attack: 100,
      critChance: 3,
      accuracy: 5,
      attackPercent: 10,
      critDamage: 20,
      penetration: 8
    },
    specialAbility: {
      type: 'guaranteed_crit_on_miss',
      name: '공격 실패시 무조건 치명타',
      description: '공격이 실패하면 다음 공격은 100% 치명타'
    }
  },
  crush: {
    id: 'crush',
    name: '분쇄의 문양',
    image: '/images/inscriptions/crush.png',
    description: '보호막을 파괴하는 문양',
    abilities: ['shield_break', 'shield_penetration'],
    baseStats: {
      attack: 120,
      critChance: 4,
      accuracy: 6,
      attackPercent: 12,
      critDamage: 25,
      penetration: 15     // 관통 (보호막 추가 피해)
    },
    specialAbility: {
      type: 'penetration',
      name: '관통 증가',
      description: '방어력 무시 +15%'
    }
  },
  void: {
    id: 'void',
    name: '공허의 문양',
    image: '/images/inscriptions/void.png',
    description: '모든 것을 관통하는 문양',
    abilities: ['shield_penetration', 'equipment_immunity'],
    baseStats: {
      attack: 105,
      critChance: 3,
      accuracy: 7,
      attackPercent: 11,
      critDamage: 25,
      penetration: 25     // 관통 (방어 무시)
    },
    specialAbility: {
      type: 'penetration_boost',
      name: '관통 강화',
      description: '방어력 무시 +25%'
    }
  },
  thirst: {
    id: 'thirst',
    name: '갈증의 문양',
    image: '/images/inscriptions/thirst.png',
    description: '체력을 갉아먹는 문양',
    abilities: ['true_damage'],
    baseStats: {
      attack: 80,
      critChance: 2,
      accuracy: 4,
      attackPercent: 8,
      critDamage: 15,
      penetration: 6
    },
    specialAbility: {
      type: 'hp_percent_damage',
      name: '체력 비례 데미지',
      value: 5,
      description: '보스 최대 체력의 5% 추가 피해'
    }
  },
  decay: {
    id: 'decay',
    name: '부패의 문양',
    image: '/images/inscriptions/decay.png',
    description: '재생을 무력화하는 문양',
    abilities: ['heal_reduction', 'true_damage'],
    baseStats: {
      attack: 90,
      critChance: 3,
      accuracy: 5,
      attackPercent: 9,
      critDamage: 18,
      penetration: 7
    },
    specialAbility: {
      type: 'heal_reduction',
      name: '치료 효과 감소',
      value: 70,
      description: '적의 치유 효과 -70%'
    }
  },
  chaos: {
    id: 'chaos',
    name: '혼돈의 문양',
    image: '/images/inscriptions/chaos.png',
    description: '치명적인 일격을 가하는 문양',
    abilities: ['debuff_cleanse', 'debuff_power'],
    baseStats: {
      attack: 110,
      critChance: 3,
      accuracy: 5,
      attackPercent: 11,
      critDamage: 50,     // 치명타 데미지 증가
      penetration: 9
    },
    specialAbility: {
      type: 'crit_damage_boost',
      name: '치명타 데미지 증가',
      description: '치명타 데미지 +50%'
    }
  },
  eternity: {
    id: 'eternity',
    name: '영원의 문양',
    image: '/images/inscriptions/eternity.png',
    description: '불굴의 의지를 담은 문양',
    abilities: ['equipment_restore', 'debuff_cleanse'],
    baseStats: {
      attack: 130,
      critChance: 4,
      accuracy: 8,
      attackPercent: 13,
      critDamage: 28,
      penetration: 12
    },
    specialAbility: {
      type: 'hp_execute',
      name: '적 HP 20% 이하 시 데미지 2배',
      description: '적의 HP가 20% 이하일 때 데미지 2배'
    }
  }
};

// 구 등급 -> 신 등급 마이그레이션 맵
const GRADE_MIGRATION = {
  'rare': 'uncommon',    // 구: rare(희귀) -> 신: uncommon(희귀)
  'epic': 'rare',        // 구: epic(레어) -> 신: rare(레어)
  // common, unique, legendary, mythic은 그대로
};

// 등급 마이그레이션 함수
export const migrateGrade = (grade) => {
  return GRADE_MIGRATION[grade] || grade;
};

// 등급별 문양 스탯 계산
export const calculateInscriptionStats = (inscriptionId, grade) => {
  const inscription = INSCRIPTIONS[inscriptionId];

  // 구 등급 마이그레이션
  const migratedGrade = migrateGrade(grade);
  const gradeData = INSCRIPTION_GRADES[migratedGrade];

  if (!inscription || !gradeData) {
    // 폴백: 기본값 반환
    return {
      name: '알 수 없는 문양',
      gradeName: '알 수 없음',
      gradeColor: 'text-gray-400',
      attack: 0,
      critChance: 0,
      accuracy: 0,
      attackPercent: 0,
      critDamage: 0,
      penetration: 0
    };
  }

  const multiplier = gradeData.statMultiplier;

  return {
    ...inscription,
    grade: migratedGrade,
    gradeName: gradeData.name,
    gradeColor: gradeData.color,
    attack: Math.floor(inscription.baseStats.attack * multiplier),
    critChance: inscription.baseStats.critChance * multiplier,
    accuracy: inscription.baseStats.accuracy * multiplier,
    attackPercent: inscription.baseStats.attackPercent * multiplier,
    critDamage: inscription.baseStats.critDamage * multiplier,
    penetration: inscription.baseStats.penetration * multiplier
  };
};

// 층별 문양 드랍 테이블 (1~100층 패턴, 이후 반복)
export const INSCRIPTION_DROP_TABLE = {
  1: { inscriptionId: 'rage', name: '분노', baseDropRate: 0.10 },       // 1~10층
  11: { inscriptionId: 'precision', name: '정밀', baseDropRate: 0.10 },  // 11~20층
  21: { inscriptionId: 'shadow', name: '그림자', baseDropRate: 0.10 }, // 21~30층
  31: { inscriptionId: 'chaos', name: '혼돈', baseDropRate: 0.10 },      // 31~40층
  41: { inscriptionId: 'decay', name: '부패', baseDropRate: 0.10 },    // 41~50층
  51: { inscriptionId: 'crush', name: '분쇄', baseDropRate: 0.10 }, // 51~60층
  61: { inscriptionId: 'void', name: '공허', baseDropRate: 0.10 },     // 61~70층
  71: { inscriptionId: 'thirst', name: '갈증', baseDropRate: 0.10 },    // 71~80층
  81: { inscriptionId: 'destruction', name: '파괴', baseDropRate: 0.10 },    // 81~90층
  91: { inscriptionId: 'eternity', name: '영원', baseDropRate: 0.10 }      // 91~100층
};

// 층수에 따른 문양 ID 결정
export const getInscriptionIdByFloor = (floor) => {
  // 100층 단위로 반복 (1~100, 101~200, 201~300 ...)
  const normalizedFloor = ((floor - 1) % 100) + 1;

  // 해당 층의 10층 구간 시작점 찾기 (1, 11, 21, ..., 91)
  const rangeStart = Math.floor((normalizedFloor - 1) / 10) * 10 + 1;

  return INSCRIPTION_DROP_TABLE[rangeStart];
};

// 층수에 따른 드랍율 계산 (100층마다 증가)
export const getInscriptionDropRate = (floor) => {
  const dropInfo = getInscriptionIdByFloor(floor);
  if (!dropInfo) return 0;

  // 100층 구간 (0: 1~100층, 1: 101~200층, 2: 201~300층 ...)
  const hundredBlock = Math.floor((floor - 1) / 100);

  // 100층마다 드랍율 2배 증가 (10% -> 20% -> 40% -> 80% ...)
  const dropRate = dropInfo.baseDropRate * Math.pow(2, hundredBlock);

  // 최대 80%로 제한
  return Math.min(dropRate, 0.80);
};

// 문양 드랍 확률 (등급별)
export const INSCRIPTION_DROP_RATES = {
  common: 0.50,     // 50%
  uncommon: 0.30,   // 30%
  rare: 0.15,       // 15%
  unique: 0.04,     // 4%
  legendary: 0.009, // 0.9%
  mythic: 0.001     // 0.1%
};

// 문양 등급 롤 (드랍 시 등급 결정)
export const rollInscriptionGrade = () => {
  const roll = Math.random();
  let cumulative = 0;

  for (const [grade, rate] of Object.entries(INSCRIPTION_DROP_RATES)) {
    cumulative += rate;
    if (roll <= cumulative) return grade;
  }

  return 'common';
};
