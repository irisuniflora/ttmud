import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOT_NAMES, EQUIPMENT_SETS, getUpgradeCost } from '../../data/equipmentSets';
import { formatNumber, formatStatValue } from '../../utils/formatter';
import NotificationModal from '../UI/NotificationModal';

// 슬롯별 아이콘
const SLOT_ICONS = {
  weapon: '⚔️',
  armor: '🛡️',
  gloves: '🧤',
  boots: '👢',
  necklace: '📿',
  ring: '💍'
};

// 세트 아이템 이미지 경로 가져오기
const getSetItemImage = (setId, slot) => {
  return `/images/equipment/sets/${setId}/${slot}.png`;
};

const NewEquipment = () => {
  const { gameState, equipNewItem, unequipNewItem, disassembleNewItem, disassembleAllNormal, upgradeEquipmentLevel, awakenEquipment, useSetSelector, updateSettings } = useGame();
  const { equipment, newInventory = [], equipmentFragments = 0, settings = {}, setSelectors = {} } = gameState;

  const [showSets, setShowSets] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedSelectorType, setSelectedSelectorType] = useState(null);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  // 세트 개수 계산
  const getSetCounts = () => {
    const setCounts = {};
    Object.values(equipment).forEach(item => {
      if (item && item.setId) {
        setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
      }
    });
    return setCounts;
  };

  // 활성 세트 효과 가져오기
  const getActiveSetBonuses = () => {
    const setCounts = getSetCounts();
    const bonuses = [];

    Object.entries(setCounts).forEach(([setId, count]) => {
      const setData = EQUIPMENT_SETS[setId];
      if (!setData) return;

      if (count >= 6 && setData.setBonus[6]) {
        bonuses.push({ setId, setName: setData.name, tier: 6, ...setData.setBonus[6] });
      } else if (count >= 3 && setData.setBonus[3]) {
        bonuses.push({ setId, setName: setData.name, tier: 3, ...setData.setBonus[3] });
      }
    });

    return bonuses;
  };

  const handleEquip = (itemId) => {
    const result = equipNewItem(itemId);
    if (!result.success) {
      showNotification('장착 실패', result.message, 'error');
    }
  };

  const handleUnequip = (slot) => {
    unequipNewItem(slot);
  };

  const handleDisassemble = (itemId) => {
    disassembleNewItem(itemId);
  };

  const handleDisassembleAll = () => {
    const result = disassembleAllNormal();
    if (result.success) {
      showNotification('일괄 분해', result.message, 'success');
    } else {
      showNotification('분해 실패', result.message, 'warning');
    }
  };

  const handleUpgrade = (slot) => {
    const result = upgradeEquipmentLevel(slot);
    if (result.success) {
      showNotification('강화 성공!', result.message, 'success');
    } else {
      showNotification('강화 실패', result.message, 'warning');
    }
  };

  const handleAwaken = (slot) => {
    const result = awakenEquipment(slot);
    if (result.success) {
      showNotification('각성 성공!', result.message, 'success');
    } else {
      showNotification('각성 실패', result.message, 'warning');
    }
  };

  // 세트 선택권 사용
  const openSelectorModal = (selectorType) => {
    setSelectedSelectorType(selectorType);
    setSelectedSetId(null);
    setShowSelector(true);
  };

  const handleUseSelector = (slot) => {
    if (!selectedSelectorType || !selectedSetId) return;
    const result = useSetSelector(selectedSelectorType, selectedSetId, slot);
    if (result.success) {
      showNotification('획득 성공!', result.message, 'success');
      setShowSelector(false);
      setSelectedSelectorType(null);
      setSelectedSetId(null);
    } else {
      showNotification('실패', result.message, 'error');
    }
  };

  // 총 선택권 개수
  const totalSelectors = (setSelectors.floor50 || 0) + (setSelectors.floor100 || 0) + (setSelectors.floor200 || 0);

  // 인벤토리 정렬: 세트템 우선, 템렙 높은 순
  const sortedInventory = [...newInventory].sort((a, b) => {
    // 세트템 우선
    if (a.type === 'set' && b.type !== 'set') return -1;
    if (a.type !== 'set' && b.type === 'set') return 1;
    // 템렙 높은 순
    return b.itemLevel - a.itemLevel;
  });

  // 슬롯별 그룹화
  const inventoryBySlot = {};
  EQUIPMENT_SLOTS.forEach(slot => {
    inventoryBySlot[slot] = sortedInventory.filter(item => item.slot === slot);
  });

  const setCounts = getSetCounts();
  const activeBonuses = getActiveSetBonuses();
  const awakenStones = gameState.awakenStones || 0;

  return (
    <>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">⚔️ 장비</h3>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-cyan-400">
              🔧 조각: <span className="text-yellow-400 font-bold">{formatNumber(equipmentFragments)}</span>
            </span>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-purple-400">
              ✨ 각성석: <span className="text-purple-300 font-bold">{awakenStones}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {totalSelectors > 0 && (
              <button
                onClick={() => setShowSelector(true)}
                className="px-3 py-1.5 rounded text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 animate-pulse"
              >
                🎁 선택권 ({totalSelectors})
              </button>
            )}
            <button
              onClick={() => setShowSets(!showSets)}
              className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
                showSets
                  ? 'bg-purple-600 text-white'
                  : 'bg-game-panel text-gray-400 hover:text-white'
              }`}
            >
              📜 세트효과
            </button>
          </div>
        </div>

        {/* 세트 선택권 모달 */}
        {showSelector && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-game-dark border border-game-border rounded-lg p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">🎁 세트 선택권</h3>
                <button
                  onClick={() => {
                    setShowSelector(false);
                    setSelectedSelectorType(null);
                    setSelectedSetId(null);
                  }}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* 선택권 선택 */}
              {!selectedSelectorType && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-3">사용할 선택권을 고르세요</p>
                  {[
                    { type: 'floor50', label: '50층 선택권', level: 5 },
                    { type: 'floor100', label: '100층 선택권', level: 10 },
                    { type: 'floor200', label: '200층 선택권', level: 20 }
                  ].map(({ type, label, level }) => {
                    const count = setSelectors[type] || 0;
                    return (
                      <button
                        key={type}
                        onClick={() => count > 0 && openSelectorModal(type)}
                        disabled={count === 0}
                        className={`w-full p-3 rounded border text-left ${
                          count > 0
                            ? 'border-yellow-500 bg-yellow-900/20 hover:bg-yellow-900/40'
                            : 'border-gray-700 bg-gray-800/20 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold">{label}</span>
                          <span className="text-yellow-400">x{count}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Lv.{level} 세트 아이템 획득</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 세트 선택 */}
              {selectedSelectorType && !selectedSetId && (
                <div>
                  <button
                    onClick={() => setSelectedSelectorType(null)}
                    className="text-sm text-gray-400 hover:text-white mb-3"
                  >
                    ← 뒤로
                  </button>
                  <p className="text-sm text-gray-400 mb-3">원하는 세트를 선택하세요</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(EQUIPMENT_SETS).map(([setId, setData]) => (
                      <button
                        key={setId}
                        onClick={() => setSelectedSetId(setId)}
                        className="p-2 rounded border border-gray-600 hover:border-purple-500 bg-gray-800/50 hover:bg-purple-900/30 transition-all"
                        style={{ borderColor: setData.color + '60' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{setData.icon}</span>
                          <span className="text-sm font-bold" style={{ color: setData.color }}>
                            {setData.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 슬롯 선택 */}
              {selectedSelectorType && selectedSetId && (
                <div>
                  <button
                    onClick={() => setSelectedSetId(null)}
                    className="text-sm text-gray-400 hover:text-white mb-3"
                  >
                    ← 뒤로
                  </button>
                  <p className="text-sm text-gray-400 mb-3">
                    <span style={{ color: EQUIPMENT_SETS[selectedSetId].color }}>
                      {EQUIPMENT_SETS[selectedSetId].icon} {EQUIPMENT_SETS[selectedSetId].name}
                    </span>
                    {' '}슬롯을 선택하세요
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {EQUIPMENT_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => handleUseSelector(slot)}
                        className="p-3 rounded border border-gray-600 hover:border-green-500 bg-gray-800/50 hover:bg-green-900/30 transition-all flex flex-col items-center gap-1"
                      >
                        <img
                          src={getSetItemImage(selectedSetId, slot)}
                          alt={slot}
                          className="w-8 h-8"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <span className="text-xs text-gray-300">{EQUIPMENT_SLOT_NAMES[slot]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 활성 세트 효과 */}
        {activeBonuses.length > 0 && (
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-lg p-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-purple-400 font-bold">활성:</span>
              {activeBonuses.map((bonus, idx) => (
                <span key={idx} className="text-xs bg-purple-800/50 px-2 py-0.5 rounded text-white">
                  {bonus.setName} ({bonus.tier}셋)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 세트 효과 모달 */}
        {showSets && (
          <div className="bg-game-panel border border-game-border rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {Object.entries(EQUIPMENT_SETS).map(([setId, setData]) => {
                const count = setCounts[setId] || 0;
                const is3SetActive = count >= 3;
                const is6SetActive = count >= 6;

                return (
                  <div
                    key={setId}
                    className={`border rounded p-2 ${count > 0 ? 'border-purple-500' : 'border-gray-700'}`}
                    style={count > 0 ? { borderColor: setData.color } : {}}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: setData.color }}>
                        {setData.icon} {setData.name}
                      </span>
                      <span className={`text-xs ${count > 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                        {count}/6
                      </span>
                    </div>
                    <div className="text-[10px] space-y-0.5">
                      <div className={is3SetActive ? 'text-green-400' : 'text-gray-500'}>
                        (3) {setData.setBonus[3].description}
                      </div>
                      <div className={is6SetActive ? 'text-green-400' : 'text-gray-500'}>
                        (6) {setData.setBonus[6].description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 장착 슬롯 */}
        <div className="grid grid-cols-6 gap-2">
          {EQUIPMENT_SLOTS.map(slot => {
            const item = equipment[slot];
            const setData = item?.setId ? EQUIPMENT_SETS[item.setId] : null;
            const upgradeCost = item ? getUpgradeCost(item) : 0;
            const upgradesLeft = item?.upgradesLeft ?? 10;
            const canUpgrade = item && equipmentFragments >= upgradeCost && upgradesLeft > 0;
            const canAwaken = item && upgradesLeft === 0 && awakenStones > 0;

            return (
              <div key={slot} className="bg-game-panel border border-game-border rounded-lg p-2">
                {/* 슬롯 헤더 */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm">{SLOT_ICONS[slot]}</span>
                  <span className="text-xs text-gray-400">{EQUIPMENT_SLOT_NAMES[slot]}</span>
                </div>

                {item ? (
                  <div
                    className={`border rounded p-1.5 relative overflow-hidden ${
                      item.type === 'set' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600 bg-gray-800/20'
                    }`}
                    style={item.type === 'set' ? {
                      borderColor: setData?.color,
                      boxShadow: `0 0 10px ${setData?.color}40, inset 0 0 15px ${setData?.color}20`
                    } : {}}
                  >
                    {/* 세트 아이템 글로우 효과 */}
                    {item.type === 'set' && (
                      <div
                        className="absolute inset-0 opacity-20 animate-pulse"
                        style={{
                          background: `radial-gradient(circle at center, ${setData?.color}30 0%, transparent 70%)`
                        }}
                      />
                    )}

                    {/* 아이템 이미지 */}
                    <div className="relative flex justify-center mb-1">
                      {item.type === 'set' ? (
                        <img
                          src={getSetItemImage(item.setId, slot)}
                          alt={item.name}
                          className="w-8 h-8 object-contain pixelated"
                          style={{
                            filter: `drop-shadow(0 0 4px ${setData?.color})`,
                            imageRendering: 'pixelated'
                          }}
                        />
                      ) : (
                        <span className="text-2xl">{SLOT_ICONS[slot]}</span>
                      )}
                    </div>

                    {/* 아이템 이름 */}
                    {item.type === 'set' ? (
                      <div
                        className="relative rounded px-1 py-0.5 mb-1"
                        style={{ backgroundColor: setData?.color }}
                      >
                        <p className="text-[10px] truncate font-bold text-center text-white">
                          {setData?.name}
                        </p>
                      </div>
                    ) : (
                      <p className="relative text-[10px] truncate mb-1 font-bold text-center text-gray-400">
                        {EQUIPMENT_SLOT_NAMES[slot]}
                      </p>
                    )}

                    {/* 템렙 & 업글 횟수 */}
                    <div className="relative flex items-center justify-between mb-1 px-1">
                      <span className="text-[10px] text-yellow-400 font-bold">Lv.{item.itemLevel}</span>
                      <span className={`text-[9px] ${upgradesLeft > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        ({upgradesLeft}회)
                      </span>
                    </div>

                    {/* 스탯 */}
                    <div className="relative text-[9px] space-y-0">
                      {item.stats.map((stat, idx) => (
                        <div key={idx} className="flex justify-between text-gray-400">
                          <span className="truncate">{stat.name.substring(0, 3)}</span>
                          <span className="text-green-400">+{formatStatValue(stat.value, stat.suffix)}</span>
                        </div>
                      ))}
                    </div>

                    {/* 버튼들 */}
                    <div className="relative mt-1.5 space-y-1">
                      {upgradesLeft > 0 ? (
                        <button
                          onClick={() => handleUpgrade(slot)}
                          disabled={!canUpgrade}
                          className={`w-full py-0.5 rounded text-[10px] font-bold ${
                            canUpgrade
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          ⬆️ +1 ({upgradeCost}조각)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAwaken(slot)}
                          disabled={!canAwaken}
                          className={`w-full py-0.5 rounded text-[10px] font-bold ${
                            canAwaken
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          ✨ 각성
                        </button>
                      )}
                      <button
                        onClick={() => handleUnequip(slot)}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white text-[10px] py-0.5 rounded"
                      >
                        해제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-700 rounded h-24 flex items-center justify-center">
                    <span className="text-gray-600 text-[10px]">빈 슬롯</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 인벤토리 */}
        <div className="bg-game-panel border border-game-border rounded-lg p-3">
          {/* 인벤토리 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white">
              🎒 인벤토리 ({newInventory.length})
            </h4>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoDisassemble || false}
                  onChange={(e) => updateSettings({ autoDisassemble: e.target.checked })}
                  className="w-3 h-3"
                />
                <span className="text-[10px] text-gray-400">자동분해</span>
              </label>
              <button
                onClick={handleDisassembleAll}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded text-[10px]"
              >
                🔨 일괄분해
              </button>
            </div>
          </div>

          {newInventory.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              인벤토리가 비어있습니다
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {EQUIPMENT_SLOTS.map(slot => {
                const items = inventoryBySlot[slot];
                if (items.length === 0) return null;

                return (
                  <div key={slot}>
                    <div className="text-[10px] text-cyan-400 font-bold mb-1">
                      {SLOT_ICONS[slot]} {EQUIPMENT_SLOT_NAMES[slot]} ({items.length})
                    </div>
                    <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
                      {items.map(item => {
                        const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
                        const isSet = item.type === 'set';

                        return (
                          <div
                            key={item.id}
                            className={`border rounded p-1 relative group cursor-pointer hover:scale-105 transition-all overflow-hidden ${
                              isSet ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/20'
                            }`}
                            style={isSet ? {
                              borderColor: setData?.color,
                              boxShadow: `0 0 6px ${setData?.color}30`
                            } : {}}
                            onClick={() => handleEquip(item.id)}
                          >
                            {/* 세트 아이템 글로우 */}
                            {isSet && (
                              <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                  background: `radial-gradient(circle at center, ${setData?.color}20 0%, transparent 70%)`
                                }}
                              />
                            )}

                            {/* 아이템 이미지 */}
                            <div className="relative flex justify-center">
                              {isSet ? (
                                <img
                                  src={getSetItemImage(item.setId, item.slot)}
                                  alt={item.name}
                                  className="w-6 h-6 object-contain"
                                  style={{
                                    filter: `drop-shadow(0 0 2px ${setData?.color})`,
                                    imageRendering: 'pixelated'
                                  }}
                                />
                              ) : (
                                <span className="text-base">{SLOT_ICONS[item.slot]}</span>
                              )}
                            </div>

                            {/* 템렙 */}
                            <div className="relative flex items-center justify-center">
                              <span className="text-[8px] text-yellow-400 font-bold">Lv.{item.itemLevel}</span>
                            </div>

                            {/* 세트명 */}
                            {isSet && (
                              <p className="relative text-[7px] truncate text-center" style={{ color: setData?.color }}>
                                {setData?.name?.substring(0, 4)}
                              </p>
                            )}

                            {/* 스탯 요약 */}
                            <div className="relative text-[7px] text-gray-500 text-center">
                              {item.stats.length}옵션
                            </div>

                            {/* 분해 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisassemble(item.id);
                              }}
                              className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white text-[8px] w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewEquipment;
