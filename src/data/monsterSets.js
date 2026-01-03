// 몬스터 도감 세트 시스템
// 몬스터를 각인하면 해당 몬스터는 사라지고(방생) 세트 진행도가 증가
// 세트 완성 시 영구 스탯 보너스 제공
// 도감은 희귀 이상 등급만 (일반 몬스터 제외)

// 몬스터 등급
export const MONSTER_GRADES = {
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
  accuracy: { name: '명중률', suffix: '%', icon: '🎯' },
  skipChance: { name: '스킵 확률', suffix: '%', icon: '⏭️' }
};

// 몬스터 세트 정의 (희귀+전설만)
// monsters 배열: [지역시작층, 몬스터인덱스(0-9), 등급('rare'/'legendary')]
// 보스는 monsterIndex: 10
export const MONSTER_SETS = {
  // ===== 특수 테마 (5개) - 모두 희귀+전설만 =====
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
  },

  // ===== 진화 라인 세트 (같은 지역 희귀→전설, 3~4마리) =====
  spider_evolution: {
    id: 'spider_evolution',
    name: '거미의 진화',
    icon: '🕸️',
    description: '거미 동굴의 희귀→전설 진화 라인',
    monsters: [
      { zone: 11, index: 1, grade: 'rare', name: '맹독 거미' },
      { zone: 11, index: 5, grade: 'rare', name: '거미 여왕 호위병' },
      { zone: 11, index: 10, grade: 'legendary', name: '거대 여왕거미' }
    ],
    effect: { type: 'critChance', value: 8 }
  },

  goblin_evolution: {
    id: 'goblin_evolution',
    name: '고블린의 진화',
    icon: '👺',
    description: '고블린 진영의 희귀→전설 진화 라인',
    monsters: [
      { zone: 6, index: 3, grade: 'rare', name: '고블린 도적단장' },
      { zone: 6, index: 6, grade: 'rare', name: '고블린 주술사' },
      { zone: 6, index: 10, grade: 'legendary', name: '고블린 우두머리' }
    ],
    effect: { type: 'goldBonus', value: 15 }
  },

  flame_evolution: {
    id: 'flame_evolution',
    name: '화염의 진화',
    icon: '🔥',
    description: '화염 지역의 희귀→전설 진화 라인',
    monsters: [
      { zone: 41, index: 3, grade: 'rare', name: '불꽃 박쥐' },
      { zone: 41, index: 7, grade: 'rare', name: '용암 거미' },
      { zone: 41, index: 8, grade: 'rare', name: '화염 드레이크' },
      { zone: 41, index: 10, grade: 'legendary', name: '불의 군주' }
    ],
    effect: { type: 'attackPercent', value: 10 }
  },

  frost_evolution: {
    id: 'frost_evolution',
    name: '냉기의 진화',
    icon: '❄️',
    description: '빙설 지역의 희귀→전설 진화 라인',
    monsters: [
      { zone: 46, index: 3, grade: 'rare', name: '서리 골렘' },
      { zone: 46, index: 6, grade: 'rare', name: '얼음 드레이크' },
      { zone: 46, index: 10, grade: 'legendary', name: '빙설의 마녀' }
    ],
    effect: { type: 'critDmg', value: 15 }
  },

  harpy_evolution: {
    id: 'harpy_evolution',
    name: '하피의 진화',
    icon: '🦅',
    description: '하피 둥지의 희귀→전설 진화 라인',
    monsters: [
      { zone: 31, index: 4, grade: 'rare', name: '폭풍 깃털' },
      { zone: 31, index: 6, grade: 'rare', name: '번개 하피' },
      { zone: 31, index: 8, grade: 'rare', name: '회오리 하피' },
      { zone: 31, index: 10, grade: 'legendary', name: '폭풍의 여왕' }
    ],
    effect: { type: 'skipChance', value: 3 }
  },

  minotaur_evolution: {
    id: 'minotaur_evolution',
    name: '미노타우로스의 진화',
    icon: '🐂',
    description: '미로 지역의 희귀→전설 진화 라인',
    monsters: [
      { zone: 36, index: 4, grade: 'rare', name: '도끼 미노타우로스' },
      { zone: 36, index: 7, grade: 'rare', name: '미로 순찰병' },
      { zone: 36, index: 9, grade: 'rare', name: '미궁 광전사' },
      { zone: 36, index: 10, grade: 'legendary', name: '미로의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 8 }
  },

  ogre_evolution: {
    id: 'ogre_evolution',
    name: '오거의 진화',
    icon: '👹',
    description: '오거 요새의 희귀→전설 진화 라인',
    monsters: [
      { zone: 51, index: 4, grade: 'rare', name: '오거 돌격병' },
      { zone: 51, index: 6, grade: 'rare', name: '철갑 오거' },
      { zone: 51, index: 10, grade: 'legendary', name: '오거 장군' }
    ],
    effect: { type: 'bossDamage', value: 10 }
  },

  darkelf_evolution: {
    id: 'darkelf_evolution',
    name: '다크엘프의 진화',
    icon: '🧝',
    description: '다크엘프 궁정의 희귀→전설 진화 라인',
    monsters: [
      { zone: 56, index: 4, grade: 'rare', name: '독살자' },
      { zone: 56, index: 6, grade: 'rare', name: '그림자 무용수' },
      { zone: 56, index: 7, grade: 'rare', name: '암살단원' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' }
    ],
    effect: { type: 'critDmg', value: 12 }
  },

  gargoyle_evolution: {
    id: 'gargoyle_evolution',
    name: '가고일의 진화',
    icon: '🗿',
    description: '가고일 첨탑의 희귀→전설 진화 라인',
    monsters: [
      { zone: 61, index: 3, grade: 'rare', name: '대리석 가고일' },
      { zone: 61, index: 7, grade: 'rare', name: '돌 악마' },
      { zone: 61, index: 10, grade: 'legendary', name: '고대의 가고일' }
    ],
    effect: { type: 'monsterReduction', value: 2 }
  },

  dragon_evolution: {
    id: 'dragon_evolution',
    name: '용의 진화',
    icon: '🐲',
    description: '용의 영역의 희귀→전설 진화 라인',
    monsters: [
      { zone: 66, index: 5, grade: 'rare', name: '불 드레이크' },
      { zone: 66, index: 6, grade: 'rare', name: '용 사냥꾼' },
      { zone: 66, index: 8, grade: 'rare', name: '용인족 주술사' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' }
    ],
    effect: { type: 'attackPercent', value: 15 }
  },

  demon_evolution: {
    id: 'demon_evolution',
    name: '악마의 진화',
    icon: '😈',
    description: '지옥 영역의 희귀→전설 진화 라인',
    monsters: [
      { zone: 71, index: 3, grade: 'rare', name: '지옥 기사' },
      { zone: 71, index: 8, grade: 'rare', name: '마귀' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' }
    ],
    effect: { type: 'critChance', value: 6 }
  },

  dimension_evolution: {
    id: 'dimension_evolution',
    name: '차원의 진화',
    icon: '🌀',
    description: '차원의 틈의 희귀→전설 진화 라인',
    monsters: [
      { zone: 76, index: 4, grade: 'rare', name: '시간 정령' },
      { zone: 76, index: 8, grade: 'rare', name: '뒤틀린 정령' },
      { zone: 76, index: 10, grade: 'legendary', name: '원소의 화신' }
    ],
    effect: { type: 'expBonus', value: 12 }
  },

  fallen_evolution: {
    id: 'fallen_evolution',
    name: '타락의 진화',
    icon: '⚔️',
    description: '타락 성채의 희귀→전설 진화 라인',
    monsters: [
      { zone: 81, index: 1, grade: 'rare', name: '타락한 성기사' },
      { zone: 81, index: 2, grade: 'rare', name: '망령 기사' },
      { zone: 81, index: 8, grade: 'rare', name: '복수의 기사' },
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' }
    ],
    effect: { type: 'bossDamage', value: 15 }
  },

  ancient_evolution: {
    id: 'ancient_evolution',
    name: '고대의 진화',
    icon: '🔮',
    description: '고대 유적의 희귀→전설 진화 라인',
    monsters: [
      { zone: 86, index: 8, grade: 'rare', name: '고대 마법사' },
      { zone: 86, index: 9, grade: 'rare', name: '유적 골렘' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' }
    ],
    effect: { type: 'expBonus', value: 18 }
  },

  boneDragon_evolution: {
    id: 'boneDragon_evolution',
    name: '용혼의 진화',
    icon: '🦴',
    description: '해골 용 무덤의 희귀→전설 진화 라인',
    monsters: [
      { zone: 91, index: 1, grade: 'rare', name: '드래곤 리치' },
      { zone: 91, index: 2, grade: 'rare', name: '용혼의 파수꾼' },
      { zone: 91, index: 5, grade: 'rare', name: '용 언데드' },
      { zone: 91, index: 6, grade: 'rare', name: '용혼 전사' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' }
    ],
    effect: { type: 'hpPercentDmg', value: 2 }
  },

  abyss_evolution: {
    id: 'abyss_evolution',
    name: '심연의 진화',
    icon: '🌌',
    description: '심연의 끝의 희귀→전설 진화 라인',
    monsters: [
      { zone: 96, index: 2, grade: 'rare', name: '혼돈의 군주' },
      { zone: 96, index: 6, grade: 'rare', name: '심연 악마' },
      { zone: 96, index: 7, grade: 'rare', name: '절망의 괴물' },
      { zone: 96, index: 8, grade: 'rare', name: '파멸의 화신' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 18 }
  },

  mine_evolution: {
    id: 'mine_evolution',
    name: '광산의 진화',
    icon: '⛏️',
    description: '폐광의 희귀→전설 진화 라인',
    monsters: [
      { zone: 1, index: 7, grade: 'rare', name: '광석 정령' },
      { zone: 1, index: 8, grade: 'rare', name: '곡괭이 좀비' },
      { zone: 1, index: 10, grade: 'legendary', name: '폐광의 수호자' }
    ],
    effect: { type: 'goldBonus', value: 12 }
  },

  graveyard_evolution: {
    id: 'graveyard_evolution',
    name: '묘지의 진화',
    icon: '⚰️',
    description: '묘지의 희귀→전설 진화 라인',
    monsters: [
      { zone: 16, index: 5, grade: 'rare', name: '죽음의 기사' },
      { zone: 16, index: 8, grade: 'rare', name: '네크로맨서' },
      { zone: 16, index: 10, grade: 'legendary', name: '묘지기 리치' }
    ],
    effect: { type: 'hpPercentDmg', value: 3 }
  },

  kobold_evolution: {
    id: 'kobold_evolution',
    name: '코볼트의 진화',
    icon: '🐉',
    description: '코볼트 소굴의 희귀→전설 진화 라인',
    monsters: [
      { zone: 21, index: 5, grade: 'rare', name: '코볼트 마법사' },
      { zone: 21, index: 7, grade: 'rare', name: '코볼트 폭파병' },
      { zone: 21, index: 10, grade: 'legendary', name: '코볼트 대족장' }
    ],
    effect: { type: 'expBonus', value: 10 }
  },

  mushroom_evolution: {
    id: 'mushroom_evolution',
    name: '버섯의 진화',
    icon: '🍄',
    description: '버섯 숲의 희귀→전설 진화 라인',
    monsters: [
      { zone: 26, index: 5, grade: 'rare', name: '포자 마법사' },
      { zone: 26, index: 7, grade: 'rare', name: '맹독 슬라임' },
      { zone: 26, index: 10, grade: 'legendary', name: '버섯왕 미코스' }
    ],
    effect: { type: 'accuracy', value: 8 }
  },

  // ===== 테마 혼합 세트 (희귀+전설 다양한 지역) =====
  flame_ice_masters: {
    id: 'flame_ice_masters',
    name: '불꽃과 얼음의 지배자',
    icon: '🔥❄️',
    description: '화염과 냉기를 지배하는 희귀+전설 몬스터',
    monsters: [
      { zone: 41, index: 8, grade: 'rare', name: '화염 드레이크' },
      { zone: 46, index: 6, grade: 'rare', name: '얼음 드레이크' },
      { zone: 41, index: 10, grade: 'legendary', name: '불의 군주' },
      { zone: 46, index: 10, grade: 'legendary', name: '빙설의 마녀' }
    ],
    effect: { type: 'critDmg', value: 35 }
  },

  dragon_lords: {
    id: 'dragon_lords',
    name: '용족의 지배자들',
    icon: '🐉',
    description: '살아있는 용과 망령의 연합',
    monsters: [
      { zone: 66, index: 5, grade: 'rare', name: '불 드레이크' },
      { zone: 91, index: 1, grade: 'rare', name: '드래곤 리치' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' }
    ],
    effect: { type: 'attackPercent', value: 35 }
  },

  dark_alliance: {
    id: 'dark_alliance',
    name: '어둠의 동맹',
    icon: '🌑',
    description: '다크엘프와 악마의 연합',
    monsters: [
      { zone: 56, index: 4, grade: 'rare', name: '독살자' },
      { zone: 71, index: 3, grade: 'rare', name: '지옥 기사' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' }
    ],
    effect: { type: 'critChance', value: 15 }
  },

  sky_storm_alliance: {
    id: 'sky_storm_alliance',
    name: '하늘의 폭풍군단',
    icon: '⚡🦅',
    description: '하피와 드래곤의 하늘 연합',
    monsters: [
      { zone: 31, index: 8, grade: 'rare', name: '회오리 하피' },
      { zone: 66, index: 5, grade: 'rare', name: '불 드레이크' },
      { zone: 31, index: 10, grade: 'legendary', name: '폭풍의 여왕' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' }
    ],
    effect: { type: 'skipChance', value: 8 }
  },

  corruption_pact: {
    id: 'corruption_pact',
    name: '타락의 서약',
    icon: '💀⚔️',
    description: '타락 기사와 악마의 계약',
    monsters: [
      { zone: 81, index: 8, grade: 'rare', name: '복수의 기사' },
      { zone: 71, index: 3, grade: 'rare', name: '지옥 기사' },
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' }
    ],
    effect: { type: 'bossDamage', value: 40 }
  },

  arcane_supremacy: {
    id: 'arcane_supremacy',
    name: '마법의 패권',
    icon: '🔮✨',
    description: '고대 마법과 원소의 힘',
    monsters: [
      { zone: 86, index: 8, grade: 'rare', name: '고대 마법사' },
      { zone: 76, index: 8, grade: 'rare', name: '뒤틀린 정령' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' },
      { zone: 76, index: 10, grade: 'legendary', name: '원소의 화신' }
    ],
    effect: { type: 'expBonus', value: 40 }
  },

  beast_kings: {
    id: 'beast_kings',
    name: '야수의 왕들',
    icon: '🐂👹',
    description: '미노타우로스와 오거의 연합',
    monsters: [
      { zone: 36, index: 4, grade: 'rare', name: '도끼 미노타우로스' },
      { zone: 51, index: 6, grade: 'rare', name: '철갑 오거' },
      { zone: 36, index: 10, grade: 'legendary', name: '미로의 지배자' },
      { zone: 51, index: 10, grade: 'legendary', name: '오거 장군' }
    ],
    effect: { type: 'attackPercent', value: 28 }
  },

  undead_dominion: {
    id: 'undead_dominion',
    name: '언데드의 지배',
    icon: '💀🦴',
    description: '리치와 해골용의 언데드 군세',
    monsters: [
      { zone: 16, index: 8, grade: 'rare', name: '네크로맨서' },
      { zone: 91, index: 1, grade: 'rare', name: '드래곤 리치' },
      { zone: 16, index: 10, grade: 'legendary', name: '묘지기 리치' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' }
    ],
    effect: { type: 'hpPercentDmg', value: 6 }
  },

  void_chaos: {
    id: 'void_chaos',
    name: '공허와 혼돈',
    icon: '🕳️💫',
    description: '차원과 심연의 혼돈 세력',
    monsters: [
      { zone: 76, index: 8, grade: 'rare', name: '뒤틀린 정령' },
      { zone: 96, index: 6, grade: 'rare', name: '심연 악마' },
      { zone: 76, index: 10, grade: 'legendary', name: '원소의 화신' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 45 }
  },

  stone_guardians: {
    id: 'stone_guardians',
    name: '돌의 수호자들',
    icon: '🗿🪨',
    description: '가고일과 골렘의 연합',
    monsters: [
      { zone: 61, index: 7, grade: 'rare', name: '돌 악마' },
      { zone: 86, index: 9, grade: 'rare', name: '유적 골렘' },
      { zone: 61, index: 10, grade: 'legendary', name: '고대의 가고일' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' }
    ],
    effect: { type: 'monsterReduction', value: 8 }
  },

  // ===== 추가 희귀+전설 세트 =====
  early_rare_alliance: {
    id: 'early_rare_alliance',
    name: '초반 희귀 연합',
    icon: '💠',
    description: '초반 지역 희귀 몬스터들의 연합',
    monsters: [
      { zone: 1, index: 7, grade: 'rare', name: '광석 정령' },
      { zone: 1, index: 8, grade: 'rare', name: '곡괭이 좀비' },
      { zone: 6, index: 6, grade: 'rare', name: '고블린 주술사 견습' },
      { zone: 11, index: 1, grade: 'rare', name: '맹독 거미' }
    ],
    effect: { type: 'goldBonus', value: 20 }
  },

  mid_rare_alliance: {
    id: 'mid_rare_alliance',
    name: '중반 희귀 연합',
    icon: '💎',
    description: '중반 지역 희귀 몬스터들의 연합',
    monsters: [
      { zone: 16, index: 8, grade: 'rare', name: '네크로맨서' },
      { zone: 21, index: 7, grade: 'rare', name: '코볼트 폭파병' },
      { zone: 26, index: 7, grade: 'rare', name: '맹독 슬라임' },
      { zone: 31, index: 8, grade: 'rare', name: '회오리 하피' }
    ],
    effect: { type: 'expBonus', value: 20 }
  },

  late_rare_alliance: {
    id: 'late_rare_alliance',
    name: '후반 희귀 연합',
    icon: '🔷',
    description: '후반 지역 희귀 몬스터들의 연합',
    monsters: [
      { zone: 36, index: 4, grade: 'rare', name: '도끼 미노타우로스' },
      { zone: 41, index: 8, grade: 'rare', name: '화염 드레이크' },
      { zone: 46, index: 6, grade: 'rare', name: '얼음 드레이크' },
      { zone: 51, index: 6, grade: 'rare', name: '철갑 오거' }
    ],
    effect: { type: 'critChance', value: 12 }
  },

  endgame_rare_alliance: {
    id: 'endgame_rare_alliance',
    name: '엔드게임 희귀 연합',
    icon: '🔶',
    description: '최종 지역 희귀 몬스터들의 연합',
    monsters: [
      { zone: 56, index: 4, grade: 'rare', name: '독살자' },
      { zone: 61, index: 7, grade: 'rare', name: '돌 악마' },
      { zone: 66, index: 5, grade: 'rare', name: '불 드레이크' },
      { zone: 71, index: 3, grade: 'rare', name: '지옥 기사' }
    ],
    effect: { type: 'critDmg', value: 25 }
  },

  ultimate_rare_alliance: {
    id: 'ultimate_rare_alliance',
    name: '궁극 희귀 연합',
    icon: '💜',
    description: '최강 지역 희귀 몬스터들의 연합',
    monsters: [
      { zone: 76, index: 8, grade: 'rare', name: '뒤틀린 정령' },
      { zone: 81, index: 8, grade: 'rare', name: '복수의 기사' },
      { zone: 86, index: 8, grade: 'rare', name: '고대 마법사' },
      { zone: 91, index: 1, grade: 'rare', name: '드래곤 리치' },
      { zone: 96, index: 6, grade: 'rare', name: '심연 악마' }
    ],
    effect: { type: 'attackPercent', value: 30 }
  },

  early_boss_alliance: {
    id: 'early_boss_alliance',
    name: '초반 보스 연합',
    icon: '👑',
    description: '초반 지역 보스들의 연합',
    monsters: [
      { zone: 1, index: 10, grade: 'legendary', name: '폐광의 수호자' },
      { zone: 6, index: 10, grade: 'legendary', name: '고블린 우두머리' },
      { zone: 11, index: 10, grade: 'legendary', name: '거대 여왕거미' },
      { zone: 16, index: 10, grade: 'legendary', name: '묘지기 리치' }
    ],
    effect: { type: 'goldBonus', value: 30 }
  },

  mid_boss_alliance: {
    id: 'mid_boss_alliance',
    name: '중반 보스 연합',
    icon: '🏆',
    description: '중반 지역 보스들의 연합',
    monsters: [
      { zone: 21, index: 10, grade: 'legendary', name: '코볼트 대족장' },
      { zone: 26, index: 10, grade: 'legendary', name: '버섯왕 미코스' },
      { zone: 31, index: 10, grade: 'legendary', name: '폭풍의 여왕' },
      { zone: 36, index: 10, grade: 'legendary', name: '미로의 지배자' }
    ],
    effect: { type: 'expBonus', value: 30 }
  },

  late_boss_alliance: {
    id: 'late_boss_alliance',
    name: '후반 보스 연합',
    icon: '🎖️',
    description: '후반 지역 보스들의 연합',
    monsters: [
      { zone: 41, index: 10, grade: 'legendary', name: '불의 군주' },
      { zone: 46, index: 10, grade: 'legendary', name: '빙설의 마녀' },
      { zone: 51, index: 10, grade: 'legendary', name: '오거 장군' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' }
    ],
    effect: { type: 'critDmg', value: 40 }
  },

  endgame_boss_alliance: {
    id: 'endgame_boss_alliance',
    name: '엔드게임 보스 연합',
    icon: '🌟',
    description: '엔드게임 지역 보스들의 연합',
    monsters: [
      { zone: 61, index: 10, grade: 'legendary', name: '고대의 가고일' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' },
      { zone: 76, index: 10, grade: 'legendary', name: '원소의 화신' }
    ],
    effect: { type: 'bossDamage', value: 35 }
  },

  final_boss_alliance: {
    id: 'final_boss_alliance',
    name: '최종 보스 연합',
    icon: '✨',
    description: '최종 지역 보스들의 연합',
    monsters: [
      { zone: 81, index: 10, grade: 'legendary', name: '타락의 기사단장' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 55 }
  },

  // ===== 3마리 희귀+전설 혼합 세트 =====
  spider_queen_court: {
    id: 'spider_queen_court',
    name: '거미 여왕의 궁정',
    icon: '🕷️',
    description: '거미 여왕과 그 심복들',
    monsters: [
      { zone: 11, index: 1, grade: 'rare', name: '맹독 거미' },
      { zone: 41, index: 7, grade: 'rare', name: '용암 거미' },
      { zone: 11, index: 10, grade: 'legendary', name: '거대 여왕거미' }
    ],
    effect: { type: 'accuracy', value: 10 }
  },

  flame_lords: {
    id: 'flame_lords',
    name: '화염의 군주들',
    icon: '🔥',
    description: '화염을 지배하는 자들',
    monsters: [
      { zone: 41, index: 7, grade: 'rare', name: '용암 거미' },
      { zone: 41, index: 8, grade: 'rare', name: '화염 드레이크' },
      { zone: 41, index: 10, grade: 'legendary', name: '불의 군주' }
    ],
    effect: { type: 'attackPercent', value: 18 }
  },

  frost_rulers: {
    id: 'frost_rulers',
    name: '냉기의 지배자들',
    icon: '❄️',
    description: '냉기를 지배하는 자들',
    monsters: [
      { zone: 46, index: 6, grade: 'rare', name: '얼음 드레이크' },
      { zone: 46, index: 10, grade: 'legendary', name: '빙설의 마녀' },
      { zone: 41, index: 10, grade: 'legendary', name: '불의 군주' }
    ],
    effect: { type: 'critDmg', value: 22 }
  },

  shadow_court: {
    id: 'shadow_court',
    name: '그림자 궁정',
    icon: '🌑',
    description: '어둠의 세력',
    monsters: [
      { zone: 56, index: 4, grade: 'rare', name: '독살자' },
      { zone: 56, index: 7, grade: 'rare', name: '암살단원' },
      { zone: 56, index: 10, grade: 'legendary', name: '어둠의 여군주' }
    ],
    effect: { type: 'critChance', value: 10 }
  },

  hell_commanders: {
    id: 'hell_commanders',
    name: '지옥의 사령관들',
    icon: '😈',
    description: '지옥군단의 지휘관들',
    monsters: [
      { zone: 71, index: 3, grade: 'rare', name: '지옥 기사' },
      { zone: 71, index: 8, grade: 'rare', name: '마귀' },
      { zone: 71, index: 10, grade: 'legendary', name: '지옥의 대공' }
    ],
    effect: { type: 'bossDamage', value: 25 }
  },

  ancient_council: {
    id: 'ancient_council',
    name: '고대 평의회',
    icon: '🔮',
    description: '고대의 현자들',
    monsters: [
      { zone: 86, index: 8, grade: 'rare', name: '고대 마법사' },
      { zone: 86, index: 9, grade: 'rare', name: '유적 골렘' },
      { zone: 86, index: 10, grade: 'legendary', name: '고대 마법사왕' }
    ],
    effect: { type: 'expBonus', value: 25 }
  },

  abyss_council: {
    id: 'abyss_council',
    name: '심연 평의회',
    icon: '🌌',
    description: '심연의 지배자들',
    monsters: [
      { zone: 96, index: 6, grade: 'rare', name: '심연 악마' },
      { zone: 96, index: 7, grade: 'rare', name: '절망의 괴물' },
      { zone: 96, index: 8, grade: 'rare', name: '파멸의 화신' },
      { zone: 96, index: 10, grade: 'legendary', name: '심연의 지배자' }
    ],
    effect: { type: 'attackPercent', value: 38 }
  },

  dragon_bone_alliance: {
    id: 'dragon_bone_alliance',
    name: '용골 연합',
    icon: '🦴🐲',
    description: '살아있는 용과 죽은 용의 연합',
    monsters: [
      { zone: 66, index: 5, grade: 'rare', name: '불 드레이크' },
      { zone: 66, index: 8, grade: 'rare', name: '용인족 주술사' },
      { zone: 91, index: 1, grade: 'rare', name: '드래곤 리치' },
      { zone: 66, index: 10, grade: 'legendary', name: '고룡 발라크' },
      { zone: 91, index: 10, grade: 'legendary', name: '고룡의 망령' }
    ],
    effect: { type: 'attackPercent', value: 42 }
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
    accuracy: 0,
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
  special: {
    name: '특수',
    icon: '⭐',
    sets: ['boss_slayers', 'rare_collectors', 'world_conqueror', 'legendary_hunters', 'ultimate_power']
  },
  evolution: {
    name: '진화',
    icon: '🔄',
    sets: ['spider_evolution', 'goblin_evolution', 'flame_evolution', 'frost_evolution', 'harpy_evolution',
           'minotaur_evolution', 'ogre_evolution', 'darkelf_evolution', 'gargoyle_evolution', 'dragon_evolution',
           'demon_evolution', 'dimension_evolution', 'fallen_evolution', 'ancient_evolution', 'boneDragon_evolution',
           'abyss_evolution', 'mine_evolution', 'graveyard_evolution', 'kobold_evolution', 'mushroom_evolution']
  },
  mixed: {
    name: '혼합',
    icon: '🔗',
    sets: ['flame_ice_masters', 'dragon_lords', 'dark_alliance', 'sky_storm_alliance', 'corruption_pact',
           'arcane_supremacy', 'beast_kings', 'undead_dominion', 'void_chaos', 'stone_guardians']
  },
  rare_alliance: {
    name: '희귀연합',
    icon: '💎',
    sets: ['early_rare_alliance', 'mid_rare_alliance', 'late_rare_alliance', 'endgame_rare_alliance', 'ultimate_rare_alliance']
  },
  boss_alliance: {
    name: '보스연합',
    icon: '👑',
    sets: ['early_boss_alliance', 'mid_boss_alliance', 'late_boss_alliance', 'endgame_boss_alliance', 'final_boss_alliance']
  },
  themed: {
    name: '테마',
    icon: '🎭',
    sets: ['spider_queen_court', 'flame_lords', 'frost_rulers', 'shadow_court', 'hell_commanders',
           'ancient_council', 'abyss_council', 'dragon_bone_alliance']
  }
};
