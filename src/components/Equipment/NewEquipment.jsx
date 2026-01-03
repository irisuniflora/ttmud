import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOT_NAMES, EQUIPMENT_SETS, getUpgradeCost, OPTION_GRADES, ANCIENT_CONFIG, NORMAL_GRADES, getEnhanceCost, getEnhanceSuccessRate, getDowngradeAmount, getEnhanceBonus, getProtectionRequired, ENHANCE_CONFIG } from '../../data/equipmentSets';
import { formatNumber, formatStatValue } from '../../utils/formatter';
import NotificationModal from '../UI/NotificationModal';
import ItemTooltip from '../UI/ItemTooltip';

// 슬롯별 아이콘
const SLOT_ICONS = {
  weapon: '⚔️',
  armor: '🛡️',
  gloves: '🧤',
  boots: '👢',
  necklace: '📿',
  ring: '💍'
};

// GitHub Pages 배포용 BASE_URL
const BASE_URL = import.meta.env.BASE_URL || '/';

// 세트 아이템 이미지 경로 가져오기
const getSetItemImage = (setId, slot) => {
  return `${BASE_URL}images/equipment/sets/${setId}/${slot}.png`;
};

// 일반 아이템 이미지 경로 가져오기
const getNormalItemImage = (normalGrade, slot) => {
  return `${BASE_URL}images/equipment/normal/${normalGrade}/${slot}.png`;
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
  const { gameState, equipNewItem, unequipNewItem, disassembleNewItem, disassembleAllNormal, toggleItemLock, upgradeEquipmentLevel, awakenEquipment, enhanceEquipment, useSetSelector, updateSettings, useOrb, useSealStone } = useGame();
  const { equipment, newInventory = [], equipmentFragments = 0, settings = {}, setSelectors = {}, orbs = 0 } = gameState;

  const [showSets, setShowSets] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedSelectorType, setSelectedSelectorType] = useState(null);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // { item, isEquipped, slot } 형태로 선택된 아이템
  const [showDisassembleOptions, setShowDisassembleOptions] = useState(false);
  const [showAutoDisassembleOptions, setShowAutoDisassembleOptions] = useState(false); // 자동분해 옵션
  const [selectedGrades, setSelectedGrades] = useState(['white', 'blue', 'purple']); // 분해 등급 선택
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

  const handleDisassembleAll = (grades = null) => {
    const result = disassembleAllNormal(grades ? { grades } : {});
    if (result.success) {
      showNotification('일괄 분해', result.message, 'success');
    } else {
      showNotification('분해 실패', result.message, 'warning');
    }
    setShowDisassembleOptions(false);
  };

  const handleToggleLock = (itemId) => {
    const result = toggleItemLock(itemId);
    if (result.success) {
      // 선택된 아이템 상태 업데이트
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(prev => ({ ...prev, locked: result.locked }));
      }
    }
  };

  const toggleGradeSelection = (grade) => {
    setSelectedGrades(prev => {
      if (prev.includes(grade)) {
        return prev.filter(g => g !== grade);
      } else {
        return [...prev, grade];
      }
    });
  };

  const handleUpgrade = (slot) => {
    const result = upgradeEquipmentLevel(slot);
    // 성공 시 팝업 없이 바로 적용, 실패 시에만 알림
    if (!result.success) {
      showNotification('제련 실패', result.message, 'warning');
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

  const setCounts = getSetCounts();
  const consumables = gameState.consumables || {};
  const awakenStones = consumables.awakening_stone || 0;
  const sealStones = consumables.seal_stone || 0;

  // 카르마 오브 사용
  const handleUseOrb = (slot) => {
    const result = useOrb(slot);
    if (result.success) {
      showNotification('재굴림 성공!', result.message, 'success');
    } else {
      showNotification('실패', result.message, 'warning');
    }
  };

  // 봉인석으로 옵션 잠금/해제
  const handleUseSealStone = (slot, statIndex) => {
    const result = useSealStone(slot, statIndex);
    if (result.success) {
      showNotification(result.locked ? '잠금 성공!' : '잠금 해제!', result.message, result.locked ? 'success' : 'info');
    } else {
      showNotification('실패', result.message, 'warning');
    }
  };

  // 선택된 아이템 정보 (실시간 반영)
  const getSelectedItemData = () => {
    if (!selectedItem) return null;
    const isEquipped = selectedItem._isEquipped;
    const equippedSlot = selectedItem._equippedSlot;
    if (isEquipped && equipment[equippedSlot]) {
      return { ...equipment[equippedSlot], _isEquipped: true, _equippedSlot: equippedSlot };
    }
    // 인벤토리 아이템의 경우 최신 상태 반영 (잠금 상태 등)
    const latestItem = newInventory.find(item => item.id === selectedItem.id);
    return latestItem || selectedItem;
  };

  const selectedItemData = getSelectedItemData();
  const upgradeCost = selectedItemData ? getUpgradeCost(selectedItemData) : 0;
  const upgradesLeft = selectedItemData?.upgradesLeft ?? 10;
  const canUpgrade = selectedItemData && equipmentFragments >= upgradeCost && upgradesLeft > 0;
  const canAwaken = selectedItemData && upgradesLeft === 0 && awakenStones > 0;

  return (
    <>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

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

      {/* 메인 레이아웃: 좌우 3:7 분할 */}
      <div className="flex gap-3 h-full">
        {/* 좌측 영역 (30%) - 장비창 + 콘솔 */}
        <div className="w-[30%] flex flex-col gap-3">
          {/* 상단: 장비 슬롯 */}
          <div className="bg-game-panel border border-game-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">⚔️ 장착 장비</h3>
              <div className="flex items-center gap-1">
                {totalSelectors > 0 && (
                  <button
                    onClick={() => setShowSelector(true)}
                    className="px-2 py-1 rounded text-[10px] font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 animate-pulse"
                  >
                    🎁 선택권 ({totalSelectors})
                  </button>
                )}
                <button
                  onClick={() => setShowSets(!showSets)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    showSets
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  📜 세트
                </button>
              </div>
            </div>

            {/* 장비 그리드 (2x3) */}
            <div className="grid grid-cols-2 gap-2 justify-items-center">
              {EQUIPMENT_SLOTS.map(slot => {
                const item = equipment[slot];
                const setData = item?.setId ? EQUIPMENT_SETS[item.setId] : null;
                const isSelected = selectedItem?._equippedSlot === slot && selectedItem?._isEquipped;

                return (
                  <ItemTooltip key={slot} item={item} equipment={equipment} disabled={!item}>
                    <div
                      onClick={() => {
                        if (item) {
                          setSelectedItem(isSelected ? null : { ...item, _isEquipped: true, _equippedSlot: slot });
                        }
                      }}
                      className={`relative rounded cursor-pointer transition-all duration-200 overflow-hidden ${
                        isSelected ? 'ring-2 ring-cyan-400' : 'hover:brightness-125'
                      }`}
                      style={{
                        width: '70px',
                        height: '70px',
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
                                className="w-14 h-14 object-contain"
                                style={{
                                  filter: `drop-shadow(0 0 4px ${setData?.color})`,
                                  imageRendering: 'pixelated'
                                }}
                              />
                            ) : (
                              <img
                                src={getNormalItemImage(item.normalGrade || 'white', slot)}
                                alt={item.name}
                                className="w-14 h-14 object-contain"
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
                              padding: '6px 0 2px 0'
                            }}
                          >
                            <span className="text-[10px] font-black drop-shadow-lg text-white">
                              Lv.{item.itemLevel}
                            </span>
                          </div>

                          {/* 강화 수치 - 좌상단 */}
                          {(item.enhanceLevel || 0) > 0 && (
                            <div className="absolute top-0.5 left-0.5 text-[10px] text-yellow-400 font-bold drop-shadow-lg">
                              +{item.enhanceLevel}
                            </div>
                          )}

                          {/* 각성 배지 - 우상단 */}
                          {(item.awakeningCount || 0) > 0 && (
                            <div className="absolute top-0.5 right-0.5 text-[9px] text-purple-300 font-bold">
                              💎{item.awakeningCount}
                            </div>
                          )}

                          {/* 고대 마크 - 우하단 안쪽 */}
                          {item.isAncient && (
                            <div className="absolute bottom-1 right-1 text-[11px] z-10" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}>
                              🔱
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                          <span className="text-2xl text-gray-500">{SLOT_ICONS[slot]}</span>
                        </div>
                      )}
                    </div>
                  </ItemTooltip>
                );
              })}
            </div>

            {/* 세트 효과 패널 (토글) */}
            {showSets && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
                  {Object.entries(EQUIPMENT_SETS).map(([setId, setData]) => {
                    const count = setCounts[setId] || 0;
                    const is3SetActive = count >= 3;
                    const is6SetActive = count >= 6;

                    return (
                      <div
                        key={setId}
                        className={`border rounded p-1.5 ${count > 0 ? 'border-purple-500' : 'border-gray-700'}`}
                        style={count > 0 ? { borderColor: setData.color } : {}}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-bold" style={{ color: setData.color }}>
                            {setData.icon} {setData.name}
                          </span>
                          <span className={`text-[10px] ${count > 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                            {count}/6
                          </span>
                        </div>
                        <div className="text-[9px] space-y-0.5">
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
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-gray-400">✨</span>
                    {activeBonuses.map((bonus, idx) => {
                      const setData = EQUIPMENT_SETS[bonus.setId];
                      return (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${setData?.color}30`,
                            color: setData?.color,
                          }}
                        >
                          {setData?.icon} {bonus.tier}세트
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 하단: 콘솔 (제련/각성/재굴림 등) */}
          <div className="bg-game-panel border border-game-border rounded-lg p-3 flex-1">
            {/* 재화 표시 - 통일된 회색 톤 */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span
                className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 cursor-help"
                title="장비 파편 - 장비 제련에 사용"
              >
                ⚡ {formatNumber(equipmentFragments)}
              </span>
              <span
                className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 cursor-help"
                title="각성석 - 최대 제련 장비를 각성 (다음 단계로 진화)"
              >
                💎 {awakenStones}
              </span>
              <span
                className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 cursor-help"
                title="재굴림 오브 - 장비 옵션 재굴림 (잠긴 옵션 제외)"
              >
                🔮 {orbs}
              </span>
              <span
                className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 cursor-help"
                title="봉인석 - 재굴림 시 옵션 잠금 (잠금 해제는 무료)"
              >
                🔒 {sealStones}
              </span>
              <span
                className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 cursor-help"
                title="하락 방지권 - +10 이상 강화 실패 시 하락 방지 (50층 이상 보스에서 5% 확률로 드랍)"
              >
                🛡️ {gameState.downgradeProtection || 0}
              </span>
            </div>

            {selectedItemData ? (
              <div className="space-y-2">
                {/* 선택된 아이템 요약 + 기본옵션 */}
                {(() => {
                  const mainStat = selectedItemData.stats?.find(stat => stat.isMain);
                  const currentEnhance = selectedItemData.enhanceLevel || 0;
                  const enhanceBonusPercent = getEnhanceBonus(currentEnhance);

                  return (
                    <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                      {selectedItemData.type === 'set' ? (
                        <img
                          src={getSetItemImage(selectedItemData.setId, selectedItemData.slot)}
                          alt={selectedItemData.name}
                          className="w-10 h-10 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <img
                          src={getNormalItemImage(selectedItemData.normalGrade || 'white', selectedItemData.slot)}
                          alt={selectedItemData.name}
                          className="w-10 h-10 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {currentEnhance > 0 && <span className="text-yellow-400">+{currentEnhance} </span>}
                          {selectedItemData.isAncient && <span className="text-amber-300">[고대] </span>}
                          {selectedItemData.name || EQUIPMENT_SLOT_NAMES[selectedItemData.slot]}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-yellow-400">Lv.{selectedItemData.itemLevel}</span>
                          <span className={`text-[10px] ${upgradesLeft > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                            제련 {10 - upgradesLeft}/10
                          </span>
                          {(selectedItemData.awakeningCount || 0) > 0 && (
                            <span className="text-[10px] text-purple-400">💎{selectedItemData.awakeningCount}</span>
                          )}
                        </div>
                      </div>
                      {/* 기본옵션 - 이름 옆에 표시 */}
                      {mainStat && selectedItemData._isEquipped && (
                        <div className="text-right border-l border-gray-700 pl-3 min-w-[90px]">
                          <div className="text-[10px] text-gray-400">{mainStat.name}</div>
                          <div className="text-sm text-white font-bold">
                            {formatStatValue(mainStat.value, mainStat.suffix)}{mainStat.suffix || ''}
                            {enhanceBonusPercent > 0 && (
                              <span className="text-amber-400 ml-1">
                                +{formatStatValue(mainStat.value * enhanceBonusPercent / 100, mainStat.suffix)}{mainStat.suffix || ''}
                              </span>
                            )}
                          </div>
                          {enhanceBonusPercent > 0 && (
                            <div className="text-[8px] text-amber-400">강화 +{currentEnhance} → +{enhanceBonusPercent}%</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 액션 버튼들 */}
                <div className="space-y-1.5">
                  {selectedItemData._isEquipped ? (
                    <>
                      {/* 제련/각성 버튼 */}
                      <div className="flex gap-1">
                        {upgradesLeft > 0 ? (
                          <button
                            onClick={() => handleUpgrade(selectedItemData._equippedSlot)}
                            disabled={!canUpgrade}
                            className={`flex-1 px-2 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 ${
                              canUpgrade
                                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <span>🔥 제련</span>
                            <span className="text-[10px] opacity-80">⚡ {formatNumber(upgradeCost)}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAwaken(selectedItemData._equippedSlot)}
                            disabled={!canAwaken}
                            className={`flex-1 px-2 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 ${
                              canAwaken
                                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <span>💎 각성</span>
                            <span className="text-[10px] opacity-80">💎 1</span>
                          </button>
                        )}
                      </div>

                      {/* 강화 섹션 */}
                      {(() => {
                        const enhanceCost = getEnhanceCost(selectedItemData);
                        const successRate = getEnhanceSuccessRate(selectedItemData);
                        const downgradeAmount = getDowngradeAmount(selectedItemData);
                        const currentEnhance = selectedItemData.enhanceLevel || 0;
                        const playerGold = gameState.player?.gold || 0;
                        const downgradeProtection = gameState.downgradeProtection || 0;
                        const protectionRequired = getProtectionRequired(currentEnhance);
                        const canEnhance = playerGold >= enhanceCost && currentEnhance < ENHANCE_CONFIG.maxEnhance;
                        const canUseProtection = downgradeProtection >= protectionRequired && protectionRequired > 0;

                        const handleEnhanceClick = (useProtection = false) => {
                          if (!selectedItemData._equippedSlot) return;
                          enhanceEquipment(selectedItemData._equippedSlot, useProtection);
                        };

                        return (
                          <div className="space-y-1">
                            {/* 강화 정보 바 */}
                            <div className="flex items-center justify-between bg-gray-800/70 rounded px-2 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-400">성공</span>
                                <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      successRate >= 80 ? 'bg-green-500' :
                                      successRate >= 50 ? 'bg-yellow-500' :
                                      successRate >= 30 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${successRate}%` }}
                                  />
                                </div>
                                <span className={`text-[10px] font-bold ${
                                  successRate >= 80 ? 'text-green-400' :
                                  successRate >= 50 ? 'text-yellow-400' :
                                  successRate >= 30 ? 'text-orange-400' : 'text-red-400'
                                }`}>{successRate}%</span>
                                {downgradeAmount > 0 && (
                                  <span className="text-[9px] text-red-400">📉-{downgradeAmount}</span>
                                )}
                              </div>
                              <span className="text-[9px] text-yellow-400">💰{formatNumber(enhanceCost)}</span>
                            </div>

                            {/* 강화 버튼들 (한 줄) */}
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleEnhanceClick(false)}
                                disabled={!canEnhance}
                                className={`flex-1 px-2 py-2 rounded text-xs font-bold flex items-center justify-center gap-1 ${
                                  canEnhance
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <span>🔨 강화</span>
                                <span className="text-[10px]">+{currentEnhance}</span>
                              </button>
                              {/* 하락 방지 강화 (+10 이상에서만) */}
                              {downgradeAmount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleEnhanceClick(true)}
                                  disabled={!canEnhance || !canUseProtection}
                                  className={`flex-1 px-2 py-2 rounded text-xs font-bold flex items-center justify-center gap-1 ${
                                    canEnhance && canUseProtection
                                      ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  }`}
                                  title={`하락 방지권 ${protectionRequired}개 필요`}
                                >
                                  <span>🛡️ 하락방지</span>
                                  <span className="text-[10px]">{protectionRequired}개</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 잠재옵션 + 재굴림 */}
                      {selectedItemData.stats && (() => {
                        const subStats = selectedItemData.stats
                          .map((stat, idx) => ({ ...stat, index: idx }))
                          .filter(stat => !stat.isMain);
                        const lockedCount = subStats.filter(s => s.locked).length;
                        const canReroll = orbs >= 1 && (lockedCount === 0 || sealStones >= lockedCount);

                        return (
                          <div className="bg-gray-800/50 rounded p-2">
                            {/* 잠재옵션 헤더 + 재굴림 버튼 */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                <span>⚙️ 잠재옵션</span>
                                {selectedItemData.isAncient && <span className="text-amber-400">(고대 4옵)</span>}
                                <span className="text-gray-500">🔒{lockedCount}</span>
                              </div>
                              {/* 재굴림 버튼 */}
                              <button
                                onClick={() => handleUseOrb(selectedItemData._equippedSlot)}
                                disabled={!canReroll}
                                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                                  canReroll
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                                title={lockedCount > 0 ? `재굴림 시 봉인석 ${lockedCount}개 소모` : '재굴림'}
                              >
                                <span>🔮 재굴림</span>
                                {lockedCount > 0 && <span className="text-cyan-300">🔒{lockedCount}</span>}
                              </button>
                            </div>
                            {/* 2열 배치 - 자물쇠 토글 포함 */}
                            {subStats.length > 0 && (
                              <div className="grid grid-cols-2 gap-1">
                                {subStats.map(stat => {
                                  const gradeLabel = stat.optionGrade === OPTION_GRADES.LOW ? '하' :
                                                    stat.optionGrade === OPTION_GRADES.MID ? '중' : '극';
                                  const isHigh = stat.optionGrade === OPTION_GRADES.HIGH;
                                  const isMid = stat.optionGrade === OPTION_GRADES.MID;
                                  const gradeColor = isHigh ? '#F59E0B' : '#FFFFFF';
                                  const statValue = `+${formatStatValue(stat.value, stat.suffix)}${stat.suffix || ''}`;
                                  const isLocked = stat.locked;
                                  return (
                                    <div
                                      key={stat.index}
                                      className={`flex items-center justify-between text-[9px] px-1.5 py-1 rounded ${isLocked ? 'bg-gray-600/50' : 'bg-gray-700/50'}`}
                                    >
                                      {/* 자물쇠 토글 버튼 (무료) */}
                                      <button
                                        onClick={() => handleUseSealStone(selectedItemData._equippedSlot, stat.index)}
                                        className="mr-1 text-sm transition-transform hover:scale-110 cursor-pointer"
                                        title={isLocked ? '잠금 해제' : '잠금 (재굴림 시 봉인석 소모)'}
                                      >
                                        {isLocked ? '🔒' : '🔓'}
                                      </button>
                                      <div className="flex items-center gap-0.5 min-w-0 flex-1">
                                        <span style={{ color: gradeColor }} className={`truncate ${isMid || isHigh ? 'font-bold' : ''}`}>{stat.name}</span>
                                        <span className="text-gray-600">({gradeLabel})</span>
                                      </div>
                                      <span style={{ color: gradeColor }} className={`ml-1 ${isMid || isHigh ? 'font-bold' : ''}`}>{statValue}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* 해제 버튼 */}
                      <button
                        onClick={() => {
                          handleUnequip(selectedItemData._equippedSlot);
                          setSelectedItem(null);
                        }}
                        className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded"
                      >
                        해제
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 장착 버튼 */}
                      <button
                        onClick={() => {
                          handleEquip(selectedItemData.id);
                          setSelectedItem(null);
                        }}
                        className="w-full px-3 py-2 rounded text-xs font-bold bg-gray-600 hover:bg-gray-500 text-white"
                      >
                        ⚔️ 장착
                      </button>
                      {/* 잠금/분해 버튼 */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleLock(selectedItemData.id)}
                          className={`flex-1 px-2 py-1.5 text-xs rounded font-bold ${
                            selectedItemData.locked
                              ? 'bg-amber-700 hover:bg-amber-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          }`}
                        >
                          {selectedItemData.locked ? '🔓 잠금해제' : '🔒 잠금'}
                        </button>
                        <button
                          onClick={() => {
                            if (!selectedItemData.locked) {
                              handleDisassemble(selectedItemData.id);
                              setSelectedItem(null);
                            }
                          }}
                          disabled={selectedItemData.locked}
                          className={`flex-1 px-2 py-1.5 text-xs rounded ${
                            selectedItemData.locked
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-600 hover:bg-gray-500 text-white'
                          }`}
                        >
                          🔨 분해
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-4">
                <div className="text-center">
                  <div className="text-2xl mb-1 opacity-30">⚔️</div>
                  <p className="text-[10px]">장비를 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우측 영역 (70%) - 인벤토리 */}
        <div className="w-[70%] bg-game-panel border border-game-border rounded-lg p-3 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-gray-300">🎒 인벤토리</h4>
            <div className="flex items-center gap-2">
              {/* 자동분해 토글 + 등급 선택 */}
              <div className="relative flex items-center">
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
                  onClick={() => setShowAutoDisassembleOptions(!showAutoDisassembleOptions)}
                  className="ml-1 px-1 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-[8px]"
                  title="자동분해 등급 설정"
                >
                  ▾
                </button>
                {showAutoDisassembleOptions && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-2 w-36">
                    <div className="text-[10px] text-gray-400 mb-2 font-bold">자동분해 등급</div>
                    {[
                      { id: 'white', name: '흰색', color: NORMAL_GRADES.white?.color || '#9CA3AF' },
                      { id: 'blue', name: '파란색', color: NORMAL_GRADES.blue?.color || '#3B82F6' },
                      { id: 'purple', name: '보라색', color: NORMAL_GRADES.purple?.color || '#A855F7' }
                    ].map(grade => (
                      <label key={grade.id} className="flex items-center gap-1.5 py-1 cursor-pointer hover:bg-gray-700/50 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={(settings.autoDisassembleGrades || ['white', 'blue', 'purple']).includes(grade.id)}
                          onChange={() => {
                            const currentGrades = settings.autoDisassembleGrades || ['white', 'blue', 'purple'];
                            const newGrades = currentGrades.includes(grade.id)
                              ? currentGrades.filter(g => g !== grade.id)
                              : [...currentGrades, grade.id];
                            updateSettings({ autoDisassembleGrades: newGrades });
                          }}
                          className="w-3 h-3"
                        />
                        <span className="text-[10px] font-bold" style={{ color: grade.color }}>
                          {grade.name}
                        </span>
                      </label>
                    ))}
                    <div className="text-[8px] text-gray-500 mt-1 pt-1 border-t border-gray-700">
                      체크된 등급만 자동분해
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDisassembleOptions(!showDisassembleOptions)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded text-[10px] flex items-center gap-1"
                >
                  🔨 일괄분해 ▾
                </button>
                {showDisassembleOptions && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-2 w-40">
                    <div className="text-[10px] text-gray-400 mb-2 font-bold">분해 등급 선택</div>
                    {[
                      { id: 'white', name: '흰색 (일반)', color: NORMAL_GRADES.white?.color || '#9CA3AF' },
                      { id: 'blue', name: '파란색 (고급)', color: NORMAL_GRADES.blue?.color || '#3B82F6' },
                      { id: 'purple', name: '보라색 (희귀)', color: NORMAL_GRADES.purple?.color || '#A855F7' }
                    ].map(grade => (
                      <label key={grade.id} className="flex items-center gap-1.5 py-1 cursor-pointer hover:bg-gray-700/50 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedGrades.includes(grade.id)}
                          onChange={() => toggleGradeSelection(grade.id)}
                          className="w-3 h-3"
                        />
                        <span className="text-[10px] font-bold" style={{ color: grade.color }}>
                          {grade.name}
                        </span>
                      </label>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-700 flex gap-1">
                      <button
                        onClick={() => handleDisassembleAll(selectedGrades)}
                        disabled={selectedGrades.length === 0}
                        className={`flex-1 px-2 py-1 rounded text-[10px] font-bold ${
                          selectedGrades.length > 0
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        선택 분해
                      </button>
                      <button
                        onClick={() => handleDisassembleAll(null)}
                        className="flex-1 px-2 py-1 bg-gray-500 hover:bg-gray-400 text-white rounded text-[10px] font-bold"
                      >
                        전체 분해
                      </button>
                    </div>
                    <div className="text-[8px] text-gray-500 mt-1 text-center">
                      * 잠금 아이템은 제외됨
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 슬롯별 인벤토리 그리드 */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {EQUIPMENT_SLOTS.map(slot => {
                const items = getAllItemsForSlot(slot);

                // 일반템 등급별 색상 가져오기
                const getNormalGradeColor = (normalGrade) => {
                  if (!normalGrade) return { bg: '#44403c', text: '#a8a29e' };
                  const gradeData = NORMAL_GRADES[normalGrade];
                  if (!gradeData) return { bg: '#44403c', text: '#a8a29e' };
                  return { bg: gradeData.color, text: '#000' };
                };

                return (
                  <div key={slot} className="bg-gray-800/30 rounded p-2">
                    <div className="text-[10px] text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                      <span>{SLOT_ICONS[slot]}</span>
                      <span>{EQUIPMENT_SLOT_NAMES[slot]}</span>
                      <span className="text-gray-600">({items.length})</span>
                    </div>

                    {/* 고정 높이 3줄 (44px * 3 + gap) - 스크롤 없음 */}
                    <div
                      className="flex flex-wrap gap-1 content-start overflow-hidden"
                      style={{ height: '140px', minHeight: '140px' }}
                    >
                      {items.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">
                          비어있음
                        </div>
                      ) : (
                        items.map(item => {
                          const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
                          const isSet = item.type === 'set';
                          const isAncient = item.isAncient;
                          const isEquippedItem = item._isEquipped;
                          const isSelected = selectedItem?.id === item.id || (selectedItem?._isEquipped && selectedItem?._equippedSlot === item._equippedSlot && item._isEquipped);
                          const normalColors = getNormalGradeColor(item.normalGrade);

                          // 세트템: 세트 고유 색상 테두리 + 글로우 / 일반템: 테두리 없음
                          const borderStyle = isSet
                            ? {
                                border: `2px solid ${setData?.color || '#888'}`,
                                boxShadow: `0 0 6px ${setData?.color}80`
                              }
                            : {};

                          return (
                            <ItemTooltip key={item.id || `equipped-${slot}`} item={item} equipment={equipment}>
                              <div
                                className={`w-11 h-11 relative cursor-pointer transition-all rounded ${isSelected ? 'ring-2 ring-cyan-400' : 'hover:brightness-125'}`}
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
                                      className="w-8 h-8 object-contain"
                                      style={{
                                        filter: `drop-shadow(0 0 4px ${setData?.color})`,
                                        imageRendering: 'pixelated'
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={getNormalItemImage(item.normalGrade || 'white', item.slot)}
                                      alt={item.name}
                                      className="w-8 h-8 object-contain"
                                      style={{
                                        imageRendering: 'pixelated'
                                      }}
                                    />
                                  )}
                                </div>

                                {/* 템렙 - 좌상단 (일반템도 등급 색상 적용) */}
                                <div
                                  className="absolute top-0 left-0 text-[8px] font-black px-0.5 rounded-br"
                                  style={{
                                    background: isSet ? (setData?.color || '#888') : normalColors.bg,
                                    color: isSet ? '#000' : normalColors.text
                                  }}
                                >
                                  {item.itemLevel}
                                </div>

                                {/* 강화 수치 - 좌하단 */}
                                {(item.enhanceLevel || 0) > 0 && (
                                  <div className="absolute bottom-0 left-0 text-[8px] font-black text-yellow-400 px-0.5 drop-shadow-lg">
                                    +{item.enhanceLevel}
                                  </div>
                                )}

                                {/* 장착/잠금 마크 - 우상단 */}
                                {isEquippedItem ? (
                                  <div className="absolute top-0 right-0 text-[7px] bg-green-600 text-white px-0.5 rounded-bl font-bold">
                                    E
                                  </div>
                                ) : item.locked ? (
                                  <div className="absolute top-0 right-0 text-[7px]">
                                    🔒
                                  </div>
                                ) : null}

                                {/* 고대 마크 - 우하단 안쪽 */}
                                {isAncient && (
                                  <div className="absolute bottom-0.5 right-0.5 text-[9px] z-10" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}>
                                    🔱
                                  </div>
                                )}
                              </div>
                            </ItemTooltip>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewEquipment;
