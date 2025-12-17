// 스킬 트리 데이터
export const SKILL_TREES = {
  combat: {
    name: '전투',
    color: 'red',
    skills: [
      {
        id: 'crit_chance',
        name: '치명타 강화',
        description: '치명타 확률 증가',
        maxLevel: 20,
        costPerLevel: 1,
        costMultiplier: 1.5,
        costType: 'sp',
        effect: (level) => ({ critChance: level * 1 })
      },
      {
        id: 'crit_damage',
        name: '치명타 데미지',
        description: '크리티컬 데미지 증가',
        maxLevel: 20,
        costPerLevel: 1,
        costMultiplier: 1.5,
        costType: 'sp',
        effect: (level) => ({ critDmg: level * 10 })
      },
      {
        id: 'atk_boost',
        name: '공격력 증폭',
        description: '기본 공격력 증가',
        maxLevel: 30,
        costPerLevel: 1,
        costMultiplier: 1.5,
        costType: 'sp',
        effect: (level) => ({ atkPercent: level * 5 })
      },
      {
        id: 'hero_boost',
        name: '동료 강화',
        description: '모든 동료의 데미지 증가',
        maxLevel: 25,
        costPerLevel: 2,
        costMultiplier: 1.6,
        costType: 'sp',
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
        costPerLevel: 1,
        costMultiplier: 1.5,
        costType: 'sp',
        effect: (level) => ({ goldPercent: level * 10 })
      },
      {
        id: 'treasure_hunter',
        name: '보물 사냥꾼',
        description: '아이템 드랍률 증가',
        maxLevel: 20,
        costPerLevel: 1,
        costMultiplier: 1.5,
        costType: 'sp',
        effect: (level) => ({ dropRate: level * 2 })
      },
      {
        id: 'fast_learner',
        name: '빠른 성장',
        description: '경험치 획득량 증가',
        maxLevel: 20,
        costPerLevel: 1,
        costMultiplier: 1.5,
        costType: 'sp',
        effect: (level) => ({ expPercent: level * 10 })
      }
    ]
  },
};

export const getSkillCost = (skill, currentLevel) => {
  const costType = skill.costType || 'gold';

  // SP 스킬은 구간별 고정 비용
  if (costType === 'sp') {
    if (currentLevel < 5) return 1;
    if (currentLevel < 10) return 2;
    if (currentLevel < 15) return 3;
    if (currentLevel < 20) return 4;
    if (currentLevel < 25) return 5;
    return 6;
  }

  // PP나 골드는 기존 방식 유지
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
