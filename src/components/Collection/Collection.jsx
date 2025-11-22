import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { FLOOR_RANGES, getCollectionBonus } from '../../data/monsters';
import { formatNumberWithCommas } from '../../utils/formatter';

const Collection = () => {
  const { gameState, releaseMonster, engine } = useGame();
  const { collection, statistics } = gameState;
  const [activeTab, setActiveTab] = useState('monsters');
  const [releaseModal, setReleaseModal] = useState(null); // { monsterId, monsterName, type }
  const [resultModal, setResultModal] = useState(null); // { success, message, damageBonus, dropRateBonus }

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

  // 방생 정보 가져오기
  const releaseData = collection.release || {
    releasedMonsters: {},
    totalRareReleased: 0,
    totalLegendaryReleased: 0
  };

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
        <div className="bg-gradient-to-r from-purple-900 to-orange-900 border border-purple-500 rounded-lg p-3">
          <h4 className="text-sm font-bold text-yellow-400 mb-2">🐧 방생 시스템</h4>
          <div className="text-xs text-gray-200 space-y-1">
            <p>• 각 몬스터는 <span className="text-purple-400 font-bold">레어</span>와 <span className="text-orange-400 font-bold">전설</span> 각각 <span className="text-yellow-400 font-bold">최대 3회</span>까지 방생 가능</p>
            <p>• 방생하면 해당 구간에서 <span className="text-red-400 font-bold">데미지</span>와 <span className="text-green-400 font-bold">드랍율</span>이 영구 증가</p>
            <p>• 레어: 1회당 <span className="text-purple-400">+5%</span> (최대 +15%) | 전설: 1회당 <span className="text-orange-400">+20%</span> (최대 +60%)</p>
            <p>• 방생 횟수는 펭귄(🐧)으로 표시됩니다</p>
            <p>• 전설이 수집되어 있으면 전설을 먼저 방생해야 레어 방생 가능</p>
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

      {/* 몬스터 도감 - 레어/전설 통합 */}
      {activeTab === 'monsters' && (
        <div className="space-y-4">
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
            const legendaryBonus = {
              monsterReduction: legendaryCollected >= 10 ? 10 : legendaryCollected >= 5 ? 5 : legendaryCollected >= 2 ? 2 : legendaryCollected
            };

            // 방생 보너스 계산
            const releaseBonus = engine ? engine.calculateReleaseBonus(floor) : { damageBonus: 0, dropRateBonus: 0 };

            return (
              <div key={floor} className="bg-game-panel border border-game-border rounded-lg p-3">
                {/* 던전 제목 */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-cyan-400">
                      {data.name}
                    </h4>
                    <div className="flex items-center gap-3">
                      {/* 레어 도감 */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-purple-400">레어: {rareCollected}/10</span>
                      </div>
                      {/* 전설 도감 */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-orange-400">전설: {legendaryCollected}/10</span>
                      </div>
                    </div>
                    {(rareReleased > 0 || legendaryReleased > 0) && (
                      <p className="text-[10px] text-yellow-400">
                        방생 보너스: +{releaseBonus.damageBonus}% 데미지, +{releaseBonus.dropRateBonus}%p 드랍
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-right space-y-1">
                    <p className="text-gray-400 text-[9px]">
                      몬스터 감소:
                      <span className="text-purple-400 font-bold ml-1">레어 -{rareBonus.monsterReduction}</span>
                      <span className="text-orange-400 font-bold ml-1">전설 -{legendaryBonus.monsterReduction}</span>
                    </p>
                    <p className="text-green-400 font-bold text-[10px]">
                      총 감소: -{rareBonus.monsterReduction + legendaryBonus.monsterReduction}
                    </p>
                    <p className="text-gray-500 text-[8px]">
                      (2셋: -1, 5셋: -3, 10셋: -8)
                    </p>
                  </div>
                </div>

                {/* 몬스터 그리드 (5x2) - 각 몬스터당 희귀/전설 2칸 구조 */}
                <div className="grid grid-cols-5 gap-1">
                  {data.monsters.map((monsterName, idx) => {
                    const rareId = `rare_${floor}_${idx}`;
                    const legendaryId = `legendary_${floor}_${idx}`;

                    const rareUnlocked = collection.rareMonsters?.[rareId]?.unlocked;
                    const rareReleaseData = releaseData.releasedMonsters?.[rareId];
                    const rareReleaseCount = rareReleaseData?.releaseCount || 0;

                    const legendaryUnlocked = collection.legendaryMonsters?.[legendaryId]?.unlocked;
                    const legendaryReleaseData = releaseData.releasedMonsters?.[legendaryId];
                    const legendaryReleaseCount = legendaryReleaseData?.releaseCount || 0;

                    // 방생 가능 여부
                    const canReleaseRare = rareUnlocked && rareReleaseCount < 3 && (!legendaryUnlocked || legendaryReleaseCount >= rareReleaseCount + 1);
                    const canReleaseLegendary = legendaryUnlocked && legendaryReleaseCount < 3;

                    return (
                      <div key={idx} className="space-y-0.5">
                        {/* 몬스터 이름 칸 + 펭귄 아이콘 */}
                        <div className="bg-gray-800 border border-gray-700 rounded p-1 text-center">
                          <p className="text-[9px] font-bold text-gray-300 truncate mb-0.5">
                            {(rareUnlocked || rareReleaseCount > 0 || legendaryUnlocked || legendaryReleaseCount > 0) ? monsterName : '???'}
                          </p>
                          {/* 펭귄 아이콘 표시 */}
                          <div className="flex items-center justify-center gap-0.5">
                            {/* 레어 펭귄 */}
                            {rareReleaseCount > 0 && (
                              <div className="flex gap-0.5 border border-purple-500 rounded px-0.5">
                                {[...Array(rareReleaseCount)].map((_, i) => (
                                  <span key={`rare-${i}`} className="text-[10px]">🐧</span>
                                ))}
                              </div>
                            )}
                            {/* 전설 펭귄 */}
                            {legendaryReleaseCount > 0 && (
                              <div className="flex gap-0.5 border border-orange-500 rounded px-0.5">
                                {[...Array(legendaryReleaseCount)].map((_, i) => (
                                  <span key={`legendary-${i}`} className="text-[10px]">🐧</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 레어 / 전설 2칸 */}
                        <div className="flex gap-0.5">
                          {/* 레어 칸 */}
                          <div className="flex-1 flex flex-col gap-0.5">
                            <div className={`flex-1 border rounded p-0.5 text-center ${
                              rareUnlocked ? 'bg-purple-900 border-purple-500' :
                              rareReleaseCount > 0 ? 'bg-purple-900/50 border-purple-600' :
                              'bg-gray-900 border-gray-700'
                            }`}>
                              <div className="flex items-center justify-center gap-0.5">
                                <p className={`text-[8px] font-bold ${
                                  rareUnlocked ? 'text-purple-400' :
                                  rareReleaseCount > 0 ? 'text-purple-300' :
                                  'text-gray-600'
                                }`}>
                                  {rareUnlocked ? '레어' : rareReleaseCount > 0 ? '방생' : '-'}
                                </p>
                                {rareReleaseCount > 0 && (
                                  <span className="text-[10px]">
                                    {'🐧'.repeat(rareReleaseCount)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {canReleaseRare && (
                              <button
                                onClick={() => handleReleaseClick(rareId, monsterName, 'rare')}
                                className="w-full bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded flex items-center justify-center text-[9px] py-0.5 transition-transform hover:scale-105"
                                title={`레어 방생 (${rareReleaseCount + 1}/3회) (+5% 데미지, +5%p 드랍)`}
                              >
                                🕊️
                              </button>
                            )}
                          </div>

                          {/* 전설 칸 */}
                          <div className="flex-1 flex flex-col gap-0.5">
                            <div className={`flex-1 border rounded p-0.5 text-center ${
                              legendaryUnlocked ? 'bg-orange-900 border-orange-500' :
                              legendaryReleaseCount > 0 ? 'bg-orange-900/50 border-orange-600' :
                              'bg-gray-900 border-gray-700'
                            }`}>
                              <div className="flex items-center justify-center gap-0.5">
                                <p className={`text-[8px] font-bold ${
                                  legendaryUnlocked ? 'text-orange-400' :
                                  legendaryReleaseCount > 0 ? 'text-orange-300' :
                                  'text-gray-600'
                                }`}>
                                  {legendaryUnlocked ? '전설' : legendaryReleaseCount > 0 ? '방생' : '-'}
                                </p>
                                {legendaryReleaseCount > 0 && (
                                  <span className="text-[10px]">
                                    {'🐧'.repeat(legendaryReleaseCount)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {canReleaseLegendary && (
                              <button
                                onClick={() => handleReleaseClick(legendaryId, monsterName, 'legendary')}
                                className="w-full bg-orange-600 hover:bg-orange-700 border border-orange-500 rounded flex items-center justify-center text-[9px] py-0.5 transition-transform hover:scale-105"
                                title={`전설 방생 (${legendaryReleaseCount + 1}/3회) (+20% 데미지, +20%p 드랍)`}
                              >
                                🕊️
                              </button>
                            )}
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

      {/* 보스 도감 */}
      {activeTab === 'bosses' && (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm font-bold">
            보스 도감 (희귀 🌸 / 전설 ⭐)
          </p>

          <div className="grid grid-cols-4 gap-2">
            {Object.entries(FLOOR_RANGES).map(([floorStart, data]) => {
              const floor = parseInt(floorStart);
              const rareBossId = `rare_boss_${floor}`;
              const legendaryBossId = `legendary_boss_${floor}`;

              const rareUnlocked = collection.rareBosses?.[rareBossId]?.unlocked;
              const legendaryUnlocked = collection.legendaryBosses?.[legendaryBossId]?.unlocked;

              return (
                <div key={floor} className="bg-game-panel border border-game-border rounded p-2">
                  <p className="text-[10px] text-cyan-400 font-bold mb-1">{data.name}</p>
                  <p className="text-[9px] text-gray-300 font-bold mb-1 truncate">{data.boss}</p>

                  <div className="space-y-0.5">
                    <div className={`border rounded p-1 text-center ${
                      rareUnlocked ? 'bg-pink-900 border-pink-500' : 'bg-gray-900 border-gray-700'
                    }`}>
                      <p className={`text-[8px] font-bold ${
                        rareUnlocked ? 'text-pink-400' : 'text-gray-600'
                      }`}>
                        {rareUnlocked ? '희귀 보스!' : '-'}
                      </p>
                    </div>

                    <div className={`border rounded p-1 text-center ${
                      legendaryUnlocked ? 'bg-orange-900 border-orange-500' : 'bg-gray-900 border-gray-700'
                    }`}>
                      <p className={`text-[8px] font-bold ${
                        legendaryUnlocked ? 'text-orange-400' : 'text-gray-600'
                      }`}>
                        {legendaryUnlocked ? '전설 보스!' : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Collection;
