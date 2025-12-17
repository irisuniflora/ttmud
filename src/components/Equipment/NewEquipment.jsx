import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOT_NAMES, EQUIPMENT_SETS, getUpgradeCost, OPTION_GRADES, ANCIENT_CONFIG, NORMAL_GRADES } from '../../data/equipmentSets';
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

// 일반 아이템 이미지 경로 가져오기
const getNormalItemImage = (normalGrade, slot) => {
  return `/images/equipment/normal/${normalGrade}/${slot}.png`;
};

// 배경색에 따라 적절한 텍스트 색상 반환 (밝은 배경 -> 어두운 텍스트)
const getContrastTextColor = (hexColor) => {
  if (!hexColor) return 'text-white';
  // hex -> RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // 밝기 계산 (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  // 밝으면 어두운 텍스트, 어두우면 밝은 텍스트
  return brightness > 128 ? '#1a1a1a' : '#ffffff';
};

const NewEquipment = () => {
  const { gameState, equipNewItem, unequipNewItem, disassembleNewItem, disassembleAllNormal, upgradeEquipmentLevel, awakenEquipment, useSetSelector, updateSettings, usePerfectEssence, useOrb } = useGame();
  const { equipment, newInventory = [], equipmentFragments = 0, settings = {}, setSelectors = {}, orbs = 0 } = gameState;

  const [showSets, setShowSets] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedSelectorType, setSelectedSelectorType] = useState(null);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // { item, isEquipped, slot } 형태로 선택된 아이템
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
    // 성공 시 팝업 없이 바로 적용, 실패 시에만 알림
    if (!result.success) {
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

  // 모든 아이템 (장착 + 인벤토리) 통합 - 장착중 표시 포함
  const getAllItemsForSlot = (slot) => {
    const equippedItem = equipment[slot];
    const inventoryItems = newInventory.filter(item => item.slot === slot);

    // 장착중인 아이템 먼저, 그 다음 인벤토리 (세트템 우선, 템렙 높은 순)
    const items = [];
    if (equippedItem) {
      items.push({ ...equippedItem, _isEquipped: true, _equippedSlot: slot });
    }

    const sortedInvItems = [...inventoryItems].sort((a, b) => {
      if (a.type === 'set' && b.type !== 'set') return -1;
      if (a.type !== 'set' && b.type === 'set') return 1;
      return b.itemLevel - a.itemLevel;
    });

    items.push(...sortedInvItems);
    return items;
  };

  // 딜링 슬롯 (왼쪽)
  const DEALING_SLOTS = ['weapon', 'armor', 'gloves'];
  // 악세 슬롯 (오른쪽)
  const ACCESSORY_SLOTS = ['boots', 'necklace', 'ring'];

  const setCounts = getSetCounts();
  const consumables = gameState.consumables || {};
  const awakenStones = consumables.awakening_stone || 0;
  const perfectEssences = consumables.stat_max_item || 0;

  // 완벽의 정수 사용
  const handleUsePerfectEssence = (slot, statIndex) => {
    const result = usePerfectEssence(slot, statIndex);
    if (result.success) {
      showNotification('극옵화 성공!', result.message, 'success');
    } else {
      showNotification('실패', result.message, 'warning');
    }
  };

  // 카르마 오브 사용
  const handleUseOrb = (slot) => {
    const result = useOrb(slot);
    if (result.success) {
      showNotification('재굴림 성공!', result.message, 'success');
    } else {
      showNotification('실패', result.message, 'warning');
    }
  };

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
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-yellow-400">
              ⚡ 조각: <span className="text-yellow-300 font-bold">{formatNumber(equipmentFragments)}</span>
            </span>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-purple-400">
              ✨ 각성석: <span className="text-purple-300 font-bold">{awakenStones}</span>
            </span>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-pink-400">
              ⚙️ 정수: <span className="text-pink-300 font-bold">{perfectEssences}</span>
            </span>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-blue-400">
              🔮 카르마: <span className="text-blue-300 font-bold">{orbs}</span>
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
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-purple-500 rounded-lg p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
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
                            ? 'border-yellow-500 bg-yellow-900/50 hover:bg-yellow-900/70'
                            : 'border-gray-700 bg-gray-800/50 opacity-50'
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
                          className="w-8 h-8 object-contain"
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

        {/* 세트 효과 모달 */}
        {showSets && (
          <div className="bg-game-panel border border-game-border rounded-lg p-3">
            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
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

        {/* 활성 세트 효과 표시 */}
        {(() => {
          const activeBonuses = getActiveSetBonuses();
          if (activeBonuses.length === 0) return null;
          return (
            <div className="mb-3 p-2 bg-gray-900/80 border border-gray-600 rounded-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-300 font-bold">✨ 세트 효과:</span>
                {activeBonuses.map((bonus, idx) => {
                  const setData = EQUIPMENT_SETS[bonus.setId];
                  return (
                    <span
                      key={idx}
                      className="text-xs font-bold px-2 py-1 rounded border"
                      style={{
                        backgroundColor: `${setData?.color}20`,
                        borderColor: setData?.color,
                        color: setData?.color,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {setData?.icon} {bonus.setName} ({bonus.tier}세트)
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 상단: 장비 슬롯 + 상세정보 패널 */}
        <div className="bg-game-panel border border-game-border rounded-lg p-4">
          <div className="flex gap-6">
            {/* 좌측: 장비 아이콘 그리드 (2x3) */}
            <div className="flex-shrink-0 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-2">
                {EQUIPMENT_SLOTS.map(slot => {
                  const item = equipment[slot];
                  const setData = item?.setId ? EQUIPMENT_SETS[item.setId] : null;
                  const isSelected = selectedItem?._equippedSlot === slot && selectedItem?._isEquipped;

                  return (
                    <div
                      key={slot}
                      onClick={() => {
                        if (item) {
                          setSelectedItem(isSelected ? null : { ...item, _isEquipped: true, _equippedSlot: slot });
                        }
                      }}
                      className={`relative rounded cursor-pointer transition-all duration-200 overflow-hidden ${
                        isSelected ? 'ring-2 ring-cyan-400' : 'hover:brightness-125'
                      }`}
                      style={{
                        width: '80px',
                        height: '80px',
                        background: '#1a1a2e',
                        border: isSelected ? '2px solid #22d3ee' : '1px solid #444'
                      }}
                    >
                      {item ? (
                        <>
                          {/* 아이콘 */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {item.type === 'set' ? (
                              <img
                                src={getSetItemImage(item.setId, slot)}
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                                style={{
                                  filter: item.isAncient
                                    ? `drop-shadow(0 0 6px ${ANCIENT_CONFIG.color})`
                                    : `drop-shadow(0 0 4px ${setData?.color})`,
                                  imageRendering: 'pixelated'
                                }}
                              />
                            ) : (
                              <img
                                src={getNormalItemImage(item.normalGrade || 'white', slot)}
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                                style={{
                                  filter: item.normalGrade && NORMAL_GRADES[item.normalGrade]
                                    ? `drop-shadow(0 0 3px ${NORMAL_GRADES[item.normalGrade].color})`
                                    : 'none',
                                  imageRendering: 'pixelated'
                                }}
                              />
                            )}
                          </div>

                          {/* 레벨 - 하단 반투명 */}
                          <div
                            className="absolute bottom-0 left-0 right-0 text-center"
                            style={{
                              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                              padding: '8px 0 2px 0'
                            }}
                          >
                            <span
                              className="text-[11px] font-black drop-shadow-lg"
                              style={{
                                color: item.isAncient ? ANCIENT_CONFIG.color : '#fff'
                              }}
                            >
                              Lv.{item.itemLevel}
                            </span>
                          </div>

                          {/* 고대 마크 - 우상단 */}
                          {item.isAncient && (
                            <div className="absolute top-1 right-1 text-[11px]">
                              {ANCIENT_CONFIG.icon}
                            </div>
                          )}

                          {/* 각성 배지 - 우상단 (고대 아닐때만) */}
                          {(item.awakeningCount || 0) > 0 && !item.isAncient && (
                            <div className="absolute top-1 right-1 text-[10px] text-yellow-300 font-bold">
                              ⭐{item.awakeningCount}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                          <span className="text-3xl text-gray-500">{SLOT_ICONS[slot]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 우측: 상세정보 패널 (고정) */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="text-xs text-gray-400 font-bold mb-2 pb-1 border-b border-gray-700">📋 상세정보</div>

              <div className="flex-1 overflow-y-auto" style={{ minHeight: '200px' }}>
                {selectedItem ? (
                  (() => {
                    // 장착된 아이템이면 최신 equipment 데이터 사용 (강화/각성 실시간 반영)
                    const isEquipped = selectedItem._isEquipped;
                    const equippedSlot = selectedItem._equippedSlot;
                    const item = isEquipped && equipment[equippedSlot]
                      ? { ...equipment[equippedSlot], _isEquipped: true, _equippedSlot: equippedSlot }
                      : selectedItem;
                    const setData = item?.setId ? EQUIPMENT_SETS[item.setId] : null;
                    const normalGradeData = item.normalGrade ? NORMAL_GRADES[item.normalGrade] : null;
                    const currentSetCounts = getSetCounts();
                    const setCount = item?.setId ? (currentSetCounts[item.setId] || 0) : 0;
                    const isSetActive = setCount >= 3;
                    const upgradeCost = getUpgradeCost(item);
                    const upgradesLeft = item.upgradesLeft ?? 10;
                    const canUpgrade = equipmentFragments >= upgradeCost && upgradesLeft > 0;
                    const canAwaken = upgradesLeft === 0 && awakenStones > 0;

                    return (
                      <div className="flex flex-col h-full">
                        {/* 헤더 */}
                        <div className="flex items-center gap-2 flex-wrap mb-3 pb-2 border-b border-gray-700">
                          {item.isAncient && (
                            <span
                              className="text-xs font-bold px-2 py-1 rounded"
                              style={{
                                background: `linear-gradient(135deg, ${ANCIENT_CONFIG.color}, ${ANCIENT_CONFIG.glowColor})`,
                                color: '#000'
                              }}
                            >
                              {ANCIENT_CONFIG.icon} 고대
                            </span>
                          )}
                          {item.type === 'set' ? (
                            <span
                              className="text-xs font-bold px-2 py-1 rounded"
                              style={{ backgroundColor: setData?.color, color: getContrastTextColor(setData?.color) }}
                            >
                              {setData?.icon} {setData?.name}
                            </span>
                          ) : (
                            <span
                              className="text-xs font-bold px-2 py-1 rounded"
                              style={{ backgroundColor: normalGradeData?.color || '#666', color: '#000' }}
                            >
                              {normalGradeData?.name || '일반'}
                            </span>
                          )}
                          <span className="text-sm text-gray-400">{EQUIPMENT_SLOT_NAMES[item.slot]}</span>
                          {isSetActive && <span className="text-yellow-400">✨</span>}
                          {isEquipped && <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">장착중</span>}
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm bg-yellow-800 text-yellow-300 px-2 py-0.5 rounded font-bold">Lv.{item.itemLevel}</span>
                            <span className={`text-sm px-2 py-0.5 rounded font-bold ${
                              upgradesLeft > 0
                                ? 'bg-emerald-800 text-emerald-300'
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              ⚡{upgradesLeft}/10
                            </span>
                            {(item.awakeningCount || 0) > 0 && (
                              <span className="text-sm bg-purple-800 text-purple-300 px-2 py-0.5 rounded font-bold">⭐{item.awakeningCount}</span>
                            )}
                          </div>
                        </div>

                        {/* 능력치 영역 - 좌우 분할 */}
                        <div className="flex gap-4 flex-1">
                          {/* 기본 능력치 */}
                          <div className="flex-1 bg-black/30 rounded p-3">
                            <div className="text-xs text-gray-400 mb-2 font-bold border-b border-gray-700 pb-1">기본 능력치</div>
                            {item.stats.filter(s => s.isMain).map((stat, idx) => {
                              const isReduction = stat.id === 'monstersPerStageReduction';
                              return (
                                <div key={`main-${idx}`} className="flex justify-between items-center py-1">
                                  <span className="text-sm text-cyan-300">{stat.name}</span>
                                  <span className="text-sm font-bold text-cyan-300">
                                    {isReduction ? '-' : '+'}{formatStatValue(stat.value, stat.suffix)}{stat.suffix}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* 잠재 능력치 */}
                          <div className="flex-1 bg-black/30 rounded p-3">
                            <div className="text-xs text-gray-400 mb-2 font-bold border-b border-gray-700 pb-1">잠재 능력치</div>
                            {item.stats.map((stat, idx) => {
                              if (stat.isMain) return null;
                              const optionGrade = stat.optionGrade ?? OPTION_GRADES.LOW;
                              const isMaxed = optionGrade === OPTION_GRADES.HIGH;
                              const colorClass = optionGrade === OPTION_GRADES.HIGH ? 'text-red-400' : optionGrade === OPTION_GRADES.MID ? 'text-green-400' : 'text-gray-400';
                              const canPerfect = isEquipped && perfectEssences > 0 && !isMaxed && stat.id !== 'monstersPerStageReduction';

                              return (
                                <div key={`pot-${idx}`} className="flex justify-between items-center py-1 group">
                                  <span className={`text-sm ${colorClass}`}>{stat.name}</span>
                                  <div className="flex items-center gap-2">
                                    {canPerfect && (
                                      <button
                                        onClick={() => handleUsePerfectEssence(equippedSlot, idx)}
                                        className="text-[10px] px-1.5 py-0.5 bg-pink-600 hover:bg-pink-500 text-white rounded opacity-0 group-hover:opacity-100"
                                      >
                                        극옵화
                                      </button>
                                    )}
                                    <span className={`text-sm font-bold ${colorClass}`}>
                                      +{formatStatValue(stat.value, stat.suffix)}{stat.suffix}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-700">
                          {isEquipped ? (
                            <>
                              {upgradesLeft > 0 ? (
                                <button
                                  onClick={() => handleUpgrade(equippedSlot)}
                                  disabled={!canUpgrade}
                                  className={`px-4 py-2 rounded text-sm font-bold ${
                                    canUpgrade
                                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white'
                                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  ⚡ 강화 ({formatNumber(equipmentFragments)}/{formatNumber(upgradeCost)})
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAwaken(equippedSlot)}
                                  disabled={!canAwaken}
                                  className={`px-4 py-2 rounded text-sm font-bold ${
                                    canAwaken
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  ✨ 각성 (💎{awakenStones})
                                </button>
                              )}
                              {orbs > 0 && (
                                <button
                                  onClick={() => handleUseOrb(equippedSlot)}
                                  className="px-4 py-2 rounded text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                  🔮 재굴림
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleUnequip(equippedSlot);
                                  setSelectedItem(null);
                                }}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded ml-auto"
                              >
                                해제
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  handleEquip(item.id);
                                  setSelectedItem(null);
                                }}
                                className="px-4 py-2 rounded text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                              >
                                ⚔️ 장착
                              </button>
                              <button
                                onClick={() => {
                                  handleDisassemble(item.id);
                                  setSelectedItem(null);
                                }}
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded ml-auto"
                              >
                                🔨 분해
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2 opacity-30">⚔️</div>
                      <p className="text-sm">장비를 선택하세요</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 인벤토리 (딜링/악세 구분) */}
        <div className="bg-game-panel border border-game-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-300">🎒 인벤토리</h4>
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
                className="px-2 py-1 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded text-[10px]"
              >
                🔨 일괄분해
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* 왼쪽: 딜링 장비 (무기, 갑옷, 장갑) */}
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 font-bold mb-2 pb-1 border-b border-gray-700">⚔️ 딜링 장비</div>
              <div className="space-y-2">
                {DEALING_SLOTS.map(slot => {
                  const items = getAllItemsForSlot(slot);
                  if (items.length === 0) return (
                    <div key={slot} className="text-[10px] text-gray-600">
                      {SLOT_ICONS[slot]} {EQUIPMENT_SLOT_NAMES[slot]} - 비어있음
                    </div>
                  );

                  return (
                    <div key={slot}>
                      <div className="text-[10px] text-gray-400 font-bold mb-1">
                        {SLOT_ICONS[slot]} {EQUIPMENT_SLOT_NAMES[slot]} ({items.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {items.map(item => {
                          const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
                          const isSet = item.type === 'set';
                          const isAncient = item.isAncient;
                          const normalGradeData = item.normalGrade ? NORMAL_GRADES[item.normalGrade] : null;
                          const isEquippedItem = item._isEquipped;
                          const isSelected = selectedItem?.id === item.id || (selectedItem?._isEquipped && selectedItem?._equippedSlot === item._equippedSlot && item._isEquipped);

                          // 세트템: 세트 고유 색상 테두리 + 글로우 (고대는 금색) / 일반템: 테두리 없음
                          const borderStyle = isSet
                            ? {
                                border: isAncient
                                  ? `2px solid ${ANCIENT_CONFIG.color}`
                                  : `2px solid ${setData?.color || '#888'}`,
                                boxShadow: isAncient
                                  ? `0 0 8px ${ANCIENT_CONFIG.color}, inset 0 0 4px ${ANCIENT_CONFIG.glowColor}40`
                                  : `0 0 6px ${setData?.color}80`
                              }
                            : {};

                          return (
                            <div
                              key={item.id || `equipped-${slot}`}
                              className={`w-12 h-12 relative group cursor-pointer transition-all rounded ${isSelected ? 'ring-2 ring-cyan-400' : 'hover:brightness-125'}`}
                              style={{
                                background: isEquippedItem ? '#1a2e1a' : '#1a1a2e',
                                ...borderStyle
                              }}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedItem(null);
                                } else {
                                  setSelectedItem(item);
                                }
                              }}
                            >
                              {/* 아이콘 */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                {isSet ? (
                                  <img
                                    src={getSetItemImage(item.setId, item.slot)}
                                    alt={item.name}
                                    className="w-9 h-9 object-contain"
                                    style={{
                                      filter: isAncient
                                        ? `drop-shadow(0 0 6px ${ANCIENT_CONFIG.color}) drop-shadow(0 0 3px ${ANCIENT_CONFIG.glowColor})`
                                        : `drop-shadow(0 0 4px ${setData?.color})`,
                                      imageRendering: 'pixelated'
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={getNormalItemImage(item.normalGrade || 'white', item.slot)}
                                    alt={item.name}
                                    className="w-9 h-9 object-contain"
                                    style={{
                                      imageRendering: 'pixelated'
                                    }}
                                  />
                                )}
                              </div>

                              {/* 템렙 - 좌상단 */}
                              <div
                                className="absolute top-0 left-0 text-[9px] font-black px-0.5 rounded-br"
                                style={{
                                  background: isSet ? (isAncient ? ANCIENT_CONFIG.color : setData?.color || '#888') : '#44403c',
                                  color: isSet ? '#000' : '#a8a29e'
                                }}
                              >
                                {item.itemLevel}
                              </div>

                              {/* 고대/장착 마크 - 우상단 */}
                              {isAncient ? (
                                <div className="absolute top-0 right-0 text-[8px]">
                                  {ANCIENT_CONFIG.icon}
                                </div>
                              ) : isEquippedItem ? (
                                <div className="absolute top-0 right-0 text-[8px] bg-green-600 text-white px-0.5 rounded-bl font-bold">
                                  E
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 오른쪽: 악세서리 (신발, 목걸이, 반지) */}
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 font-bold mb-2 pb-1 border-b border-gray-700">💎 악세서리</div>
              <div className="space-y-2">
                {ACCESSORY_SLOTS.map(slot => {
                  const items = getAllItemsForSlot(slot);
                  if (items.length === 0) return (
                    <div key={slot} className="text-[10px] text-gray-600">
                      {SLOT_ICONS[slot]} {EQUIPMENT_SLOT_NAMES[slot]} - 비어있음
                    </div>
                  );

                  return (
                    <div key={slot}>
                      <div className="text-[10px] text-gray-400 font-bold mb-1">
                        {SLOT_ICONS[slot]} {EQUIPMENT_SLOT_NAMES[slot]} ({items.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {items.map(item => {
                          const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
                          const isSet = item.type === 'set';
                          const isAncient = item.isAncient;
                          const normalGradeData = item.normalGrade ? NORMAL_GRADES[item.normalGrade] : null;
                          const isEquippedItem = item._isEquipped;
                          const isSelected = selectedItem?.id === item.id || (selectedItem?._isEquipped && selectedItem?._equippedSlot === item._equippedSlot && item._isEquipped);

                          // 세트템: 세트 고유 색상 테두리 + 글로우 (고대는 금색) / 일반템: 테두리 없음
                          const borderStyle = isSet
                            ? {
                                border: isAncient
                                  ? `2px solid ${ANCIENT_CONFIG.color}`
                                  : `2px solid ${setData?.color || '#888'}`,
                                boxShadow: isAncient
                                  ? `0 0 8px ${ANCIENT_CONFIG.color}, inset 0 0 4px ${ANCIENT_CONFIG.glowColor}40`
                                  : `0 0 6px ${setData?.color}80`
                              }
                            : {};

                          return (
                            <div
                              key={item.id || `equipped-${slot}`}
                              className={`w-12 h-12 relative group cursor-pointer transition-all rounded ${isSelected ? 'ring-2 ring-cyan-400' : 'hover:brightness-125'}`}
                              style={{
                                background: isEquippedItem ? '#1a2e1a' : '#1a1a2e',
                                ...borderStyle
                              }}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedItem(null);
                                } else {
                                  setSelectedItem(item);
                                }
                              }}
                            >
                              {/* 아이콘 */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                {isSet ? (
                                  <img
                                    src={getSetItemImage(item.setId, item.slot)}
                                    alt={item.name}
                                    className="w-9 h-9 object-contain"
                                    style={{
                                      filter: isAncient
                                        ? `drop-shadow(0 0 6px ${ANCIENT_CONFIG.color}) drop-shadow(0 0 3px ${ANCIENT_CONFIG.glowColor})`
                                        : `drop-shadow(0 0 4px ${setData?.color})`,
                                      imageRendering: 'pixelated'
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={getNormalItemImage(item.normalGrade || 'white', item.slot)}
                                    alt={item.name}
                                    className="w-9 h-9 object-contain"
                                    style={{
                                      imageRendering: 'pixelated'
                                    }}
                                  />
                                )}
                              </div>

                              {/* 템렙 - 좌상단 */}
                              <div
                                className="absolute top-0 left-0 text-[9px] font-black px-0.5 rounded-br"
                                style={{
                                  background: isSet ? (isAncient ? ANCIENT_CONFIG.color : setData?.color || '#888') : '#44403c',
                                  color: isSet ? '#000' : '#a8a29e'
                                }}
                              >
                                {item.itemLevel}
                              </div>

                              {/* 고대/장착 마크 - 우상단 */}
                              {isAncient ? (
                                <div className="absolute top-0 right-0 text-[8px]">
                                  {ANCIENT_CONFIG.icon}
                                </div>
                              ) : isEquippedItem ? (
                                <div className="absolute top-0 right-0 text-[8px] bg-green-600 text-white px-0.5 rounded-bl font-bold">
                                  E
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewEquipment;
