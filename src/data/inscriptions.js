// 봉인구역 전용 문양 시스템

// 문양 등급 (동료 등급 색상과 통일)
export const INSCRIPTION_GRADES = {
  common: { name: '일반', color: 'text-gray-400', statMultiplier: 1, sellDust: 1 },
  uncommon: { name: '희귀', color: 'text-green-400', statMultiplier: 1.5, sellDust: 3 },
  rare: { name: '레어', color: 'text-blue-400', statMultiplier: 2.2, sellDust: 8 },
  epic: { name: '에픽', color: 'text-purple-400', statMultiplier: 3, sellDust: 15 },
  unique: { name: '유니크', color: 'text-yellow-400', statMultiplier: 4, sellDust: 25 },
  legendary: { name: '레전드', color: 'text-orange-400', statMultiplier: 6, sellDust: 50 },
  mythic: { name: '신화', color: 'text-red-400', statMultiplier: 10, sellDust: 150 },
  dark: { name: '다크', color: 'text-fuchsia-500', statMultiplier: 15, sellDust: 300 }
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
  // 베크타 대응 (장비 파괴) - equipment_immunity 삭제 (오밸)
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
    icon: '🛡️',
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
    icon: '💨',
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
    name: '백발백중',
    description: '회피 무시 효과 (모든 공격 명중)',
    icon: '💫',
    counters: ['silen']
  },
  miss_power: {
    id: 'miss_power',
    name: '회피 분노',
    description: '미스 날 때마다 다음 공격 데미지 +30%',
    icon: '😤',
    counters: ['silen']
  }
};

// 문양 정의 (10가지) - 최종 데미지% (곱연산)
export const INSCRIPTIONS = {
  rage: {
    id: 'rage',
    name: '분노의 문양',
    description: '장비 파괴 시 분노 폭발 (베크타 특화)',
    abilities: ['destruction_rage'],
    baseStats: { finalDamagePercent: 5 },
    specialAbility: {
      type: 'destruction_rage',
      name: '파괴 분노',
      description: '장비 파괴 시 최종 데미지 +50% (5초)'
    }
  },
  precision: {
    id: 'precision',
    name: '정밀의 문양',
    description: '모든 공격이 명중 (실렌 특화)',
    abilities: ['true_hit'],
    baseStats: { finalDamagePercent: 3 },
    specialAbility: {
      type: 'true_hit',
      name: '백발백중',
      description: '회피 무시 (모든 공격 명중)'
    }
  },
  shadow: {
    id: 'shadow',
    name: '그림자의 문양',
    description: '명중 대폭 증가 (실렌 특화)',
    abilities: ['accuracy_up'],
    baseStats: { finalDamagePercent: 5, accuracy: 1500 },
    specialAbility: {
      type: 'accuracy_boost',
      name: '명중 특화',
      description: '명중 +1500'
    }
  },
  destruction: {
    id: 'destruction',
    name: '파괴의 문양',
    description: '보호막에 추가 피해 (네페론 특화)',
    abilities: ['shield_break'],
    baseStats: { finalDamagePercent: 5 },
    specialAbility: {
      type: 'shield_double_damage',
      name: '보호막 분쇄',
      description: '보호막에 +100% 피해'
    }
  },
  crush: {
    id: 'crush',
    name: '분쇄의 문양',
    description: '무적 즉시 해제 (에스모드 특화)',
    abilities: [],
    baseStats: { finalDamagePercent: 5 },
    specialAbility: {
      type: 'invincible_destroy',
      name: '무적 파괴',
      description: '보스의 무적 상태를 즉시 해제'
    }
  },
  void: {
    id: 'void',
    name: '공허의 문양',
    description: '방어막 관통 피해 (네페론 특화)',
    abilities: ['shield_penetration'],
    baseStats: { finalDamagePercent: 5 },
    specialAbility: {
      type: 'shield_bypass_damage',
      name: '방어막 관통',
      value: 30,
      description: '데미지의 30%가 방어막을 무시하고 실제 체력에 추가 피해'
    }
  },
  thirst: {
    id: 'thirst',
    name: '갈증의 문양',
    description: '생존력 증가',
    abilities: [],
    baseStats: { finalDamagePercent: 5 },
    specialAbility: {
      type: 'hp_regen',
      name: '생명력 흡수',
      value: 12,
      description: '12초마다 플레이어 체력 1 회복'
    }
  },
  decay: {
    id: 'decay',
    name: '부패의 문양',
    description: '보스 치유 감소 (로타르 특화)',
    abilities: ['heal_reduction'],
    baseStats: { finalDamagePercent: 5 },
    specialAbility: {
      type: 'heal_reduction',
      name: '치유 감소',
      value: 30,
      description: '보스 치유 효과 -30% (등급별 증가)'
    }
  },
  chaos: {
    id: 'chaos',
    name: '혼돈의 문양',
    description: '최종 데미지 특화 (고라스 특화)',
    abilities: [],
    baseStats: { finalDamagePercent: 12 },
    specialAbility: {
      type: 'pure_damage_boost',
      name: '순수 데미지',
      description: '최종 데미지 +12% (치명타 무효 보스 특화)'
    }
  },
  eternity: {
    id: 'eternity',
    name: '영원의 문양',
    description: '공격 타수 증가',
    abilities: [],
    baseStats: { finalDamagePercent: 3 },
    specialAbility: {
      type: 'extra_hit',
      name: '추가 타격',
      value: 1,
      description: '공격 시 타수 +1'
    }
  }
};

// 등급 마이그레이션 함수 (더 이상 마이그레이션 불필요)
export const migrateGrade = (grade) => {
  return grade;
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
      finalDamagePercent: 0,
      accuracy: 0
    };
  }

  const multiplier = gradeData.statMultiplier;

  return {
    ...inscription,
    abilities: inscription.abilities || [],
    grade: migratedGrade,
    gradeName: gradeData.name,
    gradeColor: gradeData.color,
    finalDamagePercent: (inscription.baseStats.finalDamagePercent || 0) * multiplier,
    accuracy: (inscription.baseStats.accuracy || 0) * multiplier
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
  common: 0.44,     // 44%
  uncommon: 0.27,   // 27%
  rare: 0.15,       // 15%
  epic: 0.08,       // 8%
  unique: 0.04,     // 4%
  legendary: 0.015, // 1.5%
  mythic: 0.004,    // 0.4%
  dark: 0.001       // 0.1%
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
