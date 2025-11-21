// 새로운 아이템 시스템

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
  bossDamageIncrease: { id: 'bossDamageIncrease', name: '보스 데미지 증가', suffix: '%' },
  normalMonsterDamageIncrease: { id: 'normalMonsterDamageIncrease', name: '일반 몬스터 데미지 증가', suffix: '%' }
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
  monstersPerStageReduction: 0.05, // 스테이지 당 몬스터 감소 (아직 미구현, 1/10로 감소)
  bossDamageIncrease: 0.1, // 보스 데미지 증가 (아직 미구현, 보스 도감 연동 예정, 1/10로 감소)
  normalMonsterDamageIncrease: 0.1 // 일반 몬스터 데미지 증가 (아직 미구현, 1/10로 감소)
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

// 아이템 생성
export const generateItem = (slot, playerFloor = 1) => {
  const rarity = rollRarity();
  const statType = SLOT_STAT_TYPES[slot];
  const statPool = statType === 'damage' ? DAMAGE_STATS : UTILITY_STATS;

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
      let reductionValue = 1; // 전설: -1
      if (rarity === 'mythic') reductionValue = 2; // 신화: -2
      if (rarity === 'dark') reductionValue = Math.random() < 0.5 ? 3 : 4; // 다크: -3 또는 -4

      stats.push({
        id: statDef.id,
        name: statDef.name,
        value: reductionValue,
        suffix: statDef.suffix
      });
    } else {
      const range = STAT_RANGES[statDef.id][rarity];

      // 랜덤 값 생성 (층수에 따른 보너스 추가 가능)
      const floorMultiplier = 1 + (playerFloor * 0.02); // 층당 2% 증가
      const baseValue = range.min + Math.random() * (range.max - range.min);
      const finalValue = Math.floor(baseValue * floorMultiplier);

      stats.push({
        id: statDef.id,
        name: statDef.name,
        value: finalValue,
        suffix: statDef.suffix
      });
    }
  }

  return {
    id: `item_${Date.now()}_${Math.random()}`,
    slot,
    name: ITEM_SLOT_NAMES[slot],
    rarity,
    stats
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

// 기어 코어 드랍 확률
export const GEAR_CORE_DROP_RATE = 0.003; // 0.003%

// 기어 코어로 장비 옵션 최대치로 강화
export const upgradeItemStatToMax = (item, statIndex) => {
  if (!item || !item.stats || !item.stats[statIndex]) {
    return false;
  }

  const stat = item.stats[statIndex];
  const range = STAT_RANGES[stat.id]?.[item.rarity];

  if (!range) return false;

  // 최대값으로 설정
  stat.value = Math.floor(range.max);
  return true;
};
