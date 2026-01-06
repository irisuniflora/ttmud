/**
 * 다이아 상점 시스템
 * 골드 → 다이아 변환, 동료 뽑기
 */

// ===== 다이아 설정 =====
export const DIAMOND_CONFIG = {
  // 골드 → 다이아 변환 비율
  goldToDiamondRate: 1000000,  // 100만 골드 = 1 다이아 (1억 = 100 다이아)

  // 10연차 비용
  pullCost: 100,  // 100 다이아

  // 천장 시스템 (Pity)
  pitySystem: {
    epicPity: 100,      // 100회마다 에픽 확정
    legendaryPity: null  // 레전드 천장 없음 (순수 운)
  }
};

// ===== 뽑기 패키지 =====
export const PULL_PACKAGES = [
  {
    id: 'single',
    name: '단일 소환',
    cost: 10,
    count: 1,
    bonus: 0,
    description: '동료 카드 1장 소환'
  },
  {
    id: 'multi_10',
    name: '10연차 소환',
    cost: 100,
    count: 10,
    bonus: 1,  // 보너스 오브 1개
    description: '동료 카드 10장 + 오브 1개'
  }
];

// ===== 골드 → 다이아 변환 옵션 =====
export const GOLD_EXCHANGE_OPTIONS = [
  {
    id: 'exchange_10',
    diamonds: 10,
    goldCost: 10000000,  // 1,000만 골드
    bonus: 0
  },
  {
    id: 'exchange_50',
    diamonds: 50,
    goldCost: 45000000,  // 4,500만 골드 (10% 보너스)
    bonus: 5
  },
  {
    id: 'exchange_100',
    diamonds: 100,
    goldCost: 85000000,  // 8,500만 골드 (15% 보너스)
    bonus: 15
  },
  {
    id: 'exchange_500',
    diamonds: 500,
    goldCost: 400000000,  // 4억 골드 (20% 보너스)
    bonus: 100
  },
  {
    id: 'exchange_custom',
    diamonds: 0,
    goldCost: 1000000,  // 커스텀: 100만 골드당 1다이아
    bonus: 0,
    isCustom: true
  }
];

// ===== 헬퍼 함수 =====

// 골드로 살 수 있는 최대 다이아 계산
export const getMaxDiamondsForGold = (gold) => {
  return Math.floor(gold / DIAMOND_CONFIG.goldToDiamondRate);
};

// 다이아 구매에 필요한 골드
export const getGoldCostForDiamonds = (diamonds) => {
  return diamonds * DIAMOND_CONFIG.goldToDiamondRate;
};

// 뽑기 가능 여부
export const canPull = (diamonds, packageId) => {
  const pkg = PULL_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return false;
  return diamonds >= pkg.cost;
};

// 환전 가능 여부
export const canExchange = (gold, optionId) => {
  const option = GOLD_EXCHANGE_OPTIONS.find(o => o.id === optionId);
  if (!option) return false;
  return gold >= option.goldCost;
};
