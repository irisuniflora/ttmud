// 스킬 트리 데이터
export const SKILL_TREES = {
  combat: {
    name: '전투',
    color: 'red',
    skills: [
      {
        id: 'crit_chance',
        name: '치명타 강화',
        description: '크리티컬 확률 증가',
        maxLevel: 20,
        costPerLevel: 100,
        costMultiplier: 1.5,
        effect: (level) => ({ critChance: level * 1 })
      },
      {
        id: 'crit_damage',
        name: '치명타 데미지',
        description: '크리티컬 데미지 증가',
        maxLevel: 20,
        costPerLevel: 150,
        costMultiplier: 1.5,
        effect: (level) => ({ critDmg: level * 10 })
      },
      {
        id: 'atk_boost',
        name: '공격력 증폭',
        description: '기본 공격력 증가',
        maxLevel: 30,
        costPerLevel: 200,
        costMultiplier: 1.5,
        effect: (level) => ({ atkPercent: level * 5 })
      },
      {
        id: 'hero_boost',
        name: '영웅 강화',
        description: '모든 영웅의 데미지 증가',
        maxLevel: 25,
        costPerLevel: 300,
        costMultiplier: 1.6,
        effect: (level) => ({ heroDmgPercent: level * 10 })
      }
    ]
  },
  economy: {
    name: '경제',
    color: 'yellow',
    skills: [
      {
        id: 'gold_master',
        name: '골드 마스터',
        description: '골드 획득량 증가',
        maxLevel: 25,
        costPerLevel: 100,
        costMultiplier: 1.5,
        effect: (level) => ({ goldPercent: level * 10 })
      },
      {
        id: 'treasure_hunter',
        name: '보물 사냥꾼',
        description: '아이템 드랍률 증가',
        maxLevel: 20,
        costPerLevel: 200,
        costMultiplier: 1.5,
        effect: (level) => ({ dropRate: level * 2 })
      },
      {
        id: 'fast_learner',
        name: '빠른 성장',
        description: '경험치 획득량 증가',
        maxLevel: 20,
        costPerLevel: 150,
        costMultiplier: 1.5,
        effect: (level) => ({ expPercent: level * 10 })
      }
    ]
  },
  prestige: {
    name: '환생',
    color: 'purple',
    skills: [
      {
        id: 'starting_gold',
        name: '시작 골드',
        description: '환생 시 시작 골드 증가',
        maxLevel: 15,
        costPerLevel: 1, // PP 사용
        costMultiplier: 1,
        costType: 'pp',
        effect: (level) => ({ startingGold: level * 1000 })
      },
      {
        id: 'starting_level',
        name: '시작 레벨',
        description: '환생 시 시작 레벨 증가',
        maxLevel: 10,
        costPerLevel: 2,
        costMultiplier: 1,
        costType: 'pp',
        effect: (level) => ({ startingLevel: level * 5 })
      },
      {
        id: 'permanent_damage',
        name: '영구 데미지',
        description: '영구적인 데미지 증가',
        maxLevel: 50,
        costPerLevel: 1,
        costMultiplier: 1.2,
        costType: 'pp',
        effect: (level) => ({ permanentDmgPercent: level * 5 })
      },
      {
        id: 'permanent_gold',
        name: '영구 골드',
        description: '영구적인 골드 증가',
        maxLevel: 50,
        costPerLevel: 1,
        costMultiplier: 1.2,
        costType: 'pp',
        effect: (level) => ({ permanentGoldPercent: level * 5 })
      }
    ]
  }
};

export const getSkillCost = (skill, currentLevel) => {
  const costType = skill.costType || 'gold';
  return Math.floor(
    skill.costPerLevel * Math.pow(skill.costMultiplier, currentLevel)
  );
};

export const getTotalSkillEffects = (skillLevels) => {
  const effects = {
    critChance: 0,
    critDmg: 0,
    atkPercent: 0,
    heroDmgPercent: 0,
    goldPercent: 0,
    dropRate: 0,
    expPercent: 0,
    startingGold: 0,
    startingLevel: 0,
    permanentDmgPercent: 0,
    permanentGoldPercent: 0
  };
  
  Object.values(SKILL_TREES).forEach(tree => {
    tree.skills.forEach(skill => {
      const level = skillLevels[skill.id] || 0;
      if (level > 0) {
        const skillEffect = skill.effect(level);
        Object.keys(skillEffect).forEach(key => {
          effects[key] = (effects[key] || 0) + skillEffect[key];
        });
      }
    });
  });
  
  return effects;
};
