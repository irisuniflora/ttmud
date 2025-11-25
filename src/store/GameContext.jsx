import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GAME_CONFIG } from '../data/gameBalance';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // 게임 엔진 초기화
  useEffect(() => {
    // localStorage에서 저장된 게임 불러오기
    const savedGame = localStorage.getItem('tapTitansMUD');
    let initialState = savedGame ? JSON.parse(savedGame) : null;

    // 데이터 마이그레이션: currentMonster.name이 객체인 경우 수정
    if (initialState && initialState.currentMonster && typeof initialState.currentMonster.name === 'object') {
      // 구버전 데이터가 있으면 게임 초기화
      console.log('[Migration] Old data format detected. Resetting game...');
      localStorage.removeItem('tapTitansMUD');
      initialState = null;
    }

    engineRef.current = new GameEngine(initialState);
    setGameState(engineRef.current.getState());
    
    // 자동 시작
    engineRef.current.start();
    setIsRunning(true);
    
    // 정기적으로 상태 업데이트
    const updateInterval = setInterval(() => {
      setGameState({ ...engineRef.current.getState() });
    }, 100);
    
    // 정기적으로 저장
    const saveInterval = setInterval(() => {
      saveGame();
    }, GAME_CONFIG.autoSaveInterval);
    
    return () => {
      engineRef.current.stop();
      clearInterval(updateInterval);
      clearInterval(saveInterval);
      saveGame(); // 언마운트 시 저장
    };
  }, []);

  const saveGame = () => {
    if (engineRef.current) {
      const state = engineRef.current.getState();
      localStorage.setItem('tapTitansMUD', JSON.stringify(state));
    }
  };

  const resetGame = () => {
    if (window.confirm('정말 게임을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
      localStorage.removeItem('tapTitansMUD');
      window.location.reload();
    }
  };

  const togglePause = () => {
    if (isRunning) {
      engineRef.current.stop();
      setIsRunning(false);
    } else {
      engineRef.current.start();
      setIsRunning(true);
    }
  };

  const inscribeHero = (heroId) => {
    const result = engineRef.current.inscribeHero(heroId);
    if (result) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const upgradeHeroGrade = (heroId) => {
    const result = engineRef.current.upgradeHeroGrade(heroId);
    if (result) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const upgradeHeroStar = (heroId) => {
    const result = engineRef.current.upgradeHeroStar(heroId);
    if (result) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const bulkUpgradeHeroStars = () => {
    const result = engineRef.current.bulkUpgradeHeroStars();
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const bulkUpgradeHeroGrades = () => {
    const result = engineRef.current.bulkUpgradeHeroGrades();
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const equipItem = (item) => {
    engineRef.current.equipItem(item);
    setGameState({ ...engineRef.current.getState() });
  };

  const unequipItem = (slot) => {
    engineRef.current.unequipItem(slot);
    setGameState({ ...engineRef.current.getState() });
  };

  const autoEquipAll = () => {
    const result = engineRef.current.autoEquipAll();
    if (result) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const prestige = () => {
    const result = engineRef.current.prestige();
    if (result) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const upgradeSkill = (skillId, tree) => {
    const result = engineRef.current.upgradeSkill(skillId, tree);
    if (result) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const enterBossBattle = () => {
    const result = engineRef.current.enterBossBattle();
    if (result) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const toggleFloorLock = () => {
    const result = engineRef.current.toggleFloorLock();
    setGameState({ ...engineRef.current.getState() });
    return result;
  };

  const goDownFloor = () => {
    const result = engineRef.current.goDownFloor();
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const enhanceSlot = (slot) => {
    const result = engineRef.current.enhanceSlot(slot);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const autoSellItems = (maxRarity) => {
    const result = engineRef.current.autoSellItems(maxRarity);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const sellItem = (itemId) => {
    const result = engineRef.current.sellItem(itemId);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const updateSettings = (newSettings) => {
    engineRef.current.updateSettings(newSettings);
    setGameState({ ...engineRef.current.getState() });
  };

  const usePerfectEssence = (slot, statIndex) => {
    const result = engineRef.current.usePerfectEssence(slot, statIndex);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const useOrb = (slot) => {
    const result = engineRef.current.useOrb(slot);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const releaseMonster = (monsterId, type) => {
    const result = engineRef.current.releaseMonster(monsterId, type);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const releaseAllMonsters = () => {
    const result = engineRef.current.releaseAllMonsters();
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const unlockMonsterWithTicket = (monsterId, type, monsterName) => {
    const result = engineRef.current.unlockMonsterWithTicket(monsterId, type, monsterName);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  // ===== 월드보스 시스템 =====
  const startWorldBossBattle = () => {
    const result = engineRef.current.startWorldBossBattle();
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const toggleWorldBoss = (forceState = null) => {
    const result = engineRef.current.toggleWorldBoss(forceState);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  const distributeWorldBossRewards = () => {
    const result = engineRef.current.distributeWorldBossRewards();
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  // ===== 경매 시스템 =====
  const placeBid = (itemId, amount, playerId, playerName) => {
    const result = engineRef.current.placeBid(itemId, amount, playerId, playerName);
    if (result.success) {
      setGameState({ ...engineRef.current.getState() });
    }
    return result;
  };

  // ===== 유물 시스템 =====
  const gachaRelic = () => {
    const result = engineRef.current.gachaRelic();
    setGameState({ ...engineRef.current.getState() });
    return result;
  };

  const upgradeRelic = (relicId) => {
    const result = engineRef.current.upgradeRelic(relicId);
    setGameState({ ...engineRef.current.getState() });
    return result;
  };

  // 보스 타이머 업데이트 (1초마다)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (engineRef.current) {
        engineRef.current.updateBossTimer();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-2xl">게임 로딩 중...</div>
    </div>;
  }

  return (
    <GameContext.Provider value={{
      gameState,
      setGameState,
      isRunning,
      togglePause,
      saveGame,
      resetGame,
      inscribeHero,
      upgradeHeroGrade,
      upgradeHeroStar,
      bulkUpgradeHeroStars,
      bulkUpgradeHeroGrades,
      equipItem,
      unequipItem,
      autoEquipAll,
      enhanceSlot,
      autoSellItems,
      sellItem,
      updateSettings,
      usePerfectEssence,
      useOrb,
      releaseMonster,
      releaseAllMonsters,
      unlockMonsterWithTicket,
      prestige,
      upgradeSkill,
      enterBossBattle,
      toggleFloorLock,
      goDownFloor,
      startWorldBossBattle,
      toggleWorldBoss,
      distributeWorldBossRewards,
      placeBid,
      gachaRelic,
      upgradeRelic,
      engine: engineRef.current
    }}>
      {children}
    </GameContext.Provider>
  );
};
