// 새로운 아이템 시스템
import { EQUIPMENT_CONFIG } from './gameBalance.js';

// 아이템 슬롯
export const ITEM_SLOTS = ['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'];

export const ITEM_SLOT_NAMES = {
  weapon: '무기',
  armor: '갑옷',
  gloves: '장갑',
  boots: '신발',
  necklace: '목걸이',
  ring: '반지'
};

// 7개 등급 (일반 → 레어 → 에픽 → 유니크 → 전설 → 신화 → 다크)
export const RARITIES = {
  common: { name: '일반', color: 'common', dropRate: 0.55 },      // 55%
  rare: { name: '레어', color: 'rare', dropRate: 0.28 },          // 28%
  epic: { name: '에픽', color: 'epic', dropRate: 0.10 },          // 10%
  unique: { name: '유니크', color: 'unique', dropRate: 0.045 },   // 4.5%
  legendary: { name: '전설', color: 'legendary', dropRate: 0.02 },// 2%
  mythic: { name: '신화', color: 'mythic', dropRate: 0.004 },     // 0.4%
  dark: { name: '다크', color: 'dark', dropRate: 0.001 }          // 0.1%
};

// 딜링 능력치 (무기, 갑옷, 장갑)
export const DAMAGE_STATS = {
  attack: { id: 'attack', name: '공격력', suffix: '' },
  critChance: { id: 'critChance', name: '치명타 확률', suffix: '%' },
  critDmg: { id: 'critDmg', name: '치명타 데미지', suffix: '%' },
  attackPercent: { id: 'attackPercent', name: '공격력', suffix: '%' },
  bossDamageIncrease: { id: 'bossDamageIncrease', name: '보스몹 추뎀', suffix: '%' },
  normalMonsterDamageIncrease: { id: 'normalMonsterDamageIncrease', name: '일반몹 추뎀', suffix: '%' }
};

// 보조 능력치 (신발, 목걸이, 반지)
export const UTILITY_STATS = {
  skipChance: { id: 'skipChance', name: '스킵 확률', suffix: '%' },
  expBonus: { id: 'expBonus', name: '경험치 획득률', suffix: '%' },
  dropRate: { id: 'dropRate', name: '드랍률', suffix: '%' },
  goldBonus: { id: 'goldBonus', name: '골드 획득량', suffix: '%' },
  monstersPerStageReduction: { id: 'monstersPerStageReduction', name: '스테이지 당 몬스터 감소', suffix: '' }
};

// 등급별 능력치 범위 (배수 기준: 1-3, 4-7, 8-14, 15-25, 26-43, 44-62, 63-109)
// 기본값 설정: 영웅과 밸런스 맞춤 (6슬롯 * 3옵션 = 18개 스탯으로 영웅 1명과 비슷한 효과)
const BASE_VALUES = {
  attack: 20, // 영웅 공격력 100의 1/5 수준 (깡 공격력은 유지)
  critChance: 0.03, // 영웅 크리 확률 5%의 1/150 수준 (1/10로 감소)
  critDmg: 0.15, // 영웅 크리 데미지 20%의 1/130 수준 (1/10로 감소)
  attackPercent: 0.1, // 퍼센트 보너스 (1/10로 감소)
  skipChance: 0.015, // 영웅 스킵 확률 2%의 1/130 수준 (1/10로 감소)
  expBonus: 0.12, // 영웅 경험치 15%의 1/120 수준 (1/10로 감소)
  dropRate: 0.04, // 영웅 드랍율 5%의 1/120 수준 (1/10로 감소)
  goldBonus: 0.08, // 영웅 골드 10%의 1/120 수준 (1/10로 감소)
  monstersPerStageReduction: 1, // 스테이지 당 몬스터 감소 (미사용 - 등급별 고정값 사용: 전설2~3, 신화4~5, 다크7~9)
  bossDamageIncrease: 0.1, // 보스 데미지 증가 (1/10로 감소)
  normalMonsterDamageIncrease: 0.1 // 일반 몬스터 데미지 증가 (1/10로 감소)
};

// 등급별 배수 범위
const MULTIPLIERS = {
  common: { min: 1, max: 3 },
  rare: { min: 4, max: 7 },
  epic: { min: 8, max: 14 },
  unique: { min: 15, max: 25 },
  legendary: { min: 26, max: 43 },
  mythic: { min: 44, max: 62 },
  dark: { min: 63, max: 109 }
};

// 능력치별 범위 계산
export const STAT_RANGES = {};
Object.keys(BASE_VALUES).forEach(statId => {
  STAT_RANGES[statId] = {};
  Object.keys(MULTIPLIERS).forEach(rarity => {
    const baseValue = BASE_VALUES[statId];
    const multiplier = MULTIPLIERS[rarity];
    STAT_RANGES[statId][rarity] = {
      min: baseValue * multiplier.min,
      max: baseValue * multiplier.max
    };
  });
});

// 슬롯별 능력치 타입
export const SLOT_STAT_TYPES = {
  weapon: 'damage',
  armor: 'damage',
  gloves: 'damage',
  boots: 'utility',
  necklace: 'utility',
  ring: 'utility'
};

// 티어 배수 계산 (50층마다 1.2배)
const calculateTierMultiplier = (floor) => {
  const tier = Math.floor((floor - 1) / EQUIPMENT_CONFIG.tierSystem.floorInterval);
  return Math.pow(EQUIPMENT_CONFIG.tierSystem.tierMultiplier, tier);
};

// 아이템 생성
// 옵션 등급: 하옵(0.8x), 중옵(1.0x), 상옵(1.2x), 극옵(1.5x)
// 기본값을 중옵(1.0x)으로 두고, 0.8x~1.5x 범위에서 랜덤 결정
export const generateItem = (slot, playerFloor = 1) => {
  const rarity = rollRarity();
  const statType = SLOT_STAT_TYPES[slot];
  const statPool = statType === 'damage' ? DAMAGE_STATS : UTILITY_STATS;

  // 티어 배수 계산
  const tierMultiplier = calculateTierMultiplier(playerFloor);

  // 등급별 스탯 배수 범위 가져오기
  const rarityConfig = EQUIPMENT_CONFIG.rarities[rarity];
  const statMultiplierMin = rarityConfig.statMin;
  const statMultiplierMax = rarityConfig.statMax;

  // 3개 랜덤 능력치 (중복 가능)
  const stats = [];
  // monstersPerStageReduction을 제외한 스탯 풀
  const statKeys = Object.keys(statPool).filter(key => key !== 'monstersPerStageReduction');

  for (let i = 0; i < 3; i++) {
    let randomStatKey = statKeys[Math.floor(Math.random() * statKeys.length)];
    let statDef = statPool[randomStatKey];

    // 몬스터 감소 옵션은 전설 이상에서만 드랍 (매우 낮은 확률)
    // 유틸리티 슬롯(신발, 반지, 목걸이)에서만 드랍
    if (statType === 'utility' && (rarity === 'legendary' || rarity === 'mythic' || rarity === 'dark')) {
      const monsterReductionChance = Math.random();
      // 0.5% 확률로 몬스터 감소 옵션 부여
      if (monsterReductionChance < 0.005) {
        randomStatKey = 'monstersPerStageReduction';
        statDef = statPool[randomStatKey];
      }
    }

    // 몬스터 감소 옵션은 고정값
    if (randomStatKey === 'monstersPerStageReduction') {
      let reductionValue = 2 + Math.floor(Math.random() * 2); // 전설: 2~3
      if (rarity === 'mythic') reductionValue = 4 + Math.floor(Math.random() * 2); // 신화: 4~5
      if (rarity === 'dark') reductionValue = 7 + Math.floor(Math.random() * 3); // 다크: 7~9

      stats.push({
        id: statDef.id,
        name: statDef.name,
        value: reductionValue,
        suffix: statDef.suffix
      });
    } else {
      // 기본 스탯 값 (등급 배수 적용)
      const baseValue = BASE_VALUES[statDef.id];

      // 등급별 기본값 = BASE_VALUE × 등급배수 × 티어배수
      // 이 기본값을 중옵(1.0x)으로 설정
      const gradedBaseValue = baseValue * ((statMultiplierMin + statMultiplierMax) / 2) * tierMultiplier;

      // 옵션 등급에 따른 min/max 계산
      // 하옵(0.8x) ~ 극옵(1.5x)
      const minValue = gradedBaseValue * OPTION_GRADE_MULTIPLIERS.low;  // 0.8x
      const maxValue = gradedBaseValue * OPTION_GRADE_MULTIPLIERS.perfect; // 1.5x

      // 1/20 확률로 극옵(1.5x)
      let finalValue;
      if (Math.random() < 0.05) {
        // 5% 확률로 극옵
        finalValue = maxValue;
      } else {
        // 0.8x ~ 1.5x 범위에서 랜덤 결정
        const randomOptionMultiplier = OPTION_GRADE_MULTIPLIERS.low +
          Math.random() * (OPTION_GRADE_MULTIPLIERS.perfect - OPTION_GRADE_MULTIPLIERS.low);
        finalValue = gradedBaseValue * randomOptionMultiplier;
      }

      stats.push({
        id: statDef.id,
        name: statDef.name,
        value: finalValue,
        minValue: minValue, // 최소값 저장 (% 계산용 - 하옵 0.8x)
        maxValue: maxValue, // 최대값 저장 (% 계산용 - 극옵 1.5x)
        suffix: statDef.suffix
      });
    }
  }

  return {
    id: `item_${Date.now()}_${Math.random()}`,
    slot,
    name: ITEM_SLOT_NAMES[slot],
    rarity,
    stats,
    tier: Math.floor((playerFloor - 1) / EQUIPMENT_CONFIG.tierSystem.floorInterval) + 1, // 티어 저장 (표시용)
    floor: playerFloor // 획득 층수 저장
  };
};

// 레어리티 드랍 계산
const rollRarity = () => {
  const roll = Math.random();
  let cumulative = 0;

  for (const [rarity, data] of Object.entries(RARITIES)) {
    cumulative += data.dropRate;
    if (roll <= cumulative) return rarity;
  }

  return 'common';
};

// 옵션 % 계산 함수
export const calculateStatPercentage = (stat) => {
  if (!stat.minValue || !stat.maxValue) return 100; // 최소/최대값이 없으면 100%로 표시
  if (stat.maxValue === stat.minValue) return 100;

  const percentage = ((stat.value - stat.minValue) / (stat.maxValue - stat.minValue)) * 100;
  return Math.max(0, Math.min(100, percentage));
};

// 옵션 등급 배율 시스템 (기본값 = 중옵 1.0x 기준)
// 하옵: 0.8x, 중옵: 1.0x, 상옵: 1.2x, 극옵: 1.5x
export const OPTION_GRADE_MULTIPLIERS = {
  low: 0.8,      // 하옵
  mid: 1.0,      // 중옵 (기본값)
  high: 1.2,     // 상옵
  perfect: 1.5   // 극옵
};

// 다이아몬드 등급 계산 (배율 기준)
// 하옵: 0.8x = 1다이아, 중옵: 1.0x = 2다이아, 상옵: 1.2x = 3다이아, 극옵: 1.5x = 반짝이는 3다이아
export const getDiamondGrade = (percentage) => {
  // percentage는 0~100 범위 (0.8x~1.5x를 0~100%로 환산)
  if (percentage >= 100) return { count: 3, isPerfect: true, label: '극옵', multiplier: 1.5 };
  if (percentage >= 57) return { count: 3, isPerfect: false, label: '상옵', multiplier: 1.2 }; // (1.2-0.8)/(1.5-0.8) = 57%
  if (percentage >= 29) return { count: 2, isPerfect: false, label: '중옵', multiplier: 1.0 }; // (1.0-0.8)/(1.5-0.8) = 29%
  return { count: 1, isPerfect: false, label: '하옵', multiplier: 0.8 };
};

// 다이아몬드 렌더링용 문자열 생성
// 모든 등급에서 동일한 ◆ 모양 사용 (색상/애니메이션으로 구분)
export const getDiamondDisplay = (percentage) => {
  const grade = getDiamondGrade(percentage);
  return '◆'.repeat(grade.count); // 모두 동일한 다이아 모양
};

// 다이아몬드 색상
// 하옵~상옵: 회색, 극옵: 노란색 반짝임
export const getDiamondColor = (percentage) => {
  if (percentage >= 100) return 'text-yellow-400 animate-pulse'; // 극옵: 노란색 반짝임
  return 'text-gray-400'; // 하옵~상옵: 모두 회색
};

// 옵션 % 기준 색상 결정 (스탯 값 자체의 색상)
// 극옵만 노란색, 나머지는 흰색
export const getStatColorByPercentage = (percentage) => {
  if (percentage >= 100) return 'text-yellow-400'; // 극옵: 노란색
  return 'text-gray-100'; // 하옵~상옵: 흰색
};

// 아이템 가격 계산 (등급에 따라)
export const getItemPrice = (item) => {
  const rarityPrices = {
    common: 10,
    rare: 50,
    epic: 200,
    unique: 800,
    legendary: 3000,
    mythic: 12000,
    dark: 50000
  };

  return rarityPrices[item.rarity] || 10;
};


// 오브로 아이템 옵션 재조정
// 옵션 등급: 하옵(0.8x), 중옵(1.0x), 상옵(1.2x), 극옵(1.5x)
export const rerollItemWithOrb = (item, playerFloor = 1) => {
  if (!item || !item.stats) {
    return false;
  }

  const statType = SLOT_STAT_TYPES[item.slot];
  const statPool = statType === 'damage' ? DAMAGE_STATS : UTILITY_STATS;
  const statKeys = Object.keys(statPool).filter(key => key !== 'monstersPerStageReduction');

  // 기존 스탯을 새로운 랜덤 스탯으로 재조정
  item.stats = [];

  for (let i = 0; i < 3; i++) {
    let randomStatKey = statKeys[Math.floor(Math.random() * statKeys.length)];
    let statDef = statPool[randomStatKey];

    // 몬스터 감소 옵션 처리 (전설 이상, 유틸리티 슬롯만)
    if (statType === 'utility' && (item.rarity === 'legendary' || item.rarity === 'mythic' || item.rarity === 'dark')) {
      const monsterReductionChance = Math.random();
      if (monsterReductionChance < 0.005) {
        randomStatKey = 'monstersPerStageReduction';
        statDef = statPool[randomStatKey];
      }
    }

    // 몬스터 감소 옵션은 고정값
    if (randomStatKey === 'monstersPerStageReduction') {
      let reductionValue = 2 + Math.floor(Math.random() * 2); // 전설: 2~3
      if (item.rarity === 'mythic') reductionValue = 4 + Math.floor(Math.random() * 2); // 신화: 4~5
      if (item.rarity === 'dark') reductionValue = 7 + Math.floor(Math.random() * 3); // 다크: 7~9

      item.stats.push({
        id: statDef.id,
        name: statDef.name,
        value: reductionValue,
        suffix: statDef.suffix
      });
    } else {
      // 티어 배수 계산
      const tierMultiplier = calculateTierMultiplier(playerFloor);

      // 등급별 스탯 배수 범위 가져오기
      const rarityConfig = EQUIPMENT_CONFIG.rarities[item.rarity];
      const statMultiplierMin = rarityConfig.statMin;
      const statMultiplierMax = rarityConfig.statMax;

      // 기본 스탯 값
      const baseValue = BASE_VALUES[statDef.id];

      // 등급별 기본값 = BASE_VALUE × 등급배수 × 티어배수
      // 이 기본값을 중옵(1.0x)으로 설정
      const gradedBaseValue = baseValue * ((statMultiplierMin + statMultiplierMax) / 2) * tierMultiplier;

      // 옵션 등급에 따른 min/max 계산
      // 하옵(0.8x) ~ 극옵(1.5x)
      const minValue = gradedBaseValue * OPTION_GRADE_MULTIPLIERS.low;  // 0.8x
      const maxValue = gradedBaseValue * OPTION_GRADE_MULTIPLIERS.perfect; // 1.5x

      // 1/20 확률로 극옵(1.5x)
      let finalValue;
      if (Math.random() < 0.05) {
        // 5% 확률로 극옵
        finalValue = maxValue;
      } else {
        // 0.8x ~ 1.5x 범위에서 랜덤 결정
        const randomOptionMultiplier = OPTION_GRADE_MULTIPLIERS.low +
          Math.random() * (OPTION_GRADE_MULTIPLIERS.perfect - OPTION_GRADE_MULTIPLIERS.low);
        finalValue = gradedBaseValue * randomOptionMultiplier;
      }

      item.stats.push({
        id: statDef.id,
        name: statDef.name,
        value: finalValue,
        minValue: minValue,
        maxValue: maxValue,
        suffix: statDef.suffix
      });
    }
  }

  return true;
};

// 완벽의 정수로 장비의 특정 옵션 1개를 극옵(최대치)으로 변경
// 극옵 = 기본값 × 1.5x
export const perfectSingleStat = (item, statIndex, playerFloor = 1) => {
  if (!item || !item.stats || !item.stats[statIndex]) {
    return false;
  }

  const stat = item.stats[statIndex];

  // 몬스터 감소 옵션은 이미 고정값이므로 불가
  if (stat.id === 'monstersPerStageReduction') {
    return false;
  }

  // 이미 극옵(100%)이면 불가
  const currentPercentage = calculateStatPercentage(stat);
  if (currentPercentage >= 100) {
    return false;
  }

  // maxValue가 이미 있으면 그걸 사용 (극옵 1.5x에 해당)
  if (stat.maxValue) {
    stat.value = stat.maxValue;
    return true;
  }

  // maxValue가 없으면 새로 계산
  const statType = SLOT_STAT_TYPES[item.slot];

  // 티어 배수 계산
  const tierMultiplier = calculateTierMultiplier(playerFloor);

  // 등급별 스탯 배수 범위 가져오기
  const rarityConfig = EQUIPMENT_CONFIG.rarities[item.rarity];
  const statMultiplierMin = rarityConfig.statMin;
  const statMultiplierMax = rarityConfig.statMax;

  // 기본 스탯 값
  const baseValue = BASE_VALUES[stat.id];

  // 등급별 기본값 = BASE_VALUE × 등급배수 × 티어배수
  const gradedBaseValue = baseValue * ((statMultiplierMin + statMultiplierMax) / 2) * tierMultiplier;

  // 극옵 값 = 기본값 × 1.5x
  const maxValue = gradedBaseValue * OPTION_GRADE_MULTIPLIERS.perfect;

  // 옵션 값을 극옵으로 설정
  stat.value = maxValue;
  stat.minValue = gradedBaseValue * OPTION_GRADE_MULTIPLIERS.low;
  stat.maxValue = maxValue;

  return true;
};
