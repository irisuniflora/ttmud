import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';

const DevPanel = () => {
  const { gameState, setGameState, engine } = useGame();
  const [amounts, setAmounts] = useState({
    gold: 100000,
    tickets: 30,
    relicFragments: 100,
    bossCoins: 500,
    fragments: 1000,
    orbs: 10,
    level: 10,
    floor: 10,
    diamonds: 100,
  });

  const handleAmountChange = (key, value) => {
    setAmounts(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  // engine.state를 직접 수정하고 React 상태도 동기화
  const modifyState = (modifier) => {
    if (!engine) return;
    modifier(engine.state);
    setGameState({ ...engine.getState() });
  };

  const addResource = (type) => {
    const amount = amounts[type];
    modifyState(state => {
      switch (type) {
        case 'gold':
          state.player.gold = (state.player.gold || 0) + amount;
          break;
        case 'tickets':
          if (!state.sealedZone) state.sealedZone = {};
          state.sealedZone.tickets = (state.sealedZone.tickets || 0) + amount;
          break;
        case 'relicFragments':
          state.relicFragments = (state.relicFragments || 0) + amount;
          break;
        case 'bossCoins':
          if (!state.sealedZone) state.sealedZone = {};
          state.sealedZone.bossCoins = (state.sealedZone.bossCoins || 0) + amount;
          break;
        case 'fragments':
          state.player.fragments = (state.player.fragments || 0) + amount;
          break;
        case 'orbs':
          state.orbs = (state.orbs || 0) + amount;
          break;
        case 'level':
          state.player.level = (state.player.level || 1) + amount;
          break;
        case 'floor':
          const newFloor = Math.max(1, (state.player.floor || 1) + amount);
          state.player.floor = newFloor;
          state.player.highestFloor = Math.max(state.player.highestFloor || 1, newFloor);
          break;
        case 'diamonds':
          state.diamonds = (state.diamonds || 0) + amount;
          break;
      }
    });
  };

  const setResource = (type) => {
    const amount = amounts[type];
    modifyState(state => {
      switch (type) {
        case 'gold':
          state.player.gold = amount;
          break;
        case 'tickets':
          if (!state.sealedZone) state.sealedZone = {};
          state.sealedZone.tickets = amount;
          break;
        case 'relicFragments':
          state.relicFragments = amount;
          break;
        case 'bossCoins':
          if (!state.sealedZone) state.sealedZone = {};
          state.sealedZone.bossCoins = amount;
          break;
        case 'fragments':
          state.player.fragments = amount;
          break;
        case 'orbs':
          state.orbs = amount;
          break;
        case 'level':
          state.player.level = Math.max(1, amount);
          break;
        case 'floor':
          const newFloor = Math.max(1, amount);
          state.player.floor = newFloor;
          state.player.highestFloor = Math.max(state.player.highestFloor || 1, newFloor);
          break;
        case 'diamonds':
          state.diamonds = amount;
          break;
      }
    });
  };

  const setClassLevel = (classLevel) => {
    modifyState(state => {
      state.player.classLevel = classLevel;
    });
  };

  const resources = [
    { key: 'gold', name: '골드', icon: '💰', current: gameState.player?.gold || 0 },
    { key: 'tickets', name: '도전권', icon: '🎫', current: gameState.sealedZone?.tickets || 0 },
    { key: 'relicFragments', name: '고대 유물', icon: '🏺', current: gameState.relicFragments || 0 },
    { key: 'bossCoins', name: '보스 코인', icon: '🪙', current: gameState.sealedZone?.bossCoins || 0 },
    { key: 'fragments', name: '장비 조각', icon: '⚡', current: gameState.player?.fragments || 0 },
    { key: 'orbs', name: '카르마 오브', icon: '🔮', current: gameState.orbs || 0 },
    { key: 'level', name: '레벨', icon: '⭐', current: gameState.player?.level || 1 },
    { key: 'floor', name: '층수', icon: '🏢', current: gameState.player?.floor || 1 },
    { key: 'diamonds', name: '다이아', icon: '💎', current: gameState.diamonds || 0 },
  ];

  const quickAdd = (type, amount) => {
    setAmounts(prev => ({ ...prev, [type]: amount }));
    // 직접 호출
    modifyState(state => {
      switch (type) {
        case 'gold':
          state.player.gold = (state.player.gold || 0) + amount;
          break;
        case 'tickets':
          if (!state.sealedZone) state.sealedZone = {};
          state.sealedZone.tickets = (state.sealedZone.tickets || 0) + amount;
          break;
        case 'relicFragments':
          state.relicFragments = (state.relicFragments || 0) + amount;
          break;
        case 'bossCoins':
          if (!state.sealedZone) state.sealedZone = {};
          state.sealedZone.bossCoins = (state.sealedZone.bossCoins || 0) + amount;
          break;
        case 'fragments':
          state.player.fragments = (state.player.fragments || 0) + amount;
          break;
        case 'orbs':
          state.orbs = (state.orbs || 0) + amount;
          break;
        case 'level':
          state.player.level = (state.player.level || 1) + amount;
          break;
        case 'floor':
          const newFloor = Math.max(1, (state.player.floor || 1) + amount);
          state.player.floor = newFloor;
          state.player.highestFloor = Math.max(state.player.highestFloor || 1, newFloor);
          break;
        case 'diamonds':
          state.diamonds = (state.diamonds || 0) + amount;
          break;
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
        <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
          🛠️ 개발자 테스트 패널
        </h2>
        <p className="text-xs text-red-300 mt-1">
          테스트용입니다. 실제 게임 플레이에 사용하면 밸런스가 깨질 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {resources.map(resource => (
          <div key={resource.key} className="bg-gray-800 border border-gray-700 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-sm">{resource.icon}</span>
                <span className="font-bold text-gray-200 text-xs">{resource.name}</span>
              </div>
              <span className="text-cyan-400 font-bold text-xs">
                {resource.current.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <input
                type="number"
                value={amounts[resource.key]}
                onChange={(e) => handleAmountChange(resource.key, e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-white min-w-0"
              />
              <button
                onClick={() => addResource(resource.key)}
                className="px-1.5 py-0.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded"
              >
                +추가
              </button>
              <button
                onClick={() => setResource(resource.key)}
                className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded"
              >
                설정
              </button>
            </div>

            {/* 빠른 추가 버튼 */}
            <div className="flex gap-0.5 flex-wrap">
              {resource.key === 'gold' && (
                <>
                  <button onClick={() => quickAdd('gold', 10000)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+1만</button>
                  <button onClick={() => quickAdd('gold', 100000)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+10만</button>
                  <button onClick={() => quickAdd('gold', 1000000)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100만</button>
                </>
              )}
              {resource.key === 'tickets' && (
                <>
                  <button onClick={() => quickAdd('tickets', 10)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+10</button>
                  <button onClick={() => quickAdd('tickets', 30)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+30</button>
                  <button onClick={() => quickAdd('tickets', 100)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100</button>
                </>
              )}
              {resource.key === 'relicFragments' && (
                <>
                  <button onClick={() => quickAdd('relicFragments', 50)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+50</button>
                  <button onClick={() => quickAdd('relicFragments', 100)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100</button>
                  <button onClick={() => quickAdd('relicFragments', 500)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+500</button>
                </>
              )}
              {resource.key === 'bossCoins' && (
                <>
                  <button onClick={() => quickAdd('bossCoins', 100)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100</button>
                  <button onClick={() => quickAdd('bossCoins', 500)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+500</button>
                  <button onClick={() => quickAdd('bossCoins', 1000)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+1000</button>
                </>
              )}
              {resource.key === 'fragments' && (
                <>
                  <button onClick={() => quickAdd('fragments', 100)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100</button>
                  <button onClick={() => quickAdd('fragments', 500)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+500</button>
                  <button onClick={() => quickAdd('fragments', 1000)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+1000</button>
                </>
              )}
              {resource.key === 'orbs' && (
                <>
                  <button onClick={() => quickAdd('orbs', 5)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+5</button>
                  <button onClick={() => quickAdd('orbs', 10)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+10</button>
                  <button onClick={() => quickAdd('orbs', 50)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+50</button>
                </>
              )}
              {resource.key === 'level' && (
                <>
                  <button onClick={() => quickAdd('level', 10)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+10</button>
                  <button onClick={() => quickAdd('level', 50)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+50</button>
                  <button onClick={() => quickAdd('level', 100)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100</button>
                </>
              )}
              {resource.key === 'floor' && (
                <>
                  <button onClick={() => quickAdd('floor', 10)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+10</button>
                  <button onClick={() => quickAdd('floor', 50)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+50</button>
                  <button onClick={() => quickAdd('floor', 100)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100</button>
                </>
              )}
              {resource.key === 'diamonds' && (
                <>
                  <button onClick={() => quickAdd('diamonds', 50)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+50</button>
                  <button onClick={() => quickAdd('diamonds', 100)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+100</button>
                  <button onClick={() => quickAdd('diamonds', 500)} className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-[10px] rounded">+500</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 소비 아이템 */}
      <div className="bg-gray-800 border border-cyan-500 rounded-lg p-3">
        <h3 className="font-bold text-cyan-400 mb-2">📦 소비 아이템</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {/* 각성석 */}
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">✨ 각성석</span>
              <span className="text-purple-400 text-xs font-bold">{gameState.consumables?.awakening_stone || 0}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => modifyState(s => {
                  if (!s.consumables) s.consumables = {};
                  s.consumables.awakening_stone = (s.consumables.awakening_stone || 0) + 10;
                })}
                className="flex-1 px-1 py-0.5 bg-purple-600 hover:bg-purple-500 text-[10px] rounded"
              >+10</button>
              <button
                onClick={() => modifyState(s => {
                  if (!s.consumables) s.consumables = {};
                  s.consumables.awakening_stone = (s.consumables.awakening_stone || 0) + 50;
                })}
                className="flex-1 px-1 py-0.5 bg-purple-600 hover:bg-purple-500 text-[10px] rounded"
              >+50</button>
            </div>
          </div>

          {/* 봉인석 */}
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">🔒 봉인석</span>
              <span className="text-cyan-400 text-xs font-bold">{gameState.consumables?.seal_stone || 0}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => modifyState(s => {
                  if (!s.consumables) s.consumables = {};
                  s.consumables.seal_stone = (s.consumables.seal_stone || 0) + 10;
                })}
                className="flex-1 px-1 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-[10px] rounded"
              >+10</button>
              <button
                onClick={() => modifyState(s => {
                  if (!s.consumables) s.consumables = {};
                  s.consumables.seal_stone = (s.consumables.seal_stone || 0) + 50;
                })}
                className="flex-1 px-1 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-[10px] rounded"
              >+50</button>
            </div>
          </div>

          {/* 도감 선택권 */}
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">📜 도감 선택권</span>
              <span className="text-orange-400 text-xs font-bold">{gameState.consumables?.monster_selection_ticket || 0}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => modifyState(s => {
                  if (!s.consumables) s.consumables = {};
                  s.consumables.monster_selection_ticket = (s.consumables.monster_selection_ticket || 0) + 3;
                })}
                className="flex-1 px-1 py-0.5 bg-orange-600 hover:bg-orange-500 text-[10px] rounded"
              >+3</button>
              <button
                onClick={() => modifyState(s => {
                  if (!s.consumables) s.consumables = {};
                  s.consumables.monster_selection_ticket = (s.consumables.monster_selection_ticket || 0) + 10;
                })}
                className="flex-1 px-1 py-0.5 bg-orange-600 hover:bg-orange-500 text-[10px] rounded"
              >+10</button>
            </div>
          </div>

          {/* 하락 방지권 */}
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">🛡️ 하락 방지권</span>
              <span className="text-emerald-400 text-xs font-bold">{gameState.downgradeProtection || 0}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => modifyState(s => {
                  s.downgradeProtection = (s.downgradeProtection || 0) + 10;
                })}
                className="flex-1 px-1 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] rounded"
              >+10</button>
              <button
                onClick={() => modifyState(s => {
                  s.downgradeProtection = (s.downgradeProtection || 0) + 50;
                })}
                className="flex-1 px-1 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] rounded"
              >+50</button>
            </div>
          </div>
        </div>
      </div>

      {/* 전직 테스트 */}
      <div className="bg-gray-800 border border-purple-500 rounded-lg p-3">
        <h3 className="font-bold text-purple-400 mb-2">🎖️ 전직 테스트</h3>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3].map(classLevel => (
            <button
              key={classLevel}
              onClick={() => setClassLevel(classLevel)}
              className={`px-3 py-1 rounded text-sm font-bold ${
                gameState.player?.classLevel === classLevel
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {classLevel === 0 ? '초심자' : classLevel === 1 ? '숙련자' : classLevel === 2 ? '전문가' : '마스터'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          현재: {gameState.player?.classLevel === 0 ? '초심자' :
                 gameState.player?.classLevel === 1 ? '숙련자' :
                 gameState.player?.classLevel === 2 ? '전문가' :
                 gameState.player?.classLevel === 3 ? '마스터' : '초심자'}
          ({gameState.player?.classLevel || 0}차)
        </p>
      </div>
    </div>
  );
};

export default DevPanel;
