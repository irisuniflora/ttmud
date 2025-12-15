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
    pattern: {
      type: 'equipment_destroy',
      interval: 5000, // 5초마다
      duration: 5000, // 5초간 지속
      description: '5초마다 무작위 장비 슬롯 1개를 5초간 파괴 (능력치 0)'
    },
    baseStats: {
      hp: 100000,
      defense: 100
    },
    rewards: {
      gold: 1000,
      exp: 500
    }
  },
  nepheron: {
    id: 'nepheron',
    name: '결계 사령 네페론',
    icon: '🛡️',
    description: '보호막 30% 체력',
    unlockFloor: 50, // 해금 조건: 50층 이상
    pattern: {
      type: 'shield',
      shieldPercent: 30, // 체력의 30%
      interval: 10000, // 10초마다
      description: '체력의 30%만큼 강력한 보호막을 주기적으로 생성. 보호막 유지 중 무적'
    },
    baseStats: {
      hp: 120000,
      defense: 150
    },
    rewards: {
      gold: 1200,
      exp: 600
    }
  },
  rothar: {
    id: 'rothar',
    name: '부패군주 로타르',
    icon: '💀',
    description: '보스 체력 자동 재생',
    unlockFloor: 100, // 해금 조건: 100층 이상
    pattern: {
      type: 'regeneration',
      regenPercent: 5, // 매초 5% 회복
      interval: 1000, // 1초마다
      description: '매초 보스 체력 5% 회복'
    },
    baseStats: {
      hp: 80000,
      defense: 80
    },
    rewards: {
      gold: 1500,
      exp: 700
    }
  },
  esmode: {
    id: 'esmode',
    name: '혼돈의 점술가 에스모드',
    icon: '🔮',
    description: '랜덤 약화',
    unlockFloor: 150, // 해금 조건: 150층 이상
    pattern: {
      type: 'debuff',
      interval: 3000, // 3초마다
      debuffs: [
        { id: 'atk_down', name: '공격력 감소', value: 30 },
        { id: 'aspd_down', name: '공격속도 감소', value: 30 },
        { id: 'crit_down', name: '치명타율 감소', value: 30 },
        { id: 'cooldown_up', name: '스킬 쿨타임 증가', value: 50 },
        { id: 'dot', name: '지속 피해', value: 1000 }
      ],
      description: '3초마다 문양에게 5종 랜덤 디버프 중 하나 적용'
    },
    baseStats: {
      hp: 90000,
      defense: 90
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
    description: '회피 60%',
    unlockFloor: 200, // 해금 조건: 200층 이상
    pattern: {
      type: 'evasion',
      evasionRate: 60, // 60% 회피
      description: '보스 기본 회피율 60%'
    },
    baseStats: {
      hp: 70000,
      defense: 70
    },
    rewards: {
      gold: 1400,
      exp: 680
    }
  },
  gorath: {
    id: 'gorath',
    name: '강철심장 고라스',
    icon: '⚙️',
    description: '치명타 무효',
    unlockFloor: 250, // 해금 조건: 250층 이상
    pattern: {
      type: 'crit_immunity',
      critReduction: 100, // 치명타 데미지 100% 감소 (일반 데미지로 변환)
      description: '모든 치명타 공격이 일반 공격으로 변환됨'
    },
    baseStats: {
      hp: 150000,
      defense: 200
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

// 난이도 레벨별 보스 스탯 계산 (플레이어 층수와 무관하게 난이도만으로 결정)
export const calculateRaidBossStats = (bossId, difficultyLevel) => {
  const boss = RAID_BOSSES[bossId];

  if (!boss) return null;

  const difficultyMultiplier = getDifficultyMultiplier(difficultyLevel);

  return {
    ...boss,
    difficultyLevel,
    difficultyName: getDifficultyName(difficultyLevel),
    difficultyColor: getDifficultyColor(difficultyLevel),
    hp: Math.floor(boss.baseStats.hp * difficultyMultiplier),
    maxHp: Math.floor(boss.baseStats.hp * difficultyMultiplier),
    defense: Math.floor(boss.baseStats.defense * difficultyMultiplier),
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
