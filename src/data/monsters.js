// 층별 몬스터 데이터 (1-100층) - 각 층마다 10마리 일반 몬스터 + 1 보스
export const FLOOR_RANGES = {
  1: {
    name: '버려진 광산',
    monsters: ['광산 박쥐', '동굴 쥐', '녹슨 골렘', '갱도 거미', '부서진 광부', '독가스 슬라임', '무너진 수레', '광석 정령', '곡괭이 좀비', '갱도 벌레'],
    boss: '폐광의 수호자',
    rareMonster: '황금 광석 골렘'
  },
  6: {
    name: '고블린 소굴',
    monsters: ['고블린 정찰병', '고블린 전사', '늑대기수', '고블린 투석병', '고블린 도적', '고블린 창병', '고블린 주술사 견습', '사냥개', '고블린 파수꾼', '고블린 광전사'],
    boss: '고블린 우두머리',
    rareMonster: '고블린 왕자'
  },
  11: {
    name: '거미 동굴',
    monsters: ['동굴 거미', '맹독 거미', '거미줄 덫꾼', '점프 거미', '알 수호자', '독침 거미', '어둠 거미', '거대 타란툴라', '거미 사냥꾼', '실뿜는 거미'],
    boss: '거대 여왕거미',
    rareMonster: '크리스탈 거미'
  },
  16: {
    name: '언데드 묘지',
    monsters: ['좀비', '스켈레톤', '그림자 영혼', '구울', '스켈레톤 궁수', '좀비 전사', '망령', '뱀파이어 박쥐', '해골 개', '부패한 시체'],
    boss: '묘지기 리치',
    rareMonster: '유령 기사'
  },
  21: {
    name: '코볼트 영토',
    monsters: ['코볼트 전사', '코볼트 주술사', '코볼트 암살자', '코볼트 창병', '코볼트 궁수', '코볼트 광부', '코볼트 정찰병', '코볼트 폭파병', '코볼트 사제', '코볼트 검사'],
    boss: '코볼트 대족장',
    rareMonster: '코볼트 영웅'
  },
  26: {
    name: '독버섯 숲',
    monsters: ['포자 좀비', '독버섯인간', '맹독 덩굴', '버섯 포자', '독초 정령', '썩은 나무인간', '독안개 정령', '맹독 슬라임', '포자 벌레', '균사체 괴물'],
    boss: '버섯왕 미코스',
    rareMonster: '발광 버섯'
  },
  31: {
    name: '하피 둥지',
    monsters: ['하피 전사', '깃털 마법사', '돌풍의 하피', '하피 궁수', '폭풍 하피', '하피 정찰병', '번개 하피', '하피 암살자', '회오리 하피', '하피 사냥꾼'],
    boss: '폭풍의 여왕',
    rareMonster: '번개의 하피'
  },
  36: {
    name: '미노타우로스 미궁',
    monsters: ['미로의 전사', '황소인간', '미궁 수호병', '투우사 미노타우로스', '도끼 미노타우로스', '미궁 파수꾼', '광전사 황소인간', '미로 순찰병', '뿔달린 전사', '미궁 광전사'],
    boss: '미로의 지배자',
    rareMonster: '황금 황소'
  },
  41: {
    name: '화염 용암지대',
    monsters: ['용암 슬라임', '화염 정령', '마그마 골렘', '불꽃 박쥐', '용암 벌레', '화염 악마', '불의 정령', '용암 거미', '화염 드레이크', '타오르는 해골'],
    boss: '불의 군주',
    rareMonster: '화염 피닉스'
  },
  46: {
    name: '얼음 동굴',
    monsters: ['서리 늑대', '빙결 좀비', '얼음 정령', '눈보라 정령', '빙하 골렘', '서리 거미', '얼음 드레이크', '냉기 유령', '눈사람 전사', '빙결 슬라임'],
    boss: '빙설의 마녀',
    rareMonster: '얼음 용'
  },
  51: {
    name: '오거 요새',
    monsters: ['오거 전사', '오거 타격수', '쌍두 오거', '오거 광전사', '오거 정예병', '오거 투척병', '철갑 오거', '오거 파괴자', '오거 사냥꾼', '오거 약탈자'],
    boss: '오거 장군',
    rareMonster: '삼두 오거'
  },
  56: {
    name: '다크엘프 거처',
    monsters: ['암흑 궁수', '그림자 암살자', '어둠 마법사', '다크엘프 검사', '독살자', '어둠 사제', '그림자 무용수', '암살단원', '어둠 주술사', '다크엘프 기사'],
    boss: '어둠의 여군주',
    rareMonster: '그림자 군주'
  },
  61: {
    name: '가고일 첨탑',
    monsters: ['석상 가고일', '비행 가고일', '석화의 감시자', '대리석 가고일', '화강암 가고일', '날개 달린 석상', '첨탑 파수꾼', '돌 악마', '석화 전사', '고딕 가고일'],
    boss: '고대의 가고일',
    rareMonster: '다이아몬드 가고일'
  },
  66: {
    name: '드래곤 둥지',
    monsters: ['와이번', '드레이크', '용인족 전사', '드래곤 새끼', '용비늘 전사', '불 드레이크', '용 사냥꾼', '드래곤 기사', '용인족 주술사', '익룡'],
    boss: '고룡 발라크',
    rareMonster: '엘더 드래곤'
  },
  71: {
    name: '악마의 전당',
    monsters: ['임프', '서큐버스', '헬하운드', '지옥 기사', '악마 사제', '인큐버스', '지옥 마법사', '악마 전사', '마귀', '지옥 창병'],
    boss: '지옥의 대공',
    rareMonster: '타락한 대천사'
  },
  76: {
    name: '정령의 심연',
    monsters: ['혼돈 정령', '폭주 원소', '차원 균열수', '공간 정령', '시간 정령', '무형 정령', '원소 융합체', '균열 악마', '뒤틀린 정령', '차원 포식자'],
    boss: '원소의 화신',
    rareMonster: '태초의 정령'
  },
  81: {
    name: '타락한 기사단',
    monsters: ['흑기사', '타락한 성기사', '망령 기사', '사신 기사', '타락 검사', '어둠 기사', '죽음의 기사', '타락한 십자군', '복수의 기사', '저주받은 기사'],
    boss: '타락의 기사단장',
    rareMonster: '파멸의 기사'
  },
  86: {
    name: '고대 유적',
    monsters: ['고대 골렘', '룬 수호자', '마법 파수꾼', '석판 골렘', '마법 석상', '고대 전사', '룬 정령', '마법진 수호자', '고대 마법사', '유적 골렘'],
    boss: '고대 마법사왕',
    rareMonster: '미스릴 골렘'
  },
  91: {
    name: '용의 무덤',
    monsters: ['본 드래곤', '드래곤 리치', '용혼의 파수꾼', '해골 용', '망령 와이번', '용 언데드', '용혼 전사', '뼈 드레이크', '용의 저주', '용혼 악령'],
    boss: '고룡의 망령',
    rareMonster: '죽음의 용'
  },
  96: {
    name: '심연의 끝',
    monsters: ['심연의 괴수', '공포의 화신', '혼돈의 군주', '어둠의 지배자', '공허의 포식자', '종말의 사자', '심연 악마', '절망의 괴물', '파멸의 화신', '무의 지배자'],
    boss: '심연의 지배자',
    rareMonster: '공허의 신'
  }
};

// 101층 이상 접두사 (100층 단위)
const FLOOR_PREFIXES = [
  { minFloor: 101, maxFloor: 200, prefix: '타락한' },
  { minFloor: 201, maxFloor: 300, prefix: '고대의' },
  { minFloor: 301, maxFloor: 400, prefix: '각성한' },
  { minFloor: 401, maxFloor: 500, prefix: '심연' },
  { minFloor: 501, maxFloor: 600, prefix: '광기의' },
  { minFloor: 601, maxFloor: 700, prefix: '전설의' },
  { minFloor: 701, maxFloor: 800, prefix: '암흑' },
  { minFloor: 801, maxFloor: 900, prefix: '불멸의' },
  { minFloor: 901, maxFloor: 1000, prefix: '초월' }
];

// 기존 몬스터 타입 (레거시 - 몬스터 도감용)
export const MONSTER_TYPES = [
  { id: 'slime', name: '슬라임', hpMultiplier: 1, goldMultiplier: 1 },
  { id: 'goblin', name: '고블린', hpMultiplier: 1.2, goldMultiplier: 1.1 },
  { id: 'orc', name: '오크', hpMultiplier: 1.5, goldMultiplier: 1.2 },
  { id: 'troll', name: '트롤', hpMultiplier: 2, goldMultiplier: 1.5 },
  { id: 'ogre', name: '오우거', hpMultiplier: 2.5, goldMultiplier: 1.8 },
  { id: 'demon', name: '악마', hpMultiplier: 3, goldMultiplier: 2 },
  { id: 'dragon', name: '드래곤', hpMultiplier: 4, goldMultiplier: 2.5 },
];

export const BOSS_TYPES = [
  { id: 'boss_goblin_king', name: '고블린 킹', hpMultiplier: 10, goldMultiplier: 5 },
  { id: 'boss_orc_warlord', name: '오크 대장', hpMultiplier: 12, goldMultiplier: 6 },
  { id: 'boss_troll_chief', name: '트롤 족장', hpMultiplier: 15, goldMultiplier: 7 },
  { id: 'boss_demon_lord', name: '마왕', hpMultiplier: 20, goldMultiplier: 10 },
  { id: 'boss_ancient_dragon', name: '고대 드래곤', hpMultiplier: 30, goldMultiplier: 15 },
];

export const getMonsterHP = (stage) => {
  const baseHP = 100;
  return Math.floor(baseHP * Math.pow(1.05, stage - 1));
};

export const getBossHP = (stage) => {
  const baseHP = 100;
  const floorMultiplier = Math.pow(1.05, stage - 1);
  return Math.floor(baseHP * floorMultiplier * 15); // 15x multiplier for normal bosses (slightly weaker)
};

export const getMonsterGold = (stage) => {
  const baseGold = 5;
  return Math.floor(baseGold * Math.pow(1.4, stage - 1));
};

export const getBossGold = (stage) => {
  return getMonsterGold(stage) * 5;
};

// 희귀 몬스터 출현 확률 (보스)
export const RARE_MONSTER_CHANCE = 5; // 5% 확률

// 전설 몬스터 출현 확률 (보스, 희귀 수집 시)
export const LEGENDARY_MONSTER_CHANCE = 2; // 2% 확률

// 희귀 몬스터 출현 확률 (일반 몬스터)
export const RARE_MONSTER_SPAWN_CHANCE = 5; // 5% 확률로 출현

// 전설 몬스터 출현 확률 (일반 몬스터) - 희귀 수집 여부와 무관하게 독립적
export const LEGENDARY_MONSTER_SPAWN_CHANCE = 1; // 1% 확률로 출현

// 희귀 몬스터 포획 확률 (처치 시)
export const RARE_MONSTER_CAPTURE_CHANCE = 50; // 50% 확률로 포획

// 전설 몬스터 포획 확률 (처치 시)
export const LEGENDARY_MONSTER_CAPTURE_CHANCE = 30; // 30% 확률로 포획

// 구버전 호환용 (기존 코드에서 사용)
export const RARE_MONSTER_COLLECTION_CHANCE = RARE_MONSTER_SPAWN_CHANCE;
export const LEGENDARY_MONSTER_COLLECTION_CHANCE = LEGENDARY_MONSTER_SPAWN_CHANCE;

// 도감용 희귀 몬스터 목록 가져오기
export const getRareMonsterList = () => {
  const rareMonsters = [];

  // 1-100층의 희귀 몬스터들
  Object.entries(FLOOR_RANGES).forEach(([floorStart, data]) => {
    const floor = parseInt(floorStart);
    rareMonsters.push({
      id: `rare_${floor}`,
      name: data.rareMonster,
      zoneName: data.name,
      floorRange: `${floor}-${floor + 4}층`
    });
  });

  return rareMonsters;
};

// 층별 도감 보너스 - 세트 효과로 몬스터 수 감소
// 2셋: 1마리 추가 감소
// 5셋: 2마리 추가 감소 (총 3마리)
// 10셋: 5마리 추가 감소 (총 8마리)
export const getCollectionBonus = (collectedCount, totalCount) => {
  let monsterReduction = 0;

  // 기본: 수집한 수만큼 감소
  monsterReduction = collectedCount;

  // 세트 보너스 누적 (2셋 + 5셋 + 10셋)
  if (collectedCount >= 2) {
    monsterReduction += 1; // 2셋: +1
  }
  if (collectedCount >= 5) {
    monsterReduction += 2; // 5셋: +2 (총 2셋+5셋 = +3)
  }
  if (collectedCount >= 10) {
    monsterReduction += 5; // 10셋: +5 (총 2셋+5셋+10셋 = +8)
  }

  return {
    monsterReduction: monsterReduction,
    attack: 0,
    goldBonus: 0,
    expBonus: 0
  };
};

// 보스 도감 보너스 계산 (레어/전설 보스 수집 시)
// 레어 보스: 5셋 +10% 골드, 10셋 +20% 골드, 20셋 +50% 골드
// 전설 보스: 5셋 +10% 데미지, 10셋 +25% 데미지, 20셋 +60% 데미지
export const getBossCollectionBonus = (rareCount, legendaryCount) => {
  let goldBonus = 0;
  let damageBonus = 0;

  // 레어 보스 골드 보너스
  if (rareCount >= 5) goldBonus += 10;
  if (rareCount >= 10) goldBonus += 10; // 총 20%
  if (rareCount >= 20) goldBonus += 30; // 총 50%

  // 전설 보스 데미지 보너스
  if (legendaryCount >= 5) damageBonus += 10;
  if (legendaryCount >= 10) damageBonus += 15; // 총 25%
  if (legendaryCount >= 20) damageBonus += 35; // 총 60%

  return {
    goldBonus,
    damageBonus
  };
};

// 층에 맞는 몬스터 이름 가져오기 (monsterIndex 파라미터 추가)
const getMonsterNameForFloor = (floor, isBoss = false, isRare = false, monsterIndex = null) => {
  // 100층 이하
  if (floor <= 100) {
    // 해당 층의 범위 찾기 (5층 단위)
    const rangeStart = Math.floor((floor - 1) / 5) * 5 + 1;
    const rangeData = FLOOR_RANGES[rangeStart];

    if (!rangeData) return { name: isBoss ? '보스' : '몬스터', monsterIndex: 0 };

    if (isBoss) {
      return { name: rangeData.boss, monsterIndex: 10 }; // 보스는 인덱스 10
    } else {
      // monsterIndex가 주어지지 않으면 랜덤 선택
      const idx = monsterIndex !== null ? monsterIndex : Math.floor(Math.random() * rangeData.monsters.length);
      return { name: rangeData.monsters[idx], monsterIndex: idx };
    }
  }

  // 101층 이상 - 접두사 시스템
  const baseFloor = ((floor - 1) % 100) + 1; // 1-100으로 매핑
  const rangeStart = Math.floor((baseFloor - 1) / 5) * 5 + 1;
  const rangeData = FLOOR_RANGES[rangeStart];

  if (!rangeData) return { name: isBoss ? '보스' : '몬스터', monsterIndex: 0 };

  // 접두사 찾기
  const prefixData = FLOOR_PREFIXES.find(p => floor >= p.minFloor && floor <= p.maxFloor);
  const prefix = prefixData ? prefixData.prefix + ' ' : '';

  if (isBoss) {
    return { name: prefix + rangeData.boss, monsterIndex: 10 }; // 보스는 인덱스 10
  } else {
    const idx = monsterIndex !== null ? monsterIndex : Math.floor(Math.random() * rangeData.monsters.length);
    return { name: prefix + rangeData.monsters[idx], monsterIndex: idx };
  }
};

export const getMonsterForStage = (stage, isBoss = false, forceRare = false, forceLegendary = false, collection = null, rareSpawnBonus = 0, legendarySpawnBonus = 0) => {
  // 희귀/전설 독립적 확률 시스템
  // 희귀: 5% 출현, 50% 포획
  // 전설: 1% 출현, 30% 포획
  // 희귀를 수집하지 않아도 전설 출현 가능
  let isRare = false;
  let isLegendary = false;
  let monsterIndex = null;

  // 유물 효과로 스폰율 증가
  const adjustedRareSpawnChance = RARE_MONSTER_SPAWN_CHANCE + rareSpawnBonus;
  const adjustedLegendarySpawnChance = LEGENDARY_MONSTER_SPAWN_CHANCE + legendarySpawnBonus;
  const adjustedRareBossChance = RARE_MONSTER_CHANCE + rareSpawnBonus;
  const adjustedLegendaryBossChance = LEGENDARY_MONSTER_CHANCE + legendarySpawnBonus;

  if (!isBoss && collection) {
    // 1. 몬스터 타입을 먼저 선택 (0-9)
    const rangeStart = Math.floor((stage - 1) / 5) * 5 + 1;
    monsterIndex = Math.floor(Math.random() * 10);
    const rareId = `rare_${rangeStart}_${monsterIndex}`;
    const legendaryId = `legendary_${rangeStart}_${monsterIndex}`;

    // 2. 해당 몬스터의 수집 여부 확인
    const rareCollected = collection.rareMonsters?.[rareId]?.unlocked || false;
    const legendaryCollected = collection.legendaryMonsters?.[legendaryId]?.unlocked || false;

    // 3. 독립적 확률로 희귀/전설 결정 (수집 안 된 것만)
    // 전설 먼저 체크 (더 희귀하므로 우선순위)
    if (!legendaryCollected && (forceLegendary || Math.random() * 100 < adjustedLegendarySpawnChance)) {
      isLegendary = true;
    } else if (!rareCollected && (forceRare || Math.random() * 100 < adjustedRareSpawnChance)) {
      isRare = true;
    }
    // 둘 다 수집됨 → 일반 몬스터 (isRare = false, isLegendary = false)
  } else {
    // 보스의 경우 기존 로직 유지
    isRare = forceRare || Math.random() * 100 < adjustedRareBossChance;
    if (collection && isRare) {
      const rangeStart = Math.floor((stage - 1) / 5) * 5 + 1;
      const rareId = `rare_boss_${rangeStart}`;
      if (collection.rareBosses?.[rareId]?.unlocked) {
        isLegendary = forceLegendary || Math.random() * 100 < adjustedLegendaryBossChance;
        if (isLegendary) isRare = false;
      }
    }
  }

  const monsterData = getMonsterNameForFloor(stage, isBoss, isRare || isLegendary, monsterIndex);

  if (isBoss) {
    // 희귀 보스는 HP 10배, 전설 보스는 HP 50배 (매우 강력)
    // 골드는 체력에 비례
    let hpMultiplier = 1;

    if (isLegendary) {
      hpMultiplier = 50; // 전설 보스: 일반 보스의 50배 (지리게 강함)
    } else if (isRare) {
      hpMultiplier = 10; // 희귀 보스: 일반 보스의 10배
    }

    // 5층 단위로 시작 층 계산
    const rangeStart = Math.floor((stage - 1) / 5) * 5 + 1;

    const bossHP = Math.floor(getBossHP(stage) * hpMultiplier);

    return {
      id: isLegendary ? `legendary_boss_${stage}` : (isRare ? `rare_boss_${stage}` : `boss_${stage}`),
      name: monsterData.name,
      hp: bossHP,
      maxHp: bossHP,
      gold: bossHP, // 골드는 체력에 비례
      isBoss: true,
      isRare: isRare,
      isLegendary: isLegendary,
      stage,
      monsterIndex: monsterData.monsterIndex,
      rangeStart: rangeStart // 도감 ID 계산용
    };
  }

  // 희귀 몬스터는 HP 3배, 전설 몬스터는 HP 10배
  // 골드는 체력에 비례
  let hpMultiplier = 1;

  if (isLegendary) {
    hpMultiplier = 10;
  } else if (isRare) {
    hpMultiplier = 3;
  }

  // 5층 단위로 시작 층 계산
  const rangeStart = Math.floor((stage - 1) / 5) * 5 + 1;

  const monsterHP = Math.floor(getMonsterHP(stage) * hpMultiplier);

  return {
    id: isLegendary ? `legendary_${stage}_${monsterData.monsterIndex}` : (isRare ? `rare_${stage}_${monsterData.monsterIndex}` : `monster_${stage}`),
    name: monsterData.name,
    hp: monsterHP,
    maxHp: monsterHP,
    gold: monsterHP, // 골드는 체력에 비례
    isBoss: false,
    isRare: isRare,
    isLegendary: isLegendary,
    stage,
    monsterIndex: monsterData.monsterIndex,
    rangeStart: rangeStart, // 도감 ID 계산용
    spawnTime: Date.now() // 스폰 시간 추적
  };
};
