/**
 * 동료(Companion) 시스템 데이터
 * 8계열 × 5등급 = 40명의 동료
 *
 * ============================================================
 * 계열별 색상 코드 (오브 색상과 동일 - 시너지 매칭용)
 * ============================================================
 * | 계열   | 이름   | 색상코드  | 특화 스탯        |
 * |--------|--------|-----------|------------------|
 * | 암살   | 암살   | #A855F7   | 크리티컬 확률    |
 * | 광전   | 광전   | #EF4444   | 크리티컬 데미지  |
 * | 연격   | 연격   | #06B6D4   | 추가타격 확률    |
 * | 정밀   | 정밀   | #10B981   | 명중률           |
 * | 시공   | 시공   | #3B82F6   | 스테이지 스킵    |
 * | 행운   | 행운   | #FBBF24   | 드랍률           |
 * | 재물   | 재물   | #F59E0B   | 골드 보너스      |
 * | 지혜   | 지혜   | #0EA5E9   | 경험치 보너스    |
 * ============================================================
 *
 * 등급별 색상 코드 (글로우 효과로 표현, 계열 색상과 겹치지 않음)
 * ============================================================
 * | 등급     | 이름   | 색상코드  | 뽑기확률 | 오브슬롯 |
 * |----------|--------|-----------|----------|----------|
 * | normal   | 일반   | #9CA3AF   | 60%      | 1개      |
 * | uncommon | 희귀   | #4ADE80   | 30%      | 2개      |
 * | rare     | 레어   | #60A5FA   | 8%       | 3개      |
 * | epic     | 에픽   | #EC4899   | 1.9%     | 4개      |
 * | legendary| 레전드 | #FACC15   | 0.1%     | 5개      |
 * ============================================================
 */

import { getOrbById } from './orbs.js';

// ===== 계열 정의 =====
export const COMPANION_CATEGORIES = {
  assassination: {
    id: 'assassination',
    name: '암살',
    color: '#A855F7',  // 보라 (Purple-500)
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500',
    mainStat: 'critChance',
    description: '치명타 확률 특화'
  },
  berserker: {
    id: 'berserker',
    name: '광전',
    color: '#EF4444',  // 빨강 (Red-500)
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-500',
    mainStat: 'critDamage',
    description: '치명타 데미지 특화'
  },
  striker: {
    id: 'striker',
    name: '연격',
    color: '#06B6D4',  // 청록 (Cyan-500)
    colorClass: 'text-cyan-500',
    bgClass: 'bg-cyan-500',
    borderClass: 'border-cyan-500',
    mainStat: 'extraHit',
    description: '추가타격 특화'
  },
  precision: {
    id: 'precision',
    name: '정밀',
    color: '#10B981',  // 에메랄드 (Emerald-500)
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    mainStat: 'accuracy',
    description: '명중률 특화'
  },
  temporal: {
    id: 'temporal',
    name: '시공',
    color: '#3B82F6',  // 파랑 (Blue-500)
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    mainStat: 'stageSkip',
    description: '스테이지 스킵 특화'
  },
  fortune: {
    id: 'fortune',
    name: '행운',
    color: '#FBBF24',  // 노랑 (Amber-400)
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400',
    borderClass: 'border-amber-400',
    mainStat: 'dropRate',
    description: '드랍률 특화'
  },
  wealth: {
    id: 'wealth',
    name: '재물',
    color: '#F59E0B',  // 금색 (Amber-500)
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    mainStat: 'goldBonus',
    description: '골드 보너스 특화'
  },
  wisdom: {
    id: 'wisdom',
    name: '지혜',
    color: '#0EA5E9',  // 하늘 (Sky-500)
    colorClass: 'text-sky-500',
    bgClass: 'bg-sky-500',
    borderClass: 'border-sky-500',
    mainStat: 'expBonus',
    description: '경험치 보너스 특화'
  }
};

// ===== 동료 등급 (5등급) =====
// 등급 색상은 계열 색상과 겹치지 않도록 설정
export const COMPANION_GRADES = {
  normal: {
    id: 'normal',
    name: '일반',
    color: '#9CA3AF',      // 회색
    glowColor: 'none',
    multiplier: 1.0,
    orbSlots: 1,
    pullRate: 80  // 뽑기 확률 %
  },
  uncommon: {
    id: 'uncommon',
    name: '희귀',
    color: '#4ADE80',      // 초록
    glowColor: '0 0 8px #4ADE80',
    multiplier: 1.5,
    orbSlots: 2,
    pullRate: 18
  },
  rare: {
    id: 'rare',
    name: '레어',
    color: '#60A5FA',      // 하늘파랑
    glowColor: '0 0 12px #60A5FA',
    multiplier: 2.5,
    orbSlots: 3,
    pullRate: 1.89
  },
  epic: {
    id: 'epic',
    name: '에픽',
    color: '#EC4899',      // 핑크 (암살 보라와 구분)
    glowColor: '0 0 16px #EC4899, 0 0 32px #EC489950',
    multiplier: 4.0,
    orbSlots: 4,
    pullRate: 0.1
  },
  legendary: {
    id: 'legendary',
    name: '레전드',
    color: '#FACC15',      // 금색 (재물/행운과 구분)
    glowColor: '0 0 20px #FACC15, 0 0 40px #FACC1580, 0 0 60px #FACC1540',
    multiplier: 7.0,
    orbSlots: 5,
    pullRate: 0.01
  }
};

export const GRADE_ORDER = ['normal', 'uncommon', 'rare', 'epic', 'legendary'];

// ===== 동료 데이터 (40명) =====
export const COMPANIONS = [
  // ===== 암살 계열 (크리 확률) =====
  {
    id: 'shadow',
    name: '섀도우',
    category: 'assassination',
    grade: 'normal',
    description: '그림자 속에서 활동하는 초보 암살자',
    baseStats: { attack: 80, critChance: 3 },
    subStats: {}
  },
  {
    id: 'assassin',
    name: '어쌔신',
    category: 'assassination',
    grade: 'uncommon',
    description: '숙련된 암살 기술을 보유한 자객',
    baseStats: { attack: 120, critChance: 5 },
    subStats: { critDamage: 5 }
  },
  {
    id: 'nightblade',
    name: '나이트블레이드',
    category: 'assassination',
    grade: 'rare',
    description: '밤의 칼날로 적을 베는 숙련자',
    baseStats: { attack: 180, critChance: 8 },
    subStats: { critDamage: 10, extraHit: 3 }
  },
  {
    id: 'reaper',
    name: '리퍼',
    category: 'assassination',
    grade: 'epic',
    description: '죽음을 거두는 공포의 존재',
    baseStats: { attack: 280, critChance: 12 },
    subStats: { critDamage: 20, extraHit: 5 }
  },
  {
    id: 'deathlord',
    name: '데스로드',
    category: 'assassination',
    grade: 'legendary',
    description: '죽음 그 자체를 지배하는 군주',
    baseStats: { attack: 500, critChance: 18 },
    subStats: { critDamage: 35, extraHit: 8 }
  },

  // ===== 광전 계열 (크리 데미지) =====
  {
    id: 'fighter',
    name: '파이터',
    category: 'berserker',
    grade: 'normal',
    description: '싸움을 즐기는 전투 입문자',
    baseStats: { attack: 100, critDamage: 15 },
    subStats: {}
  },
  {
    id: 'warrior',
    name: '워리어',
    category: 'berserker',
    grade: 'uncommon',
    description: '전장에서 단련된 전사',
    baseStats: { attack: 150, critDamage: 25 },
    subStats: { critChance: 2 }
  },
  {
    id: 'berserker',
    name: '버서커',
    category: 'berserker',
    grade: 'rare',
    description: '광기로 적을 압도하는 광전사',
    baseStats: { attack: 220, critDamage: 40 },
    subStats: { critChance: 4, attack: 50 }
  },
  {
    id: 'slayer',
    name: '슬레이어',
    category: 'berserker',
    grade: 'epic',
    description: '살육의 화신이 된 학살자',
    baseStats: { attack: 350, critDamage: 60 },
    subStats: { critChance: 6, attack: 100 }
  },
  {
    id: 'titan',
    name: '타이탄',
    category: 'berserker',
    grade: 'legendary',
    description: '신들조차 두려워하는 거인',
    baseStats: { attack: 600, critDamage: 100 },
    subStats: { critChance: 10, attack: 200 }
  },

  // ===== 연격 계열 (추가타격) =====
  {
    id: 'striker',
    name: '스트라이커',
    category: 'striker',
    grade: 'normal',
    description: '빠른 연타를 구사하는 격투가',
    baseStats: { attack: 70, extraHit: 5 },
    subStats: {}
  },
  {
    id: 'duelist',
    name: '듀얼리스트',
    category: 'striker',
    grade: 'uncommon',
    description: '쌍검을 다루는 결투사',
    baseStats: { attack: 100, extraHit: 8 },
    subStats: { critChance: 2 }
  },
  {
    id: 'bladedancer',
    name: '블레이드댄서',
    category: 'striker',
    grade: 'rare',
    description: '칼날의 춤을 추는 무희',
    baseStats: { attack: 150, extraHit: 12 },
    subStats: { critChance: 4, critDamage: 10 }
  },
  {
    id: 'swordmaster',
    name: '소드마스터',
    category: 'striker',
    grade: 'epic',
    description: '검술의 정점에 오른 달인',
    baseStats: { attack: 240, extraHit: 18 },
    subStats: { critChance: 6, critDamage: 20 }
  },
  {
    id: 'bladesoul',
    name: '블레이드소울',
    category: 'striker',
    grade: 'legendary',
    description: '검과 하나가 된 전설적 존재',
    baseStats: { attack: 400, extraHit: 28 },
    subStats: { critChance: 10, critDamage: 35 }
  },

  // ===== 정밀 계열 (명중률) =====
  {
    id: 'archer',
    name: '아처',
    category: 'precision',
    grade: 'normal',
    description: '활을 다루는 궁수 수련생',
    baseStats: { attack: 75, accuracy: 50 },
    subStats: {}
  },
  {
    id: 'sniper',
    name: '스나이퍼',
    category: 'precision',
    grade: 'uncommon',
    description: '정밀한 조준의 저격수',
    baseStats: { attack: 110, accuracy: 100 },
    subStats: { critChance: 3 }
  },
  {
    id: 'ranger',
    name: '레인저',
    category: 'precision',
    grade: 'rare',
    description: '숲을 누비는 명사수',
    baseStats: { attack: 160, accuracy: 180 },
    subStats: { critChance: 5, critDamage: 15 }
  },
  {
    id: 'hawkeye',
    name: '호크아이',
    category: 'precision',
    grade: 'epic',
    description: '매의 눈을 가진 명궁',
    baseStats: { attack: 250, accuracy: 300 },
    subStats: { critChance: 8, critDamage: 25 }
  },
  {
    id: 'eagleeye',
    name: '이글아이',
    category: 'precision',
    grade: 'legendary',
    description: '절대로 빗나가지 않는 전설의 사수',
    baseStats: { attack: 420, accuracy: 500 },
    subStats: { critChance: 12, critDamage: 40 }
  },

  // ===== 시공 계열 (스테이지 스킵) =====
  {
    id: 'novice',
    name: '노비스',
    category: 'temporal',
    grade: 'normal',
    description: '시간 마법을 배우기 시작한 수련생',
    baseStats: { attack: 60, stageSkip: 2 },
    subStats: {}
  },
  {
    id: 'mage',
    name: '메이지',
    category: 'temporal',
    grade: 'uncommon',
    description: '시공간을 다루는 마법사',
    baseStats: { attack: 90, stageSkip: 4 },
    subStats: { expBonus: 5 }
  },
  {
    id: 'chronocer',
    name: '크로노서',
    category: 'temporal',
    grade: 'rare',
    description: '시간의 흐름을 조종하는 술사',
    baseStats: { attack: 130, stageSkip: 7 },
    subStats: { expBonus: 10, goldBonus: 5 }
  },
  {
    id: 'timewalker',
    name: '타임워커',
    category: 'temporal',
    grade: 'epic',
    description: '시간 속을 걷는 초월자',
    baseStats: { attack: 200, stageSkip: 11 },
    subStats: { expBonus: 20, goldBonus: 10 }
  },
  {
    id: 'dimensionlord',
    name: '디멘션로드',
    category: 'temporal',
    grade: 'legendary',
    description: '차원 전체를 지배하는 군주',
    baseStats: { attack: 350, stageSkip: 18 },
    subStats: { expBonus: 35, goldBonus: 20 }
  },

  // ===== 행운 계열 (드랍률) =====
  {
    id: 'scout',
    name: '스카우트',
    category: 'fortune',
    grade: 'normal',
    description: '보물을 찾아다니는 정찰병',
    baseStats: { attack: 65, dropRate: 3 },
    subStats: {}
  },
  {
    id: 'tracker',
    name: '트래커',
    category: 'fortune',
    grade: 'uncommon',
    description: '숨겨진 것을 추적하는 사냥꾼',
    baseStats: { attack: 95, dropRate: 6 },
    subStats: { goldBonus: 5 }
  },
  {
    id: 'treasurehunter',
    name: '트레져헌터',
    category: 'fortune',
    grade: 'rare',
    description: '보물을 찾는 전문 사냥꾼',
    baseStats: { attack: 140, dropRate: 10 },
    subStats: { goldBonus: 10, expBonus: 5 }
  },
  {
    id: 'fortuneseeker',
    name: '포춘시커',
    category: 'fortune',
    grade: 'epic',
    description: '행운이 따르는 탐험가',
    baseStats: { attack: 210, dropRate: 16 },
    subStats: { goldBonus: 20, expBonus: 10 }
  },
  {
    id: 'lucklord',
    name: '럭로드',
    category: 'fortune',
    grade: 'legendary',
    description: '행운 그 자체인 전설적 존재',
    baseStats: { attack: 360, dropRate: 25 },
    subStats: { goldBonus: 35, expBonus: 20 }
  },

  // ===== 재물 계열 (골드 보너스) =====
  {
    id: 'trader',
    name: '트레이더',
    category: 'wealth',
    grade: 'normal',
    description: '장사를 시작한 초보 상인',
    baseStats: { attack: 60, goldBonus: 5 },
    subStats: {}
  },
  {
    id: 'merchant',
    name: '머천트',
    category: 'wealth',
    grade: 'uncommon',
    description: '거래에 능숙한 상인',
    baseStats: { attack: 85, goldBonus: 10 },
    subStats: { dropRate: 3 }
  },
  {
    id: 'banker',
    name: '뱅커',
    category: 'wealth',
    grade: 'rare',
    description: '금융을 다루는 은행가',
    baseStats: { attack: 120, goldBonus: 18 },
    subStats: { dropRate: 6, expBonus: 5 }
  },
  {
    id: 'goldbaron',
    name: '골드바론',
    category: 'wealth',
    grade: 'epic',
    description: '황금을 지배하는 남작',
    baseStats: { attack: 180, goldBonus: 30 },
    subStats: { dropRate: 10, expBonus: 10 }
  },
  {
    id: 'kingofgold',
    name: '킹오브골드',
    category: 'wealth',
    grade: 'legendary',
    description: '황금의 왕, 부의 정점',
    baseStats: { attack: 300, goldBonus: 50 },
    subStats: { dropRate: 18, expBonus: 20 }
  },

  // ===== 지혜 계열 (경험치 보너스) =====
  {
    id: 'scholar',
    name: '스콜라',
    category: 'wisdom',
    grade: 'normal',
    description: '지식을 탐구하는 학생',
    baseStats: { attack: 55, expBonus: 5 },
    subStats: {}
  },
  {
    id: 'sage',
    name: '세이지',
    category: 'wisdom',
    grade: 'uncommon',
    description: '지혜로운 현자',
    baseStats: { attack: 80, expBonus: 10 },
    subStats: { goldBonus: 5 }
  },
  {
    id: 'master',
    name: '마스터',
    category: 'wisdom',
    grade: 'rare',
    description: '학문의 대가',
    baseStats: { attack: 115, expBonus: 18 },
    subStats: { goldBonus: 8, dropRate: 5 }
  },
  {
    id: 'grandmaster',
    name: '그랜드마스터',
    category: 'wisdom',
    grade: 'epic',
    description: '최고의 지식을 갖춘 현인',
    baseStats: { attack: 170, expBonus: 30 },
    subStats: { goldBonus: 15, dropRate: 8 }
  },
  {
    id: 'enlightened',
    name: '엔라이튼드',
    category: 'wisdom',
    grade: 'legendary',
    description: '깨달음을 얻은 초월자',
    baseStats: { attack: 280, expBonus: 50 },
    subStats: { goldBonus: 25, dropRate: 15 }
  }
];

// ===== 별 시스템 =====
export const STAR_CONFIG = {
  maxStars: 5,
  // 등급별 별 업그레이드에 필요한 카드 수
  cardCostPerStar: {
    normal: 3,
    uncommon: 5,
    rare: 10,
    epic: 20,
    legendary: 50
  },
  // 별당 스탯 증가율 (%)
  statBonusPerStar: 10
};

// ===== 헬퍼 함수 =====

// ID로 동료 찾기
export const getCompanionById = (companionId) => {
  return COMPANIONS.find(c => c.id === companionId);
};

// 계열로 동료 필터
export const getCompanionsByCategory = (categoryId) => {
  return COMPANIONS.filter(c => c.category === categoryId);
};

// 등급으로 동료 필터
export const getCompanionsByGrade = (gradeId) => {
  return COMPANIONS.filter(c => c.grade === gradeId);
};

// 동료의 현재 스탯 계산 (별 고려)
export const getCompanionStats = (companion, stars = 0, equippedOrbs = []) => {
  const starMultiplier = 1 + (stars * STAR_CONFIG.statBonusPerStar / 100);
  const category = COMPANION_CATEGORIES[companion.category];

  const stats = {
    attack: Math.floor(companion.baseStats.attack * starMultiplier)
  };

  // 메인 스탯 계산
  const mainStatKey = category.mainStat;
  if (companion.baseStats[mainStatKey] !== undefined) {
    stats[mainStatKey] = companion.baseStats[mainStatKey] * starMultiplier;
  }

  // 서브 스탯 계산
  Object.entries(companion.subStats).forEach(([key, value]) => {
    if (key === 'attack') {
      stats.attack += Math.floor(value * starMultiplier);
    } else {
      stats[key] = (stats[key] || 0) + value * starMultiplier;
    }
  });

  // 오브 효과 적용
  equippedOrbs.forEach(orb => {
    if (!orb) return;
    const orbData = getOrbById(orb.id);
    if (!orbData) return;

    const orbGrade = orb.grade || 'normal';
    let orbValue = orbData.effectByGrade[orbGrade] || 0;

    // 시너지 보너스 (동료 계열 색상 = 오브 색상)
    if (orbData.category === companion.category) {
      orbValue *= 1.5;
    }

    const statKey = orbData.statKey;
    stats[statKey] = (stats[statKey] || 0) + orbValue;
  });

  return stats;
};

// 등급 인덱스
export const getGradeIndex = (gradeId) => {
  return GRADE_ORDER.indexOf(gradeId);
};

// 뽑기 확률 기반 등급 결정
export const rollCompanionGrade = () => {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const gradeId of GRADE_ORDER) {
    cumulative += COMPANION_GRADES[gradeId].pullRate;
    if (roll < cumulative) {
      return gradeId;
    }
  }
  return 'normal';
};

// 뽑기 결과 생성 (10연차)
export const pullCompanions = (count = 10) => {
  const results = [];

  for (let i = 0; i < count; i++) {
    const grade = rollCompanionGrade();
    const companionsOfGrade = getCompanionsByGrade(grade);
    const randomCompanion = companionsOfGrade[Math.floor(Math.random() * companionsOfGrade.length)];

    results.push({
      companion: randomCompanion,
      isNew: false,  // 나중에 게임 상태와 비교해서 설정
      grade: grade
    });
  }

  return results;
};

