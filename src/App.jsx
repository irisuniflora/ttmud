import React, { useState } from 'react';
import { GameProvider, useGame } from './store/GameContext';
import PlayerInfo from './components/Player/PlayerInfo';
import StatsList from './components/Player/StatsList';
import HeroList from './components/Heroes/HeroList';
import NewEquipment from './components/Equipment/NewEquipment';
import Achievements from './components/Achievements/Achievements';
import SkillTree from './components/SkillTree/SkillTree';
import Collection from './components/Collection/Collection';
import SealedZone from './components/SealedZone/SealedZone';
import Shop from './components/Shop/Shop';
import Chat from './components/Chat/Chat';
// import WorldBoss from './components/WorldBoss/WorldBoss'; // 월드보스 시스템 비활성화
import PrestigeRelics from './components/Prestige/PrestigeRelics';
import DevPanel from './components/DevTools/DevPanel';
import PrestigeConfirmModal from './components/UI/PrestigeConfirmModal';
import { getTotalRelicEffects } from './data/prestigeRelics';
import { MONSTER_SETS, checkSetCompletion } from './data/monsterSets';

const GameContent = () => {
  const { gameState, isRunning, togglePause, saveGame, resetGame, prestige } = useGame();

  // 각인만 하면 완성 가능한 세트가 있는지 확인
  const hasCompletableSet = () => {
    try {
      const { collection } = gameState;
      if (!collection) return false;

      const inscribedMonsters = collection.inscribedMonsters || {};
      const completedSets = collection.completedSets || [];

      // 모든 세트를 순회하며 완성 가능한 세트 찾기
      for (const setId of Object.keys(MONSTER_SETS)) {
        // 이미 완성된 세트는 스킵
        if (completedSets.includes(setId)) continue;

        const set = MONSTER_SETS[setId];
        if (!set || !set.monsters) continue;

        let allCollected = true;
        let allInscribed = true;

        for (const monster of set.monsters) {
          const monsterId = `${monster.grade}_${monster.zone}_${monster.index}`;

          // 이미 각인됨
          if (inscribedMonsters[monsterId]) {
            continue;
          }

          allInscribed = false;

          // 수집 여부 확인
          if (monster.grade === 'rare') {
            const rareId = `rare_${monster.zone}_${monster.index}`;
            if (!collection.rareMonsters?.[rareId]?.unlocked) {
              allCollected = false;
              break;
            }
          } else if (monster.grade === 'legendary') {
            const legendaryId = `legendary_${monster.zone}_${monster.index}`;
            if (!collection.legendaryMonsters?.[legendaryId]?.unlocked) {
              allCollected = false;
              break;
            }
          }
          // normal 등급은 도감 체크 없이 통과 (층수 도달로 자동 수집)
        }

        // 모든 몬스터가 수집되어 있고, 아직 전부 각인되지 않은 세트가 있음
        if (allCollected && !allInscribed) {
          return true;
        }
      }

      return false;
    } catch (e) {
      console.error('hasCompletableSet error:', e);
      return false;
    }
  };
  const [activeTab, setActiveTab] = useState('equipment');
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [prestigeFragments, setPrestigeFragments] = useState(0);
  const { combatLog = [] } = gameState;

  // 최근 로그 2개 가져오기
  const recentLogs = combatLog.slice(0, 2);

  const getLogColor = (log) => {
    if (log.type === 'gear_core') return 'text-orange-400 font-bold';
    if (log.type === 'rare_monster') return 'text-pink-400 font-bold';
    if (log.type === 'sold') return 'text-yellow-400';
    if (log.rarity === 'dark') return 'text-white font-bold';
    if (log.rarity === 'mythic') return 'text-red-400';
    if (log.rarity === 'legendary') return 'text-orange-400';
    if (log.rarity === 'unique') return 'text-yellow-400';
    if (log.rarity === 'epic') return 'text-purple-400';
    if (log.rarity === 'rare') return 'text-blue-400';
    return 'text-gray-400';
  };

  // 고대 유물 획득량 계산 함수
  // 밸런스: 36개 유물 모으려면 가챠만 약 62만개 필요
  // 50층: ~100개, 100층: ~400개, 200층: ~1500개, 500층: ~8000개
  const calculateFragments = () => {
    const floor = gameState.player.floor;
    // 기본 30 + 층수^1.5 / 5 + 고층 보너스
    const baseFragments = 30;
    const floorBonus = Math.floor(Math.pow(floor, 1.5) / 5);
    const highFloorBonus = floor > 100 ? Math.floor(Math.pow(floor - 100, 1.4) / 3) : 0;
    let fragmentsGained = baseFragments + floorBonus + highFloorBonus;

    // 유물 효과 가져오기
    const relicEffects = getTotalRelicEffects(gameState.prestigeRelics || {});

    // 반지 장비의 ppBonus 스탯 (고대 유물 획득량 증가%)
    const { equipment } = gameState;
    let ringPpBonus = 0;
    if (equipment?.ring) {
      const ppBonusStat = equipment.ring.stats?.find(s => s.id === 'ppBonus');
      if (ppBonusStat) {
        // 유물 ringPercent 보너스 적용
        const ringRelicBonus = 1 + (relicEffects.ringPercent || 0) / 100;
        ringPpBonus = ppBonusStat.value * ringRelicBonus;
      }
    }

    // 총 보너스 계산
    let totalBonus = 1;
    if (relicEffects.relicFragmentPercent > 0) {
      totalBonus += relicEffects.relicFragmentPercent / 100;
    }
    if (ringPpBonus > 0) {
      totalBonus += ringPpBonus / 100;
    }

    return Math.floor(fragmentsGained * totalBonus);
  };

  const handlePrestige = () => {
    if (gameState.player.floor < 50) {
      alert('귀환하려면 50층 이상 도달해야 합니다!');
      return;
    }

    const fragments = calculateFragments();
    setPrestigeFragments(fragments);
    setShowPrestigeModal(true);
  };

  const confirmPrestige = () => {
    setShowPrestigeModal(false);
    prestige();
  };

  return (
    <div className="h-screen bg-game-bg text-gray-100 p-4 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-game-panel border border-game-border rounded-lg p-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Abyss Walker
            </h1>
            {/* 최근 로그 표시 */}
            <div className="flex flex-col gap-0.5 text-xs max-w-md">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <span key={log.id} className={`truncate ${getLogColor(log)}`}>
                    {log.message}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">아이템 로그가 여기에 표시됩니다</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className={`px-4 py-2 rounded font-bold ${
                isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? '⏸️ 일시정지' : '▶️ 재개'}
            </button>
            <button
              onClick={saveGame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
            >
              💾 저장
            </button>
            <button
              onClick={handlePrestige}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold"
              disabled={gameState.player.stage < 50}
            >
              🌟 귀환
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold"
            >
              🔄 초기화
            </button>
          </div>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* 왼쪽 패널 - 플레이어 정보 (스크롤 없이 꽉 참) */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <PlayerInfo />
          <div className="flex-1 overflow-hidden">
            <StatsList />
          </div>
        </div>

        {/* 오른쪽 패널 - 탭 컨텐츠 */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="bg-game-panel border border-game-border rounded-lg p-4 flex flex-col overflow-hidden h-full">
            {/* 탭 메뉴 - 순서: 장비, 도감, 동료, 스킬, 유물, 봉인구역, 상점, 업적 */}
            <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
              <button
                onClick={() => setActiveTab('equipment')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'equipment'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                ⚔️ 장비
              </button>
              <button
                onClick={() => setActiveTab('collection')}
                className={`px-4 py-2 rounded font-bold transition-all relative ${
                  activeTab === 'collection'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                📖 도감
                {hasCompletableSet() && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('heroes')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'heroes'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                👥 동료
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'skills'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🌳 스킬
              </button>
              <button
                onClick={() => setActiveTab('prestige')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'prestige'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🌟 유물
              </button>
              <button
                onClick={() => setActiveTab('sealedZone')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'sealedZone'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🔒 봉인구역
              </button>
              <button
                onClick={() => setActiveTab('shop')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'shop'
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🛒 상점
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'achievements'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🏆 업적
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                💬 채팅
              </button>
              <button
                onClick={() => setActiveTab('devtools')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'devtools'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-red-800'
                }`}
              >
                🛠️ DEV
              </button>
            </div>

            {/* 탭 컨텐츠 - 이 영역만 스크롤 */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'heroes' && <HeroList />}
              {activeTab === 'equipment' && <NewEquipment />}
              {activeTab === 'achievements' && <Achievements />}
              {activeTab === 'skills' && <SkillTree />}
              {activeTab === 'collection' && <Collection />}
              {activeTab === 'sealedZone' && <SealedZone />}
              {activeTab === 'shop' && <Shop />}
              {/* {activeTab === 'worldBoss' && <WorldBoss />} */}
              {activeTab === 'prestige' && <PrestigeRelics />}
              {activeTab === 'chat' && <Chat />}
              {activeTab === 'devtools' && <DevPanel />}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <footer className="mt-4 text-center text-gray-500 text-sm font-medium flex-shrink-0">
        <p>게임은 자동으로 5초마다 저장됩니다 • Made with ❤️</p>
      </footer>

      {/* 귀환 확인 모달 */}
      <PrestigeConfirmModal
        isOpen={showPrestigeModal}
        onConfirm={confirmPrestige}
        onCancel={() => setShowPrestigeModal(false)}
        fragmentsGained={prestigeFragments}
        currentFloor={gameState.player.floor}
      />
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
