import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { FLOOR_RANGES, getCollectionBonus, getBossCollectionBonus } from '../../data/monsters';
import { MONSTER_SETS, SET_CATEGORIES, SET_EFFECT_TYPES, checkSetCompletion, calculateSetBonuses, MONSTER_GRADES } from '../../data/monsterSets';
import { formatNumberWithCommas } from '../../utils/formatter';

// GitHub Pages 배포용 BASE_URL
const BASE_URL = import.meta.env.BASE_URL || '/';

// 몬스터 이미지 컴포넌트
const MonsterImage = ({ floorStart, monsterIndex, isBoss = false, isUnlocked = false, isRare = false, isLegendary = false, size = 'md' }) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  const imagePath = isBoss
    ? `${BASE_URL}images/field/monsters/floor_${floorStart}/boss.png`
    : `${BASE_URL}images/field/monsters/floor_${floorStart}/${monsterIndex}.png`;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // 글로우 효과
  const getGlowStyle = () => {
    if (!isUnlocked) return {};
    if (isLegendary) {
      return { filter: 'drop-shadow(0 0 6px #F97316) drop-shadow(0 0 12px #EA580C)' };
    }
    if (isRare) {
      return { filter: 'drop-shadow(0 0 4px #A855F7) drop-shadow(0 0 8px #9333EA)' };
    }
    return {};
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      {imageLoaded ? (
        <img
          src={imagePath}
          alt="Monster"
          className="w-full h-full object-contain transition-all"
          style={{
            imageRendering: 'pixelated',
            filter: isUnlocked ? getGlowStyle().filter || 'none' : 'grayscale(1) brightness(0.4) opacity(0.5)',
          }}
          onError={() => setImageLoaded(false)}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} flex items-center justify-center text-2xl`}
          style={{
            filter: isUnlocked ? getGlowStyle().filter || 'none' : 'grayscale(1) brightness(0.4) opacity(0.5)',
          }}
        >
          {isBoss ? '👹' : '👻'}
        </div>
      )}
    </div>
  );
};

const Collection = () => {
  const { gameState, inscribeMonster, engine } = useGame();
  const { collection, statistics, consumables = {} } = gameState;
  const [activeTab, setActiveTab] = useState('sets');
  const [activeCategory, setActiveCategory] = useState('element');
  const [inscribeModal, setInscribeModal] = useState(null); // { setId, monster, monsterId }
  const [resultModal, setResultModal] = useState(null);
  const [selectionModal, setSelectionModal] = useState(false);
  const [selectionResult, setSelectionResult] = useState(null);

  // 각인된 몬스터 데이터
  const inscribedMonsters = collection.inscribedMonsters || {};

  // 완료된 세트 목록
  const completedSets = Object.keys(MONSTER_SETS).filter(setId => {
    const status = checkSetCompletion(setId, inscribedMonsters);
    return status.completed;
  });

  // 세트 보너스 계산
  const setBonuses = calculateSetBonuses(completedSets);

  // 각인 확인 모달 열기
  const handleInscribeClick = (setId, monster) => {
    const monsterId = `${monster.grade}_${monster.zone}_${monster.index}`;
    // 이미 각인되었는지 다시 체크
    if (inscribedMonsters[monsterId]) return;
    setInscribeModal({ setId, monster, monsterId });
  };

  // 각인 실행
  const confirmInscribe = () => {
    if (!inscribeModal) return;
    const { monsterId, monster, setId } = inscribeModal;
    // 각인 전에 모달 먼저 닫기
    setInscribeModal(null);
    const result = inscribeMonster(monsterId, monster.grade, monster.name, setId);
    if (result) {
      setResultModal(result);
    }
  };

  // 몬스터가 도감에 있는지 확인
  const isMonsterCollected = (monster) => {
    if (monster.grade === 'normal') {
      // 일반 몬스터는 항상 수집 가능 (층수 도달 시)
      const highestFloor = statistics.highestFloor || 1;
      return highestFloor >= monster.zone;
    } else if (monster.grade === 'rare') {
      const rareId = `rare_${monster.zone}_${monster.index}`;
      return collection.rareMonsters?.[rareId]?.unlocked;
    } else if (monster.grade === 'legendary') {
      const legendaryId = `legendary_${monster.zone}_${monster.index}`;
      return collection.legendaryMonsters?.[legendaryId]?.unlocked;
    }
    return false;
  };

  // 몬스터가 각인 가능한지 확인
  const canInscribe = (monster) => {
    const monsterId = `${monster.grade}_${monster.zone}_${monster.index}`;
    // 이미 각인됨
    if (inscribedMonsters[monsterId]) return false;
    // 수집되어 있어야 함
    return isMonsterCollected(monster);
  };

  // 엔터키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (selectionResult) {
          setSelectionResult(null);
        } else if (resultModal) {
          setResultModal(null);
        } else if (inscribeModal) {
          confirmInscribe();
        }
      } else if (e.key === 'Escape') {
        if (selectionModal) {
          setSelectionModal(false);
        } else if (inscribeModal) {
          setInscribeModal(null);
        }
      }
    };

    if (inscribeModal || resultModal || selectionModal || selectionResult) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [inscribeModal, resultModal, selectionModal, selectionResult]);

  // 등급별 색상
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'legendary': return 'text-orange-400';
      case 'rare': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  const getGradeBg = (grade) => {
    switch (grade) {
      case 'legendary': return 'bg-orange-900/30 border-orange-500';
      case 'rare': return 'bg-purple-900/30 border-purple-500';
      default: return 'bg-gray-800 border-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-100">도감</h3>

      {/* 탭 선택 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('sets')}
          className={`flex-1 py-2 rounded font-bold ${
            activeTab === 'sets'
              ? 'bg-cyan-600 text-white'
              : 'bg-game-panel text-gray-300 border border-game-border'
          }`}
        >
          세트
        </button>
        <button
          onClick={() => setActiveTab('monsters')}
          className={`flex-1 py-2 rounded font-bold ${
            activeTab === 'monsters'
              ? 'bg-red-600 text-white'
              : 'bg-game-panel text-gray-300 border border-game-border'
          }`}
        >
          몬스터
        </button>
        <button
          onClick={() => setActiveTab('bosses')}
          className={`flex-1 py-2 rounded font-bold ${
            activeTab === 'bosses'
              ? 'bg-purple-600 text-white'
              : 'bg-game-panel text-gray-300 border border-game-border'
          }`}
        >
          보스
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 rounded font-bold ${
            activeTab === 'stats'
              ? 'bg-green-600 text-white'
              : 'bg-game-panel text-gray-300 border border-game-border'
          }`}
        >
          통계
        </button>
      </div>

      {/* ===== 세트 탭 ===== */}
      {activeTab === 'sets' && (
        <div className="space-y-3">
          {/* 세트 시스템 안내 */}
          <div className="bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-500 rounded-lg p-3">
            <h4 className="text-sm font-bold text-yellow-400 mb-2">📚 몬스터 세트 시스템</h4>
            <div className="text-xs text-gray-200 space-y-1">
              <p>• 몬스터를 <span className="text-cyan-400 font-bold">각인</span>하면 세트 진행도가 증가합니다</p>
              <p>• 각인된 몬스터는 도감에서 사라지지만 세트 효과에 기여합니다</p>
              <p>• 세트 완성 시 <span className="text-green-400 font-bold">영구 스탯 보너스</span>를 획득합니다</p>
            </div>
          </div>

          {/* 현재 세트 보너스 요약 */}
          {completedSets.length > 0 && (
            <div className="bg-gray-800 border border-yellow-500 rounded-lg p-3">
              <h4 className="text-sm font-bold text-yellow-400 mb-2">🏆 완성 세트: {completedSets.length}개</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(setBonuses).map(([type, value]) => {
                  if (value === 0) return null;
                  const effectInfo = SET_EFFECT_TYPES[type];
                  return (
                    <div key={type} className="bg-gray-900 rounded px-2 py-1">
                      <span className="text-gray-300">{effectInfo.icon} {effectInfo.name}</span>
                      <span className="text-green-400 font-bold ml-1">+{value}{effectInfo.suffix}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 카테고리 선택 */}
          <div className="flex gap-1 flex-wrap">
            {Object.entries(SET_CATEGORIES).map(([catId, cat]) => (
              <button
                key={catId}
                onClick={() => setActiveCategory(catId)}
                className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                  activeCategory === catId
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* 세트 목록 - 2열 레이아웃 */}
          <div className="grid grid-cols-2 gap-3">
            {SET_CATEGORIES[activeCategory].sets.map(setId => {
              const set = MONSTER_SETS[setId];
              if (!set) return null;

              const status = checkSetCompletion(setId, inscribedMonsters);
              const isCompleted = status.completed;

              return (
                <div
                  key={setId}
                  className={`bg-game-panel border rounded-lg p-3 ${
                    isCompleted ? 'border-yellow-500 bg-yellow-900/20' : 'border-game-border'
                  }`}
                >
                  {/* 세트 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{set.icon}</span>
                      <div>
                        <h4 className={`text-sm font-bold ${isCompleted ? 'text-yellow-400' : 'text-gray-200'}`}>
                          {set.name}
                          {isCompleted && <span className="ml-2">✅</span>}
                        </h4>
                        <p className="text-xs text-cyan-400">
                          {SET_EFFECT_TYPES[set.effect.type].icon} +{set.effect.value}{SET_EFFECT_TYPES[set.effect.type].suffix}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                        {status.progress}/{status.total}
                      </p>
                    </div>
                  </div>

                  {/* 세트 몬스터 목록 */}
                  <div className="grid grid-cols-5 gap-2">
                    {set.monsters.map((monster, idx) => {
                      const monsterId = `${monster.grade}_${monster.zone}_${monster.index}`;
                      const isInscribed = inscribedMonsters[monsterId];
                      const canDoInscribe = canInscribe(monster);
                      const isCollected = isMonsterCollected(monster);

                      return (
                        <div
                          key={idx}
                          className={`relative border rounded-lg p-2 ${
                            isInscribed ? 'bg-cyan-900/40 border-cyan-500' :
                            canDoInscribe ? getGradeBg(monster.grade) :
                            'bg-gray-900 border-gray-700'
                          }`}
                        >
                          {/* 몬스터 이미지 */}
                          <div className="flex justify-center mb-1.5">
                            <MonsterImage
                              floorStart={monster.zone}
                              monsterIndex={monster.index === 10 ? 'boss' : monster.index}
                              isBoss={monster.index === 10}
                              isUnlocked={isInscribed || isCollected}
                              isRare={monster.grade === 'rare'}
                              isLegendary={monster.grade === 'legendary'}
                              size="md"
                            />
                          </div>

                          {/* 몬스터 이름 */}
                          <p className={`text-[10px] font-bold text-center truncate ${
                            isInscribed ? 'text-cyan-400' :
                            isCollected ? getGradeColor(monster.grade) :
                            'text-gray-600'
                          }`}>
                            {isCollected || isInscribed ? monster.name : '???'}
                          </p>

                          {/* 등급 + 지역 */}
                          <p className="text-[9px] text-gray-500 text-center">
                            {MONSTER_GRADES[monster.grade].icon} {monster.zone}층
                          </p>

                          {/* 각인 상태 / 버튼 */}
                          {isInscribed ? (
                            <div className="text-center mt-1.5">
                              <span className="text-[10px] bg-cyan-600 rounded px-1.5 py-0.5 text-white">각인됨</span>
                            </div>
                          ) : canDoInscribe ? (
                            <button
                              onClick={() => handleInscribeClick(setId, monster)}
                              className="w-full mt-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-[10px] font-bold py-1 text-white"
                            >
                              각인
                            </button>
                          ) : (
                            <div className="text-center mt-1.5">
                              <span className="text-[10px] text-gray-600">미수집</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 몬스터 도감 탭 ===== */}
      {activeTab === 'monsters' && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(FLOOR_RANGES).map(([floorStart, data]) => {
            const floor = parseInt(floorStart);

            // 희귀 + 전설 수집 진행도 계산
            let rareCollected = 0;
            let legendaryCollected = 0;

            data.monsters.forEach((_, idx) => {
              const rareId = `rare_${floor}_${idx}`;
              const legendaryId = `legendary_${floor}_${idx}`;

              if (collection.rareMonsters?.[rareId]?.unlocked) rareCollected++;
              if (collection.legendaryMonsters?.[legendaryId]?.unlocked) legendaryCollected++;
            });

            // 보너스 계산
            const rareBonus = getCollectionBonus(rareCollected, 10);
            const legendaryBonus = {
              monsterReduction: legendaryCollected >= 10 ? 20 : legendaryCollected >= 5 ? 7 : legendaryCollected >= 2 ? 2 : 0
            };

            return (
              <div key={floor} className="bg-game-panel border border-game-border rounded-lg p-2">
                {/* 던전 제목 + 세트효과 */}
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400">
                      {data.name} <span className="text-gray-500 font-normal">({floor}~{floor + 4}층)</span>
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-purple-400 font-bold">레어: {rareCollected}/10</span>
                      <span className="text-[10px] text-orange-400 font-bold">전설: {legendaryCollected}/10</span>
                    </div>
                  </div>
                  {/* 세트효과 */}
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">
                      총 -{rareBonus.monsterReduction + legendaryBonus.monsterReduction}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      (레어 -{rareBonus.monsterReduction} / 전설 -{legendaryBonus.monsterReduction})
                    </p>
                  </div>
                </div>

                {/* 몬스터 그리드 (5x2) */}
                <div className="grid grid-cols-5 gap-1.5">
                  {data.monsters.map((monsterName, idx) => {
                    const rareId = `rare_${floor}_${idx}`;
                    const legendaryId = `legendary_${floor}_${idx}`;

                    const rareUnlocked = collection.rareMonsters?.[rareId]?.unlocked;
                    const legendaryUnlocked = collection.legendaryMonsters?.[legendaryId]?.unlocked;

                    // 각인 여부 체크
                    const rareInscribed = inscribedMonsters[`rare_${floor}_${idx}`];
                    const legendaryInscribed = inscribedMonsters[`legendary_${floor}_${idx}`];

                    const anyUnlocked = rareUnlocked || legendaryUnlocked || rareInscribed || legendaryInscribed;

                    return (
                      <div
                        key={idx}
                        className={`relative bg-gray-900 border rounded-lg p-1 transition-all ${
                          legendaryUnlocked ? 'border-orange-500 bg-orange-950/30' :
                          rareUnlocked ? 'border-purple-500 bg-purple-950/30' :
                          'border-gray-700'
                        }`}
                      >
                        {/* 몬스터 이미지 */}
                        <div className="flex justify-center mb-1">
                          <MonsterImage
                            floorStart={floor}
                            monsterIndex={idx}
                            isUnlocked={anyUnlocked}
                            isRare={rareUnlocked && !legendaryUnlocked}
                            isLegendary={legendaryUnlocked}
                            size="md"
                          />
                        </div>

                        {/* 몬스터 이름 */}
                        <p className={`text-[8px] font-bold text-center truncate mb-1 ${
                          legendaryUnlocked ? 'text-orange-400' :
                          rareUnlocked ? 'text-purple-400' :
                          anyUnlocked ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {anyUnlocked ? monsterName : '???'}
                        </p>

                        {/* 수집 상태 뱃지 */}
                        <div className="flex justify-center gap-0.5 mb-1">
                          <div className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${
                            rareUnlocked ? 'bg-purple-600' : rareInscribed ? 'bg-cyan-600' : 'bg-gray-800'
                          }`}>
                            {rareUnlocked ? '💎' : rareInscribed ? '📚' : '-'}
                          </div>
                          <div className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${
                            legendaryUnlocked ? 'bg-orange-600' : legendaryInscribed ? 'bg-cyan-600' : 'bg-gray-800'
                          }`}>
                            {legendaryUnlocked ? '👑' : legendaryInscribed ? '📚' : '-'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== 보스 도감 탭 ===== */}
      {activeTab === 'bosses' && (() => {
        let totalRareBosses = 0;
        let totalLegendaryBosses = 0;
        Object.entries(FLOOR_RANGES).forEach(([floorStart]) => {
          const floor = parseInt(floorStart);
          if (collection.rareBosses?.[`rare_boss_${floor}`]?.unlocked) totalRareBosses++;
          if (collection.legendaryBosses?.[`legendary_boss_${floor}`]?.unlocked) totalLegendaryBosses++;
        });
        const totalBossZones = Object.keys(FLOOR_RANGES).length;
        const bossBonus = getBossCollectionBonus(totalRareBosses, totalLegendaryBosses);

        return (
          <div className="space-y-3">
            {/* 보스 도감 세트효과 */}
            <div className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 border border-purple-500 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-1">🏆 보스 도감 보너스</h4>
                  <div className="text-xs space-y-0.5">
                    <p className="text-pink-400">
                      🌸 레어 보스: <span className="font-bold">{totalRareBosses}/{totalBossZones}</span>
                      <span className="text-gray-400 ml-2">(5/10/20셋 = +10/+20/+50% 골드)</span>
                    </p>
                    <p className="text-orange-400">
                      ⭐ 전설 보스: <span className="font-bold">{totalLegendaryBosses}/{totalBossZones}</span>
                      <span className="text-gray-400 ml-2">(5/10/20셋 = +10/+25/+60% 데미지)</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-lg">+{bossBonus.goldBonus}% 골드</p>
                  <p className="text-red-400 font-bold text-lg">+{bossBonus.damageBonus}% 데미지</p>
                </div>
              </div>
            </div>

            {/* 보스 목록 */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(FLOOR_RANGES).map(([floorStart, data]) => {
                const floor = parseInt(floorStart);
                const rareBossId = `rare_boss_${floor}`;
                const legendaryBossId = `legendary_boss_${floor}`;

                const rareUnlocked = collection.rareBosses?.[rareBossId]?.unlocked;
                const legendaryUnlocked = collection.legendaryBosses?.[legendaryBossId]?.unlocked;
                const anyUnlocked = rareUnlocked || legendaryUnlocked;

                return (
                  <div
                    key={floor}
                    className={`bg-gray-900 border rounded-lg p-2 transition-all ${
                      legendaryUnlocked ? 'border-orange-500 bg-orange-950/30' :
                      rareUnlocked ? 'border-pink-500 bg-pink-950/30' :
                      'border-gray-700'
                    }`}
                  >
                    {/* 보스 이미지 */}
                    <div className="flex justify-center mb-1">
                      <MonsterImage
                        floorStart={floor}
                        monsterIndex={0}
                        isBoss={true}
                        isUnlocked={anyUnlocked}
                        isRare={rareUnlocked && !legendaryUnlocked}
                        isLegendary={legendaryUnlocked}
                        size="lg"
                      />
                    </div>

                    {/* 던전 이름 */}
                    <p className="text-[9px] text-cyan-400 font-bold text-center truncate">{data.name}</p>
                    <p className="text-[7px] text-gray-500 text-center mb-1">{floor}~{floor + 4}층</p>

                    {/* 보스 이름 */}
                    <p className={`text-[8px] font-bold text-center truncate mb-1 ${
                      legendaryUnlocked ? 'text-orange-400' :
                      rareUnlocked ? 'text-pink-400' :
                      anyUnlocked ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {anyUnlocked ? data.boss : '???'}
                    </p>

                    {/* 수집 상태 */}
                    <div className="flex justify-center gap-1">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        rareUnlocked ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-600'
                      }`}>
                        {rareUnlocked ? '🌸 희귀' : '희귀'}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        legendaryUnlocked ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-600'
                      }`}>
                        {legendaryUnlocked ? '⭐ 전설' : '전설'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ===== 통계 탭 ===== */}
      {activeTab === 'stats' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">처치한 몬스터</p>
              <p className="text-xl font-bold text-red-400">
                {formatNumberWithCommas(statistics.totalMonstersKilled || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">처치한 보스</p>
              <p className="text-xl font-bold text-purple-400">
                {formatNumberWithCommas(statistics.totalBossesKilled || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">누적 데미지</p>
              <p className="text-xl font-bold text-orange-400">
                {formatNumberWithCommas(statistics.totalDamageDealt || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">획득한 골드</p>
              <p className="text-xl font-bold text-yellow-400">
                {formatNumberWithCommas(statistics.totalGoldEarned || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">획득한 아이템</p>
              <p className="text-xl font-bold text-blue-400">
                {formatNumberWithCommas(statistics.totalItemsFound || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">완성한 세트</p>
              <p className="text-xl font-bold text-cyan-400">
                {completedSets.length}개
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">만난 희귀 몬스터</p>
              <p className="text-xl font-bold text-pink-400">
                {formatNumberWithCommas(statistics.rareMonstersMet || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">수집한 희귀 몬스터</p>
              <p className="text-xl font-bold text-pink-400">
                {formatNumberWithCommas(statistics.rareMonstersCaptured || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">각인한 몬스터</p>
              <p className="text-xl font-bold text-cyan-400">
                {Object.keys(inscribedMonsters).length}마리
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 각인 확인 모달 */}
      {inscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setInscribeModal(null)}>
          <div className="bg-gray-800 border-2 border-cyan-500 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">📚 몬스터 각인</h3>

            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="flex items-center justify-center gap-3 mb-3">
                <MonsterImage
                  floorStart={inscribeModal.monster.zone}
                  monsterIndex={inscribeModal.monster.index === 10 ? 'boss' : inscribeModal.monster.index}
                  isBoss={inscribeModal.monster.index === 10}
                  isUnlocked={true}
                  isRare={inscribeModal.monster.grade === 'rare'}
                  isLegendary={inscribeModal.monster.grade === 'legendary'}
                  size="lg"
                />
                <div>
                  <p className={`text-lg font-bold ${getGradeColor(inscribeModal.monster.grade)}`}>
                    {inscribeModal.monster.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {MONSTER_GRADES[inscribeModal.monster.grade].icon} {MONSTER_GRADES[inscribeModal.monster.grade].name} • {inscribeModal.monster.zone}층
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 text-center mb-2">
                이 몬스터를 각인하면 도감에서 사라지고,
              </p>
              <p className="text-sm text-gray-300 text-center mb-4">
                <span className="text-cyan-400 font-bold">{MONSTER_SETS[inscribeModal.setId].name}</span> 세트 진행도가 증가합니다.
              </p>

              <div className="bg-cyan-900/30 border border-cyan-500 rounded-lg p-3">
                <p className="text-center font-bold text-yellow-300 text-sm mb-1">
                  세트 효과
                </p>
                <p className="text-center text-cyan-400">
                  {SET_EFFECT_TYPES[MONSTER_SETS[inscribeModal.setId].effect.type].icon}{' '}
                  {SET_EFFECT_TYPES[MONSTER_SETS[inscribeModal.setId].effect.type].name}{' '}
                  +{MONSTER_SETS[inscribeModal.setId].effect.value}{SET_EFFECT_TYPES[MONSTER_SETS[inscribeModal.setId].effect.type].suffix}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setInscribeModal(null)}
                className="flex-1 py-2 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmInscribe}
                className="flex-1 py-2 rounded font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transition-colors shadow-lg"
              >
                📚 각인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과 모달 */}
      {resultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setResultModal(null)}>
          <div className={`bg-gray-800 border-2 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl ${
            resultModal.success ? 'border-green-500' : 'border-red-500'
          }`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 text-center ${
              resultModal.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {resultModal.success ? '✅ 각인 완료!' : '❌ 각인 실패'}
            </h3>

            <p className="text-center text-white mb-4">{resultModal.message}</p>

            {resultModal.setCompleted && (
              <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-3 mb-4 border border-yellow-500">
                <p className="text-center font-bold text-yellow-300 mb-2">🎉 세트 완성!</p>
                <p className="text-center text-white">
                  {SET_EFFECT_TYPES[resultModal.effectType].icon}{' '}
                  {SET_EFFECT_TYPES[resultModal.effectType].name}{' '}
                  <span className="text-green-400 font-bold">+{resultModal.effectValue}{SET_EFFECT_TYPES[resultModal.effectType].suffix}</span>
                </p>
              </div>
            )}

            <button
              onClick={() => setResultModal(null)}
              className="w-full py-2 rounded font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
