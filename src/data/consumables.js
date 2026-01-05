// 소모품 시스템

// 소모품 타입
export const CONSUMABLE_TYPES = {
  SEALED_ZONE_TICKET: 'sealed_zone_ticket',
  MONSTER_SELECTION_TICKET: 'monster_selection_ticket',
  GEAR_ORB: 'gear_orb',
  RARE_TOKEN: 'rare_token',
  LEGENDARY_TOKEN: 'legendary_token'
};

// 소모품 정의
export const CONSUMABLES = {
  [CONSUMABLE_TYPES.SEALED_ZONE_TICKET]: {
    id: CONSUMABLE_TYPES.SEALED_ZONE_TICKET,
    name: '봉인구역 도전권',
    description: '봉인구역에 도전할 수 있는 티켓',
    icon: '🎫',
    maxStack: 999,
    usable: false, // 자동 소모되므로 수동 사용 불가
    rarity: 'rare'
  },
  [CONSUMABLE_TYPES.MONSTER_SELECTION_TICKET]: {
    id: CONSUMABLE_TYPES.MONSTER_SELECTION_TICKET,
    name: '몬스터 도감 선택권',
    description: '원하는 몬스터를 선택하여 도감에 등록할 수 있는 티켓',
    icon: '📜',
    maxStack: 99,
    usable: true,
    rarity: 'legendary'
  },
  [CONSUMABLE_TYPES.GEAR_ORB]: {
    id: CONSUMABLE_TYPES.GEAR_ORB,
    name: '카르마 오브',
    description: '장비의 옵션을 재굴림할 수 있는 신비한 구슬',
    icon: '🔮',
    maxStack: 999,
    usable: true,
    rarity: 'epic'
  },
  [CONSUMABLE_TYPES.RARE_TOKEN]: {
    id: CONSUMABLE_TYPES.RARE_TOKEN,
    name: '희귀 토큰',
    description: '이미 포획한 희귀 몬스터 처치 시 획득. 10개로 랜덤 희귀 몬스터 도감 등록!',
    icon: '💎',
    maxStack: 999,
    usable: true,
    rarity: 'rare',
    exchangeAmount: 10
  },
  [CONSUMABLE_TYPES.LEGENDARY_TOKEN]: {
    id: CONSUMABLE_TYPES.LEGENDARY_TOKEN,
    name: '전설 토큰',
    description: '이미 포획한 전설 몬스터 처치 시 획득. 10개로 랜덤 전설 몬스터 도감 등록!',
    icon: '👑',
    maxStack: 999,
    usable: true,
    rarity: 'legendary',
    exchangeAmount: 10
  }
};

// 소모품 획득 방법
export const CONSUMABLE_SOURCES = {
  // 봉인구역 도전권 획득
  SEALED_ZONE_TICKET: {
    // 보스 처치 시 드랍 (10층마다)
    bossFloorDrop: {
      floorInterval: 10, // 10층마다
      dropRate: 0.5, // 50% 확률
      amount: { min: 1, max: 3 }
    },
    // 일일 무료 충전
    dailyRecharge: {
      amount: 3,
      resetHour: 0 // 자정 (0시)
    }
  },

  // 몬스터 도감 선택권
  MONSTER_SELECTION_TICKET: {
    // 보스 코인 상점에서 구매
    bossShop: {
      cost: 1000 // 보스 코인 1000개
    }
  },

  // 카르마 오브
  GEAR_ORB: {
    // 보스 코인 상점에서 구매
    bossShop: {
      cost: 500 // 보스 코인 500개
    }
  },

};

// 레어리티 색상
export const CONSUMABLE_RARITY_COLORS = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-orange-400',
  mythic: 'text-red-400'
};

// 소모품 사용 함수
export const useConsumable = (consumableId, gameState, targetData = null) => {
  const consumable = CONSUMABLES[consumableId];

  if (!consumable || !consumable.usable) {
    return { success: false, message: '사용할 수 없는 아이템입니다.' };
  }

  // 소지 확인
  const inventory = gameState.consumables || {};
  const currentAmount = inventory[consumableId] || 0;

  if (currentAmount <= 0) {
    return { success: false, message: '소지한 아이템이 없습니다.' };
  }

  // 아이템별 사용 로직
  switch (consumableId) {
    case CONSUMABLE_TYPES.MONSTER_SELECTION_TICKET:
      // 몬스터 선택권 사용 로직 (별도 UI에서 처리)
      return { success: true, message: '몬스터를 선택해주세요.', requiresUI: true };

    case CONSUMABLE_TYPES.GEAR_ORB:
      // 카르마 오브 사용 로직 (별도 UI에서 처리)
      return { success: true, message: '재굴림할 장비를 선택해주세요.', requiresUI: true };

    default:
      return { success: false, message: '알 수 없는 아이템입니다.' };
  }
};
