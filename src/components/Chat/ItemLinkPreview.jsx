import React from 'react';
import { createPortal } from 'react-dom';
import { resolveLinkData, LINK_TYPES } from '../../utils/chatLinkParser';
import { EQUIPMENT_SETS, EQUIPMENT_SLOT_NAMES, OPTION_GRADES, ANCIENT_CONFIG, NORMAL_GRADES, getEnhanceBonus } from '../../data/equipmentSets';
import { INSCRIPTIONS, INSCRIPTION_GRADES, INSCRIPTION_UPGRADE_CONFIG } from '../../data/inscriptions';
import { HEROES, HERO_GRADES, getHeroById, getHeroStats } from '../../data/heroes';
import { formatNumber, formatStatValue } from '../../utils/formatter';

// 장비 미리보기 카드 (ItemTooltip과 완전 동일한 스타일)
const EquipmentPreviewCard = ({ item }) => {
  const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
  const normalGradeData = item.normalGrade ? NORMAL_GRADES[item.normalGrade] : null;
  const isSet = item.type === 'set' || !!item.setId;
  const isAncient = item.isAncient;

  const getNameColor = () => {
    if (isAncient) return ANCIENT_CONFIG.color;
    if (isSet && setData) return setData.color;
    if (normalGradeData) return normalGradeData.color;
    return '#9CA3AF';
  };

  const getRefineLevel = () => {
    const upgradesLeft = item.upgradesLeft ?? 10;
    return 10 - upgradesLeft;
  };

  const enhanceLevel = item.enhanceLevel || 0;
  const enhanceBonusPercent = getEnhanceBonus(enhanceLevel);

  // 기본 능력치 찾기
  const mainStats = item.stats?.filter(s => s.isMain) || [];
  if (mainStats.length === 0 && item.stats?.length > 0) {
    const firstStat = item.stats[0];
    const mainStatIds = ['attack', 'accuracy', 'critChance', 'monstersPerStageReduction', 'skipChance', 'ppBonus'];
    if (mainStatIds.includes(firstStat.id)) {
      mainStats.push(firstStat);
    }
  }

  return (
    <div
      className="rounded-lg overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        border: `2px solid ${isAncient ? ANCIENT_CONFIG.color : (setData?.color || '#444')}`,
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-2 text-center"
        style={{
          background: isAncient
            ? `linear-gradient(180deg, ${ANCIENT_CONFIG.color}30, transparent)`
            : isSet
              ? `linear-gradient(180deg, ${setData?.color}30, transparent)`
              : 'linear-gradient(180deg, #333, transparent)',
          borderBottom: '1px solid #333',
        }}
      >
        {isAncient && (
          <div
            className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-1"
            style={{
              background: `linear-gradient(135deg, ${ANCIENT_CONFIG.color}, ${ANCIENT_CONFIG.glowColor})`,
              color: '#000'
            }}
          >
            {ANCIENT_CONFIG.icon} 고대
          </div>
        )}
        <div className="font-bold text-sm" style={{ color: getNameColor(), textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
          {enhanceLevel > 0 && <span className="text-yellow-400">+{enhanceLevel} </span>}
          {isAncient && <span className="text-amber-300">[고대] </span>}
          {item.name || EQUIPMENT_SLOT_NAMES[item.slot]}
        </div>
        {isSet && setData && (
          <div className="text-xs mt-0.5" style={{ color: setData.color }}>
            {setData.icon} {setData.name} 세트
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">장비분류</span>
          <span className="text-white">{EQUIPMENT_SLOT_NAMES[item.slot]}</span>
        </div>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-gray-400">아이템 레벨</span>
          <span className="text-yellow-400 font-bold">Lv.{item.itemLevel || 1}</span>
        </div>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-gray-400">제련도</span>
          <span className={getRefineLevel() >= 10 ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
            {getRefineLevel()}/10
          </span>
        </div>
        {(item.awakeningCount || 0) > 0 && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-gray-400">각성</span>
            <span className="text-purple-400 font-bold">💎 {item.awakeningCount}</span>
          </div>
        )}
        {enhanceLevel > 0 && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-gray-400">강화</span>
            <span className="text-yellow-400 font-bold">+{enhanceLevel}</span>
          </div>
        )}
      </div>

      {/* 기본 능력치 */}
      {mainStats.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700">
          <div className="text-xs text-gray-500 mb-1">기본 능력치</div>
          {mainStats.map((stat, idx) => {
            const isReduction = stat.id === 'monstersPerStageReduction';
            const bonusValue = enhanceBonusPercent > 0 ? Math.floor(stat.value * enhanceBonusPercent / 100) : 0;
            const suffix = stat.suffix || '';
            return (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-cyan-300">{stat.name}</span>
                <span className="text-cyan-300 font-bold">
                  {isReduction ? '-' : '+'}{formatStatValue(stat.value, suffix)}{suffix}
                  {enhanceLevel > 0 && bonusValue > 0 && (
                    <span className="text-yellow-400 ml-1">
                      (+{formatStatValue(bonusValue, suffix)}{suffix})
                    </span>
                  )}
                </span>
              </div>
            );
          })}
          {enhanceLevel > 0 && (
            <div className="text-[10px] text-yellow-400 mt-1">
              강화 +{enhanceLevel} : +{enhanceBonusPercent}%
            </div>
          )}
        </div>
      )}

      {/* 잠재 능력치 */}
      {item.stats && item.stats.filter(s => !s.isMain).length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700">
          <div className="text-xs text-gray-500 mb-1">잠재옵션</div>
          {item.stats.filter(s => !s.isMain).map((stat, idx) => {
            const optionGrade = stat.optionGrade ?? OPTION_GRADES.LOW;
            const gradeColor = optionGrade === OPTION_GRADES.HIGH
              ? '#EF4444'
              : optionGrade === OPTION_GRADES.MID
                ? '#4ADE80'
                : '#9CA3AF';
            const gradeLabel = optionGrade === OPTION_GRADES.HIGH
              ? '(극옵)'
              : optionGrade === OPTION_GRADES.MID
                ? '(중옵)'
                : '(하옵)';

            return (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span style={{ color: gradeColor }}>{stat.name}</span>
                <span style={{ color: gradeColor }} className="font-bold">
                  +{formatStatValue(stat.value, stat.suffix)}{stat.suffix}
                  <span className="text-[10px] ml-1 opacity-70">{gradeLabel}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 세트 효과 */}
      {isSet && setData && (
        <div className="px-3 py-2 border-b border-gray-700">
          <div className="text-xs mb-2" style={{ color: setData.color }}>
            {setData.icon} {setData.name} 세트 효과
          </div>

          {/* 세트 아이템 목록 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'].map(slot => (
              <span
                key={slot}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500"
              >
                {EQUIPMENT_SLOT_NAMES[slot]}
              </span>
            ))}
          </div>

          {/* 3세트 효과 */}
          <div className="text-xs py-1 text-gray-500">
            <span className="font-bold">3세트 효과 (1/3)</span>
            <div className="mt-0.5 pl-2">
              {setData.setBonus[3].description}
            </div>
          </div>

          {/* 6세트 효과 */}
          <div className="text-xs py-1 text-gray-500">
            <span className="font-bold">6세트 효과 (1/6)</span>
            <div className="mt-0.5 pl-2">
              {setData.setBonus[6].description}
            </div>
          </div>
        </div>
      )}

      {/* 하단 */}
      <div className="px-3 py-2 text-center text-[10px] text-gray-500" style={{ background: 'rgba(0,0,0,0.3)' }}>
        채팅에서 공유된 아이템
      </div>
    </div>
  );
};

// 문양 미리보기 카드
const InscriptionPreviewCard = ({ inscription }) => {
  const inscriptionData = INSCRIPTIONS[inscription.inscriptionId];
  const gradeData = INSCRIPTION_GRADES[inscription.grade];

  if (!inscriptionData || !gradeData) return null;

  const colorMap = {
    'text-gray-400': '#9CA3AF',
    'text-green-400': '#4ADE80',
    'text-blue-400': '#60A5FA',
    'text-purple-400': '#C084FC',
    'text-yellow-400': '#FACC15',
    'text-orange-400': '#FB923C',
    'text-red-400': '#F87171',
    'text-fuchsia-500': '#D946EF'
  };
  const color = colorMap[gradeData.color] || '#888';

  const level = inscription.level || 1;
  const statMultiplier = INSCRIPTION_UPGRADE_CONFIG.getStatMultiplier(level);
  const finalDamage = (inscriptionData.baseStats?.finalDamagePercent || 0) * gradeData.statMultiplier * statMultiplier;

  return (
    <div
      className="rounded-lg overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        border: `2px solid ${color}`,
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-3 text-center"
        style={{
          background: `linear-gradient(180deg, ${color}30, transparent)`,
          borderBottom: '1px solid #333',
        }}
      >
        <div className="text-3xl mb-1">📿</div>
        <div className="font-bold text-sm" style={{ color }}>
          [{gradeData.name}] {inscriptionData.name}
        </div>
        <div className="text-xs text-gray-400 mt-1">+{level}강</div>
      </div>

      {/* 효과 */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="text-xs text-gray-500 mb-1">문양 효과</div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-orange-400">🔥 최종 데미지</span>
          <span className="text-orange-400 font-bold">+{finalDamage.toFixed(1)}%</span>
        </div>
        {inscriptionData.baseStats?.accuracy && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-cyan-400">🎯 명중</span>
            <span className="text-cyan-400 font-bold">+{Math.floor(inscriptionData.baseStats.accuracy * gradeData.statMultiplier)}</span>
          </div>
        )}
      </div>

      {/* 특수 능력 */}
      {inscriptionData.specialAbility && (
        <div className="px-3 py-2 border-b border-gray-700">
          <div className="text-xs text-gray-500 mb-1">특수 능력</div>
          <div className="text-xs text-yellow-400 font-bold">
            ✨ {inscriptionData.specialAbility.name}
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {inscriptionData.specialAbility.description}
          </div>
        </div>
      )}

      {/* 하단 */}
      <div className="px-3 py-2 text-center text-[10px] text-gray-500" style={{ background: 'rgba(0,0,0,0.3)' }}>
        채팅에서 공유된 문양
      </div>
    </div>
  );
};

// 동료 미리보기 카드
const HeroPreviewCard = ({ hero }) => {
  const heroData = getHeroById(hero.id);
  const gradeData = HERO_GRADES[hero.grade];

  if (!heroData || !gradeData) return null;

  const colorMap = {
    normal: '#9CA3AF',
    rare: '#60A5FA',
    epic: '#C084FC',
    unique: '#FACC15',
    legendary: '#FB923C',
    mythic: '#F87171',
    dark: '#D946EF'
  };
  const color = colorMap[hero.grade] || '#888';

  const stats = hero.stats || getHeroStats(heroData, hero.grade, hero.stars);

  return (
    <div
      className="rounded-lg overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        border: `2px solid ${color}`,
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-3 text-center"
        style={{
          background: `linear-gradient(180deg, ${color}30, transparent)`,
          borderBottom: '1px solid #333',
        }}
      >
        <div className="text-3xl mb-1">🦸</div>
        <div className="font-bold text-sm" style={{ color }}>
          {heroData.name}
        </div>
        <div className="text-xs mt-1" style={{ color }}>
          {gradeData.name}
        </div>
        <div className="text-sm mt-1">
          {'★'.repeat(hero.stars || 0)}{'☆'.repeat(5 - (hero.stars || 0))}
        </div>
      </div>

      {/* 스탯 */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="text-xs text-gray-500 mb-1">동료 스탯</div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-rose-400">⚔️ 공격력</span>
          <span className="text-rose-400 font-bold">{formatNumber(stats.attack || 0)}</span>
        </div>
        {stats.critChance && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-yellow-400">💥 치명타 확률</span>
            <span className="text-yellow-400 font-bold">{stats.critChance.toFixed(1)}%</span>
          </div>
        )}
        {stats.critDmg && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-red-400">🎯 치명타 데미지</span>
            <span className="text-red-400 font-bold">{Math.floor(stats.critDmg)}%</span>
          </div>
        )}
        {stats.goldBonus && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-yellow-300">💰 골드</span>
            <span className="text-yellow-300 font-bold">+{Math.floor(stats.goldBonus)}%</span>
          </div>
        )}
        {stats.expBonus && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-purple-300">📈 경험치</span>
            <span className="text-purple-300 font-bold">+{Math.floor(stats.expBonus)}%</span>
          </div>
        )}
        {stats.dropRate && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-green-400">🍀 드랍율</span>
            <span className="text-green-400 font-bold">+{Math.floor(stats.dropRate)}%</span>
          </div>
        )}
      </div>

      {/* 설명 */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="text-xs text-gray-400 italic">
          "{heroData.description}"
        </div>
      </div>

      {/* 하단 */}
      <div className="px-3 py-2 text-center text-[10px] text-gray-500" style={{ background: 'rgba(0,0,0,0.3)' }}>
        채팅에서 공유된 동료
      </div>
    </div>
  );
};

// 메인 미리보기 모달
const ItemLinkPreview = ({ isOpen, onClose, linkData }) => {
  if (!isOpen || !linkData) return null;

  const resolvedData = resolveLinkData(linkData);

  if (!resolvedData) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400">아이템 정보를 불러올 수 없습니다</div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative animate-scaleIn"
        style={{
          animation: 'scaleIn 0.15s ease-out'
        }}
      >
        {linkData.linkType === LINK_TYPES.EQUIPMENT && (
          <EquipmentPreviewCard item={resolvedData} />
        )}
        {linkData.linkType === LINK_TYPES.INSCRIPTION && (
          <InscriptionPreviewCard inscription={resolvedData} />
        )}
        {linkData.linkType === LINK_TYPES.HERO && (
          <HeroPreviewCard hero={resolvedData} />
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 border border-gray-600
                     rounded-full flex items-center justify-center text-gray-400 hover:text-white
                     hover:bg-gray-700 transition-colors"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ItemLinkPreview;
