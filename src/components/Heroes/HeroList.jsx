import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { HEROES, getHeroById, getHeroStats, HERO_GRADES, getNextGrade, getUpgradeCost, getStarUpgradeCost } from '../../data/heroes';
import { formatNumber } from '../../utils/formatter';
import NotificationModal from '../UI/NotificationModal';

const HeroList = () => {
  const { gameState, inscribeHero, upgradeHeroGrade, upgradeHeroStar, bulkUpgradeHeroStars, bulkUpgradeHeroGrades } = useGame();
  const { player, heroes, collection } = gameState;

  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  const handleBulkUpgradeStars = () => {
    const result = bulkUpgradeHeroStars();
    if (result.success && result.upgradedCount > 0) {
      showNotification('별 업그레이드 완료!', `${result.upgradedCount}개의 별을 업그레이드했습니다!`, 'success');
    } else {
      showNotification('업그레이드 불가', '업그레이드 가능한 동료가 없습니다.', 'warning');
    }
  };

  const handleBulkUpgradeGrades = () => {
    const result = bulkUpgradeHeroGrades();
    if (result.success && result.upgradedCount > 0) {
      showNotification('등급 업그레이드 완료!', `${result.upgradedCount}명의 동료 등급을 업그레이드했습니다!`, 'success');
    } else {
      showNotification('업그레이드 불가', '등급 업그레이드 가능한 동료가 없습니다.', 'warning');
    }
  };

  const getGradeColor = (gradeId) => {
    const grade = HERO_GRADES[gradeId];
    return grade?.colorClass || 'text-gray-400';
  };

  const getGradeBg = (gradeId) => {
    const colorMap = {
      normal: 'bg-gray-400/10',
      rare: 'bg-blue-400/10',
      epic: 'bg-purple-400/10',
      unique: 'bg-yellow-400/10',
      legendary: 'bg-orange-400/10',
      mythic: 'bg-red-400/10',
      dark: 'bg-gradient-to-br from-slate-200/20 to-slate-400/20'
    };
    return colorMap[gradeId] || 'bg-gray-500/10';
  };

  // 등급별 글로우 효과
  const getGradeGlow = (gradeId) => {
    const glowMap = {
      normal: 'hero-glow-normal',
      rare: 'hero-glow-rare',
      epic: 'hero-glow-epic',
      unique: 'hero-glow-unique',
      legendary: 'hero-glow-legendary',
      mythic: 'hero-glow-mythic',
      dark: 'dark-glitch-border'
    };
    return glowMap[gradeId] || '';
  };

  const getGradeBorder = (gradeId) => {
    const colorMap = {
      normal: 'border-gray-400',
      rare: 'border-blue-400',
      epic: 'border-purple-400',
      unique: 'border-yellow-400',
      legendary: 'border-orange-400',
      mythic: 'border-red-400',
      dark: 'border-white'
    };
    return colorMap[gradeId] || 'border-gray-500';
  };

  return (
    <>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-gray-100">동료</h3>
            <p className="text-sm text-blue-400">
              📖 동료의 서: <span className="font-bold">{gameState.upgradeCoins || 0}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkUpgradeStars}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded transition-all text-sm shadow-md"
            >
              ⭐ 일괄 별+
            </button>
            <button
              onClick={handleBulkUpgradeGrades}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded transition-all text-sm shadow-md"
            >
              👑 일괄 등급↑
            </button>
          </div>
        </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[600px] overflow-y-auto pr-2">
        {HEROES.map(hero => {
          const heroData = heroes[hero.id];
          const collectionCard = collection.heroCards?.[hero.id];
          const isInscribed = heroData?.inscribed || false;
          const currentGrade = heroData?.grade || 'normal';
          const currentStars = heroData?.stars || 0;

          // 각인되지 않은 동료
          if (!isInscribed) {
            const hasCard = collectionCard && collectionCard.count > 0;

            return (
              <div
                key={hero.id}
                className={`border-2 border-gray-600 bg-gray-800 rounded-lg p-2 flex flex-col ${hasCard ? '' : 'opacity-50'}`}
              >
                {/* 동료 이미지 */}
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-900 mb-1 border-2 border-gray-600">
                  <img
                    src={hero.image}
                    alt={hero.name}
                    className="w-full h-full object-cover grayscale"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl text-gray-500">❓</div>';
                    }}
                  />
                  {hasCard && (
                    <div className="absolute bottom-1 right-1 bg-black/90 px-2 py-1 text-xs font-bold text-white rounded border border-white">
                      x{collectionCard.count}
                    </div>
                  )}
                </div>

                {/* 동료 정보 */}
                <div className="flex-1 flex flex-col">
                  {/* 상단 여백 - 콘텐츠를 아래로 밀기 위한 스페이서 */}
                  <div className="flex-1 min-h-[8px]"></div>

                  <h4 className="text-xs font-bold text-gray-300 text-center">{hero.name}</h4>

                  {/* 빈별 표시 */}
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-gray-600"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                        }}
                      >
                        ☆
                      </span>
                    ))}
                  </div>

                  {/* 버튼 */}
                  <div className="mt-auto pt-1">
                    {hasCard && (
                      <button
                        onClick={() => inscribeHero(hero.id)}
                        className="w-full py-1 rounded font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all text-xs shadow-md"
                      >
                        각인
                      </button>
                    )}
                    {!hasCard && (
                      <div className="w-full py-1 rounded text-center text-gray-500 bg-gray-900 border border-gray-700 text-xs font-bold">
                        🔒
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // 각인된 동료
          const stats = getHeroStats(hero, currentGrade, currentStars);
          const nextGrade = getNextGrade(currentGrade);
          const canUpgrade = nextGrade && currentStars >= 5;
          const upgradeCost = nextGrade ? getUpgradeCost(currentGrade) : 0;
          const hasEnoughCoins = gameState.upgradeCoins >= upgradeCost;
          const starUpgradeCost = currentStars < 5 ? getStarUpgradeCost(currentGrade) : 0;
          const hasEnoughCards = collectionCard && collectionCard.count >= starUpgradeCost;
          const canAddStar = currentStars < 5 && hasEnoughCards;

          return (
            <div
              key={hero.id}
              className={`border-[3px] ${getGradeBorder(currentGrade)} ${getGradeGlow(currentGrade)} bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-2 flex flex-col transition-all h-full shadow-lg`}
            >
              {/* 동료 이미지 */}
              <div className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden border-[3px] ${getGradeBorder(currentGrade)} ${getGradeGlow(currentGrade)} mb-1 bg-gray-950`}>
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl bg-gray-800">⭐</div>';
                  }}
                />
                {collectionCard && collectionCard.count > 0 && (
                  <div className="absolute bottom-1 right-1 bg-black/80 px-2 py-1 text-xs font-bold text-white rounded">
                    x{collectionCard.count}
                  </div>
                )}
              </div>

              {/* 동료 정보 */}
              <div className="flex-1 flex flex-col">
                {/* 상단 여백 - 콘텐츠를 아래로 밀기 위한 스페이서 */}
                <div className="flex-1 min-h-[8px]"></div>

                <div className="text-center mb-1">
                  <h4 className={`text-xs font-bold ${currentGrade === 'dark' ? 'dark-glitch-text' : getGradeColor(currentGrade)} ${currentGrade === 'dark' ? '' : 'drop-shadow-md'}`}>
                    {hero.name}
                  </h4>
                </div>

                {/* 별 표시 - 등급 색상 - 더 밝고 빛나는 효과 */}
                <div className="flex items-center justify-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, idx) => {
                    const isFilled = idx < currentStars;
                    const isDark = currentGrade === 'dark';

                    return (
                      <span
                        key={idx}
                        className={`text-sm ${isFilled ? (isDark ? 'text-white dark-star-glow' : getGradeColor(currentGrade)) : 'text-gray-600'}`}
                        style={{
                          filter: isFilled
                            ? isDark
                              ? 'drop-shadow(0 0 6px rgba(100, 255, 218, 1)) drop-shadow(0 0 12px rgba(138, 43, 226, 0.8)) drop-shadow(0 0 18px rgba(255, 255, 255, 0.6))'
                              : 'drop-shadow(0 0 4px currentColor) drop-shadow(0 0 8px currentColor)'
                            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                          textShadow: isFilled
                            ? isDark
                              ? '0 0 10px rgba(100, 255, 218, 1), 0 0 20px rgba(138, 43, 226, 0.9), 0 0 30px rgba(0, 255, 255, 0.7), 0 2px 4px rgba(0,0,0,0.8)'
                              : '0 0 10px currentColor, 0 0 20px currentColor, 0 2px 4px rgba(0,0,0,0.8)'
                            : '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        {isFilled ? '★' : '☆'}
                      </span>
                    );
                  })}
                </div>

                {/* 스탯 표시 */}
                <div className="text-center mb-2 text-[10px] text-gray-100 font-semibold space-y-0.5"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                  <div>⚔️ {Math.floor(stats.attack || 0)}</div>
                  {stats.critChance && <div className="text-yellow-300">💥 {stats.critChance.toFixed(1)}%</div>}
                  {stats.critDmg && <div className="text-red-400">🎯 {Math.floor(stats.critDmg)}%</div>}
                  {stats.hpPercentDmgChance && <div className="text-purple-400">💀 {stats.hpPercentDmgChance.toFixed(1)}% ({Math.floor(stats.hpPercentDmgValue)}%HP)</div>}
                  {stats.dotDmgPercent && <div className="text-orange-400">🔥 {Math.floor(stats.dotDmgPercent)}%</div>}
                  {stats.stageSkipChance && <div className="text-cyan-400">⏭️ {stats.stageSkipChance.toFixed(1)}%</div>}
                  {stats.dropRate && <div className="text-green-400">🍀 {Math.floor(stats.dropRate)}%</div>}
                  {stats.goldBonus && <div className="text-yellow-300">💰 {Math.floor(stats.goldBonus)}%</div>}
                  {stats.expBonus && <div className="text-purple-300">📚 {Math.floor(stats.expBonus)}%</div>}
                </div>

                {/* 버튼들 - 고정 높이 */}
                <div className="mt-auto space-y-0.5 min-h-[52px] flex flex-col justify-end">
                  {/* 별 올리기 버튼 */}
                  {currentStars < 5 && (
                    <button
                      onClick={() => upgradeHeroStar(hero.id)}
                      disabled={!canAddStar}
                      className={`w-full py-1 rounded font-bold transition-all text-xs shadow-md ${
                        canAddStar
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                      }`}
                    >
                      별+ ({starUpgradeCost})
                    </button>
                  )}

                  {/* 등급업 버튼 */}
                  {nextGrade && (
                    <>
                      {canUpgrade ? (
                        <button
                          onClick={() => upgradeHeroGrade(hero.id)}
                          disabled={!hasEnoughCoins}
                          title="등급업 효과:&#10;- 공격력 추가 증가 (+50)&#10;- 별을 새로 달 수 있음&#10;- 더 높은 등급의 별은 더 강력함"
                          className={`w-full py-1 rounded font-bold transition-all text-xs shadow-md ${
                            hasEnoughCoins
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                          }`}
                        >
                          등급↑ ({upgradeCost})
                        </button>
                      ) : (
                        <div className="w-full py-1 rounded text-center text-xs text-gray-400 bg-gray-700 border border-gray-600 leading-tight font-semibold">
                          등급업 해금 (별5)
                        </div>
                      )}
                    </>
                  )}
                  {!nextGrade && (
                    <div className="w-full py-1 rounded text-center text-xs text-yellow-300 bg-yellow-900/50 border-2 border-yellow-500 font-bold shadow-lg"
                      style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.8)' }}>
                      MAX
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default HeroList;
