import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/formatter';
import { DEFENSE_FORMULAS } from '../../data/formulas';

// GitHub Pages 배포용 BASE_URL
const BASE_URL = import.meta.env.BASE_URL || '/';

const DUMMY_TEST_DURATION = 30; // 30초

// 요일 이름
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const TrainingDummy = () => {
  const { gameState, engine } = useGame();
  const { player, combatLog = [] } = gameState;

  const [isTesting, setIsTesting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DUMMY_TEST_DURATION);
  const [totalDamage, setTotalDamage] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [critCount, setCritCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [bestDPS, setBestDPS] = useState(() => {
    const saved = localStorage.getItem('ttmud_bestDPS');
    return saved ? parseInt(saved, 10) : 0;
  });

  // 현재 요일 특성
  const dailyModifier = useMemo(() => {
    return DEFENSE_FORMULAS.getDailyDummyModifier();
  }, []);

  const dayOfWeek = new Date().getDay();

  // 플레이어 관통율 계산
  const playerPenetration = useMemo(() => {
    const penetrations = [];
    // 전직별 기본 방관 (전직1: 10%, 전직2: 20%, 전직3: 30%, 전직4: 50%)
    const classLevel = player?.classLevel || 1;
    const basePenetration = classLevel === 1 ? 10 : classLevel === 2 ? 20 : classLevel === 3 ? 30 : 50;
    penetrations.push(basePenetration);
    // 문양에서 관통율 수집
    const inscriptionStats = gameState.inscriptionStats || {};
    if (inscriptionStats.defensePenetration) {
      penetrations.push(inscriptionStats.defensePenetration);
    }
    // 장비에서 관통율 수집
    Object.values(gameState.equipment || {}).forEach(item => {
      if (item && item.stats) {
        item.stats.forEach(stat => {
          if (stat.id === 'defensePenetration' && stat.value > 0) {
            penetrations.push(stat.value);
          }
        });
      }
    });
    // 스킬에서 관통율 수집
    const skillEffects = gameState.skillEffects || {};
    if (skillEffects.defensePenetration) {
      penetrations.push(skillEffects.defensePenetration);
    }
    // 유물에서 관통율 수집
    const relicEffects = gameState.relicEffects || {};
    if (relicEffects.defensePenetration) {
      penetrations.push(relicEffects.defensePenetration);
    }
    return DEFENSE_FORMULAS.calculateTotalPenetration(penetrations);
  }, [gameState.inscriptionStats, gameState.equipment, gameState.skillEffects, gameState.relicEffects]);

  // 허수아비에게 적용되는 데미지 배율
  const damageMultiplier = useMemo(() => {
    if (dailyModifier.defenseRate <= 0) return 1;
    const penetrations = [];
    // 전직별 기본 방관 (전직1: 10%, 전직2: 20%, 전직3: 30%, 전직4: 50%)
    const classLevel = player?.classLevel || 1;
    const basePenetration = classLevel === 1 ? 10 : classLevel === 2 ? 20 : classLevel === 3 ? 30 : 50;
    penetrations.push(basePenetration);
    // 관통율 수집 (위와 동일)
    const inscriptionStats = gameState.inscriptionStats || {};
    if (inscriptionStats.defensePenetration) {
      penetrations.push(inscriptionStats.defensePenetration);
    }
    Object.values(gameState.equipment || {}).forEach(item => {
      if (item && item.stats) {
        item.stats.forEach(stat => {
          if (stat.id === 'defensePenetration' && stat.value > 0) {
            penetrations.push(stat.value);
          }
        });
      }
    });
    const skillEffects = gameState.skillEffects || {};
    if (skillEffects.defensePenetration) {
      penetrations.push(skillEffects.defensePenetration);
    }
    const relicEffects = gameState.relicEffects || {};
    if (relicEffects.defensePenetration) {
      penetrations.push(relicEffects.defensePenetration);
    }
    return DEFENSE_FORMULAS.calculateDamageMultiplier(dailyModifier.defenseRate, penetrations);
  }, [dailyModifier.defenseRate, gameState.inscriptionStats, gameState.equipment, gameState.skillEffects, gameState.relicEffects]);

  const timerRef = useRef(null);
  const damageIdRef = useRef(0);
  const lastLogIdRef = useRef(null);
  const startTimeRef = useRef(null);

  // 테스트 시작
  const startTest = () => {
    setIsTesting(true);
    setTimeLeft(DUMMY_TEST_DURATION);
    setTotalDamage(0);
    setHitCount(0);
    setCritCount(0);
    setMissCount(0);
    setDamageNumbers([]);
    lastLogIdRef.current = combatLog.length > 0 ? combatLog[0]?.id : null;
    startTimeRef.current = Date.now();

    // 타이머 시작
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 테스트 종료
  const endTest = () => {
    setIsTesting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 테스트 중 데미지 로그 감지
  useEffect(() => {
    if (!isTesting || combatLog.length === 0) return;

    const lastLog = combatLog[0];
    if (!lastLog || lastLog.id === lastLogIdRef.current) return;
    lastLogIdRef.current = lastLog.id;

    const logMessage = typeof lastLog === 'string' ? lastLog : lastLog.message || '';
    const isDamageLog = logMessage.includes('⚔️') || logMessage.includes('💥') ||
                        lastLog.type === 'damage' || lastLog.type === 'critical';

    if (isDamageLog) {
      // 요일별 회피 체크 (명중 vs 회피치)
      if (dailyModifier.evasionStat > 0) {
        // 플레이어 명중 스탯 계산
        const playerAccuracy = player?.stats?.accuracy || 100;
        const dummyEvasion = dailyModifier.evasionStat;
        // 명중률 = 플레이어 명중 / 허수아비 회피 * 100, 최소 10%, 최대 100%
        const hitChance = Math.min(100, Math.max(10, (playerAccuracy / dummyEvasion) * 100));
        const hitRoll = Math.random() * 100;

        if (hitRoll > hitChance) {
          // 회피됨 - MISS 표시
          setMissCount(prev => prev + 1);
          damageIdRef.current += 1;
          const missDisplay = {
            id: damageIdRef.current,
            value: 0,
            isMiss: true,
            x: 40 + Math.random() * 20,
            y: 30 + Math.random() * 20
          };
          setDamageNumbers(prev => [...prev.slice(-10), missDisplay]);
          setTimeout(() => {
            setDamageNumbers(prev => prev.filter(d => d.id !== missDisplay.id));
          }, 1000);
          return;
        }
      }

      let isCrit = logMessage.includes('💥') || logMessage.includes('치명타') || lastLog.type === 'critical';

      // 요일별 크리티컬 저항 체크
      if (isCrit && dailyModifier.critResist > 0) {
        const critResistRoll = Math.random() * 100;
        if (critResistRoll < dailyModifier.critResist) {
          isCrit = false; // 크리티컬이 일반 타격으로 변환
        }
      }

      // K/M/B 포맷 지원: "712.8M 데미지", "1.5B 데미지", "500K 데미지", "1,234 데미지"
      const damageMatch = logMessage.match(/([\d,.]+)([KMB])?\s*데미지/i);

      if (damageMatch) {
        let damageValue = parseFloat(damageMatch[1].replace(/,/g, '')) || 0;
        const suffix = damageMatch[2]?.toUpperCase();
        if (suffix === 'K') damageValue *= 1000;
        else if (suffix === 'M') damageValue *= 1000000;
        else if (suffix === 'B') damageValue *= 1000000000;
        damageValue = Math.floor(damageValue);

        // 요일별 방어율 적용
        if (dailyModifier.defenseRate > 0) {
          damageValue = Math.floor(damageValue * damageMultiplier);
        }

        setTotalDamage(prev => prev + damageValue);
        setHitCount(prev => prev + 1);
        if (isCrit) setCritCount(prev => prev + 1);

        // 데미지 숫자 플로팅
        damageIdRef.current += 1;
        const newDamage = {
          id: damageIdRef.current,
          value: damageValue,
          isCrit,
          x: 40 + Math.random() * 20,
          y: 30 + Math.random() * 20
        };
        setDamageNumbers(prev => [...prev.slice(-10), newDamage]);

        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== newDamage.id));
        }, 1000);
      }
    }
  }, [combatLog, isTesting, dailyModifier, damageMultiplier]);

  // 테스트 종료 시 결과 처리
  useEffect(() => {
    if (!isTesting && totalDamage > 0 && timeLeft === 0) {
      // 30초 DPS 계산 (총 데미지 / 30)
      const dps = Math.floor(totalDamage / DUMMY_TEST_DURATION);

      if (dps > bestDPS) {
        setBestDPS(dps);
        localStorage.setItem('ttmud_bestDPS', dps.toString());
      }
    }
  }, [isTesting, totalDamage, timeLeft, bestDPS]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const currentDPS = isTesting && timeLeft < DUMMY_TEST_DURATION
    ? Math.floor(totalDamage / (DUMMY_TEST_DURATION - timeLeft))
    : 0;

  const critRate = hitCount > 0 ? ((critCount / hitCount) * 100).toFixed(1) : 0;

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🥊 허수아비 훈련장
        </h3>
        <div className="text-xs text-gray-400">
          30초 DPS 측정
        </div>
      </div>

      {/* 오늘의 특성 */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-lg p-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{dailyModifier.icon}</span>
            <span className="text-sm font-bold text-purple-300">
              {DAY_NAMES[dayOfWeek]}요일: {dailyModifier.name}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {dailyModifier.description}
        </div>
        {/* 요일별 스탯 표시 */}
        <div className="flex flex-col gap-1 mt-2 text-xs">
          {dailyModifier.defenseRate > 0 && (
            <div className="text-orange-400">
              🛡️ 방어율: {dailyModifier.defenseRate}%
              {playerPenetration > 0 && (
                <span className="text-purple-400 ml-1">
                  (관통: {playerPenetration.toFixed(1)}% → 데미지 {(damageMultiplier * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          )}
          {dailyModifier.evasionStat > 0 && (
            <div className="text-yellow-400">
              👻 회피치: {formatNumber(dailyModifier.evasionStat)}
              <span className="text-gray-400 ml-1">
                (내 명중: {formatNumber(player?.stats?.accuracy || 100)} → 명중률 {Math.min(100, Math.max(10, ((player?.stats?.accuracy || 100) / dailyModifier.evasionStat) * 100)).toFixed(1)}%)
              </span>
            </div>
          )}
          {dailyModifier.critResist > 0 && (
            <div className="text-gray-300">🪨 크리저항: {dailyModifier.critResist}%</div>
          )}
        </div>
      </div>

      {/* 허수아비 영역 */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ height: '200px' }}>
        {/* 배경 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)'
          }}
        />

        {/* 허수아비 이미지 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`transition-all duration-100 ${isTesting ? 'animate-pulse' : ''}`}
            style={{
              filter: isTesting
                ? 'drop-shadow(0 0 20px #ef4444) drop-shadow(0 0 40px #dc2626)'
                : 'drop-shadow(0 0 10px rgba(255,255,255,0.2))'
            }}
          >
            <div className="text-8xl">🪵</div>
          </div>
        </div>

        {/* 데미지 숫자 팝업 */}
        {damageNumbers.map(dmg => (
          <div
            key={dmg.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${dmg.x}%`,
              top: `${dmg.y}%`,
              textShadow: dmg.isMiss
                ? '0 0 8px #666, 2px 2px 4px rgba(0,0,0,1)'
                : dmg.isCrit
                  ? '0 0 8px #ff0000, 0 0 16px #ff4444, 2px 2px 4px rgba(0,0,0,1)'
                  : '2px 2px 4px rgba(0,0,0,0.9)',
              animation: dmg.isMiss ? 'missFloat 1s ease-out forwards' : (dmg.isCrit ? 'critDamageFloat 1s ease-out forwards' : 'damageFloat 1s ease-out forwards'),
              fontSize: dmg.isMiss ? '1rem' : (dmg.isCrit ? '1.5rem' : '1.1rem'),
              color: dmg.isMiss ? '#888888' : (dmg.isCrit ? '#FFD700' : '#FFFFFF'),
              fontWeight: 700,
            }}
          >
            {dmg.isMiss ? (
              <span style={{ fontStyle: 'italic' }}>MISS</span>
            ) : (
              <>
                {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
                {formatNumber(dmg.value)}
                {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
              </>
            )}
          </div>
        ))}

        {/* 타이머 오버레이 */}
        {isTesting && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-3 py-1">
            <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {timeLeft}초
            </span>
          </div>
        )}

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes damageFloat {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
            100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
          }
          @keyframes critDamageFloat {
            0% { opacity: 1; transform: translateY(0) scale(1.5); }
            20% { transform: translateY(-10px) scale(1.8); }
            50% { opacity: 1; transform: translateY(-25px) scale(1.6); }
            100% { opacity: 0; transform: translateY(-50px) scale(1); }
          }
          @keyframes missFloat {
            0% { opacity: 1; transform: translateY(0) scale(0.8); }
            50% { opacity: 0.7; transform: translateY(-15px) scale(1); }
            100% { opacity: 0; transform: translateY(-30px) scale(0.6); }
          }
        `}</style>
      </div>

      {/* 통계 영역 */}
      <div className={`grid ${dailyModifier.evasionStat > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">총 데미지</div>
          <div className="text-lg font-bold text-cyan-400">{formatNumber(totalDamage)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">현재 DPS</div>
          <div className="text-lg font-bold text-green-400">{formatNumber(currentDPS)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">타격 횟수</div>
          <div className="text-lg font-bold text-white">{hitCount}회</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">치명타율</div>
          <div className="text-lg font-bold text-orange-400">{critRate}%</div>
        </div>
        {dailyModifier.evasionStat > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">회피됨</div>
            <div className="text-lg font-bold text-gray-500">{missCount}회</div>
          </div>
        )}
        {dailyModifier.evasionStat > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">명중률</div>
            <div className="text-lg font-bold text-green-400">
              {hitCount + missCount > 0 ? ((hitCount / (hitCount + missCount)) * 100).toFixed(1) : 0}%
            </div>
          </div>
        )}
      </div>

      {/* 최고 DPS 기록 */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-yellow-400 mb-1">🏆 최고 DPS 기록</div>
            <div className="text-xl font-bold text-yellow-300">{formatNumber(bestDPS)}</div>
          </div>
          <div className="text-xs text-gray-400">
            (30초 평균)
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        {isTesting ? (
          <button
            onClick={endTest}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all"
          >
            테스트 중지
          </button>
        ) : (
          <button
            onClick={startTest}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold transition-all"
          >
            🥊 30초 테스트 시작
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        * 자동 전투 중 데미지가 측정됩니다
      </div>
    </div>
  );
};

export default TrainingDummy;
