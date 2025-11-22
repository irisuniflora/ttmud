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
    baseDropRate: 20, // 기본 드랍율 %
    stageBonus: 0, // 스테이지당 추가 % (0으로 고정)
    stageBonusInterval: 10, // 보너스 적용 간격
  },

  // 등급업 코인 드랍
  upgradeCoin: {
    baseDropRate: 1, // 기본 드랍율 %
    stageBonus: 0.3, // 20스테이지당 추가 %
    stageBonusInterval: 20,
    // 코인 수량 = Math.max(1, Math.floor(stage / amountPerStage))
    amountPerStage: 10,
  },
};

// ===== 영웅 시스템 =====
export const HERO_CONFIG = {
  // 영웅 등급 시스템
  grades: {
    normal: { name: '일반', color: '#9CA3AF', colorClass: 'text-gray-400' },
    rare: { name: '희귀', color: '#3B82F6', colorClass: 'text-blue-400' },
    epic: { name: '레어', color: '#A855F7', colorClass: 'text-purple-400' },
    unique: { name: '유니크', color: '#EAB308', colorClass: 'text-yellow-400' },
    legendary: { name: '전설', color: '#F97316', colorClass: 'text-orange-400' },
    mythic: { name: '신화', color: '#EF4444', colorClass: 'text-red-400' },
    dark: { name: '다크', color: '#1F2937', colorClass: 'text-gray-900' },
  },

  // 등급 순서
  gradeOrder: ['normal', 'rare', 'epic', 'unique', 'legendary', 'mythic', 'dark'],

  // 별 시스템
  maxStarsPerGrade: 5,
  starBonusMultiplier: 0.2, // 별당 등급 스탯의 20% 추가

  // 등급업 비용 (피보나치 수열 - 각 등급에서 다음 등급으로 갈 때 필요한 토큰)
  upgradeCostByGrade: [2, 3, 5, 8, 13, 21], // normal->rare: 2, rare->epic: 3, ...

  // 별 업그레이드 카드 소모량 (피보나치 수열 - 등급별로 별 하나당 필요한 카드 수)
  starUpgradeCostByGrade: [1, 2, 3, 5, 8, 13, 21], // normal: 1장, rare: 2장, epic: 3장, ...

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

  // 체력 퍼센트 데미지 딜러 (다크 리퍼)
  hpPercentDmgDealerBase: 10, // 기본 확률 10%
  hpPercentDmgDealerPerGrade: 0, // 등급당 확률 증가 없음
  hpPercentDmgDealerBaseStar: 2, // 별당 확률 +2%
  hpPercentDmgValue: 10, // 기본 데미지: 최대HP의 10%
  hpPercentDmgValuePerGrade: 5, // 등급당 +5% (15%, 20%, 25%...)

  // 도트 데미지 딜러 (아크메이지)
  dotDmgDealerBase: 20, // 기본 틱당 공격력의 20%
  dotDmgDealerPerGrade: 15, // 등급당 +15%

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
  // 한 층당 일반 몬스터 수
  monstersPerFloor: 40,

  // 보스 타이머
  bossTimeLimit: 20, // 초

  // 보스 체력 배수
  bossHPMultiplier: 20,
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

  // 장비 레어리티
  rarities: {
    common: { name: '일반', color: '#9CA3AF', weight: 50 },
    rare: { name: '레어', color: '#3B82F6', weight: 30 },
    epic: { name: '에픽', color: '#A855F7', weight: 15 },
    legendary: { name: '전설', color: '#F97316', weight: 4 },
    mythic: { name: '신화', color: '#EF4444', weight: 1 },
  },

  // 슬롯 강화 시스템
  enhancement: {
    maxLevel: 20, // 최대 강화 레벨
    baseCost: 1000, // 기본 강화 비용
    costMultiplier: 1.5, // 레벨당 비용 증가 배수
    statBonusPerLevel: 5, // 레벨당 스탯 증가 (%)
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

// ===== 환생 시스템 =====
export const PRESTIGE_CONFIG = {
  // 환생 가능 최소 스테이지
  minStage: 50,

  // PP 획득 계산식
  // PP = Math.floor(stage / ppPerStage)
  ppPerStage: 10,
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

// ===== 스킬 시스템 =====
// (skills.js에서 개별 관리, 여기서는 공통 설정만)
export const SKILL_CONFIG = {
  // 골드로 구매하는 스킬
  goldSkills: {
    costMultiplier: 1.5, // 레벨당 비용 증가 배수
  },

  // PP로 구매하는 스킬 (환생 스킬)
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
 * 등급업 코인 드랍 확률 계산
 * @param {number} stage - 스테이지
 * @returns {number} 드랍 확률 (%)
 */
export const calculateUpgradeCoinDropChance = (stage) => {
  const stageBonus = Math.floor(stage / DROP_CONFIG.upgradeCoin.stageBonusInterval) *
                     DROP_CONFIG.upgradeCoin.stageBonus;
  return DROP_CONFIG.upgradeCoin.baseDropRate + stageBonus;
};

/**
 * 등급업 코인 드랍 수량 계산
 * @param {number} stage - 스테이지
 * @returns {number} 코인 수량
 */
export const calculateUpgradeCoinAmount = (stage) => {
  return Math.max(1, Math.floor(stage / DROP_CONFIG.upgradeCoin.amountPerStage));
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
