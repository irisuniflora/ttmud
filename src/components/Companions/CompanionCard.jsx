import React, { memo } from 'react';
import { COMPANION_CATEGORIES, COMPANION_GRADES, STAR_CONFIG, getCompanionStats } from '../../data/companions';
import { ORB_GRADES, getOrbById, getOrbDisplayInfo } from '../../data/orbs';
import { formatNumber } from '../../utils/formatter';

const BASE_URL = import.meta.env.BASE_URL || '/';

const CompanionCard = memo(({
  companion,
  owned = false,
  stars = 0,
  cardCount = 0,
  equippedOrbs = [],
  onEquip,
  onUpgradeStar,
  onManageOrbs,
  compact = false,
  isEquipped = false,
  onClick
}) => {
  const category = COMPANION_CATEGORIES[companion.category];
  const grade = COMPANION_GRADES[companion.grade];
  const stats = getCompanionStats(companion, stars, equippedOrbs);
  const maxSlots = grade.orbSlots;

  // 별 업그레이드 비용
  const starCost = STAR_CONFIG.cardCostPerStar[companion.grade];
  const canUpgradeStar = stars < STAR_CONFIG.maxStars && cardCount >= starCost;

  // 카드 이미지
  const getCardImage = () => {
    return `${BASE_URL}images/companions/${companion.id}.png`;
  };

  // 등급별 테두리 스타일
  const getBorderStyle = () => {
    const styles = {
      normal: 'border-gray-500',
      uncommon: 'border-green-500',
      rare: 'border-blue-500',
      epic: 'border-purple-500',
      legendary: 'border-orange-500 shadow-lg shadow-orange-500/30'
    };
    return styles[companion.grade] || 'border-gray-500';
  };

  // 등급별 글로우 효과
  const getGlowStyle = () => {
    if (companion.grade === 'legendary') {
      return 'animate-pulse ring-2 ring-orange-400/50';
    }
    if (companion.grade === 'epic') {
      return 'ring-1 ring-purple-400/30';
    }
    return '';
  };

  // 미보유 카드
  if (!owned) {
    return (
      <div className={`border-2 border-gray-700 bg-gray-800/50 rounded-lg p-2 opacity-60`}>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-900 mb-2">
          <img
            src={getCardImage()}
            alt={companion.name}
            className="w-full h-full object-cover grayscale opacity-50"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl" style="color: ${category.color}">?</div>`;
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <span className="text-4xl opacity-30">🔒</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium">{companion.name}</p>
          <p className="text-[10px] text-gray-600">{grade.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 ${getBorderStyle()} ${getGlowStyle()} bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-2 transition-all hover:scale-[1.02] cursor-pointer ${
        isEquipped ? 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50' : ''
      }`}
      onClick={() => onClick?.(companion.id, companion.category)}
    >
      {/* 장착 표시 */}
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-cyan-400 text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold z-10 shadow-lg">
          장착중
        </div>
      )}

      {/* 카드 이미지 */}
      <div
        className={`relative aspect-[3/4] rounded-lg overflow-hidden mb-2 border-2 ${getBorderStyle()}`}
        style={{ backgroundColor: `${category.color}15` }}
      >
        <img
          src={getCardImage()}
          alt={companion.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl" style="color: ${category.color}">⚔️</div>`;
          }}
        />

        {/* 계열 뱃지 */}
        <div
          className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
          style={{ backgroundColor: category.color }}
        >
          {category.name}
        </div>

        {/* 카드 수량 */}
        {cardCount > 0 && (
          <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-bold text-white">
            x{cardCount}
          </div>
        )}

        {/* 등급 표시 */}
        <div
          className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{ backgroundColor: grade.color, color: companion.grade === 'normal' ? '#000' : '#fff' }}
        >
          {grade.name}
        </div>
      </div>

      {/* 이름 & 별 */}
      <div className="text-center mb-1">
        <h4 className="text-sm font-bold" style={{ color: category.color }}>
          {companion.name}
        </h4>

        {/* 별 표시 */}
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {[...Array(STAR_CONFIG.maxStars)].map((_, idx) => (
            <span
              key={idx}
              className={`text-sm ${idx < stars ? '' : 'opacity-30'}`}
              style={{
                color: idx < stars ? grade.color : '#6B7280',
                filter: idx < stars ? `drop-shadow(0 0 4px ${grade.color})` : 'none'
              }}
            >
              {idx < stars ? '★' : '☆'}
            </span>
          ))}
        </div>
      </div>

      {/* 스탯 표시 */}
      <div className="text-[10px] space-y-0.5 mb-2 px-1">
        <div className="flex justify-between text-gray-300">
          <span>⚔️ 공격력</span>
          <span className="font-bold">{formatNumber(stats.attack || 0)}</span>
        </div>

        {/* 메인 스탯 */}
        {stats.critChance && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>💥 크리확률</span>
            <span className="font-bold">{stats.critChance.toFixed(1)}%</span>
          </div>
        )}
        {stats.critDamage && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>🔺 크리뎀</span>
            <span className="font-bold">{stats.critDamage.toFixed(0)}%</span>
          </div>
        )}
        {stats.extraHit && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>⚡ 추가타</span>
            <span className="font-bold">{stats.extraHit.toFixed(1)}%</span>
          </div>
        )}
        {stats.accuracy && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>🎯 명중</span>
            <span className="font-bold">{formatNumber(stats.accuracy)}</span>
          </div>
        )}
        {stats.stageSkip && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>⏭️ 스킵</span>
            <span className="font-bold">{stats.stageSkip.toFixed(1)}%</span>
          </div>
        )}
        {stats.dropRate && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>🍀 드랍</span>
            <span className="font-bold">{stats.dropRate.toFixed(1)}%</span>
          </div>
        )}
        {stats.goldBonus && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>💰 골드</span>
            <span className="font-bold">{stats.goldBonus.toFixed(1)}%</span>
          </div>
        )}
        {stats.expBonus && (
          <div className="flex justify-between" style={{ color: category.color }}>
            <span>📈 경험치</span>
            <span className="font-bold">{stats.expBonus.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* 오브 슬롯 */}
      <div className="mb-2">
        <div className="flex items-center gap-1 justify-center">
          {[...Array(maxSlots)].map((_, idx) => {
            const orb = equippedOrbs[idx];
            const orbInfo = orb ? getOrbDisplayInfo(orb) : null;
            const orbData = orb ? getOrbById(orb.orbType) : null;
            const hasSynergy = orbData && orbData.category === companion.category;

            return (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                  orb
                    ? `border-${orbInfo?.gradeColor || 'gray-500'}`
                    : 'border-gray-600 border-dashed'
                }`}
                style={{
                  backgroundColor: orb ? `${orbData?.color}40` : 'transparent',
                  borderColor: orb ? orbData?.color : undefined,
                  boxShadow: hasSynergy ? `0 0 8px ${orbData?.color}` : 'none'
                }}
                onClick={() => onManageOrbs?.(companion.id)}
                title={orbInfo ? `${orbInfo.name} (${orbInfo.gradeName})${hasSynergy ? ' - 시너지!' : ''}` : '빈 슬롯'}
              >
                {orb ? (
                  <span className="text-xs">💎</span>
                ) : (
                  <span className="text-gray-600 text-xs">+</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 버튼 */}
      <div className="space-y-1">
        {stars < STAR_CONFIG.maxStars && (
          <button
            onClick={() => onUpgradeStar?.(companion.id)}
            disabled={!canUpgradeStar}
            className={`w-full py-1.5 rounded text-xs font-bold transition-all ${
              canUpgradeStar
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-900'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            ⭐ +1 ({starCost}장)
          </button>
        )}

        {stars >= STAR_CONFIG.maxStars && (
          <div className="w-full py-1.5 rounded text-xs font-bold text-center bg-gradient-to-r from-amber-600 to-yellow-500 text-white">
            ✨ MAX ✨
          </div>
        )}
      </div>
    </div>
  );
});

CompanionCard.displayName = 'CompanionCard';

export default CompanionCard;
