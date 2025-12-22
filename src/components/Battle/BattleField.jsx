import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../store/GameContext';
import { formatNumber } from '../../utils/formatter';
import { FLOOR_RANGES } from '../../data/monsters';

// GitHub Pages 배포용 BASE_URL
const BASE_URL = import.meta.env.BASE_URL || '/';

// FLOOR_RANGES 키값 정렬 (내림차순)
const FLOOR_THRESHOLDS = Object.keys(FLOOR_RANGES).map(Number).sort((a, b) => b - a);

// 층에 맞는 구간 시작점 찾기 (100층 이후는 1층부터 순환)
const getFloorRangeStart = (floor) => {
  // 100층 이후는 1층부터 순환 (101-105 → 1-5, 106-110 → 6-10, ...)
  const effectiveFloor = floor > 100 ? ((floor - 1) % 100) + 1 : floor;

  for (const threshold of FLOOR_THRESHOLDS) {
    if (effectiveFloor >= threshold) {
      return threshold;
    }
  }
  return 1;
};

// 지역별 그라데이션 폴백 색상
const FLOOR_GRADIENTS = {
  1: 'linear-gradient(180deg, #4a3728 0%, #2d1f14 60%, #1a1008 100%)',   // 버려진 광산
  6: 'linear-gradient(180deg, #3d5c3d 0%, #2a4a2a 60%, #1a331a 100%)',   // 고블린 소굴
  11: 'linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 60%, #0a0a0a 100%)',  // 거미 동굴
  16: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 60%, #050510 100%)',  // 언데드 묘지
  21: 'linear-gradient(180deg, #5c4a3d 0%, #3d2e26 60%, #1a1510 100%)',  // 코볼트 영토
  26: 'linear-gradient(180deg, #2d4a2d 0%, #1a3d1a 60%, #0d260d 100%)',  // 독버섯 숲
  31: 'linear-gradient(180deg, #6a5a7a 0%, #4a3a5a 60%, #2a1a3a 100%)',  // 하피 둥지
  36: 'linear-gradient(180deg, #5a4a3a 0%, #3a2a1a 60%, #1a1008 100%)',  // 미노타우로스 미궁
  41: 'linear-gradient(180deg, #ff6b35 0%, #8b0000 60%, #2d0a0a 100%)',  // 화염 용암지대
  46: 'linear-gradient(180deg, #87CEEB 0%, #4a8aaa 60%, #1a4a6a 100%)',  // 얼음 동굴
  51: 'linear-gradient(180deg, #5a5a6a 0%, #3a3a4a 60%, #1a1a2a 100%)',  // 오거 요새
  56: 'linear-gradient(180deg, #2a1a3a 0%, #1a0a2a 60%, #0a0010 100%)',  // 다크엘프 거처
  61: 'linear-gradient(180deg, #6a6a7a 0%, #4a4a5a 60%, #2a2a3a 100%)',  // 가고일 첨탑
  66: 'linear-gradient(180deg, #8b4513 0%, #5a2d0a 60%, #2d1508 100%)',  // 드래곤 둥지
  71: 'linear-gradient(180deg, #4a1a1a 0%, #2d0a0a 60%, #1a0505 100%)',  // 악마의 전당
  76: 'linear-gradient(180deg, #3a2a5a 0%, #2a1a4a 60%, #1a0a3a 100%)',  // 정령의 심연
  81: 'linear-gradient(180deg, #3a3a4a 0%, #2a2a3a 60%, #1a1a2a 100%)',  // 타락한 기사단
  86: 'linear-gradient(180deg, #4a4a5a 0%, #3a3a4a 60%, #2a2a3a 100%)',  // (추가 지역)
  91: 'linear-gradient(180deg, #5a3a3a 0%, #4a2a2a 60%, #3a1a1a 100%)',  // (추가 지역)
  96: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 60%, #000000 100%)',  // (추가 지역)
};

// 몬스터 이미지 경로 (층 구간 + 인덱스 기반)
// 레어/전설은 별도 이미지 없이 일반 몬스터에 글로우 효과 적용
const getMonsterImage = (monster, floorRangeStart) => {
  if (monster.isBoss) {
    return `${BASE_URL}images/field/monsters/floor_${floorRangeStart}/boss.png`;
  }
  // 일반/레어/전설 모두 같은 이미지 사용 (monsterIndex 기반)
  const index = monster.monsterIndex ?? 0;
  return `${BASE_URL}images/field/monsters/floor_${floorRangeStart}/${index}.png`;
};

// 몬스터 등급별 글로우 스타일
const getMonsterGlowStyle = (monster, isHit) => {
  if (isHit) {
    return 'brightness(2) saturate(0.5)';
  }

  // 보스 타입별 글로우
  if (monster.isBoss) {
    if (monster.isLegendary) {
      // 전설 보스: 진홍 + 금색 + 자주색 - 극강 위압감
      return 'drop-shadow(0 0 20px #DC2626) drop-shadow(0 0 40px #B91C1C) drop-shadow(0 0 15px #FFD700) drop-shadow(0 0 25px #8B5CF6) drop-shadow(2px 4px 10px rgba(0,0,0,0.8))';
    }
    if (monster.isRare) {
      // 희귀 보스: 보라색 + 금색 - 고급스러운 위압감
      return 'drop-shadow(0 0 18px #A855F7) drop-shadow(0 0 35px #7C3AED) drop-shadow(0 0 10px #FFD700) drop-shadow(2px 4px 8px rgba(0,0,0,0.7))';
    }
    // 일반 보스: 진홍색 + 금색 고급스러운 글로우
    return 'drop-shadow(0 0 15px #DC2626) drop-shadow(0 0 30px #B91C1C) drop-shadow(0 0 8px #FFD700) drop-shadow(2px 4px 8px rgba(0,0,0,0.6))';
  }

  // 일반 몬스터 타입별 글로우
  if (monster.isLegendary) {
    // 전설: 주황색 글로우
    return 'drop-shadow(0 0 12px #F97316) drop-shadow(0 0 24px #EA580C) drop-shadow(2px 4px 6px rgba(0,0,0,0.5))';
  }
  if (monster.isRare) {
    // 희귀: 보라색 글로우
    return 'drop-shadow(0 0 8px #A855F7) drop-shadow(0 0 16px #9333EA) drop-shadow(2px 4px 6px rgba(0,0,0,0.5))';
  }
  // 일반: 회색 글로우
  return 'drop-shadow(0 0 6px rgba(156,163,175,0.5)) drop-shadow(0 0 12px rgba(107,114,128,0.3)) drop-shadow(2px 4px 6px rgba(0,0,0,0.5))';
};

// 전직 단계별 폴더명
// base: 기본, class1: 1차전직, class2: 2차전직, class3: 3차전직
const CLASS_FOLDERS = ['base', 'class1', 'class2', 'class3'];

// 현재 전직 단계에 따른 캐릭터 이미지 경로
// frame: 0-2 일반 공격, 3 크리티컬 공격
const getPlayerImagePath = (classLevel, frame) => {
  const folder = CLASS_FOLDERS[classLevel] || 'base';
  return `${BASE_URL}images/field/characters/${folder}/player_${frame}.png`;
};

const BattleField = () => {
  const { gameState } = useGame();
  const { player, currentMonster, combatLog = [] } = gameState;

  const [isAttacking, setIsAttacking] = useState(false);
  const [isMonsterHit, setIsMonsterHit] = useState(false);
  const [isCriticalHit, setIsCriticalHit] = useState(false); // 크리티컬 히트 효과용
  const [screenShake, setScreenShake] = useState(false); // 화면 흔들림 효과
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);
  const [monsterImageLoaded, setMonsterImageLoaded] = useState(true);
  const [playerFrame, setPlayerFrame] = useState(0); // 캐릭터 모션 프레임 (0-2: 일반, 3: 크리티컬)
  const lastLogRef = useRef(null);
  const damageIdRef = useRef(0);
  const lastMonsterImageRef = useRef('');
  const lastNormalFrame = useRef(0); // 마지막 일반 공격 프레임 (순환용)

  const floorRangeStart = getFloorRangeStart(player.floor);
  const monsterImageSrc = getMonsterImage(currentMonster, floorRangeStart);
  const playerImageSrc = getPlayerImagePath(player.classLevel || 0, playerFrame);

  // 몬스터 이미지가 변경될 때만 로드 상태 리셋
  useEffect(() => {
    if (lastMonsterImageRef.current !== monsterImageSrc) {
      lastMonsterImageRef.current = monsterImageSrc;
      setMonsterImageLoaded(true); // 새 이미지 시도
    }
  }, [monsterImageSrc]);


  const [bgImageSrc, setBgImageSrc] = useState('');

  // 배경 이미지 프리로드 (PNG 우선, JPG 폴백)
  useEffect(() => {
    setBgImageLoaded(false);
    setBgImageSrc('');

    const basePath = `${BASE_URL}images/field/backgrounds/floor_${floorRangeStart}`;

    // PNG 먼저 시도
    const pngImg = new Image();
    pngImg.onload = () => {
      setBgImageSrc(`${basePath}.png`);
      setBgImageLoaded(true);
    };
    pngImg.onerror = () => {
      // PNG 실패 시 JPG 시도
      const jpgImg = new Image();
      jpgImg.onload = () => {
        setBgImageSrc(`${basePath}.jpg`);
        setBgImageLoaded(true);
      };
      jpgImg.onerror = () => setBgImageLoaded(false);
      jpgImg.src = `${basePath}.jpg`;
    };
    pngImg.src = `${basePath}.png`;
  }, [floorRangeStart]);

  // 전투 로그 감지하여 애니메이션 트리거
  useEffect(() => {
    if (!combatLog || combatLog.length === 0) return;

    // combatLog는 최신이 앞에 있음 (unshift 사용)
    const lastLogObj = combatLog[0];
    if (!lastLogObj || lastLogObj.id === lastLogRef.current) return;
    lastLogRef.current = lastLogObj.id;

    // 로그 메시지 추출 (객체 또는 문자열 처리)
    const logMessage = typeof lastLogObj === 'string' ? lastLogObj : lastLogObj.message || '';

    // 데미지 로그 감지 (⚔️ 또는 데미지 타입)
    const isDamageLog = logMessage.includes('⚔️') ||
                        logMessage.includes('💥') ||
                        lastLogObj.type === 'damage' ||
                        lastLogObj.type === 'critical';

    if (isDamageLog) {
      // 크리티컬 여부 판단
      const isCrit = logMessage.includes('💥') || logMessage.includes('치명타') || lastLogObj.type === 'critical';

      // 캐릭터 모션 변경 (크리티컬: 3, 일반: 0-2 순환)
      if (isCrit) {
        setPlayerFrame(3);
        // 크리티컬 타격감 효과
        setIsCriticalHit(true);
        setScreenShake(true);
        setTimeout(() => setIsCriticalHit(false), 300);
        setTimeout(() => setScreenShake(false), 200);
      } else {
        // 일반 공격: 0 → 1 → 2 → 0 순환 (항상 다른 프레임)
        const nextFrame = (lastNormalFrame.current + 1) % 3;
        lastNormalFrame.current = nextFrame;
        setPlayerFrame(nextFrame);
      }

      // 공격 애니메이션 (크리티컬일 때만 캐릭터 이동)
      if (isCrit) {
        setIsAttacking(true);
        setTimeout(() => setIsAttacking(false), 200);
      }

      // 피격 애니메이션
      setTimeout(() => {
        setIsMonsterHit(true);
        setTimeout(() => setIsMonsterHit(false), isCrit ? 250 : 150); // 크리티컬은 더 오래 흔들림
      }, 100);

      // 데미지 숫자 파싱 및 표시 (몬스터 머리 위)
      // "💥 치명타! 123,456 데미지" 또는 "⚔️ 123,456 데미지" 형식
      const damageMatch = logMessage.match(/([\d,]+)\s*데미지/);
      if (damageMatch) {
        const damageValue = parseInt(damageMatch[1].replace(/,/g, ''), 10) || 0;

        damageIdRef.current += 1;
        const newDamage = {
          id: damageIdRef.current,
          value: damageValue,
          isCrit: isCrit,
          y: 5 + Math.random() * 3, // 몬스터 머리 위 (더 위로)
        };

        setDamageNumbers(prev => [...prev.slice(-5), newDamage]);

        // 1초 후 제거
        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== newDamage.id));
        }, 1000);
      }
    }
  }, [combatLog]);

  return (
    <div className="bg-black p-4 rounded-lg">
      <div
        className={`relative w-full overflow-hidden rounded ${screenShake ? 'animate-shake' : ''}`}
        style={{ aspectRatio: '3 / 2' }}
      >
        {/* 크리티컬 플래시 효과 */}
        {isCriticalHit && (
          <div
            className="absolute inset-0 z-20 pointer-events-none animate-critFlash"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
            }}
          />
        )}
        {/* 그라데이션 폴백 (이미지 로드 실패 시에만 보임) */}
        {!bgImageLoaded && (
          <div
            className="absolute inset-0"
            style={{
              background: FLOOR_GRADIENTS[floorRangeStart] || FLOOR_GRADIENTS[1],
            }}
          />
        )}

        {/* 배경 이미지 레이어 */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: bgImageSrc ? `url('${bgImageSrc}')` : 'none',
            opacity: bgImageLoaded ? 1 : 0,
          }}
        />

      {/* 바닥 레이어 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* 캐릭터 (좌측) - 화면 중앙쪽, 더 크게 */}
      <div
        className={`absolute transition-transform duration-200 ${
          isAttacking ? 'translate-x-8 scale-110' : ''
        }`}
        style={{
          bottom: '15%',
          left: '18%',
        }}
      >
        {/* 캐릭터 이미지 - 세로로 긴 타원형 영역 (1.2배 크기) */}
        <div
          className="flex items-end justify-center"
          style={{
            width: '144px',
            height: '192px',
            filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.6))',
          }}
        >
          <img
            key={playerImageSrc}
            src={playerImageSrc}
            alt="Player"
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              // 폴백: player_0 이미지로 대체
              e.target.onerror = null;
              e.target.src = `${BASE_URL}images/field/characters/base/player_0.png`;
            }}
          />
        </div>
      </div>

      {/* 몬스터 (우측) - 화면 중앙쪽, 더 크게 */}
      <div
        className={`absolute transition-all duration-150 ${
          isMonsterHit ? (isCriticalHit ? 'translate-x-4' : 'translate-x-2') : ''
        } ${(currentMonster.isBoss && currentMonster.isLegendary) ? 'animate-pulse' : ''}`}
        style={{
          bottom: '15%',
          right: '18%',
          filter: getMonsterGlowStyle(currentMonster, isMonsterHit),
        }}
      >
        {/* 몬스터 이미지 - 세로로 긴 타원형 영역 */}
        <div
          className="flex items-end justify-center transition-transform"
          style={{
            width: currentMonster.isBoss
              ? (currentMonster.isLegendary ? '160px' : currentMonster.isRare ? '150px' : '140px')
              : '120px',
            height: currentMonster.isBoss
              ? (currentMonster.isLegendary ? '200px' : currentMonster.isRare ? '180px' : '170px')
              : '150px',
            transform: currentMonster.isBoss
              ? (currentMonster.isLegendary ? 'scale(1.15)' : currentMonster.isRare ? 'scale(1.1)' : 'scale(1.05)')
              : (currentMonster.isLegendary ? 'scale(1.08)' : currentMonster.isRare ? 'scale(1.04)' : 'scale(1)'),
          }}
        >
          {monsterImageLoaded ? (
            <img
              src={monsterImageSrc}
              alt={currentMonster.name}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={() => setMonsterImageLoaded(false)}
            />
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: '100%',
                height: '100%',
                fontSize: currentMonster.isBoss
                  ? (currentMonster.isLegendary ? '6rem' : currentMonster.isRare ? '5.5rem' : '5rem')
                  : '4rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {currentMonster.isBoss
                ? (currentMonster.isLegendary ? '💀' : currentMonster.isRare ? '👿' : '👹')
                : (currentMonster.isLegendary ? '🐉' : currentMonster.isRare ? '👾' : '👻')}
            </div>
          )}
        </div>
      </div>

      {/* 데미지 숫자 팝업 - 몬스터 머리 위 */}
      {damageNumbers.map(dmg => (
        <div
          key={dmg.id}
          className="absolute pointer-events-none"
          style={{
            right: '18%',
            top: `${28 + dmg.y}%`,
            transform: 'translateX(50%)',
            textShadow: dmg.isCrit
              ? '0 0 8px #ff0000, 0 0 16px #ff4444, 2px 2px 4px rgba(0,0,0,1)'
              : '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9)',
            animation: dmg.isCrit ? 'critDamageFloat 1s ease-out forwards' : 'damageFloat 1s ease-out forwards',
            zIndex: 50,
            fontSize: dmg.isCrit ? '1.1rem' : '0.9rem',
            color: dmg.isCrit ? '#FFD700' : '#FFFFFF',
            fontWeight: 700,
            fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
          {formatNumber(dmg.value)}
          {dmg.isCrit && <span style={{ color: '#FF4444' }}>★</span>}
        </div>
      ))}

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes damageFloat {
            0% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            50% {
              opacity: 1;
              transform: translateY(-20px) scale(1.2);
            }
            100% {
              opacity: 0;
              transform: translateY(-40px) scale(0.8);
            }
          }
          @keyframes critDamageFloat {
            0% {
              opacity: 1;
              transform: translateY(0) scale(1.5);
            }
            20% {
              transform: translateY(-10px) scale(1.8);
            }
            50% {
              opacity: 1;
              transform: translateY(-25px) scale(1.6);
            }
            100% {
              opacity: 0;
              transform: translateY(-50px) scale(1);
            }
          }
          @keyframes legendaryGlow {
            0%, 100% {
              filter: drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 24px #FFA500);
            }
            50% {
              filter: drop-shadow(0 0 20px #FFD700) drop-shadow(0 0 40px #FFA500);
            }
          }
          .animate-shake {
            animation: shake 0.2s ease-in-out;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px) rotate(-1deg); }
            40% { transform: translateX(4px) rotate(1deg); }
            60% { transform: translateX(-3px) rotate(-0.5deg); }
            80% { transform: translateX(3px) rotate(0.5deg); }
          }
          .animate-critFlash {
            animation: critFlash 0.3s ease-out;
          }
          @keyframes critFlash {
            0% { opacity: 0; }
            30% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BattleField;
