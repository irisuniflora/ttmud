import React, { useState } from 'react';
import { GameProvider, useGame } from './store/GameContext';
import PlayerInfo from './components/Player/PlayerInfo';
import StatsList from './components/Player/StatsList';
import HeroList from './components/Heroes/HeroList';
import Inventory from './components/Inventory/Inventory';
import SkillTree from './components/SkillTree/SkillTree';
import Collection from './components/Collection/Collection';
import CombatLog from './components/Combat/CombatLog';

const GameContent = () => {
  const { gameState, isRunning, togglePause, saveGame, resetGame, prestige } = useGame();
  const [activeTab, setActiveTab] = useState('heroes');

  const handlePrestige = () => {
    if (gameState.player.stage < 50) {
      alert('환생하려면 스테이지 50 이상 도달해야 합니다!');
      return;
    }
    
    if (window.confirm(`환생하시겠습니까?\n\n획득할 PP: ${Math.floor(gameState.player.stage / 10)}\n\n게임이 처음부터 시작되지만 더 강해집니다!`)) {
      prestige();
    }
  };

  return (
    <div className="h-screen bg-game-bg text-gray-100 p-4 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-game-panel border border-game-border rounded-lg p-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Tap Titans MUD
            </h1>
            <p className="text-sm text-gray-400 font-semibold">방치형 텍스트 RPG</p>
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
              ✨ 환생
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
                👥 영웅
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
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded font-bold transition-all ${
                  activeTab === 'logs'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                📋 로그
              </button>
            </div>

            {/* 탭 컨텐츠 - 이 영역만 스크롤 */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'heroes' && <HeroList />}
              {activeTab === 'inventory' && <Inventory />}
              {activeTab === 'skills' && <SkillTree />}
              {activeTab === 'collection' && <Collection />}
              {activeTab === 'logs' && <CombatLog />}
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
