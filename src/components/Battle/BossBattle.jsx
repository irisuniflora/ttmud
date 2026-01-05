import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber, getHPPercent } from '../../utils/formatter';
import BattleField from './BattleField';

const MAX_HEARTS = 5;
const BOSS_ATTACK_INTERVAL = 6000; // 6초마다 보스 공격

const BossBattle = () => {
  const { gameState, forfeitBossBattle } = useGame();
  const { player, currentMonster } = gameState;

  const [playerHearts, setPlayerHearts] = useState(MAX_HEARTS);
  const [bossAttacking, setBossAttacking] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [heartLostIndex, setHeartLostIndex] = useState(-1); // 잃어버린 하트 인덱스 (애니메이션용)
  const attackTimerRef = useRef(null);
  const lastAttackRef = useRef(Date.now());
  const forfeitBossBattleRef = useRef(forfeitBossBattle);

  // forfeitBossBattle 함수 최신 참조 유지
  useEffect(() => {
    forfeitBossBattleRef.current = forfeitBossBattle;
  }, [forfeitBossBattle]);

  const hpPercent = getHPPercent(currentMonster.hp, currentMonster.maxHp);

  // 보스 공격 타이머 (6초마다)
  useEffect(() => {
    if (player.floorState !== 'boss_battle') return;

    const attackInterval = setInterval(() => {
      // 보스 공격 이펙트
      setBossAttacking(true);
      setScreenShake(true);

      // 하트 감소
      setPlayerHearts(prev => {
        const newHearts = prev - 1;
        setHeartLostIndex(newHearts); // 잃어버린 하트 위치

        // 하트 0이 되면 패배
        if (newHearts <= 0) {
          setTimeout(() => {
            forfeitBossBattleRef.current();
          }, 500);
        }

        return Math.max(0, newHearts);
      });

      // 이펙트 해제
      setTimeout(() => {
        setBossAttacking(false);
        setScreenShake(false);
        setHeartLostIndex(-1);
      }, 500);

    }, BOSS_ATTACK_INTERVAL);

    attackTimerRef.current = attackInterval;

    return () => {
      if (attackTimerRef.current) {
        clearInterval(attackTimerRef.current);
      }
    };
  }, [player.floorState]);

  // 하트 렌더링
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < MAX_HEARTS; i++) {
      const isFilled = i < playerHearts;
      const isLost = i === heartLostIndex;

      hearts.push(
        <span
          key={i}
          className={`text-2xl transition-all duration-300 ${
            isLost ? 'animate-heartLost scale-150 opacity-0' :
            isFilled ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
            'text-gray-700 opacity-50'
          }`}
        >
          {isFilled ? '❤️' : '🖤'}
        </span>
      );
    }
    return hearts;
  };

  // 다음 공격까지 남은 시간 계산
  const [timeToNextAttack, setTimeToNextAttack] = useState(BOSS_ATTACK_INTERVAL / 1000);

  useEffect(() => {
    if (player.floorState !== 'boss_battle') return;

    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - lastAttackRef.current;
      const remaining = Math.max(0, Math.ceil((BOSS_ATTACK_INTERVAL - (elapsed % BOSS_ATTACK_INTERVAL)) / 1000));
      setTimeToNextAttack(remaining);
    }, 100);

    return () => clearInterval(timerInterval);
  }, [player.floorState]);

  // 공격 타이밍 동기화
  useEffect(() => {
    if (bossAttacking) {
      lastAttackRef.current = Date.now();
    }
  }, [bossAttacking]);

  return (
    <div className={`bg-game-panel border border-game-border rounded-lg overflow-hidden h-full flex flex-col ${screenShake ? 'animate-shake' : ''}`}>
      {/* 메인 영역 - 전체 화면 전투창 + 플로팅 UI */}
      <div className="flex-1 relative min-h-0">
        {/* 전투 영역 - 전체 화면 */}
        <div className="absolute inset-0">
          <BattleField fullHeight={true} />
        </div>

        {/* 보스 공격 오버레이 */}
        {bossAttacking && (
          <div className="absolute inset-0 bg-red-600/30 animate-pulse pointer-events-none z-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl animate-bounce">💥</span>
            </div>
          </div>
        )}

        {/* 플로팅 UI - 상단 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-300 font-bold text-lg">👑 보스전</span>
              <span className="text-white font-bold">{player.floor}층</span>
            </div>
          </div>
        </div>

        {/* 플로팅 UI - 우측 패널 */}
        <div className="absolute top-12 right-2 z-20 w-48 bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50">
          {/* 보스 이름 */}
          <div className="text-center mb-2">
            <span className={`font-bold text-sm ${
              currentMonster.isLegendary ? 'text-yellow-300' :
              currentMonster.isRare ? 'text-fuchsia-400' : 'text-red-400'
            }`}>
              {currentMonster.isLegendary ? '💀 ' : currentMonster.isRare ? '👿 ' : '👑 '}
              {currentMonster.name}
            </span>
          </div>

          {/* 보스 HP 바 */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-red-400 font-bold">보스 HP</span>
              <span className="text-gray-300">{Math.round(hpPercent)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-red-600">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <div className="text-center text-[9px] text-gray-400 mt-0.5">
              {formatNumber(Math.max(0, currentMonster.hp))} / {formatNumber(currentMonster.maxHp)}
            </div>
          </div>

          {/* 플레이어 하트 */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-pink-400 font-bold">내 체력</span>
              <span className="text-gray-300">{playerHearts}/{MAX_HEARTS}</span>
            </div>
            <div className="flex justify-center gap-0.5">
              {renderHearts()}
            </div>
          </div>

          {/* 다음 공격까지 타이머 */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-orange-400 font-bold">보스 공격까지</span>
              <span className={`font-bold ${timeToNextAttack <= 2 ? 'text-red-400 animate-pulse' : 'text-yellow-300'}`}>
                {timeToNextAttack}초
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden border border-orange-600">
              <div
                className={`h-full transition-all duration-100 ${
                  timeToNextAttack > 3
                    ? 'bg-gradient-to-r from-green-600 to-green-400'
                    : timeToNextAttack > 1
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                      : 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse'
                }`}
                style={{ width: `${(timeToNextAttack / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* 포기 버튼 */}
          <button
            onClick={forfeitBossBattle}
            className="w-full py-1.5 bg-red-700/80 hover:bg-red-600 text-white rounded font-bold text-xs transition-all border border-red-600"
          >
            ⛔ 포기
          </button>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        .animate-shake {
          animation: bossShake 0.5s ease-in-out;
        }
        @keyframes bossShake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-8px) rotate(-1deg); }
          20% { transform: translateX(8px) rotate(1deg); }
          30% { transform: translateX(-6px) rotate(-0.5deg); }
          40% { transform: translateX(6px) rotate(0.5deg); }
          50% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          90% { transform: translateX(-1px); }
        }
        .animate-heartLost {
          animation: heartLost 0.5s ease-out forwards;
        }
        @keyframes heartLost {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5) translateY(-10px); opacity: 0.5; }
          100% { transform: scale(0) translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BossBattle;
