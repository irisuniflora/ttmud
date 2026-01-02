// 몬스터 도감 세트 시스템
// 몬스터를 각인하면 해당 몬스터는 사라지고(방생) 세트 진행도가 증가
// 세트 완성 시 영구 스탯 보너스 제공

// 몬스터 등급
export const MONSTER_GRADES = {
  normal: { name: '일반', color: '#9CA3AF', icon: '⚪' },
  rare: { name: '희귀', color: '#3B82F6', icon: '🔵' },
  legendary: { name: '전설', color: '#F59E0B', icon: '🟡' }
};

// 세트 효과 타입
export const SET_EFFECT_TYPES = {
  attack: { name: '공격력', suffix: '', icon: '⚔️' },
  attackPercent: { name: '공격력', suffix: '%', icon: '⚔️' },
  critChance: { name: '치명타 확률', suffix: '%', icon: '💥' },
  critDmg: { name: '치명타 데미지', suffix: '%', icon: '🎯' },
  goldBonus: { name: '골드 획득량', suffix: '%', icon: '💰' },
  dropRate: { name: '드랍율', suffix: '%', icon: '🍀' },
  expBonus: { name: '경험치', suffix: '%', icon: '📚' },
  bossDamage: { name: '보스 데미지', suffix: '%', icon: '👑' },
  monsterReduction: { name: '몬스터 감소', suffix: '', icon: '➖' },
  hpPercentDmg: { name: 'HP% 데미지', suffix: '%', icon: '💀' },
  dotDamage: { name: '도트 데미지', suffix: '%', icon: '🔥' },
  skipChance: { name: '스킵 확률', suffix: '%', icon: '⏭️' }
};

// 몬스터 세트 정의 (50개)
// monsters 배열: [지역시작층, 몬스터인덱스(0-9), 등급('normal'/'rare'/'legendary')]
// 보스는 monsterIndex: 10
export const MONSTER_SETS = {
  // ===== 속성 테마 (10개) =====
  fire_masters: {
    id: 'fire_masters',
    name: '불의 지배자들',
    icon: '🔥',
    description: '화염 속성 몬스터들의 세트',
    monsters: [
      { zone: 41, index: 0, grade: 'normal', name: '용암 슬라임' },
      { zone: 41, index: 1, grade: 'normal', name: '화염 정령' },
      { zone: 41, index: 5, grade: 'normal', name: '화염 악마' },
      { zone: 41, index: 8, grade: 'rare', name: '화염 드레이크' },
      { zone: 41, index: 10, grade: 'legendary', name: '불의 군주' }
    ],
    effect: { type: 'attackPercent', value: 15 }
  },

  ice_legion: {
    id: 'ice_legion',
    name: '얼음 군단',
    icon: '❄️',
    description: '냉기 속성 몬스터들의 세트',
    monsters: [
      { zone: 46, index: 0, grade: 'normal', name: '서리 늑대' },
      { zone: 46, index: 2, grade: 'normal', name: '얼음 정령' },
      { zone: 46, index: 4, grade: 'normal', name: '빙하 골렘' },
      { zone: 46, index: 6, grade: 'rare', name: '얼음 드레이크' },
      { zone: 46, index: 10, grade: 'legendary', name: '빙설의 마녀' }
    ],
    effect: { type: 'critDmg', value: 25 }
  },

  poison_masters: {
    id: 'poison_masters',
    name: '맹독의 군세',
    icon: '☠️',
    description: '독 속성 몬스터들의 세트',
    monsters: [
      { zone: 26, index: 0, grade: 'normal', name: '포자 좀비' },
      { zone: 26, index: 1, grade: 'normal', name: '독버섯인간' },
      { zone: 26, index: 7, grade: 'normal', name: '맹독 슬라임' },
      { zone: 11, index: 1, grade: 'rare', name: '맹독 거미' },
      { zone: 26, index: 10, grade: 'legendary', name: '버섯왕 미코스' }
    ],
    effect: { type: 'dotDamage', value: 30 }
  },

  storm_riders: {
    id: 'storm_riders',
    name: '폭풍의 기수단',
    icon: '⚡',
    description: '번개/바람 속성 몬스터들의 세트',
    monsters: [
      { zone: 31, index: 0, grade: 'normal', name: '하피 전사' },
      { zone: 31, index: 4, grade: 'normal', name: '폭풍 하피' },
      { zone: 31, index: 6, grade: 'rare', name: '번개 하피' },
      { zone: 76, index: 4, grade: 'rare', name: '시간 정령' },
      { zone: 31, index: 10, grade: 'legendary', name: '폭풍의 여왕' }
    ],
    effect: { type: 'critChance', value: 10 }
  },

  earth_guardians: {
    id: 'earth_guardians',
    name: '대지의 수호자',
    icon: '🪨',
    description: '암석/대지 속성 몬스터들의 세트',
    monsters: [
      { zone: 1, index: 2, grade: 'normal', name: '녹슨 골렘' },
      { zone: 61, index: 0, grade: 'normal', name: '석상 가고일' },
      { zone: 86, index: 0, grade: 'normal', name: '고대 골렘' },
      { zone: 61, index: 3, grade: 'rare', name: '대리석 가고일' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' }
    ],
    effect: { type: 'bossDamage', value: 20 }
  },

  shadow_walkers: {
    id: 'shadow_walkers',
    name: '그림자 보행자',
    icon: '🌑',
    description: '암흑 속성 몬스터들의 세트',
    monsters: [
      { zone: 56, index: 1, grade: 'normal', name: '그림자 암살자' },
      { zone: 56, index: 2, grade: 'normal', name: '어둠 마법사' },
      { zone: 16, index: 2, grade: 'normal', name: '그림자 영혼' },
      { zone: 56, index: 6, grade: 'rare', name: '그림자 무용수' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' }
    ],
    effect: { type: 'critDmg', value: 30 }
  },

  holy_light: {
    id: 'holy_light',
    name: '성스러운 빛',
    icon: '✨',
    description: '신성 속성 몬스터들의 세트',
    monsters: [
      { zone: 76, index: 2, grade: 'normal', name: '차원 균열수' },
      { zone: 76, index: 0, grade: 'normal', name: '혼돈 정령' },
      { zone: 81, index: 1, grade: 'rare', name: '타락한 성기사' },
      { zone: 71, index: 10, grade: 'rare', name: '지옥의 대공' },
      { zone: 76, index: 10, grade: 'legendary', name: '원소의 화신' }
    ],
    effect: { type: 'expBonus', value: 25 }
  },

  void_entities: {
    id: 'void_entities',
    name: '공허의 존재',
    icon: '🕳️',
    description: '공허/심연 속성 몬스터들의 세트',
    monsters: [
      { zone: 96, index: 0, grade: 'normal', name: '심연의 괴수' },
      { zone: 96, index: 4, grade: 'normal', name: '공허의 포식자' },
      { zone: 76, index: 9, grade: 'normal', name: '차원 포식자' },
      { zone: 96, index: 7, grade: 'rare', name: '절망의 괴물' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 20 }
  },

  nature_spirits: {
    id: 'nature_spirits',
    name: '자연의 정령',
    icon: '🌿',
    description: '자연/식물 속성 몬스터들의 세트',
    monsters: [
      { zone: 26, index: 2, grade: 'normal', name: '맹독 덩굴' },
      { zone: 26, index: 4, grade: 'normal', name: '독초 정령' },
      { zone: 26, index: 5, grade: 'normal', name: '썩은 나무인간' },
      { zone: 1, index: 7, grade: 'rare', name: '광석 정령' },
      { zone: 41, index: 6, grade: 'legendary', name: '불의 정령' }
    ],
    effect: { type: 'dropRate', value: 20 }
  },

  chaos_lords: {
    id: 'chaos_lords',
    name: '혼돈의 군주들',
    icon: '💫',
    description: '혼돈 속성 몬스터들의 세트',
    monsters: [
      { zone: 76, index: 1, grade: 'normal', name: '폭주 원소' },
      { zone: 76, index: 6, grade: 'normal', name: '원소 융합체' },
      { zone: 96, index: 2, grade: 'rare', name: '혼돈의 군주' },
      { zone: 96, index: 8, grade: 'rare', name: '파멸의 화신' },
      { zone: 96, index: 9, grade: 'legendary', name: '무의 지배자' }
    ],
    effect: { type: 'critChance', value: 12 }
  },

  // ===== 종족 테마 (15개) =====
  goblin_horde: {
    id: 'goblin_horde',
    name: '고블린 대군',
    icon: '👺',
    description: '고블린 종족의 세트',
    monsters: [
      { zone: 6, index: 0, grade: 'normal', name: '고블린 정찰병' },
      { zone: 6, index: 1, grade: 'normal', name: '고블린 전사' },
      { zone: 6, index: 9, grade: 'normal', name: '고블린 광전사' },
      { zone: 6, index: 6, grade: 'rare', name: '고블린 주술사 견습' },
      { zone: 6, index: 10, grade: 'legendary', name: '고블린 우두머리' }
    ],
    effect: { type: 'goldBonus', value: 25 }
  },

  spider_nest: {
    id: 'spider_nest',
    name: '거미 둥지',
    icon: '🕷️',
    description: '거미 종족의 세트',
    monsters: [
      { zone: 11, index: 0, grade: 'normal', name: '동굴 거미' },
      { zone: 11, index: 3, grade: 'normal', name: '점프 거미' },
      { zone: 11, index: 7, grade: 'normal', name: '거대 타란툴라' },
      { zone: 41, index: 7, grade: 'rare', name: '용암 거미' },
      { zone: 11, index: 10, grade: 'legendary', name: '거대 여왕거미' }
    ],
    effect: { type: 'critChance', value: 8 }
  },

  undead_army: {
    id: 'undead_army',
    name: '언데드 군세',
    icon: '💀',
    description: '언데드 종족의 세트',
    monsters: [
      { zone: 16, index: 0, grade: 'normal', name: '좀비' },
      { zone: 16, index: 1, grade: 'normal', name: '스켈레톤' },
      { zone: 16, index: 6, grade: 'normal', name: '망령' },
      { zone: 41, index: 9, grade: 'rare', name: '타오르는 해골' },
      { zone: 16, index: 10, grade: 'legendary', name: '묘지기 리치' }
    ],
    effect: { type: 'hpPercentDmg', value: 3 }
  },

  kobold_tribe: {
    id: 'kobold_tribe',
    name: '코볼트 부족',
    icon: '🐉',
    description: '코볼트 종족의 세트',
    monsters: [
      { zone: 21, index: 0, grade: 'normal', name: '코볼트 전사' },
      { zone: 21, index: 1, grade: 'normal', name: '코볼트 주술사' },
      { zone: 21, index: 4, grade: 'normal', name: '코볼트 궁수' },
      { zone: 21, index: 7, grade: 'rare', name: '코볼트 폭파병' },
      { zone: 21, index: 10, grade: 'legendary', name: '코볼트 대족장' }
    ],
    effect: { type: 'expBonus', value: 20 }
  },

  harpy_flock: {
    id: 'harpy_flock',
    name: '하피 무리',
    icon: '🦅',
    description: '하피 종족의 세트',
    monsters: [
      { zone: 31, index: 1, grade: 'normal', name: '깃털 마법사' },
      { zone: 31, index: 3, grade: 'normal', name: '하피 궁수' },
      { zone: 31, index: 7, grade: 'normal', name: '하피 암살자' },
      { zone: 31, index: 8, grade: 'rare', name: '회오리 하피' },
      { zone: 31, index: 10, grade: 'legendary', name: '폭풍의 여왕' }
    ],
    effect: { type: 'skipChance', value: 5 }
  },

  minotaur_maze: {
    id: 'minotaur_maze',
    name: '미노타우로스 미로',
    icon: '🐂',
    description: '미노타우로스 종족의 세트',
    monsters: [
      { zone: 36, index: 0, grade: 'normal', name: '미로의 전사' },
      { zone: 36, index: 1, grade: 'normal', name: '황소인간' },
      { zone: 36, index: 6, grade: 'normal', name: '광전사 황소인간' },
      { zone: 36, index: 4, grade: 'rare', name: '도끼 미노타우로스' },
      { zone: 36, index: 10, grade: 'legendary', name: '미로의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 12 }
  },

  ogre_fortress: {
    id: 'ogre_fortress',
    name: '오거 요새',
    icon: '👹',
    description: '오거 종족의 세트',
    monsters: [
      { zone: 51, index: 0, grade: 'normal', name: '오거 전사' },
      { zone: 51, index: 3, grade: 'normal', name: '오거 광전사' },
      { zone: 51, index: 7, grade: 'normal', name: '오거 파괴자' },
      { zone: 51, index: 6, grade: 'rare', name: '철갑 오거' },
      { zone: 51, index: 10, grade: 'legendary', name: '오거 장군' }
    ],
    effect: { type: 'bossDamage', value: 15 }
  },

  dark_elf_court: {
    id: 'dark_elf_court',
    name: '다크엘프 궁정',
    icon: '🧝',
    description: '다크엘프 종족의 세트',
    monsters: [
      { zone: 56, index: 0, grade: 'normal', name: '암흑 궁수' },
      { zone: 56, index: 3, grade: 'normal', name: '다크엘프 검사' },
      { zone: 56, index: 9, grade: 'normal', name: '다크엘프 기사' },
      { zone: 56, index: 4, grade: 'rare', name: '독살자' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' }
    ],
    effect: { type: 'critDmg', value: 20 }
  },

  gargoyle_spire: {
    id: 'gargoyle_spire',
    name: '가고일 첨탑',
    icon: '🗿',
    description: '가고일 종족의 세트',
    monsters: [
      { zone: 61, index: 1, grade: 'normal', name: '비행 가고일' },
      { zone: 61, index: 2, grade: 'normal', name: '석화의 감시자' },
      { zone: 61, index: 4, grade: 'normal', name: '화강암 가고일' },
      { zone: 61, index: 7, grade: 'rare', name: '돌 악마' },
      { zone: 61, index: 10, grade: 'legendary', name: '고대의 가고일' }
    ],
    effect: { type: 'monsterReduction', value: 2 }
  },

  dragon_kin: {
    id: 'dragon_kin',
    name: '용의 혈족',
    icon: '🐲',
    description: '드래곤 종족의 세트',
    monsters: [
      { zone: 66, index: 0, grade: 'normal', name: '와이번' },
      { zone: 66, index: 1, grade: 'normal', name: '드레이크' },
      { zone: 66, index: 3, grade: 'normal', name: '드래곤 새끼' },
      { zone: 66, index: 5, grade: 'rare', name: '불 드레이크' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' }
    ],
    effect: { type: 'attackPercent', value: 25 }
  },

  demon_legion: {
    id: 'demon_legion',
    name: '악마 군단',
    icon: '😈',
    description: '악마 종족의 세트',
    monsters: [
      { zone: 71, index: 0, grade: 'normal', name: '임프' },
      { zone: 71, index: 4, grade: 'normal', name: '악마 사제' },
      { zone: 71, index: 7, grade: 'normal', name: '악마 전사' },
      { zone: 71, index: 3, grade: 'rare', name: '지옥 기사' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' }
    ],
    effect: { type: 'critChance', value: 10 }
  },

  fallen_knights: {
    id: 'fallen_knights',
    name: '타락한 기사단',
    icon: '⚔️',
    description: '타락 기사 종족의 세트',
    monsters: [
      { zone: 81, index: 0, grade: 'normal', name: '흑기사' },
      { zone: 81, index: 4, grade: 'normal', name: '타락 검사' },
      { zone: 81, index: 6, grade: 'normal', name: '죽음의 기사' },
      { zone: 81, index: 8, grade: 'rare', name: '복수의 기사' },
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' }
    ],
    effect: { type: 'bossDamage', value: 25 }
  },

  ancient_rune: {
    id: 'ancient_rune',
    name: '고대 룬 수호자',
    icon: '🔮',
    description: '룬/고대 종족의 세트',
    monsters: [
      { zone: 86, index: 1, grade: 'normal', name: '룬 수호자' },
      { zone: 86, index: 2, grade: 'normal', name: '마법 파수꾼' },
      { zone: 86, index: 6, grade: 'normal', name: '룬 정령' },
      { zone: 86, index: 8, grade: 'rare', name: '고대 마법사' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' }
    ],
    effect: { type: 'expBonus', value: 30 }
  },

  bone_dragon: {
    id: 'bone_dragon',
    name: '해골 용의 무덤',
    icon: '🦴',
    description: '언데드 드래곤 종족의 세트',
    monsters: [
      { zone: 91, index: 0, grade: 'normal', name: '본 드래곤' },
      { zone: 91, index: 3, grade: 'normal', name: '해골 용' },
      { zone: 91, index: 7, grade: 'normal', name: '뼈 드레이크' },
      { zone: 91, index: 1, grade: 'rare', name: '드래곤 리치' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' }
    ],
    effect: { type: 'hpPercentDmg', value: 5 }
  },

  slime_army: {
    id: 'slime_army',
    name: '슬라임 대군',
    icon: '🟢',
    description: '슬라임 종족의 세트',
    monsters: [
      { zone: 1, index: 5, grade: 'normal', name: '독가스 슬라임' },
      { zone: 41, index: 0, grade: 'normal', name: '용암 슬라임' },
      { zone: 46, index: 9, grade: 'normal', name: '빙결 슬라임' },
      { zone: 26, index: 7, grade: 'rare', name: '맹독 슬라임' },
      { zone: 1, index: 10, grade: 'legendary', name: '폐광의 수호자' }
    ],
    effect: { type: 'goldBonus', value: 20 }
  },

  // ===== 직업 테마 (10개) =====
  warrior_guild: {
    id: 'warrior_guild',
    name: '전사 길드',
    icon: '🗡️',
    description: '전사 직업 몬스터들의 세트',
    monsters: [
      { zone: 6, index: 1, grade: 'normal', name: '고블린 전사' },
      { zone: 21, index: 0, grade: 'normal', name: '코볼트 전사' },
      { zone: 51, index: 0, grade: 'normal', name: '오거 전사' },
      { zone: 71, index: 7, grade: 'rare', name: '악마 전사' },
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' }
    ],
    effect: { type: 'attackPercent', value: 18 }
  },

  archer_guild: {
    id: 'archer_guild',
    name: '궁수 길드',
    icon: '🏹',
    description: '궁수 직업 몬스터들의 세트',
    monsters: [
      { zone: 16, index: 4, grade: 'normal', name: '스켈레톤 궁수' },
      { zone: 21, index: 4, grade: 'normal', name: '코볼트 궁수' },
      { zone: 31, index: 3, grade: 'normal', name: '하피 궁수' },
      { zone: 56, index: 0, grade: 'rare', name: '암흑 궁수' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' }
    ],
    effect: { type: 'critChance', value: 12 }
  },

  mage_guild: {
    id: 'mage_guild',
    name: '마법사 길드',
    icon: '🧙',
    description: '마법사 직업 몬스터들의 세트',
    monsters: [
      { zone: 31, index: 1, grade: 'normal', name: '깃털 마법사' },
      { zone: 56, index: 2, grade: 'normal', name: '어둠 마법사' },
      { zone: 71, index: 6, grade: 'normal', name: '지옥 마법사' },
      { zone: 86, index: 8, grade: 'rare', name: '고대 마법사' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' }
    ],
    effect: { type: 'critDmg', value: 25 }
  },

  assassin_guild: {
    id: 'assassin_guild',
    name: '암살자 길드',
    icon: '🗡️',
    description: '암살자 직업 몬스터들의 세트',
    monsters: [
      { zone: 21, index: 2, grade: 'normal', name: '코볼트 암살자' },
      { zone: 31, index: 7, grade: 'normal', name: '하피 암살자' },
      { zone: 56, index: 1, grade: 'normal', name: '그림자 암살자' },
      { zone: 56, index: 7, grade: 'rare', name: '암살단원' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' }
    ],
    effect: { type: 'critChance', value: 15 }
  },

  priest_guild: {
    id: 'priest_guild',
    name: '사제 길드',
    icon: '⛪',
    description: '사제 직업 몬스터들의 세트',
    monsters: [
      { zone: 21, index: 8, grade: 'normal', name: '코볼트 사제' },
      { zone: 56, index: 5, grade: 'normal', name: '어둠 사제' },
      { zone: 71, index: 4, grade: 'normal', name: '악마 사제' },
      { zone: 66, index: 8, grade: 'rare', name: '용인족 주술사' },
      { zone: 16, index: 10, grade: 'legendary', name: '묘지기 리치' }
    ],
    effect: { type: 'expBonus', value: 25 }
  },

  knight_order: {
    id: 'knight_order',
    name: '기사단',
    icon: '🛡️',
    description: '기사 직업 몬스터들의 세트',
    monsters: [
      { zone: 56, index: 9, grade: 'normal', name: '다크엘프 기사' },
      { zone: 66, index: 7, grade: 'normal', name: '드래곤 기사' },
      { zone: 71, index: 3, grade: 'normal', name: '지옥 기사' },
      { zone: 81, index: 2, grade: 'rare', name: '망령 기사' },
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' }
    ],
    effect: { type: 'bossDamage', value: 20 }
  },

  berserker_clan: {
    id: 'berserker_clan',
    name: '광전사 부족',
    icon: '💢',
    description: '광전사 직업 몬스터들의 세트',
    monsters: [
      { zone: 6, index: 9, grade: 'normal', name: '고블린 광전사' },
      { zone: 36, index: 6, grade: 'normal', name: '광전사 황소인간' },
      { zone: 51, index: 3, grade: 'normal', name: '오거 광전사' },
      { zone: 36, index: 9, grade: 'rare', name: '미궁 광전사' },
      { zone: 36, index: 10, grade: 'legendary', name: '미로의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 20 }
  },

  scout_patrol: {
    id: 'scout_patrol',
    name: '정찰대',
    icon: '👁️',
    description: '정찰병 직업 몬스터들의 세트',
    monsters: [
      { zone: 6, index: 0, grade: 'normal', name: '고블린 정찰병' },
      { zone: 21, index: 6, grade: 'normal', name: '코볼트 정찰병' },
      { zone: 31, index: 5, grade: 'normal', name: '하피 정찰병' },
      { zone: 36, index: 7, grade: 'rare', name: '미로 순찰병' },
      { zone: 51, index: 10, grade: 'legendary', name: '오거 장군' }
    ],
    effect: { type: 'dropRate', value: 15 }
  },

  hunter_lodge: {
    id: 'hunter_lodge',
    name: '사냥꾼 조합',
    icon: '🎯',
    description: '사냥꾼 직업 몬스터들의 세트',
    monsters: [
      { zone: 11, index: 8, grade: 'normal', name: '거미 사냥꾼' },
      { zone: 31, index: 9, grade: 'normal', name: '하피 사냥꾼' },
      { zone: 51, index: 8, grade: 'normal', name: '오거 사냥꾼' },
      { zone: 66, index: 6, grade: 'rare', name: '용 사냥꾼' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' }
    ],
    effect: { type: 'critDmg', value: 20 }
  },

  guard_corps: {
    id: 'guard_corps',
    name: '수호자 부대',
    icon: '🏰',
    description: '수호/파수꾼 직업 몬스터들의 세트',
    monsters: [
      { zone: 6, index: 8, grade: 'normal', name: '고블린 파수꾼' },
      { zone: 11, index: 4, grade: 'normal', name: '알 수호자' },
      { zone: 61, index: 6, grade: 'normal', name: '첨탑 파수꾼' },
      { zone: 91, index: 2, grade: 'rare', name: '용혼의 파수꾼' },
      { zone: 1, index: 10, grade: 'legendary', name: '폐광의 수호자' }
    ],
    effect: { type: 'monsterReduction', value: 3 }
  },

  // ===== 지역 연합 테마 (10개) =====
  mine_depths: {
    id: 'mine_depths',
    name: '광산의 심연',
    icon: '⛏️',
    description: '광산 지역 몬스터들의 세트',
    monsters: [
      { zone: 1, index: 0, grade: 'normal', name: '광산 박쥐' },
      { zone: 1, index: 1, grade: 'normal', name: '동굴 쥐' },
      { zone: 1, index: 4, grade: 'normal', name: '부서진 광부' },
      { zone: 1, index: 8, grade: 'rare', name: '곡괭이 좀비' },
      { zone: 1, index: 10, grade: 'legendary', name: '폐광의 수호자' }
    ],
    effect: { type: 'goldBonus', value: 30 }
  },

  cave_alliance: {
    id: 'cave_alliance',
    name: '동굴 연합',
    icon: '🦇',
    description: '동굴 지역 몬스터들의 세트',
    monsters: [
      { zone: 1, index: 0, grade: 'normal', name: '광산 박쥐' },
      { zone: 11, index: 0, grade: 'normal', name: '동굴 거미' },
      { zone: 16, index: 7, grade: 'normal', name: '뱀파이어 박쥐' },
      { zone: 41, index: 3, grade: 'rare', name: '불꽃 박쥐' },
      { zone: 11, index: 10, grade: 'legendary', name: '거대 여왕거미' }
    ],
    effect: { type: 'dropRate', value: 18 }
  },

  graveyard_union: {
    id: 'graveyard_union',
    name: '묘지 연합',
    icon: '⚰️',
    description: '묘지/언데드 지역 몬스터들의 세트',
    monsters: [
      { zone: 16, index: 3, grade: 'normal', name: '구울' },
      { zone: 16, index: 5, grade: 'normal', name: '좀비 전사' },
      { zone: 16, index: 9, grade: 'normal', name: '부패한 시체' },
      { zone: 91, index: 5, grade: 'rare', name: '용 언데드' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' }
    ],
    effect: { type: 'hpPercentDmg', value: 4 }
  },

  elemental_realm: {
    id: 'elemental_realm',
    name: '원소계',
    icon: '🌀',
    description: '정령 지역 몬스터들의 세트',
    monsters: [
      { zone: 41, index: 1, grade: 'normal', name: '화염 정령' },
      { zone: 46, index: 2, grade: 'normal', name: '얼음 정령' },
      { zone: 76, index: 3, grade: 'normal', name: '공간 정령' },
      { zone: 76, index: 8, grade: 'rare', name: '뒤틀린 정령' },
      { zone: 76, index: 10, grade: 'legendary', name: '원소의 화신' }
    ],
    effect: { type: 'attackPercent', value: 22 }
  },

  hell_pact: {
    id: 'hell_pact',
    name: '지옥 조약',
    icon: '🔱',
    description: '지옥/악마 지역 몬스터들의 세트',
    monsters: [
      { zone: 71, index: 1, grade: 'normal', name: '서큐버스' },
      { zone: 71, index: 2, grade: 'normal', name: '헬하운드' },
      { zone: 71, index: 5, grade: 'normal', name: '인큐버스' },
      { zone: 71, index: 8, grade: 'rare', name: '마귀' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' }
    ],
    effect: { type: 'critDmg', value: 28 }
  },

  dragon_realm: {
    id: 'dragon_realm',
    name: '용의 영역',
    icon: '🏔️',
    description: '드래곤 지역 몬스터들의 세트',
    monsters: [
      { zone: 66, index: 2, grade: 'normal', name: '용인족 전사' },
      { zone: 66, index: 4, grade: 'normal', name: '용비늘 전사' },
      { zone: 66, index: 9, grade: 'normal', name: '익룡' },
      { zone: 91, index: 6, grade: 'rare', name: '용혼 전사' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' }
    ],
    effect: { type: 'bossDamage', value: 30 }
  },

  ancient_ruins: {
    id: 'ancient_ruins',
    name: '고대 유적',
    icon: '🏛️',
    description: '고대 유적 지역 몬스터들의 세트',
    monsters: [
      { zone: 86, index: 3, grade: 'normal', name: '석판 골렘' },
      { zone: 86, index: 4, grade: 'normal', name: '마법 석상' },
      { zone: 86, index: 5, grade: 'normal', name: '고대 전사' },
      { zone: 86, index: 9, grade: 'rare', name: '유적 골렘' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' }
    ],
    effect: { type: 'expBonus', value: 35 }
  },

  abyss_depths: {
    id: 'abyss_depths',
    name: '심연의 끝',
    icon: '🌌',
    description: '심연 지역 몬스터들의 세트',
    monsters: [
      { zone: 96, index: 1, grade: 'normal', name: '공포의 화신' },
      { zone: 96, index: 3, grade: 'normal', name: '어둠의 지배자' },
      { zone: 96, index: 5, grade: 'normal', name: '종말의 사자' },
      { zone: 96, index: 6, grade: 'rare', name: '심연 악마' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 30 }
  },

  // ===== 특수 테마 (5개) =====
  boss_slayers: {
    id: 'boss_slayers',
    name: '보스 사냥꾼',
    icon: '👑',
    description: '각 지역 보스들의 세트',
    monsters: [
      { zone: 1, index: 10, grade: 'legendary', name: '폐광의 수호자' },
      { zone: 16, index: 10, grade: 'legendary', name: '묘지기 리치' },
      { zone: 41, index: 10, grade: 'legendary', name: '불의 군주' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'bossDamage', value: 50 }
  },

  rare_collectors: {
    id: 'rare_collectors',
    name: '희귀 수집가',
    icon: '💎',
    description: '희귀 몬스터들의 세트',
    monsters: [
      { zone: 1, index: 7, grade: 'rare', name: '광석 정령' },
      { zone: 11, index: 1, grade: 'rare', name: '맹독 거미' },
      { zone: 36, index: 4, grade: 'rare', name: '도끼 미노타우로스' },
      { zone: 66, index: 5, grade: 'rare', name: '불 드레이크' },
      { zone: 91, index: 1, grade: 'rare', name: '드래곤 리치' }
    ],
    effect: { type: 'dropRate', value: 30 }
  },

  world_conqueror: {
    id: 'world_conqueror',
    name: '세계 정복자',
    icon: '🌍',
    description: '모든 지역 대표 보스들의 세트',
    monsters: [
      { zone: 6, index: 10, grade: 'legendary', name: '고블린 우두머리' },
      { zone: 31, index: 10, grade: 'legendary', name: '폭풍의 여왕' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' },
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 40 }
  },

  legendary_hunters: {
    id: 'legendary_hunters',
    name: '전설 사냥꾼',
    icon: '🏆',
    description: '전설 등급 몬스터 수집 세트',
    monsters: [
      { zone: 11, index: 10, grade: 'legendary', name: '거대 여왕거미' },
      { zone: 46, index: 10, grade: 'legendary', name: '빙설의 마녀' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' }
    ],
    effect: { type: 'critDmg', value: 50 }
  },

  ultimate_power: {
    id: 'ultimate_power',
    name: '궁극의 힘',
    icon: '⭐',
    description: '최강 몬스터들의 세트',
    monsters: [
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' },
      { zone: 76, index: 10, grade: 'legendary', name: '원소의 화신' },
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 50 }
  }
};

// 세트 효과 계산
export const calculateSetBonuses = (completedSets) => {
  const bonuses = {
    attack: 0,
    attackPercent: 0,
    critChance: 0,
    critDmg: 0,
    goldBonus: 0,
    dropRate: 0,
    expBonus: 0,
    bossDamage: 0,
    monsterReduction: 0,
    hpPercentDmg: 0,
    dotDamage: 0,
    skipChance: 0
  };

  completedSets.forEach(setId => {
    const set = MONSTER_SETS[setId];
    if (set && set.effect) {
      bonuses[set.effect.type] += set.effect.value;
    }
  });

  return bonuses;
};

// 세트 완성도 체크
export const checkSetCompletion = (setId, inscribedMonsters) => {
  const set = MONSTER_SETS[setId];
  if (!set) return { completed: false, progress: 0, total: 0 };

  let completed = 0;
  set.monsters.forEach(monster => {
    const monsterId = `${monster.grade}_${monster.zone}_${monster.index}`;
    if (inscribedMonsters[monsterId]) {
      completed++;
    }
  });

  return {
    completed: completed === set.monsters.length,
    progress: completed,
    total: set.monsters.length
  };
};

// 몬스터 ID 생성 함수
export const getMonsterSetId = (grade, zone, index) => {
  return `${grade}_${zone}_${index}`;
};

// 세트 목록 (카테고리별)
export const SET_CATEGORIES = {
  element: {
    name: '속성',
    icon: '🔥',
    sets: ['fire_masters', 'ice_legion', 'poison_masters', 'storm_riders', 'earth_guardians',
           'shadow_walkers', 'holy_light', 'void_entities', 'nature_spirits', 'chaos_lords']
  },
  race: {
    name: '종족',
    icon: '👹',
    sets: ['goblin_horde', 'spider_nest', 'undead_army', 'kobold_tribe', 'harpy_flock',
           'minotaur_maze', 'ogre_fortress', 'dark_elf_court', 'gargoyle_spire', 'dragon_kin',
           'demon_legion', 'fallen_knights', 'ancient_rune', 'bone_dragon', 'slime_army']
  },
  class: {
    name: '직업',
    icon: '⚔️',
    sets: ['warrior_guild', 'archer_guild', 'mage_guild', 'assassin_guild', 'priest_guild',
           'knight_order', 'berserker_clan', 'scout_patrol', 'hunter_lodge', 'guard_corps']
  },
  region: {
    name: '지역',
    icon: '🗺️',
    sets: ['mine_depths', 'cave_alliance', 'graveyard_union', 'elemental_realm', 'hell_pact',
           'dragon_realm', 'ancient_ruins', 'abyss_depths']
  },
  special: {
    name: '특수',
    icon: '⭐',
    sets: ['boss_slayers', 'rare_collectors', 'world_conqueror', 'legendary_hunters', 'ultimate_power']
  }
};
