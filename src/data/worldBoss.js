// 월드보스 시스템 설정

// 월드보스 타이밍 설정 (한국시간 기준)
export const WORLD_BOSS_CONFIG = {
  // 기본 오픈 시간 (한국시간 기준)
  defaultSchedule: {
    startHour: 0,  // 오전 12시 (자정)
    endHour: 12,   // 낮 12시
    timezone: 'Asia/Seoul'
  },

  // 전투 세션 설정
  battleSession: {
    duration: 60, // 1분 (60초)
    cooldown: 0   // 재도전 쿨다운 없음
  },

  // 보상 설정
  rewards: {
    top10: {
      bossCoins: 100
    },
    participation: {
      bossCoins: 30
    }
  },

  // 수동 제어 설정
  manualControl: {
    enabled: true,
    requiresAdmin: true
  }
};

// 월드보스 정보
export const WORLD_BOSS_INFO = {
  id: 'world_boss_001',
  name: '심연의 지배자',
  description: '심연 깊은 곳에서 나타난 강력한 존재',
  icon: '👹',
  image: '🌑',

  // 보스 스탯 (표시용, 실제 체력은 무한)
  stats: {
    hp: Infinity,
    defense: 1000,
    level: 999
  },

  // 보스 특성
  traits: [
    { name: '심연의 힘', description: '모든 데미지를 흡수하여 더욱 강력해진다' },
    { name: '불멸', description: '절대 쓰러지지 않는다' },
    { name: '시간의 지배자', description: '제한된 시간 안에만 도전할 수 있다' }
  ]
};

// 경매 아이템 목록
export const AUCTION_ITEMS = [
  {
    id: 'gear_orb',
    name: '장비 오브',
    description: '장비 옵션을 재굴림',
    icon: '🔮',
    rarity: 'epic',
    minBid: 100,
    quantity: 10
  },
  {
    id: 'stat_max_item',
    name: '완벽의 정수',
    description: '장비의 현재 옵션을 최대치로 고정',
    icon: '🔷',
    rarity: 'mythic',
    minBid: 500,
    quantity: 3
  },
  {
    id: 'monster_selection_ticket',
    name: '몬스터 도감 선택권',
    description: '원하는 몬스터를 선택하여 도감에 등록',
    icon: '📜',
    rarity: 'legendary',
    minBid: 300,
    quantity: 5
  },
  {
    id: 'legendary_equipment_box',
    name: '랜덤 전설 장비 상자',
    description: '랜덤한 전설 등급 장비를 획득',
    icon: '📦',
    rarity: 'legendary',
    minBid: 400,
    quantity: 5
  },
  {
    id: 'inscription_token',
    name: '문양 각인권',
    description: '문양을 뽑을 수 있는 티켓',
    icon: '📿',
    rarity: 'epic',
    minBid: 150,
    quantity: 15
  }
];

// 경매 시스템 설정
export const AUCTION_CONFIG = {
  // 경매 진행 시간
  duration: 10 * 60, // 10분 (600초)

  // 입찰 설정
  bidding: {
    minIncrement: 10, // 최소 입찰 증가액
    maxBidsPerUser: 50 // 한 사용자당 최대 입찰 가능 횟수
  },

  // 경매 시작 조건
  startCondition: {
    minParticipants: 1, // 최소 참가자 수
    autoStart: true // 월드보스 종료 시 자동 시작
  }
};

// 레어리티 색상
export const RARITY_COLORS = {
  common: 'border-gray-500 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-orange-500 text-orange-400',
  mythic: 'border-red-500 text-red-400'
};

// 월드보스 상태 확인 함수
export const isWorldBossActive = (currentTime = new Date(), manualOverride = null) => {
  // 수동 제어가 활성화된 경우
  if (manualOverride !== null) {
    return manualOverride;
  }

  // 한국 시간으로 변환
  const koreaTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const currentHour = koreaTime.getHours();

  // 오전 12시(0시)부터 낮 12시까지 활성화
  return currentHour >= WORLD_BOSS_CONFIG.defaultSchedule.startHour &&
         currentHour < WORLD_BOSS_CONFIG.defaultSchedule.endHour;
};

// 다음 월드보스 오픈까지 남은 시간 계산
export const getTimeUntilNextBoss = (currentTime = new Date()) => {
  const koreaTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const currentHour = koreaTime.getHours();

  if (currentHour < WORLD_BOSS_CONFIG.defaultSchedule.startHour) {
    // 오늘 자정까지
    const hoursUntil = WORLD_BOSS_CONFIG.defaultSchedule.startHour - currentHour;
    return hoursUntil * 60 * 60 * 1000;
  } else if (currentHour >= WORLD_BOSS_CONFIG.defaultSchedule.endHour) {
    // 내일 자정까지
    const hoursUntil = 24 - currentHour + WORLD_BOSS_CONFIG.defaultSchedule.startHour;
    return hoursUntil * 60 * 60 * 1000;
  } else {
    // 현재 활성화 중
    return 0;
  }
};

// 월드보스 종료까지 남은 시간 계산
export const getTimeUntilBossEnd = (currentTime = new Date()) => {
  const koreaTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const currentHour = koreaTime.getHours();
  const currentMinute = koreaTime.getMinutes();
  const currentSecond = koreaTime.getSeconds();

  if (currentHour >= WORLD_BOSS_CONFIG.defaultSchedule.endHour) {
    return 0;
  }

  // 낮 12시까지 남은 시간 계산
  const hoursLeft = WORLD_BOSS_CONFIG.defaultSchedule.endHour - currentHour - 1;
  const minutesLeft = 60 - currentMinute - 1;
  const secondsLeft = 60 - currentSecond;

  return (hoursLeft * 60 * 60 + minutesLeft * 60 + secondsLeft) * 1000;
};
