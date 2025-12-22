import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, REWARD_ICONS, REWARD_NAMES, getAchievementProgress } from '../../data/achievements';
import { formatNumber } from '../../utils/formatter';

const Achievements = () => {
  const { gameState, claimAchievementReward } = useGame();
  const { completedAchievements = {}, claimedAchievements = {} } = gameState;
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 카테고리별 업적 필터링
  const filteredAchievements = Object.values(ACHIEVEMENTS).filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  // 달성 현황 계산
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const completedCount = Object.keys(completedAchievements).length;
  const claimedCount = Object.keys(claimedAchievements).length;
  const unclaimedCount = completedCount - claimedCount;

  // 보상 수령
  const handleClaim = (achievementId) => {
    if (claimAchievementReward) {
      claimAchievementReward(achievementId);
    }
  };

  // 전체 보상 수령
  const handleClaimAll = () => {
    if (!claimAchievementReward) return;

    // 수령 가능한 모든 업적 찾기
    const unclaimedIds = Object.keys(completedAchievements).filter(
      id => !claimedAchievements[id]
    );

    // 순차적으로 수령
    unclaimedIds.forEach(id => {
      claimAchievementReward(id);
    });
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">🏆 업적</h3>
          <span className="text-sm bg-game-panel px-3 py-1 rounded text-yellow-400">
            달성: <span className="font-bold">{completedCount}</span> / {totalAchievements}
          </span>
          {unclaimedCount > 0 && (
            <>
              <span className="text-sm bg-green-600 px-3 py-1 rounded text-white animate-pulse">
                보상 수령 가능: {unclaimedCount}
              </span>
              <button
                onClick={handleClaimAll}
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white text-sm font-bold rounded shadow-lg"
              >
                전체 수령
              </button>
            </>
          )}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          전체
        </button>
        {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
              selectedCategory === key
                ? 'text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={selectedCategory === key ? { backgroundColor: category.color } : {}}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* 업적 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredAchievements.map(achievement => {
          const isCompleted = completedAchievements[achievement.id];
          const isClaimed = claimedAchievements[achievement.id];
          const progress = getAchievementProgress(achievement, gameState);
          const progressPercent = Math.min(100, (progress.current / progress.target) * 100);
          const category = ACHIEVEMENT_CATEGORIES[achievement.category];

          return (
            <div
              key={achievement.id}
              className={`relative border rounded-lg p-4 transition-all ${
                isCompleted
                  ? isClaimed
                    ? 'bg-gray-800/50 border-gray-600'
                    : 'bg-green-900/30 border-green-500 shadow-lg shadow-green-500/20'
                  : 'bg-gray-800/30 border-gray-700'
              }`}
            >
              {/* 카테고리 표시 */}
              <div
                className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded font-bold"
                style={{ backgroundColor: category.color + '40', color: category.color }}
              >
                {category.icon} {category.name}
              </div>

              {/* 업적 정보 */}
              <div className="flex items-start gap-3">
                <div
                  className={`text-3xl ${isCompleted ? '' : 'grayscale opacity-50'}`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>

                  {/* 진행도 바 */}
                  {!isCompleted && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>진행도</span>
                        <span>{formatNumber(progress.current)} / {formatNumber(progress.target)}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 보상 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-gray-500">보상:</span>
                      <span className="text-yellow-400 font-bold">
                        {REWARD_ICONS[achievement.reward.type]} {formatNumber(achievement.reward.amount)} {REWARD_NAMES[achievement.reward.type]}
                      </span>
                    </div>

                    {/* 수령 버튼 */}
                    {isCompleted && !isClaimed && (
                      <button
                        onClick={() => handleClaim(achievement.id)}
                        className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-sm font-bold rounded animate-pulse"
                      >
                        수령
                      </button>
                    )}
                    {isClaimed && (
                      <span className="text-xs text-gray-500">✓ 수령 완료</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          해당 카테고리에 업적이 없습니다.
        </div>
      )}
    </div>
  );
};

export default Achievements;
