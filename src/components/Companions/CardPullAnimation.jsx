import React, { useState, useEffect, useCallback } from 'react';
import { COMPANION_CATEGORIES, COMPANION_GRADES, getCompanionById } from '../../data/companions';
import { ORB_GRADES, getOrbById } from '../../data/orbs';

const BASE_URL = import.meta.env.BASE_URL || '/';

// 개별 카드 컴포넌트
const PullCard = ({ result, index, onFlip, isFlipped, isRevealing }) => {
  const companion = result.companion;
  const category = COMPANION_CATEGORIES[companion?.category];
  const grade = COMPANION_GRADES[companion?.grade];

  const isHighGrade = companion?.grade === 'epic' || companion?.grade === 'legendary';

  // 카드 이미지
  const getCardImage = () => {
    if (result.type === 'orb') {
      return null;
    }
    return `${BASE_URL}images/companions/${companion?.id}.png`;
  };

  return (
    <div
      className={`relative w-20 h-28 md:w-24 md:h-32 cursor-pointer transition-all duration-300 ${
        isRevealing ? 'pointer-events-none' : ''
      }`}
      style={{
        perspective: '1000px',
        animationDelay: `${index * 100}ms`
      }}
      onClick={() => !isFlipped && onFlip(index)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 카드 뒷면 */}
        <div
          className="absolute inset-0 rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 카드 뒷면 디자인 */}
          <div className="absolute inset-2 border border-purple-400/30 rounded-lg"></div>
          <div className="absolute inset-4 border border-purple-400/20 rounded-lg"></div>

          {/* 중앙 심볼 */}
          <div className="relative">
            <div className="text-4xl animate-pulse">✨</div>
            <div className="absolute inset-0 blur-xl bg-purple-500/50 rounded-full"></div>
          </div>

          {/* 장식 패턴 */}
          <div className="absolute top-2 left-2 text-purple-400/30">◆</div>
          <div className="absolute top-2 right-2 text-purple-400/30">◆</div>
          <div className="absolute bottom-2 left-2 text-purple-400/30">◆</div>
          <div className="absolute bottom-2 right-2 text-purple-400/30">◆</div>

          {/* 클릭 안내 */}
          <div className="absolute bottom-3 text-[10px] text-purple-300 animate-bounce">
            터치!
          </div>
        </div>

        {/* 카드 앞면 */}
        <div
          className={`absolute inset-0 rounded-lg border-2 overflow-hidden backface-hidden ${
            isHighGrade ? 'animate-pulse' : ''
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: grade?.color || '#6B7280',
            boxShadow: isHighGrade
              ? `0 0 20px ${grade?.color}, 0 0 40px ${grade?.color}50`
              : 'none'
          }}
        >
          {/* 배경 */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${category?.color}40, ${grade?.color}40)`
            }}
          />

          {/* 이미지 */}
          {result.type !== 'orb' && (
            <img
              src={getCardImage()}
              alt={companion?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* 오브인 경우 */}
          {result.type === 'orb' && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">💎</span>
            </div>
          )}

          {/* 등급 배지 */}
          <div
            className="absolute top-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold"
            style={{
              backgroundColor: grade?.color,
              color: companion?.grade === 'normal' ? '#000' : '#fff'
            }}
          >
            {grade?.name}
          </div>

          {/* 계열 배지 */}
          {result.type !== 'orb' && (
            <div
              className="absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-bold text-white"
              style={{ backgroundColor: category?.color }}
            >
              {category?.name}
            </div>
          )}

          {/* NEW 배지 */}
          {result.isNew && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
              NEW!
            </div>
          )}

          {/* 이름 */}
          <div
            className="absolute bottom-0 left-0 right-0 p-1 text-center"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
            }}
          >
            <p className="text-xs font-bold text-white truncate">
              {result.type === 'orb' ? result.orbName : companion?.name}
            </p>
          </div>

          {/* 고급 등급 이펙트 */}
          {isHighGrade && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-shimmer"></div>
              {companion?.grade === 'legendary' && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + i * 20}%`,
                        animationDelay: `${i * 200}ms`
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 메인 애니메이션 컴포넌트
const CardPullAnimation = ({ results, onComplete, companionCards = {}, localCardCounts = {} }) => {
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const [showSkip, setShowSkip] = useState(true);

  // 모든 카드 공개
  const revealAll = useCallback(() => {
    setIsRevealing(true);

    results.forEach((_, index) => {
      setTimeout(() => {
        setFlippedCards(prev => new Set([...prev, index]));
      }, index * 150);
    });

    setTimeout(() => {
      setIsRevealing(false);
      setShowSkip(false);
    }, results.length * 150 + 500);
  }, [results]);

  // 개별 카드 뒤집기
  const handleFlip = (index) => {
    if (flippedCards.has(index)) return;
    setFlippedCards(prev => new Set([...prev, index]));

    // 모두 뒤집혔는지 확인
    if (flippedCards.size + 1 >= results.length) {
      setShowSkip(false);
    }
  };

  // 고급 카드 있는지 확인
  const hasHighGrade = results.some(r =>
    r.companion?.grade === 'epic' || r.companion?.grade === 'legendary'
  );

  const hasLegendary = results.some(r => r.companion?.grade === 'legendary');

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      {/* 배경 이펙트 */}
      {hasLegendary && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 animate-pulse"></div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      {hasHighGrade && !hasLegendary && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse"></div>
      )}

      {/* 타이틀 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {hasLegendary ? '🌟 레전드 등장! 🌟' : hasHighGrade ? '✨ 고급 카드!' : '🎴 소환 결과'}
        </h2>
        <p className="text-gray-400 text-sm">
          카드를 터치하여 확인하세요!
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="flex flex-wrap justify-center gap-2 max-w-md px-4">
        {results.map((result, index) => (
          <PullCard
            key={index}
            result={result}
            index={index}
            isFlipped={flippedCards.has(index)}
            onFlip={handleFlip}
            isRevealing={isRevealing}
          />
        ))}
      </div>

      {/* 버튼 */}
      <div className="mt-8 flex gap-4">
        {showSkip && flippedCards.size < results.length && (
          <button
            onClick={revealAll}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
          >
            모두 공개
          </button>
        )}

        <button
          onClick={onComplete}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
        >
          확인
        </button>
      </div>

      {/* 획득 요약 */}
      {flippedCards.size === results.length && (
        <div className="mt-4 bg-black/50 rounded-lg p-4 max-w-md w-full mx-4">
          <p className="text-sm text-gray-400 text-center mb-3">
            {results.filter(r => r.isNew).length > 0 && (
              <span className="text-green-400">
                🆕 새로운 동료 {results.filter(r => r.isNew).length}명!{' '}
              </span>
            )}
            총 {results.length}장 획득
          </p>

          {/* 카드 개수 변화 표시 */}
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(localCardCounts).map(([companionId, increase]) => {
              const companion = getCompanionById(companionId);
              const currentCount = companionCards[companionId] || 0;
              const newCount = currentCount + increase;
              const grade = COMPANION_GRADES[companion?.grade];

              return (
                <div key={companionId} className="flex items-center justify-between text-xs bg-gray-800/50 rounded px-2 py-1">
                  <span className="text-white truncate flex-1" style={{ color: grade?.color }}>
                    {companion?.name}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {currentCount} → <span className="text-green-400 font-bold">{newCount}</span>
                    <span className="text-green-400 ml-1">(+{increase})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 1; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.5; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CardPullAnimation;
