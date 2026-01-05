/**
 * 게임 밸런스 설정
 * 모든 수치와 계산식을 한 곳에서 관리
 */

// ===== 기본 게임 설정 =====
export const GAME_CONFIG = {
  tickRate: 500, // 게임 틱 속도 (밀리초)
  autoSaveInterval: 5000, // 자동 저장 간격 (밀리초)
};

// ===== 플레이어 기본 스탯 =====
export const PLAYER_BASE_STATS = {
  level: 1,
  exp: 0,
  expToNextLevel: 100,
  gold: 100,
  baseAtk: 10,
  critChance: 5, // %
  critDmg: 150, // %
  goldBonus: 0, // %
  dropRate: 5, // %
};

// ===== 경험치 시스템 =====
export const EXP_CONFIG = {
  // 몬스터 처치 시 기본 경험치
  baseExpPerKill: 10,

  // 레벨업 필요 경험치 계산식
  // 레벨업 경험치 = baseExpToLevel * (multiplier ^ (level - 1))
  baseExpToLevel: 100,
  expMultiplier: 1.1,

  // 레벨업 시 스탯 증가
  atkPerLevel: 5,
};

// ===== 골드 시스템 =====
export const GOLD_CONFIG = {
  // 골드 획득 계산식은 monsters.js에서 관리
  // 여기서는 보너스 관련 설정만
  baseGoldBonus: 0, // 기본 골드 보너스 %
};

// ===== 드랍 시스템 =====
export const DROP_CONFIG = {
  // 아이템 드랍
  item: {
    baseDropRate: 5, // 기본 드랍율 %
    dropRatePerStage: 0, // 스테이지당 추가 드랍율
  },

  // 영웅 카드 드랍
  heroCard: {
    baseDropRate: 1, // 기본 드랍율 1% (모든 몬스터 처치 시)
    stageBonus: 0, // 스테이지당 추가 % (0으로 고정)
    stageBonusInterval: 10, // 보너스 적용 간격
  },

  // 영웅의 서 드랍 (구 등급업 코인)
  heroScroll: {
    baseDropRate: 1, // 기본 드랍율 1%
    floorMultiplier: 1.2, // 100층마다 1.2배 복리
    floorInterval: 100, // 100층 단위로 복리 적용
    dropAmount: 1, // 고정 1개 드랍
  },
};

// ===== 영웅 시스템 =====
export const HERO_CONFIG = {
  // 영웅 등급 시스템 (문양 등급과 통일)
  grades: {
    normal: { name: '일반', color: '#9CA3AF', colorClass: 'text-gray-400' },
    uncommon: { name: '희귀', color: '#4ADE80', colorClass: 'text-green-400' },
    rare: { name: '레어', color: '#3B82F6', colorClass: 'text-blue-400' },
    epic: { name: '에픽', color: '#A855F7', colorClass: 'text-purple-400' },
    unique: { name: '유니크', color: '#EAB308', colorClass: 'text-yellow-400' },
    legendary: { name: '레전드', color: '#F97316', colorClass: 'text-orange-400' },
    mythic: { name: '신화', color: '#EF4444', colorClass: 'text-red-400' },
    dark: { name: '다크', color: '#D946EF', colorClass: 'text-fuchsia-500' },
  },

  // 등급 순서 (8등급)
  gradeOrder: ['normal', 'uncommon', 'rare', 'epic', 'unique', 'legendary', 'mythic', 'dark'],

  // 등급별 스탯 배율 (문양과 동일)
  gradeMultiplier: {
    normal: 1,
    uncommon: 1.5,
    rare: 2.2,
    epic: 3,
    unique: 4,
    legendary: 6,
    mythic: 10,
    dark: 15,
  },

  // 별 시스템
  maxStarsPerGrade: 5,
  starBonusMultiplier: 0.2, // 별당 등급 스탯의 20% 추가

  // 등급업 비용 (각 등급에서 다음 등급으로 갈 때 필요한 토큰)
  upgradeCostByGrade: [2, 3, 5, 8, 13, 21, 34], // normal->uncommon: 2, uncommon->rare: 3, ...

  // 별 업그레이드 카드 소모량 (등급별로 별 하나당 필요한 카드 수)
  starUpgradeCostByGrade: [1, 2, 3, 5, 8, 13, 21, 34], // normal: 1장, uncommon: 2장, rare: 3장, ...

  // 영웅별 기본 스탯 (heroes.js에서 정의)
  // 모든 영웅 기본 공격력
  heroBaseAttack: 100,
  heroAttackPerStar: 20,

  // 크리티컬 확률 딜러
  critChanceDealerBase: 5,
  critChanceDealerPerGrade: 2, // 등급업시 +2%
  critChanceDealerBaseStar: 0.2,
  critChanceDealerStarPerGrade: 0.1,

  // 크리티컬 데미지 딜러
  critDmgDealerBase: 20,
  critDmgDealerPerGrade: 15,
  critDmgDealerBaseStar: 3, // 별당 +3%
  critDmgDealerStarPerGrade: 2, // 등급당 별 보너스 증가

  // 추가타격 딜러 (다크 리퍼) - 등급별 고정 수치
  // [일반, 희귀, 레어, 에픽, 유니크, 레전드, 신화, 다크]
  extraHitChanceByGrade: [10, 14, 18, 22, 26, 30, 34, 42],

  // 명중률 딜러 (아크메이지) - 등급별 고정 수치
  // [일반, 희귀, 레어, 에픽, 유니크, 레전드, 신화, 다크]
  accuracyByGrade: [100, 200, 350, 550, 800, 1100, 1500, 2000],

  // 스테이지 스킵 버퍼
  stageSkipBufferBase: 2,
  stageSkipBufferPerGrade: 1.5,

  // 드랍율 버퍼
  dropRateBufferBase: 5,
  dropRateBufferPerGrade: 3,

  // 골드 버퍼
  goldBufferBase: 10,
  goldBufferPerGrade: 8,

  // 경험치 버퍼
  expBufferBase: 15,
  expBufferPerGrade: 10,
};

// ===== 층(Floor) 시스템 =====
export const FLOOR_CONFIG = {
  // 한 층당 일반 몬스터 수 (기본값 - 1~100층)
  monstersPerFloor: 40,

  // 보스 타이머
  bossTimeLimit: 20, // 초

  // 보스 체력 배수
  bossHPMultiplier: 20,
};

/**
 * 층수에 따른 몬스터 수 계산
 * 100층 구간마다 10마리씩 증가
 * 1-100층: 40마리, 101-200층: 50마리, 201-300층: 60마리, ...
 * @param {number} floor - 층수
 * @returns {number} 해당 층의 몬스터 수
 */
export const getMonstersPerFloor = (floor) => {
  const hundredBlock = Math.floor((floor - 1) / 100); // 0: 1-100층, 1: 101-200층, ...
  return FLOOR_CONFIG.monstersPerFloor + (hundredBlock * 10);
};

// ===== 몬스터 시스템 =====
export const MONSTER_CONFIG = {
  // 몬스터 HP 계산식 (층 기반)
  // HP = baseHP * (hpMultiplier ^ (floor - 1))
  baseHP: 100, // 첫 층 기본 체력
  hpMultiplier: 1.05, // 층당 1.05배

  // 보스 HP 배수 (FLOOR_CONFIG에서 관리)
  bossHPMultiplier: 20,

  // 몬스터 골드 계산식
  // Gold = baseGold * (goldMultiplier ^ (floor - 1))
  baseGold: 10,
  goldMultiplier: 1.1,

  // 보스 골드 배수
  bossGoldMultiplier: 3,
};

// ===== 장비 시스템 =====
export const EQUIPMENT_CONFIG = {
  // 장비 슬롯
  slots: ['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'],

  // 장비 레어리티 (스탯 배수 범위) - 등급 통일
  rarities: {
    common: { name: '일반', color: '#9CA3AF', weight: 50, statMin: 0.50, statMax: 1.00 },
    uncommon: { name: '희귀', color: '#4ADE80', weight: 35, statMin: 1.00, statMax: 1.50 },
    rare: { name: '레어', color: '#3B82F6', weight: 20, statMin: 1.50, statMax: 2.20 },
    epic: { name: '에픽', color: '#A855F7', weight: 12, statMin: 2.20, statMax: 3.00 },
    unique: { name: '유니크', color: '#EAB308', weight: 6, statMin: 3.00, statMax: 4.00 },
    legendary: { name: '레전드', color: '#F97316', weight: 3, statMin: 4.00, statMax: 6.00 },
    mythic: { name: '신화', color: '#EF4444', weight: 1.5, statMin: 6.00, statMax: 10.00 },
    dark: { name: '다크', color: '#D946EF', weight: 0.5, statMin: 10.00, statMax: 15.00 },
  },

  // 티어 시스템 (50층 단위로 장비 성능 상승)
  tierSystem: {
    floorInterval: 50, // 50층마다 티어 증가
    tierMultiplier: 1.2, // 티어당 1.2배 증가
  },

  // 슬롯 강화 시스템
  enhancement: {
    baseCost: 1000, // 기본 강화 비용
    costMultiplier: 1.5, // 레벨당 비용 증가 배수
    statBonusPerLevel: 5, // 레벨당 스탯 증가 (%)
    baseSuccessRate: 100, // 기본 성공률 (%)
    successRateDecayPerLevel: 2, // 레벨당 성공률 감소 (%)
    minSuccessRate: 10, // 최소 성공률 (%)
    // 크리티컬 관련 스탯은 강화 효과 미적용
    excludedStats: ['critChance', 'critDmg']
  },

  // 장비 스탯 범위 (등급별로 min~max 범위 내에서 랜덤)
  // statValue = random(minValue, maxValue) * (1 + floor * floorMultiplier)
  statRanges: {
    atk: {
      floorMultiplier: 0.05, // 층당 5% 증가
      rarityRanges: {
        common: { min: 10, max: 20 },
        rare: { min: 20, max: 40 },
        epic: { min: 40, max: 80 },
        legendary: { min: 80, max: 160 },
        mythic: { min: 160, max: 300 },
      },
    },
    critChance: {
      floorMultiplier: 0.02, // 층당 2% 증가
      rarityRanges: {
        common: { min: 2, max: 6 },
        rare: { min: 6, max: 10 },
        epic: { min: 10, max: 16 },
        legendary: { min: 16, max: 24 },
        mythic: { min: 24, max: 40 },
      },
    },
    critDmg: {
      floorMultiplier: 0.03, // 층당 3% 증가
      rarityRanges: {
        common: { min: 20, max: 40 },
        rare: { min: 40, max: 80 },
        epic: { min: 80, max: 140 },
        legendary: { min: 140, max: 240 },
        mythic: { min: 240, max: 400 },
      },
    },
    goldBonus: {
      floorMultiplier: 0.03, // 층당 3% 증가
      rarityRanges: {
        common: { min: 10, max: 20 },
        rare: { min: 20, max: 40 },
        epic: { min: 40, max: 70 },
        legendary: { min: 70, max: 120 },
        mythic: { min: 120, max: 200 },
      },
    },
    dropRate: {
      floorMultiplier: 0.02, // 층당 2% 증가
      rarityRanges: {
        common: { min: 4, max: 10 },
        rare: { min: 10, max: 20 },
        epic: { min: 20, max: 30 },
        legendary: { min: 30, max: 50 },
        mythic: { min: 50, max: 80 },
      },
    },
    allDmg: {
      floorMultiplier: 0.03, // 층당 3% 증가
      rarityRanges: {
        common: { min: 10, max: 20 },
        rare: { min: 20, max: 40 },
        epic: { min: 40, max: 60 },
        legendary: { min: 60, max: 100 },
        mythic: { min: 100, max: 160 },
      },
    },
    heroDmg: {
      floorMultiplier: 0.04, // 층당 4% 증가
      rarityRanges: {
        common: { min: 20, max: 40 },
        rare: { min: 40, max: 70 },
        epic: { min: 70, max: 120 },
        legendary: { min: 120, max: 200 },
        mythic: { min: 200, max: 300 },
      },
    },
  },
};

// ===== 귀환 시스템 =====
export const PRESTIGE_CONFIG = {
  // 귀환 가능 최소 스테이지
  minStage: 50,

  // PP 획득 계산식
  // PP = Math.floor(stage / ppPerStage)
  ppPerStage: 10,
};

// ===== 고대 유물 시스템 =====
export const RELIC_CONFIG = {
  // 가챠 시스템
  gacha: {
    firstPullCost: 1, // 첫 번째 뽑기 비용
    costMultiplier: 1.4, // 뽑기당 비용 증가 배수 (올림 적용)
    // 비용 계산: Math.ceil(firstPullCost * Math.pow(costMultiplier, pullCount))
  },

  // 업그레이드 시스템
  upgrade: {
    baseCostFormula: (level) => Math.floor(1 + level * 0.5), // 레벨별 기본 비용
    maxCostReduction: 90, // 최대 비용 감소 % (망각의 가면 유물)
  },

  // 등급별 스탯 배수
  gradeMultipliers: {
    common: 1,
    rare: 1.5,
    epic: 2,
    unique: 3,
    legendary: 5,
    mythic: 8,
  },

  // 등급별 가챠 확률 (%)
  gachaRates: {
    common: 50.0,    // 50%
    rare: 30.0,      // 30%
    epic: 15.0,      // 15%
    unique: 4.0,     // 4%
    legendary: 0.9,  // 0.9%
    mythic: 0.1,     // 0.1%
  },

  // 최대 레벨 제한이 있는 유물들
  maxLevels: {
    axe_of_carnage: 30,        // 살육의 도끼 (크리티컬 확률)
    veil_of_shadow: 30,        // 암흑의 장막 (몬스터 수 감소)
    hourglass_of_time: 50,     // 시간의 모래시계 (보스 시간)
    lucky_egg: 50,             // 행운의 알 (희귀 몬스터 출현)
    fox_spirit_orb: 50,        // 구미호의 구슬 (전설 몬스터 출현)
    dimensional_gate: 30,      // 차원의 문 (보스 스킵)
    chalice_of_miracle: 20,    // 기적의 성배 (골드 10배 확률)
  },

  // 유물별 레벨당 효과 증가 (등급별)
  effectPerLevel: {
    // 암흑의 장막 (몬스터 수 감소) - 단계별 증가
    veil_of_shadow: {
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 8,
    },
    // 시간의 모래시계 (보스 시간) - 단계별 증가
    hourglass_of_time: {
      common: 1,    // +1초
      rare: 2,      // +2초
      epic: 3,      // +3초
      legendary: 5, // +5초
      mythic: 8,    // +8초
    },
  },

  // 귀환당 고대 유물 획득량
  relicFragments: {
    basePerPrestige: 10, // 기본 획득량
    bonusPerFloor: 0.1,  // 층당 추가 획득 %
  },
};

// ===== 전투 시스템 =====
export const COMBAT_CONFIG = {
  // 크리티컬 기본 데미지 배수 (%)
  baseCritDmg: 150,

  // 기본 크리티컬 확률 (%)
  baseCritChance: 5,

  // 즉사 시 데미지 (몬스터 maxHP)
  instantKillDamage: 'MAX_HP',

  // 광역 데미지 계산 (기본 데미지 * aoeDmgPercent / 100)
  aoeCalculation: 'BASE_DMG * AOE_PERCENT / 100',
};

// ===== 전직 시스템 =====
export const CLASS_CONFIG = {
  // 전직 단계: 0 = 기본, 1 = 1차, 2 = 2차, 3 = 3차
  levels: [
    {
      id: 0,
      name: '초심자',
      requiredLevel: 1, // 처음부터
      bonuses: {
        attackPercent: 0,
        critChance: 0,
        critDamage: 0,
        goldPercent: 0,
        finalDamagePercent: 0 // 최종 데미지% (곱연산)
      },
      skills: [] // 해금 스킬
    },
    {
      id: 1,
      name: '숙련자',
      requiredLevel: 30,
      bonuses: {
        attackPercent: 50,
        critChance: 5,
        critDamage: 20,
        goldPercent: 30,
        finalDamagePercent: 10 // 최종 데미지 +10%
      },
      skills: ['class1_skill1', 'class1_skill2']
    },
    {
      id: 2,
      name: '전문가',
      requiredLevel: 100,
      bonuses: {
        attackPercent: 150,
        critChance: 10,
        critDamage: 50,
        goldPercent: 80,
        finalDamagePercent: 25 // 최종 데미지 +25%
      },
      skills: ['class2_skill1', 'class2_skill2']
    },
    {
      id: 3,
      name: '마스터',
      requiredLevel: 200,
      bonuses: {
        attackPercent: 400,
        critChance: 20,
        critDamage: 100,
        goldPercent: 200,
        finalDamagePercent: 50 // 최종 데미지 +50%
      },
      skills: ['class3_skill1', 'class3_skill2']
    }
  ]
};

// 전직 가능 여부 확인
export const canAdvanceClass = (currentClassLevel, playerLevel) => {
  const nextClass = CLASS_CONFIG.levels[currentClassLevel + 1];
  if (!nextClass) return false;
  return playerLevel >= nextClass.requiredLevel;
};

// 현재 전직 보너스 계산
export const getClassBonuses = (classLevel) => {
  const classData = CLASS_CONFIG.levels[classLevel] || CLASS_CONFIG.levels[0];
  return classData.bonuses;
};

// ===== 스킬 시스템 =====
// (skills.js에서 개별 관리, 여기서는 공통 설정만)
export const SKILL_CONFIG = {
  // 골드로 구매하는 스킬
  goldSkills: {
    costMultiplier: 1.5, // 레벨당 비용 증가 배수
  },

  // PP로 구매하는 스킬 (귀환 스킬)
  ppSkills: {
    costMultiplier: 1.3,
  },
};

// ===== 계산 헬퍼 함수 =====

/**
 * 레벨업에 필요한 경험치 계산
 * @param {number} level - 현재 레벨
 * @returns {number} 필요 경험치
 */
export const calculateExpToNextLevel = (level) => {
  return Math.floor(
    EXP_CONFIG.baseExpToLevel * Math.pow(EXP_CONFIG.expMultiplier, level - 1)
  );
};

/**
 * 몬스터 HP 계산 (층 기반)
 * @param {number} floor - 층
 * @param {boolean} isBoss - 보스 여부
 * @returns {number} HP
 */
export const calculateMonsterHP = (floor, isBoss = false) => {
  const baseHP = MONSTER_CONFIG.baseHP * Math.pow(MONSTER_CONFIG.hpMultiplier, floor - 1);
  return Math.floor(isBoss ? baseHP * FLOOR_CONFIG.bossHPMultiplier : baseHP);
};

/**
 * 몬스터 골드 계산 (층 기반)
 * @param {number} floor - 층
 * @param {boolean} isBoss - 보스 여부
 * @returns {number} 골드
 */
export const calculateMonsterGold = (floor, isBoss = false) => {
  const baseGold = MONSTER_CONFIG.baseGold * Math.pow(MONSTER_CONFIG.goldMultiplier, floor - 1);
  return Math.floor(isBoss ? baseGold * MONSTER_CONFIG.bossGoldMultiplier : baseGold);
};

/**
 * 영웅 등급업 비용 계산
 * @param {number} gradeIndex - 등급 인덱스 (0-6)
 * @returns {number} 비용
 */
export const calculateUpgradeCost = (gradeIndex) => {
  return Math.floor(
    HERO_CONFIG.upgradeCost.baseCost *
    Math.pow(HERO_CONFIG.upgradeCost.multiplier, gradeIndex)
  );
};

/**
 * 영웅 카드 드랍 확률 계산
 * @param {number} stage - 스테이지
 * @returns {number} 드랍 확률 (%)
 */
export const calculateHeroCardDropChance = (stage) => {
  const stageBonus = Math.floor(stage / DROP_CONFIG.heroCard.stageBonusInterval) *
                     DROP_CONFIG.heroCard.stageBonus;
  return DROP_CONFIG.heroCard.baseDropRate + stageBonus;
};

/**
 * 영웅의 서 드랍 확률 계산 (100층마다 1.2배 복리)
 * @param {number} floor - 층수
 * @returns {number} 드랍 확률 (%)
 */
export const calculateHeroScrollDropChance = (floor) => {
  const { baseDropRate, floorMultiplier, floorInterval } = DROP_CONFIG.heroScroll;
  const hundredBlock = Math.floor((floor - 1) / floorInterval);
  return baseDropRate * Math.pow(floorMultiplier, hundredBlock);
};

/**
 * 영웅의 서 드랍 수량 (고정 1개)
 * @returns {number} 드랍 수량
 */
export const calculateHeroScrollAmount = () => {
  return DROP_CONFIG.heroScroll.dropAmount;
};

// ===== 디버그/치트 설정 =====
export const DEBUG_CONFIG = {
  // 개발 모드에서 사용할 치트 기능
  enableCheats: false,

  // 빠른 테스트를 위한 배수
  fastMode: {
    enabled: false,
    tickRateMultiplier: 0.1, // 10배 빠른 틱
    dropRateMultiplier: 10, // 10배 드랍율
    expMultiplier: 10, // 10배 경험치
  },
};
