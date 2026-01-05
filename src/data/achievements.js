// 업적 시스템

// 업적 카테고리
export const ACHIEVEMENT_CATEGORIES = {
  floor: { name: '탐험', icon: '🗺️', color: '#3b82f6' },
  sealed: { name: '봉인구역', icon: '🔒', color: '#8b5cf6' },
  monster: { name: '몬스터', icon: '👾', color: '#ef4444' },
  equipment: { name: '장비', icon: '⚔️', color: '#f59e0b' },
  prestige: { name: '귀환', icon: '🌟', color: '#ec4899' },
  collection: { name: '수집', icon: '📖', color: '#10b981' }
};

// 업적 정의
export const ACHIEVEMENTS = {
  // ===== 탐험 업적 (층수 달성) =====
  floor_10: {
    id: 'floor_10',
    category: 'floor',
    name: '첫 걸음',
    description: '10층 도달',
    condition: (state) => state.player.floor >= 10,
    reward: { type: 'gold', amount: 1000 },
    icon: '👣'
  },
  floor_50: {
    id: 'floor_50',
    category: 'floor',
    name: '탐험가',
    description: '50층 도달',
    condition: (state) => state.player.floor >= 50,
    reward: { type: 'gold', amount: 5000 },
    icon: '🥾'
  },
  floor_100: {
    id: 'floor_100',
    category: 'floor',
    name: '심연의 여행자',
    description: '100층 도달',
    condition: (state) => state.player.floor >= 100,
    reward: { type: 'fragments', amount: 100 },
    icon: '🧭'
  },
  floor_200: {
    id: 'floor_200',
    category: 'floor',
    name: '심연 정복자',
    description: '200층 도달',
    condition: (state) => state.player.floor >= 200,
    reward: { type: 'fragments', amount: 500 },
    icon: '⚔️'
  },
  floor_500: {
    id: 'floor_500',
    category: 'floor',
    name: '전설의 탐험가',
    description: '500층 도달',
    condition: (state) => state.player.floor >= 500,
    reward: { type: 'relicFragments', amount: 10 },
    icon: '🏆'
  },
  floor_1000: {
    id: 'floor_1000',
    category: 'floor',
    name: '심연의 지배자',
    description: '1000층 도달',
    condition: (state) => state.player.floor >= 1000,
    reward: { type: 'relicFragments', amount: 50 },
    icon: '👑'
  },

  // ===== 봉인구역 업적 =====
  sealed_clear_1: {
    id: 'sealed_clear_1',
    category: 'sealed',
    name: '봉인 해제자',
    description: '봉인구역 1층 클리어',
    condition: (state) => (state.sealedZone?.highestClearedLevel || 0) >= 1,
    reward: { type: 'bossCoins', amount: 50 },
    icon: '🔓'
  },
  sealed_clear_10: {
    id: 'sealed_clear_10',
    category: 'sealed',
    name: '봉인 파괴자',
    description: '봉인구역 10층 클리어',
    condition: (state) => (state.sealedZone?.highestClearedLevel || 0) >= 10,
    reward: { type: 'bossCoins', amount: 200 },
    icon: '💥'
  },
  sealed_clear_25: {
    id: 'sealed_clear_25',
    category: 'sealed',
    name: '봉인의 정복자',
    description: '봉인구역 25층 클리어',
    condition: (state) => (state.sealedZone?.highestClearedLevel || 0) >= 25,
    reward: { type: 'bossCoins', amount: 500 },
    icon: '🏅'
  },
  sealed_clear_50: {
    id: 'sealed_clear_50',
    category: 'sealed',
    name: '봉인의 지배자',
    description: '봉인구역 50층 클리어',
    condition: (state) => (state.sealedZone?.highestClearedLevel || 0) >= 50,
    reward: { type: 'setSelector', amount: 1 },
    icon: '👹'
  },

  // ===== 희귀 몬스터 업적 =====
  rare_monster_1: {
    id: 'rare_monster_1',
    category: 'monster',
    name: '희귀종 발견',
    description: '희귀 몬스터 1마리 처치',
    condition: (state) => (state.rareMonsterKills || 0) >= 1,
    reward: { type: 'gold', amount: 2000 },
    icon: '✨'
  },
  rare_monster_10: {
    id: 'rare_monster_10',
    category: 'monster',
    name: '희귀종 사냥꾼',
    description: '희귀 몬스터 10마리 처치',
    condition: (state) => (state.rareMonsterKills || 0) >= 10,
    reward: { type: 'fragments', amount: 200 },
    icon: '🎯'
  },
  rare_monster_50: {
    id: 'rare_monster_50',
    category: 'monster',
    name: '희귀종 전문가',
    description: '희귀 몬스터 50마리 처치',
    condition: (state) => (state.rareMonsterKills || 0) >= 50,
    reward: { type: 'orbs', amount: 5 },
    icon: '🏹'
  },
  rare_monster_100: {
    id: 'rare_monster_100',
    category: 'monster',
    name: '희귀종 멸종자',
    description: '희귀 몬스터 100마리 처치',
    condition: (state) => (state.rareMonsterKills || 0) >= 100,
    reward: { type: 'relicFragments', amount: 5 },
    icon: '💀'
  },

  // ===== 도감 수집 업적 =====
  collection_10: {
    id: 'collection_10',
    category: 'collection',
    name: '수집가',
    description: '몬스터 도감 10종 등록',
    condition: (state) => Object.keys(state.collection || {}).length >= 10,
    reward: { type: 'gold', amount: 3000 },
    icon: '📖'
  },
  collection_30: {
    id: 'collection_30',
    category: 'collection',
    name: '박물관장',
    description: '몬스터 도감 30종 등록',
    condition: (state) => Object.keys(state.collection || {}).length >= 30,
    reward: { type: 'fragments', amount: 300 },
    icon: '🏛️'
  },
  collection_50: {
    id: 'collection_50',
    category: 'collection',
    name: '백과사전',
    description: '몬스터 도감 50종 등록',
    condition: (state) => Object.keys(state.collection || {}).length >= 50,
    reward: { type: 'orbs', amount: 3 },
    icon: '📖'
  },

  // ===== 장비 업적 =====
  ancient_1: {
    id: 'ancient_1',
    category: 'equipment',
    name: '고대의 발견',
    description: '고대 등급 장비 1개 획득',
    condition: (state) => (state.totalAncientItems || 0) >= 1,
    reward: { type: 'fragments', amount: 100 },
    icon: '🏛️'
  },
  ancient_6: {
    id: 'ancient_6',
    category: 'equipment',
    name: '고대 세트 완성',
    description: '고대 등급 장비 6개 장착',
    condition: (state) => {
      const equipment = state.equipment || {};
      return Object.values(equipment).filter(e => e?.isAncient).length >= 6;
    },
    reward: { type: 'relicFragments', amount: 10 },
    icon: '👑'
  },
  set_complete: {
    id: 'set_complete',
    category: 'equipment',
    name: '세트 수집가',
    description: '6세트 효과 발동',
    condition: (state) => {
      const equipment = state.equipment || {};
      const setCounts = {};
      Object.values(equipment).forEach(item => {
        if (item?.setId) {
          setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
        }
      });
      return Object.values(setCounts).some(count => count >= 6);
    },
    reward: { type: 'fragments', amount: 500 },
    icon: '💎'
  },

  // ===== 귀환 업적 =====
  prestige_1: {
    id: 'prestige_1',
    category: 'prestige',
    name: '새로운 시작',
    description: '첫 귀환 달성',
    condition: (state) => (state.prestigeCount || 0) >= 1,
    reward: { type: 'relicFragments', amount: 3 },
    icon: '🌟'
  },
  prestige_5: {
    id: 'prestige_5',
    category: 'prestige',
    name: '귀환의 달인',
    description: '5회 귀환 달성',
    condition: (state) => (state.prestigeCount || 0) >= 5,
    reward: { type: 'relicFragments', amount: 10 },
    icon: '✨'
  },
  prestige_10: {
    id: 'prestige_10',
    category: 'prestige',
    name: '윤회의 지배자',
    description: '10회 귀환 달성',
    condition: (state) => (state.prestigeCount || 0) >= 10,
    reward: { type: 'relicFragments', amount: 25 },
    icon: '🔮'
  }
};

// 보상 타입별 아이콘
export const REWARD_ICONS = {
  gold: '💰',
  fragments: '⚡',
  bossCoins: '🪙',
  orbs: '🔮',
  relicFragments: '🏺',
  setSelector: '🎁'
};

// 보상 타입별 이름
export const REWARD_NAMES = {
  gold: '골드',
  fragments: '장비 조각',
  bossCoins: '보스 코인',
  orbs: '카르마 오브',
  relicFragments: '고대 유물',
  setSelector: '세트 선택권'
};

// 업적 달성 체크 함수
export const checkAchievements = (gameState, completedAchievements = {}) => {
  const newlyCompleted = [];

  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (!completedAchievements[achievement.id] && achievement.condition(gameState)) {
      newlyCompleted.push(achievement);
    }
  });

  return newlyCompleted;
};

// 업적 진행도 계산 함수
export const getAchievementProgress = (achievement, gameState) => {
  switch (achievement.id) {
    // 층수 업적
    case 'floor_10': return { current: gameState.player?.floor || 0, target: 10 };
    case 'floor_50': return { current: gameState.player?.floor || 0, target: 50 };
    case 'floor_100': return { current: gameState.player?.floor || 0, target: 100 };
    case 'floor_200': return { current: gameState.player?.floor || 0, target: 200 };
    case 'floor_500': return { current: gameState.player?.floor || 0, target: 500 };
    case 'floor_1000': return { current: gameState.player?.floor || 0, target: 1000 };

    // 봉인구역 업적
    case 'sealed_clear_1': return { current: gameState.sealedZone?.highestClearedLevel || 0, target: 1 };
    case 'sealed_clear_10': return { current: gameState.sealedZone?.highestClearedLevel || 0, target: 10 };
    case 'sealed_clear_25': return { current: gameState.sealedZone?.highestClearedLevel || 0, target: 25 };
    case 'sealed_clear_50': return { current: gameState.sealedZone?.highestClearedLevel || 0, target: 50 };

    // 희귀 몬스터 업적
    case 'rare_monster_1': return { current: gameState.rareMonsterKills || 0, target: 1 };
    case 'rare_monster_10': return { current: gameState.rareMonsterKills || 0, target: 10 };
    case 'rare_monster_50': return { current: gameState.rareMonsterKills || 0, target: 50 };
    case 'rare_monster_100': return { current: gameState.rareMonsterKills || 0, target: 100 };

    // 도감 업적
    case 'collection_10': return { current: Object.keys(gameState.collection || {}).length, target: 10 };
    case 'collection_30': return { current: Object.keys(gameState.collection || {}).length, target: 30 };
    case 'collection_50': return { current: Object.keys(gameState.collection || {}).length, target: 50 };

    // 고대 장비 업적
    case 'ancient_1': return { current: gameState.totalAncientItems || 0, target: 1 };
    case 'ancient_6': {
      const equipment = gameState.equipment || {};
      return { current: Object.values(equipment).filter(e => e?.isAncient).length, target: 6 };
    }

    // 환생 업적
    case 'prestige_1': return { current: gameState.prestigeCount || 0, target: 1 };
    case 'prestige_5': return { current: gameState.prestigeCount || 0, target: 5 };
    case 'prestige_10': return { current: gameState.prestigeCount || 0, target: 10 };

    default: return { current: 0, target: 1 };
  }
};
