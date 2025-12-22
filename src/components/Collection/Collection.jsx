import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { FLOOR_RANGES, getCollectionBonus, getBossCollectionBonus } from '../../data/monsters';
import { formatNumberWithCommas } from '../../utils/formatter';

// 몬스터 이미지 컴포넌트
const MonsterImage = ({ floorStart, monsterIndex, isBoss = false, isUnlocked = false, isRare = false, isLegendary = false, size = 'md' }) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  const imagePath = isBoss
    ? `/images/field/monsters/floor_${floorStart}/boss.png`
    : `/images/field/monsters/floor_${floorStart}/${monsterIndex}.png`;

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
  const { gameState, releaseMonster, releaseAllMonsters, unlockMonsterWithTicket, engine } = useGame();
  const { collection, statistics, consumables = {} } = gameState;
  const [activeTab, setActiveTab] = useState('monsters');
  const [releaseModal, setReleaseModal] = useState(null); // { monsterId, monsterName, type }
  const [resultModal, setResultModal] = useState(null); // { success, message, damageBonus, dropRateBonus }
  const [selectionModal, setSelectionModal] = useState(false); // 선택권 사용 모달
  const [selectionResult, setSelectionResult] = useState(null); // 선택 결과 모달
  const [releaseAllModal, setReleaseAllModal] = useState(false); // 모두 방생 확인 모달

  // 방생 확인 모달 열기
  const handleReleaseClick = (monsterId, monsterName, type) => {
    setReleaseModal({ monsterId, monsterName, type });
  };

  // 방생 실행
  const confirmRelease = () => {
    if (!releaseModal) return;

    const { monsterId, type } = releaseModal;
    const result = releaseMonster(monsterId, type);

    setReleaseModal(null);
    setResultModal(result);
  };

  // 몬스터 선택권 사용
  const handleMonsterSelect = (monsterId, type, monsterName) => {
    const result = unlockMonsterWithTicket(monsterId, type, monsterName);
    setSelectionModal(false);
    setSelectionResult(result);
  };

  // 모두 방생 실행
  const confirmReleaseAll = () => {
    const result = releaseAllMonsters();
    setReleaseAllModal(false);
    setResultModal(result);
  };

  // 방생 정보 가져오기
  const releaseData = collection.release || {
    releasedMonsters: {},
    totalRareReleased: 0,
    totalLegendaryReleased: 0
  };

  // 엔터키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (selectionResult) {
          setSelectionResult(null);
        } else if (resultModal) {
          setResultModal(null);
        } else if (releaseModal) {
          confirmRelease();
        }
      } else if (e.key === 'Escape') {
        if (selectionModal) {
          setSelectionModal(false);
        } else if (releaseModal) {
          setReleaseModal(null);
        }
      }
    };

    if (releaseModal || resultModal || selectionModal || selectionResult) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [releaseModal, resultModal, selectionModal, selectionResult]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-100">도감</h3>

      {/* 탭 선택 */}
      <div className="flex gap-2">
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

      {/* 방생 시스템 안내 */}
      {activeTab === 'monsters' && (
        <div className="space-y-3">
          {/* 몬스터 선택권 버튼 (있는 경우에만) */}
          {consumables.monster_selection_ticket > 0 && (
            <div className="bg-gradient-to-r from-orange-900 to-yellow-900 border border-orange-500 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-1">📜 몬스터 도감 선택권</h4>
                  <p className="text-xs text-gray-200">보유: <span className="text-orange-400 font-bold">{consumables.monster_selection_ticket}개</span></p>
                </div>
                <button
                  onClick={() => setSelectionModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 border border-orange-400 rounded font-bold text-white transition-colors shadow-lg"
                >
                  몬스터 선택
                </button>
              </div>
            </div>
          )}

          {/* 방생 시스템 박스 + 모두 방생 버튼 통합 */}
          <div className="bg-gradient-to-r from-purple-900 to-orange-900 border border-purple-500 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-yellow-400 mb-2">🐧 방생 시스템</h4>
                <div className="text-xs text-gray-200 space-y-1">
                  <p>• <span className="text-purple-400 font-bold">💎 레어</span>와 <span className="text-orange-400 font-bold">👑 전설</span> 몬스터를 수집하면 이름 옆에 아이콘이 표시됩니다</p>
                  <p>• 각 몬스터는 레어와 전설 각각 <span className="text-yellow-400 font-bold">1회</span> 방생 가능</p>
                  <p>• 방생하면 해당 구간에서 <span className="text-red-400 font-bold">데미지</span>와 <span className="text-green-400 font-bold">드랍율</span>이 영구 증가</p>
                  <p>• 레어: <span className="text-purple-400">+5%</span> | 전설: <span className="text-orange-400">+20%</span></p>
                </div>
              </div>
              <button
                onClick={() => setReleaseAllModal(true)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 border border-yellow-400 rounded font-bold text-white transition-colors shadow-lg whitespace-nowrap"
              >
                🕊️ 모두 방생
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 누적 방생 통계 */}
      {activeTab === 'monsters' && (releaseData.totalRareReleased > 0 || releaseData.totalLegendaryReleased > 0) && (
        <div className="bg-gray-800 border border-yellow-500 rounded-lg p-3">
          <h4 className="text-sm font-bold text-yellow-400 mb-2">🕊️ 누적 방생</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-300">레어: </span>
              <span className="text-purple-400 font-bold">{releaseData.totalRareReleased}마리</span>
              {releaseData.totalRareReleased >= 5 && (
                <span className="text-green-400 ml-1">(레어 출현율 증가)</span>
              )}
            </div>
            <div>
              <span className="text-gray-300">전설: </span>
              <span className="text-orange-400 font-bold">{releaseData.totalLegendaryReleased}마리</span>
              {releaseData.totalLegendaryReleased >= 5 && (
                <span className="text-green-400 ml-1">(전설 출현율 증가)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 몬스터 도감 - 2열 레이아웃 */}
      {activeTab === 'monsters' && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(FLOOR_RANGES).map(([floorStart, data]) => {
            const floor = parseInt(floorStart);

            // 희귀 + 전설 수집 진행도 계산
            let rareCollected = 0;
            let legendaryCollected = 0;
            let rareReleased = 0;
            let legendaryReleased = 0;

            data.monsters.forEach((_, idx) => {
              const rareId = `rare_${floor}_${idx}`;
              const legendaryId = `legendary_${floor}_${idx}`;

              if (collection.rareMonsters?.[rareId]?.unlocked) rareCollected++;
              if (collection.legendaryMonsters?.[legendaryId]?.unlocked) legendaryCollected++;
              if (releaseData.releasedMonsters?.[rareId]) rareReleased++;
              if (releaseData.releasedMonsters?.[legendaryId]) legendaryReleased++;
            });

            // 보너스 계산
            const rareBonus = getCollectionBonus(rareCollected, 10);
            // 전설 보너스: 2셋 -2, 5셋 -5, 10셋 -13 (누적: 2셋 -2, 5셋 -7, 10셋 -20)
            const legendaryBonus = {
              monsterReduction: legendaryCollected >= 10 ? 20 : legendaryCollected >= 5 ? 7 : legendaryCollected >= 2 ? 2 : 0
            };

            // 방생 보너스 계산
            const releaseBonus = engine ? engine.calculateReleaseBonus(floor) : { damageBonus: 0, dropRateBonus: 0 };

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
                    {(rareReleased > 0 || legendaryReleased > 0) && (
                      <p className="text-[9px] text-yellow-400 mt-0.5">
                        방생: +{releaseBonus.damageBonus}% 뎀, +{releaseBonus.dropRateBonus}%p 드랍
                      </p>
                    )}
                  </div>
                  {/* 세트효과 - 더 눈에 띄게 */}
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">
                      총 -{rareBonus.monsterReduction + legendaryBonus.monsterReduction}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      (레어 -{rareBonus.monsterReduction} / 전설 -{legendaryBonus.monsterReduction})
                    </p>
                  </div>
                </div>

                {/* 몬스터 그리드 (5x2) - 이미지 기반 */}
                <div className="grid grid-cols-5 gap-1.5">
                  {data.monsters.map((monsterName, idx) => {
                    const rareId = `rare_${floor}_${idx}`;
                    const legendaryId = `legendary_${floor}_${idx}`;

                    const rareUnlocked = collection.rareMonsters?.[rareId]?.unlocked;
                    const rareReleaseData = releaseData.releasedMonsters?.[rareId];
                    const rareReleaseCount = rareReleaseData?.releaseCount || 0;

                    const legendaryUnlocked = collection.legendaryMonsters?.[legendaryId]?.unlocked;
                    const legendaryReleaseData = releaseData.releasedMonsters?.[legendaryId];
                    const legendaryReleaseCount = legendaryReleaseData?.releaseCount || 0;

                    // 방생 가능 여부 (최대 1회) - 개별적으로 방생 가능
                    const canReleaseRare = rareUnlocked && rareReleaseCount < 1;
                    const canReleaseLegendary = legendaryUnlocked && legendaryReleaseCount < 1;

                    // 하나라도 수집했는지
                    const anyUnlocked = rareUnlocked || legendaryUnlocked || rareReleaseCount > 0 || legendaryReleaseCount > 0;

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
                            rareUnlocked ? 'bg-purple-600' : 'bg-gray-800'
                          }`}>
                            {rareUnlocked ? '💎' : '-'}
                          </div>
                          <div className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${
                            legendaryUnlocked ? 'bg-orange-600' : 'bg-gray-800'
                          }`}>
                            {legendaryUnlocked ? '👑' : '-'}
                          </div>
                        </div>

                        {/* 방생 상태 / 버튼 */}
                        <div className="space-y-0.5">
                          {/* 방생된 펭귄 표시 */}
                          {(rareReleaseCount > 0 || legendaryReleaseCount > 0) && (
                            <div className="flex justify-center gap-0.5">
                              {rareReleaseCount > 0 && (
                                <span className="text-[10px] bg-purple-800 rounded px-1">🐧</span>
                              )}
                              {legendaryReleaseCount > 0 && (
                                <span className="text-[10px] bg-orange-800 rounded px-1">🐧</span>
                              )}
                            </div>
                          )}

                          {/* 방생 버튼 */}
                          {canReleaseLegendary && (
                            <button
                              onClick={() => handleReleaseClick(legendaryId, monsterName, 'legendary')}
                              className="w-full bg-orange-600 hover:bg-orange-500 rounded text-[8px] font-bold py-0.5"
                              title="전설 방생"
                            >
                              ⭐ 방생
                            </button>
                          )}
                          {canReleaseRare && (
                            <button
                              onClick={() => handleReleaseClick(rareId, monsterName, 'rare')}
                              className="w-full bg-purple-600 hover:bg-purple-500 rounded text-[8px] font-bold py-0.5"
                              title="레어 방생"
                            >
                              💎 방생
                            </button>
                          )}
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

      {/* 보스 도감 */}
      {activeTab === 'bosses' && (() => {
        // 전체 보스 수집 카운트
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

            {/* 보스 목록 - 4열 (이미지 기반) */}
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

      {/* 통계 */}
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
              <p className="text-sm text-gray-300">획득한 영웅 카드</p>
              <p className="text-xl font-bold text-green-400">
                {formatNumberWithCommas(statistics.totalHeroCardsFound || 0)}
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
              <p className="text-sm text-gray-300">방생한 희귀 몬스터</p>
              <p className="text-xl font-bold text-purple-400">
                {formatNumberWithCommas(releaseData.totalRareReleased || 0)}
              </p>
            </div>
            <div className="bg-game-panel border border-game-border rounded p-3">
              <p className="text-sm text-gray-300">방생한 전설 몬스터</p>
              <p className="text-xl font-bold text-orange-400">
                {formatNumberWithCommas(releaseData.totalLegendaryReleased || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 방생 확인 모달 */}
      {releaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setReleaseModal(null)}>
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🕊️ 방생 확인</h3>

            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <p className="text-center text-lg font-bold text-white mb-3">
                {releaseModal.monsterName}
              </p>
              <p className="text-sm text-gray-300 text-center mb-2">
                방생하면 도감에서 사라지고 세트 효과도 사라지지만,
              </p>
              <p className="text-sm text-gray-300 text-center mb-4">
                해당 구간에서 데미지와 드랍율이 <span className="text-green-400 font-bold">영구적으로</span> 증가합니다.
              </p>

              <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-3 border border-purple-500">
                <p className="text-center font-bold text-yellow-300">
                  {releaseModal.type === 'rare' ? '희귀 방생 보너스' : '전설 방생 보너스'}
                </p>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-300">데미지</p>
                    <p className="text-lg font-bold text-red-400">+{releaseModal.type === 'rare' ? '5' : '20'}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-300">드랍율</p>
                    <p className="text-lg font-bold text-green-400">+{releaseModal.type === 'rare' ? '5' : '20'}%p</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReleaseModal(null)}
                className="flex-1 py-2 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmRelease}
                className="flex-1 py-2 rounded font-bold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white transition-colors shadow-lg"
              >
                🕊️ 방생하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 몬스터 선택 모달 */}
      {selectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setSelectionModal(false)}>
          <div className="bg-gray-800 border-2 border-orange-500 rounded-lg p-6 max-w-4xl w-full mx-4 my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-orange-400 mb-4 text-center">📜 몬스터 도감 선택</h3>
            <p className="text-sm text-center text-gray-300 mb-4">원하는 몬스터를 선택하면 도감에 등록됩니다</p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(FLOOR_RANGES).map(([floorStart, data]) => {
                const floor = parseInt(floorStart);
                return (
                  <div key={floor} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-cyan-400 mb-2">{data.name}</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {data.monsters.map((monsterName, idx) => {
                        const rareId = `rare_${floor}_${idx}`;
                        const legendaryId = `legendary_${floor}_${idx}`;
                        const rareUnlocked = collection.rareMonsters?.[rareId]?.unlocked;
                        const legendaryUnlocked = collection.legendaryMonsters?.[legendaryId]?.unlocked;

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="bg-gray-800 border border-gray-700 rounded p-2 text-center">
                              <p className="text-[10px] font-bold text-gray-300 mb-1">{monsterName}</p>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleMonsterSelect(rareId, 'rare', monsterName)}
                                  disabled={rareUnlocked}
                                  className={`w-full text-[9px] py-1 rounded font-bold ${
                                    rareUnlocked
                                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                                  }`}
                                >
                                  {rareUnlocked ? '💎 보유중' : '💎 레어'}
                                </button>
                                <button
                                  onClick={() => handleMonsterSelect(legendaryId, 'legendary', monsterName)}
                                  disabled={legendaryUnlocked}
                                  className={`w-full text-[9px] py-1 rounded font-bold ${
                                    legendaryUnlocked
                                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                                  }`}
                                >
                                  {legendaryUnlocked ? '👑 보유중' : '👑 전설'}
                                </button>
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

            <button
              onClick={() => setSelectionModal(false)}
              className="w-full mt-4 py-2 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 선택 결과 모달 */}
      {selectionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setSelectionResult(null)}>
          <div className={`bg-gray-800 border-2 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl ${
            selectionResult.success ? 'border-green-500' : 'border-red-500'
          }`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 text-center ${
              selectionResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectionResult.success ? '✅ 등록 완료!' : '❌ 등록 실패'}
            </h3>
            <p className="text-center text-white mb-4">{selectionResult.message}</p>
            <button
              onClick={() => setSelectionResult(null)}
              className="w-full py-2 rounded font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 방생 결과 모달 */}
      {resultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setResultModal(null)}>
          <div className={`bg-gray-800 border-2 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl ${
            resultModal.success ? 'border-green-500' : 'border-red-500'
          }`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 text-center ${
              resultModal.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {resultModal.success ? '✅ 방생 완료!' : '❌ 방생 실패'}
            </h3>

            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <p className="text-center text-white mb-4">
                {resultModal.message}
              </p>

              {resultModal.success && (
                <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-3 border border-purple-500">
                  <p className="text-center font-bold text-yellow-300 mb-2">획득한 보너스</p>
                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-300">데미지</p>
                      <p className="text-lg font-bold text-red-400">+{resultModal.damageBonus}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">드랍율</p>
                      <p className="text-lg font-bold text-green-400">+{resultModal.dropRateBonus}%p</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setResultModal(null)}
              className="w-full py-2 rounded font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 모두 방생 확인 모달 */}
      {releaseAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setReleaseAllModal(false)}>
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🕊️ 모두 방생 확인</h3>

            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
              <p className="text-sm text-gray-300 text-center mb-3">
                방생 가능한 <span className="text-yellow-400 font-bold">모든 몬스터</span>를 한번에 방생합니다.
              </p>
              <p className="text-sm text-gray-300 text-center mb-3">
                각 몬스터당 1회씩 방생되며, 전설이 우선 방생됩니다.
              </p>
              <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-3 border border-purple-500">
                <p className="text-center text-xs text-gray-300 mb-2">예상 보너스</p>
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-300">레어 1마리당</p>
                    <p className="text-sm font-bold text-purple-400">+5% / +5%p</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-300">전설 1마리당</p>
                    <p className="text-sm font-bold text-orange-400">+20% / +20%p</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReleaseAllModal(false)}
                className="flex-1 py-2 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmReleaseAll}
                className="flex-1 py-2 rounded font-bold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white transition-colors shadow-lg"
              >
                🕊️ 모두 방생
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
