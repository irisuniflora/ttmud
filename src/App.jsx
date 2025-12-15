import React, { useState } from 'react';
import { GameProvider, useGame } from './store/GameContext';
import PlayerInfo from './components/Player/PlayerInfo';
import StatsList from './components/Player/StatsList';
import HeroList from './components/Heroes/HeroList';
import NewEquipment from './components/Equipment/NewEquipment';
import Consumables from './components/Inventory/Consumables';
import SkillTree from './components/SkillTree/SkillTree';
import Collection from './components/Collection/Collection';
import SealedZone from './components/SealedZone/SealedZone';
import BossCoinShop from './components/SealedZone/BossCoinShop';
// import WorldBoss from './components/WorldBoss/WorldBoss'; // 월드보스 시스템 비활성화
import PrestigeRelics from './components/Prestige/PrestigeRelics';

const GameContent = () => {
  const { gameState, isRunning, togglePause, saveGame, resetGame, prestige } = useGame();
  const [activeTab, setActiveTab] = useState('heroes');
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

  const handlePrestige = () => {
    if (gameState.player.floor < 50) {
      alert('환생하려면 50층 이상 도달해야 합니다!');
      return;
    }

    // 유물 조각 획득 공식 계산
    const floor = gameState.player.floor;
    const baseFragments = 5;
    const floorBonus = Math.floor(floor / 20);
    const highFloorBonus = floor > 100 ? Math.floor((floor - 100) / 10) : 0;
    const fragmentsGained = baseFragments + floorBonus + highFloorBonus;

    if (window.confirm(`환생하시겠습니까?\n\n획득할 유물 조각: 💎 ${fragmentsGained}개\n\n게임이 처음부터 시작되지만 더 강해집니다!`)) {
      prestige();
    }
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
              🌟 환생
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
            {/* 탭 메뉴 */}
            <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
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
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🎒 인벤토리
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
                onClick={() => setActiveTab('collection')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'collection'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                📖 도감
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
                onClick={() => setActiveTab('bossShop')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'bossShop'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🪙 보스상점
              </button>
              {/* 월드보스 탭 비활성화
              <button
                onClick={() => setActiveTab('worldBoss')}
                className={`px-4 py-2 rounded font-bold transition-all border-2 ${
                  activeTab === 'worldBoss'
                    ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg border-red-400'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
                }`}
              >
                👹 월드보스
              </button>
              */}
              <button
                onClick={() => setActiveTab('prestige')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'prestige'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                🌟 환생유물
              </button>
            </div>

            {/* 탭 컨텐츠 - 이 영역만 스크롤 */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'heroes' && <HeroList />}
              {activeTab === 'equipment' && <NewEquipment />}
              {activeTab === 'inventory' && <Consumables />}
              {activeTab === 'skills' && <SkillTree />}
              {activeTab === 'collection' && <Collection />}
              {activeTab === 'sealedZone' && <SealedZone />}
              {activeTab === 'bossShop' && <BossCoinShop />}
              {/* {activeTab === 'worldBoss' && <WorldBoss />} */}
              {activeTab === 'prestige' && <PrestigeRelics />}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <footer className="mt-4 text-center text-gray-500 text-sm font-medium flex-shrink-0">
        <p>게임은 자동으로 5초마다 저장됩니다 • Made with ❤️</p>
      </footer>
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
