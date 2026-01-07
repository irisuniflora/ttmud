/**
 * 오브(Orb) 시스템 데이터
 * 동료에게 장착하여 추가 능력치 부여
 * 동료 계열과 같은 색상일 경우 1.5배 시너지
 */

// ===== 오브 등급 (5등급) =====
// 등급 색상은 계열 색상과 겹치지 않도록 설정
export const ORB_GRADES = {
  normal: {
    id: 'normal',
    name: '일반',
    color: '#9CA3AF',      // 회색
    glowColor: 'none',
    pullRate: 80
  },
  uncommon: {
    id: 'uncommon',
    name: '희귀',
    color: '#4ADE80',      // 초록
    glowColor: '0 0 8px #4ADE80',
    pullRate: 18
  },
  rare: {
    id: 'rare',
    name: '레어',
    color: '#60A5FA',      // 하늘파랑 (시공 계열과 구분)
    glowColor: '0 0 12px #60A5FA',
    pullRate: 1.89
  },
  epic: {
    id: 'epic',
    name: '에픽',
    color: '#EC4899',      // 핑크 (암살 보라와 구분)
    glowColor: '0 0 16px #EC4899, 0 0 32px #EC489950',
    pullRate: 0.1
  },
  legendary: {
    id: 'legendary',
    name: '레전드',
    color: '#FACC15',      // 금색 (재물/행운 계열과 구분)
    glowColor: '0 0 20px #FACC15, 0 0 40px #FACC1580, 0 0 60px #FACC1540',
    pullRate: 0.01
  }
};

export const ORB_GRADE_ORDER = ['normal', 'uncommon', 'rare', 'epic', 'legendary'];

// ===== 오브 강화/분해 설정 =====
export const ORB_UPGRADE_CONFIG = {
  // 오브 강화 (같은 타입 5개 → 1등급 상승)
  materialsRequired: 5,
  successRate: 70, // 70% 성공률

  // 분해 시 획득 가루
  dustByGrade: {
    normal: 10,
    uncommon: 30,
    rare: 100,
    epic: 300,
    legendary: 1000
  },

  // 제작 비용 (가루)
  craftCost: {
    normal: 50,
    uncommon: 150,
    rare: 500,
    epic: 1500,
    legendary: 5000
  }
};

// ===== 오브 타입 정의 =====
// 오브 색상 = 시너지 계열 색상과 동일 (직관적 매칭)
export const ORBS = [
  {
    id: 'shadow_orb',
    name: '그림자 오브',
    category: 'assassination',  // 암살 계열과 시너지
    color: '#A855F7',           // 암살 계열 색상과 동일
    statKey: 'critChance',
    statName: '크리티컬 확률',
    description: '그림자의 기운이 담긴 오브',
    effectByGrade: {
      normal: 2,
      uncommon: 4,
      rare: 7,
      epic: 10,
      legendary: 15
    },
    unit: '%'
  },
  {
    id: 'fury_orb',
    name: '분노의 오브',
    category: 'berserker',      // 광전 계열과 시너지
    color: '#EF4444',           // 광전 계열 색상과 동일
    statKey: 'critDamage',
    statName: '크리티컬 데미지',
    description: '끓어오르는 분노가 담긴 오브',
    effectByGrade: {
      normal: 10,
      uncommon: 20,
      rare: 35,
      epic: 50,
      legendary: 80
    },
    unit: '%'
  },
  {
    id: 'gale_orb',
    name: '질풍의 오브',
    category: 'striker',        // 연격 계열과 시너지
    color: '#06B6D4',           // 연격 계열 색상과 동일
    statKey: 'extraHit',
    statName: '추가타격 확률',
    description: '바람의 속도가 담긴 오브',
    effectByGrade: {
      normal: 3,
      uncommon: 6,
      rare: 10,
      epic: 15,
      legendary: 25
    },
    unit: '%'
  },
  {
    id: 'focus_orb',
    name: '집중의 오브',
    category: 'precision',      // 정밀 계열과 시너지
    color: '#10B981',           // 정밀 계열 색상과 동일
    statKey: 'accuracy',
    statName: '명중률',
    description: '정신 집중의 힘이 담긴 오브',
    effectByGrade: {
      normal: 50,
      uncommon: 100,
      rare: 200,
      epic: 350,
      legendary: 500
    },
    unit: ''
  },
  {
    id: 'time_orb',
    name: '시간의 오브',
    category: 'temporal',       // 시공 계열과 시너지
    color: '#3B82F6',           // 시공 계열 색상과 동일
    statKey: 'stageSkip',
    statName: '스테이지 스킵',
    description: '시간의 흐름이 담긴 오브',
    effectByGrade: {
      normal: 1,
      uncommon: 2,
      rare: 4,
      epic: 6,
      legendary: 10
    },
    unit: '%'
  },
  {
    id: 'luck_orb',
    name: '행운의 오브',
    category: 'fortune',        // 행운 계열과 시너지
    color: '#FBBF24',           // 행운 계열 색상과 동일
    statKey: 'dropRate',
    statName: '드랍률',
    description: '행운의 기운이 담긴 오브',
    effectByGrade: {
      normal: 3,
      uncommon: 6,
      rare: 10,
      epic: 15,
      legendary: 25
    },
    unit: '%'
  },
  {
    id: 'gold_orb',
    name: '황금의 오브',
    category: 'wealth',         // 재물 계열과 시너지
    color: '#F59E0B',           // 재물 계열 색상과 동일
    statKey: 'goldBonus',
    statName: '골드 보너스',
    description: '황금빛 기운이 담긴 오브',
    effectByGrade: {
      normal: 5,
      uncommon: 10,
      rare: 20,
      epic: 35,
      legendary: 50
    },
    unit: '%'
  },
  {
    id: 'wisdom_orb',
    name: '지혜의 오브',
    category: 'wisdom',         // 지혜 계열과 시너지
    color: '#0EA5E9',           // 지혜 계열 색상과 동일
    statKey: 'expBonus',
    statName: '경험치 보너스',
    description: '지혜의 빛이 담긴 오브',
    effectByGrade: {
      normal: 5,
      uncommon: 10,
      rare: 20,
      epic: 35,
      legendary: 50
    },
    unit: '%'
  },
  // 범용 오브 (시너지 없음, 대신 기본 효과가 조금 더 높음)
  {
    id: 'power_orb',
    name: '힘의 오브',
    category: null,             // 시너지 없음
    color: '#78716C',           // 무채색 (범용)
    statKey: 'attack',
    statName: '공격력',
    description: '순수한 힘이 담긴 오브',
    effectByGrade: {
      normal: 30,
      uncommon: 70,
      rare: 150,
      epic: 300,
      legendary: 600
    },
    unit: ''
  }
];

// ===== 헬퍼 함수 =====

// ID로 오브 찾기
export const getOrbById = (orbId) => {
  return ORBS.find(o => o.id === orbId);
};

// 카테고리로 오브 찾기
export const getOrbByCategory = (categoryId) => {
  return ORBS.find(o => o.category === categoryId);
};

// 오브 등급 롤
export const rollOrbGrade = () => {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const gradeId of ORB_GRADE_ORDER) {
    cumulative += ORB_GRADES[gradeId].pullRate;
    if (roll < cumulative) {
      return gradeId;
    }
  }
  return 'normal';
};

// 오브 뽑기 (1개)
export const pullOrb = () => {
  const grade = rollOrbGrade();
  const randomOrb = ORBS[Math.floor(Math.random() * ORBS.length)];

  return {
    id: `${randomOrb.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orbType: randomOrb.id,
    grade: grade
  };
};

// 오브 효과 계산 (시너지 포함)
export const getOrbEffect = (orbInstance, companionCategory) => {
  const orbData = getOrbById(orbInstance.orbType);
  if (!orbData) return { statKey: null, value: 0, hasSynergy: false };

  const baseValue = orbData.effectByGrade[orbInstance.grade] || 0;
  const hasSynergy = orbData.category === companionCategory;
  const finalValue = hasSynergy ? baseValue * 1.5 : baseValue;

  return {
    statKey: orbData.statKey,
    value: finalValue,
    hasSynergy: hasSynergy,
    unit: orbData.unit
  };
};

// 오브 표시용 정보
export const getOrbDisplayInfo = (orbInstance) => {
  const orbData = getOrbById(orbInstance.orbType);
  const gradeData = ORB_GRADES[orbInstance.grade];

  if (!orbData || !gradeData) return null;

  return {
    name: orbData.name,
    gradeName: gradeData.name,
    color: orbData.color,
    gradeColor: gradeData.color,
    statName: orbData.statName,
    value: orbData.effectByGrade[orbInstance.grade],
    unit: orbData.unit,
    description: orbData.description
  };
};
