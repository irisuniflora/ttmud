// 봉인구역 레이드 보스 시스템

// 난이도 레벨 시스템 (무한 레벨)
// 레벨 1 = 1배, 레벨마다 1.5배씩 증가
export const getDifficultyMultiplier = (level) => {
  return Math.pow(1.5, level - 1);
};

// 난이도 레벨에 따른 색상
export const getDifficultyColor = (level) => {
  if (level <= 5) return 'text-gray-400';
  if (level <= 10) return 'text-green-400';
  if (level <= 20) return 'text-blue-400';
  if (level <= 30) return 'text-purple-400';
  if (level <= 50) return 'text-orange-400';
  if (level <= 75) return 'text-pink-400';
  return 'text-red-400';
};

// 난이도 레벨에 따른 이름
export const getDifficultyName = (level) => {
  return `Lv.${level}`;
};

// 죄수(레이드 보스) 정의
export const RAID_BOSSES = {
  vecta: {
    id: 'vecta',
    name: '파괴자 베크타',
    icon: '🎭',
    description: '장비 파괴',
    unlockFloor: 1, // 해금 조건: 1층부터 가능
    dropSlot: 'ring', // 반지 드랍
    pattern: {
      type: 'equipment_destroy',
      interval: 5000, // 5초마다
      duration: 5000, // 5초간 지속
      description: '5초마다 무작위 장비 슬롯 1개를 5초간 파괴 (능력치 0)'
    },
    baseStats: {
      hp: 500000,
      defense: 100,
      evasion: 300 // 기본 회피 300 (레벨당 +10% 단리)
    },
    rewards: {
      gold: 1000,
      exp: 500
    }
  },
  nepheron: {
    id: 'nepheron',
    name: '결계 사령 네페론',
    icon: '🔰',
    description: '보호막 30% 체력',
    unlockFloor: 50, // 해금 조건: 50층 이상
    dropSlot: 'weapon', // 무기 드랍
    pattern: {
      type: 'shield',
      shieldPercent: 30, // 체력의 30%
      shieldRegenRate: 30, // 30% 확률로 보호막 재생성
      interval: 10000, // 10초마다
      description: '체력의 30%만큼 강력한 보호막을 주기적으로 생성. 보호막이 있으면 체력 피해 불가',
      hasInitialShield: true // 전투 시작 시 방어막 보유
    },
    baseStats: {
      hp: 600000,
      defense: 150,
      evasion: 400 // 기본 회피 400 (레벨당 +10% 단리)
    },
    rewards: {
      gold: 1200,
      exp: 600
    }
  },
  rothar: {
    id: 'rothar',
    name: '부패군주 로타르',
    icon: '☠️',
    description: '보스 체력 자동 재생',
    unlockFloor: 100, // 해금 조건: 100층 이상
    dropSlot: 'necklace', // 목걸이 드랍
    pattern: {
      type: 'regeneration',
      regenPercent: 3, // 매초 3% 회복
      interval: 1000, // 1초마다
      description: '매초 보스 체력 3% 회복 (치유 감소 문양 필수!)'
    },
    baseStats: {
      hp: 400000,
      defense: 80,
      evasion: 500 // 기본 회피 500 (레벨당 +10% 단리)
    },
    rewards: {
      gold: 1500,
      exp: 700
    }
  },
  esmode: {
    id: 'esmode',
    name: '혼돈의 점술가 에스모드',
    icon: '🃏',
    description: '주기적 무적',
    unlockFloor: 150, // 해금 조건: 150층 이상
    dropSlot: 'boots', // 신발 드랍
    pattern: {
      type: 'invincible',
      interval: 10000, // 10초마다
      duration: 5000, // 5초간 무적
      description: '10초마다 5초간 무적 상태 돌입 (무적 해제 문양 필요!)'
    },
    baseStats: {
      hp: 450000,
      defense: 90,
      evasion: 600 // 기본 회피 600 (레벨당 +10% 단리)
    },
    rewards: {
      gold: 1300,
      exp: 650
    }
  },
  silen: {
    id: 'silen',
    name: '밤추적자 실렌',
    icon: '🌙',
    description: '회피 3000',
    unlockFloor: 200, // 해금 조건: 200층 이상
    dropSlot: 'armor', // 갑옷 드랍
    pattern: {
      type: 'evasion',
      description: '회피 3000 - 명중 특화 문양 필요'
    },
    baseStats: {
      hp: 350000,
      defense: 70,
      evasion: 3000 // 회피 특화 보스 (레벨당 +10% 단리)
    },
    rewards: {
      gold: 1400,
      exp: 680
    }
  },
  gorath: {
    id: 'gorath',
    name: '강철심장 고라스',
    icon: '🔩',
    description: '치명타 무효',
    unlockFloor: 250, // 해금 조건: 250층 이상
    dropSlot: 'gloves', // 장갑 드랍
    pattern: {
      type: 'crit_immunity',
      critReduction: 100, // 치명타 데미지 100% 감소 (일반 데미지로 변환)
      description: '모든 치명타 공격이 일반 공격으로 변환됨'
    },
    baseStats: {
      hp: 750000,
      defense: 200,
      evasion: 700 // 기본 회피 700 (레벨당 +10% 단리)
    },
    rewards: {
      gold: 1600,
      exp: 750
    }
  }
};

// 보스 해금 체크 함수
export const checkBossUnlock = (bossId, playerFloor) => {
  const boss = RAID_BOSSES[bossId];
  if (!boss) return false;
  return playerFloor >= boss.unlockFloor;
};

// 보스 코인 보상 계산 (난이도 레벨에 따라)
export const calculateBossCoinReward = (difficultyLevel) => {
  // 기본 10코인 * 난이도 배수
  const multiplier = getDifficultyMultiplier(difficultyLevel);
  return Math.floor(10 * multiplier);
};

// 봉인구역 보스 방어율 계산 (20% + (레벨-1) × 2%)
// Lv1: 20%, Lv10: 38%, Lv20: 58%, Lv40: 98%
export const calculateBossDefenseRate = (difficultyLevel) => {
  const baseDefense = 20;
  const defensePerLevel = 2;
  return Math.min(98, baseDefense + (difficultyLevel - 1) * defensePerLevel); // 최대 98%
};

// 난이도 레벨별 보스 스탯 계산 (플레이어 층수와 무관하게 난이도만으로 결정)
export const calculateRaidBossStats = (bossId, difficultyLevel) => {
  const boss = RAID_BOSSES[bossId];

  if (!boss) return null;

  const difficultyMultiplier = getDifficultyMultiplier(difficultyLevel);
  // 회피는 단리로 레벨당 +10% (레벨 1 = 100%, 레벨 2 = 110%, 레벨 11 = 200%)
  const evasionMultiplier = 1 + (difficultyLevel - 1) * 0.1;
  // 방어율 계산 (20% + (레벨-1) × 2%)
  const defenseRate = calculateBossDefenseRate(difficultyLevel);

  return {
    ...boss,
    difficultyLevel,
    difficultyName: getDifficultyName(difficultyLevel),
    difficultyColor: getDifficultyColor(difficultyLevel),
    hp: Math.floor(boss.baseStats.hp * difficultyMultiplier),
    maxHp: Math.floor(boss.baseStats.hp * difficultyMultiplier),
    defense: Math.floor(boss.baseStats.defense * difficultyMultiplier),
    defenseRate, // 방어율 (%) - 방관 스탯으로 관통 필요
    evasion: Math.floor((boss.baseStats.evasion || 500) * evasionMultiplier),
    rewards: {
      gold: Math.floor(boss.rewards.gold * difficultyMultiplier),
      exp: Math.floor(boss.rewards.exp * difficultyMultiplier),
      bossCoins: calculateBossCoinReward(difficultyLevel)
    }
  };
};

// 도전권 아이템
export const RAID_TICKET = {
  id: 'raid_ticket',
  name: '봉인구역 도전권',
  icon: '🎫',
  description: '봉인구역에 입장할 수 있는 도전권',
  dropRate: 0.05 // 5% 드랍률 (보스 처치 시)
};

// 문양 슬롯 시스템
export const INSCRIPTION_SLOT_CONFIG = {
  maxSlots: 3, // 최대 문양 슬롯 수
  defaultSlots: 1, // 기본 문양 슬롯 수
  unlockCosts: {
    slot2: 10000, // 2번째 슬롯 해금 비용 (골드)
    slot3: 50000  // 3번째 슬롯 해금 비용 (골드)
  }
};
