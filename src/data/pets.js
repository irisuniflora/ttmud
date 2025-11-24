// 봉인구역 전용 펫 시스템

// 펫 등급
export const PET_GRADES = {
  common: { name: '일반', color: 'text-gray-400', statMultiplier: 1 },
  rare: { name: '희귀', color: 'text-green-400', statMultiplier: 1.5 },
  epic: { name: '레어', color: 'text-blue-400', statMultiplier: 2 },
  unique: { name: '유니크', color: 'text-purple-400', statMultiplier: 3 },
  legendary: { name: '레전드', color: 'text-orange-400', statMultiplier: 5 },
  mythic: { name: '신화', color: 'text-pink-400', statMultiplier: 8 }
};

// 펫 능력 (보스 패턴 대응)
export const PET_ABILITIES = {
  // 베크타 대응
  skill_seal_immunity: {
    id: 'skill_seal_immunity',
    name: '스킬 봉인 면역',
    description: '스킬 봉인 효과를 받지 않음',
    icon: '🛡️',
    counters: ['vecta']
  },
  skill_seal_cleanse: {
    id: 'skill_seal_cleanse',
    name: '스킬 봉인 정화',
    description: '스킬 봉인을 받으면 자동으로 정화',
    icon: '✨',
    counters: ['vecta']
  },
  skill_seal_reset: {
    id: 'skill_seal_reset',
    name: '스킬 봉인 역전',
    description: '스킬 봉인 대상이 되면 다른 스킬 쿨타임 초기화',
    icon: '🔄',
    counters: ['vecta']
  },

  // 네페론 대응
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
    description: '보호막이 있을 때 공격 속도 +50%',
    icon: '⚡',
    counters: ['nepheron']
  },

  // 로타르 대응
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

  // 에스모드 대응
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

  // 실렌 대응
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

// 펫 정의
export const PETS = {
  seal_breaker: {
    id: 'seal_breaker',
    name: '봉인 파괴자',
    icon: '🦅',
    description: '스킬 봉인을 극복하는 펫',
    abilities: ['skill_seal_immunity', 'skill_seal_reset'],
    baseStats: {
      attack: 1000,
      attackSpeed: 1.0,
      critChance: 10,
      critDamage: 150
    }
  },
  barrier_crusher: {
    id: 'barrier_crusher',
    name: '결계 분쇄자',
    icon: '🐺',
    description: '보호막을 파괴하는 펫',
    abilities: ['shield_break', 'shield_penetration'],
    baseStats: {
      attack: 1200,
      attackSpeed: 0.9,
      critChance: 15,
      critDamage: 160
    }
  },
  decay_hunter: {
    id: 'decay_hunter',
    name: '부패 사냥꾼',
    icon: '🦊',
    description: '재생을 무력화하는 펫',
    abilities: ['heal_reduction', 'true_damage'],
    baseStats: {
      attack: 900,
      attackSpeed: 1.1,
      critChance: 12,
      critDamage: 140
    }
  },
  chaos_resist: {
    id: 'chaos_resist',
    name: '혼돈 저항자',
    icon: '🐉',
    description: '디버프를 극복하는 펫',
    abilities: ['debuff_cleanse', 'debuff_power'],
    baseStats: {
      attack: 1100,
      attackSpeed: 1.0,
      critChance: 13,
      critDamage: 155
    }
  },
  shadow_striker: {
    id: 'shadow_striker',
    name: '그림자 추격자',
    icon: '🦇',
    description: '회피를 무력화하는 펫',
    abilities: ['true_hit', 'accuracy_up'],
    baseStats: {
      attack: 1000,
      attackSpeed: 1.2,
      critChance: 20,
      critDamage: 170
    }
  }
};

// 등급별 펫 스탯 계산
export const calculatePetStats = (petId, grade) => {
  const pet = PETS[petId];
  const gradeData = PET_GRADES[grade];

  if (!pet || !gradeData) return null;

  const multiplier = gradeData.statMultiplier;

  return {
    ...pet,
    grade,
    gradeName: gradeData.name,
    gradeColor: gradeData.color,
    attack: Math.floor(pet.baseStats.attack * multiplier),
    attackSpeed: pet.baseStats.attackSpeed,
    critChance: pet.baseStats.critChance,
    critDamage: pet.baseStats.critDamage
  };
};

// 펫 뽑기 확률
export const PET_GACHA_RATES = {
  common: 0.50,    // 50%
  rare: 0.30,      // 30%
  epic: 0.15,      // 15%
  unique: 0.04,    // 4%
  legendary: 0.009, // 0.9%
  mythic: 0.001    // 0.1%
};

// 펫 뽑기 (등급 결정)
export const rollPetGrade = () => {
  const roll = Math.random();
  let cumulative = 0;

  for (const [grade, rate] of Object.entries(PET_GACHA_RATES)) {
    cumulative += rate;
    if (roll <= cumulative) return grade;
  }

  return 'common';
};
