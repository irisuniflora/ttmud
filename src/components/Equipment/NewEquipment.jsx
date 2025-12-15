import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOT_NAMES, EQUIPMENT_SETS, getUpgradeCost, OPTION_GRADES } from '../../data/equipmentSets';
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

  // 장비 오브 사용
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
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-cyan-400">
              🔧 조각: <span className="text-yellow-400 font-bold">{formatNumber(equipmentFragments)}</span>
            </span>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-purple-400">
              ✨ 각성석: <span className="text-purple-300 font-bold">{awakenStones}</span>
            </span>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-pink-400">
              💎 정수: <span className="text-pink-300 font-bold">{perfectEssences}</span>
            </span>
            <span className="text-xs bg-game-panel px-2 py-1 rounded text-blue-400">
              🔮 오브: <span className="text-blue-300 font-bold">{orbs}</span>
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

        {/* 장착 슬롯 */}
        <div className="grid grid-cols-6 gap-2">
          {EQUIPMENT_SLOTS.map(slot => {
            const item = equipment[slot];
            const setData = item?.setId ? EQUIPMENT_SETS[item.setId] : null;
            const setCounts = getSetCounts();
            const setCount = item?.setId ? (setCounts[item.setId] || 0) : 0;
            const isSetActive = setCount >= 3;
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
                    className={`relative overflow-hidden rounded-lg ${
                      item.type === 'set' ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-gray-700 to-gray-800'
                    }`}
                    style={item.type === 'set' ? {
                      border: `2px solid ${setData?.color}`,
                      boxShadow: `0 0 15px ${setData?.color}50, inset 0 0 20px ${setData?.color}15`
                    } : { border: '1px solid #4B5563' }}
                  >
                    {/* 상단 장식 라인 */}
                    {item.type === 'set' && (
                      <div
                        className="absolute top-0 left-0 right-0 h-0.5"
                        style={{ background: `linear-gradient(90deg, transparent, ${setData?.color}, transparent)` }}
                      />
                    )}

                    {/* 배경 글로우 */}
                    {item.type === 'set' && (
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: `radial-gradient(ellipse at top, ${setData?.color}40 0%, transparent 60%)`
                        }}
                      />
                    )}

                    {/* 아이템 이미지 영역 */}
                    <div className="relative flex justify-center py-4 mb-2">
                      {/* 아이콘 배경 원형 글로우 */}
                      {item.type === 'set' && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div
                            className="w-16 h-16 rounded-full opacity-40 blur-sm"
                            style={{ background: `radial-gradient(circle, ${setData?.color}60 0%, transparent 70%)` }}
                          />
                        </div>
                      )}
                      {item.type === 'set' ? (
                        <img
                          src={getSetItemImage(item.setId, slot)}
                          alt={item.name}
                          className="w-14 h-14 object-contain relative z-10"
                          style={{
                            filter: `drop-shadow(0 0 8px ${setData?.color}) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
                            imageRendering: 'pixelated'
                          }}
                        />
                      ) : (
                        <span className="text-4xl relative z-10 drop-shadow-lg">{SLOT_ICONS[slot]}</span>
                      )}
                    </div>

                    {/* 정보 영역 */}
                    <div className="relative px-2 pb-2">
                      {/* 아이템 이름 */}
                      {item.type === 'set' ? (
                        <div
                          className={`relative rounded-md px-1.5 py-1 mb-2 ${isSetActive ? 'ring-2 ring-yellow-400/70' : ''}`}
                          style={{
                            backgroundColor: setData?.color,
                            boxShadow: `0 2px 8px ${setData?.color}50`
                          }}
                        >
                          <p
                            className="text-[11px] font-bold text-center leading-tight tracking-wide"
                            style={{
                              color: getContrastTextColor(setData?.color),
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                          >
                            {setData?.name}
                          </p>
                          {isSetActive && (
                            <div className="absolute -top-1.5 -right-1.5 text-sm animate-pulse">✨</div>
                          )}
                        </div>
                      ) : (
                        <p className="relative text-[11px] mb-2 font-bold text-center text-gray-400 leading-tight bg-gray-700/50 rounded py-1">
                          {EQUIPMENT_SLOT_NAMES[slot]}
                        </p>
                      )}

                      {/* 템렙 & 각성 & 업글 횟수 */}
                      <div className="relative flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-yellow-900/40 px-1.5 py-0.5 rounded border border-yellow-600/30">
                            <span className="text-[9px] text-yellow-400 font-bold leading-none">Lv.{item.itemLevel}</span>
                          </div>
                          {(item.awakeningCount || 0) > 0 && (
                            <div className="flex items-center bg-purple-900/40 px-1.5 py-0.5 rounded border border-purple-600/30">
                              <span className="text-[9px] text-purple-400 font-bold leading-none">⭐{item.awakeningCount}</span>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center px-1.5 py-0.5 rounded border ${upgradesLeft > 0 ? 'bg-cyan-900/40 border-cyan-600/30' : 'bg-red-900/40 border-red-600/30'}`}>
                          <span className={`text-[9px] font-bold leading-none ${upgradesLeft > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                            {upgradesLeft}회
                          </span>
                        </div>
                      </div>

                      {/* 스탯 - 기본옵션 + 잠재옵션 분리 */}
                      <div className="relative text-[9px] bg-black/20 rounded p-1.5 mb-2 min-h-[60px]">
                        {/* 기본 옵션 */}
                        {item.stats.filter(s => s.isMain).map((stat, idx) => {
                          // 몬스터 감소는 - 표시
                          const isReduction = stat.id === 'monstersPerStageReduction';
                          return (
                            <div key={`main-${idx}`} className="flex justify-between items-center text-cyan-300">
                              <span className="truncate max-w-[60px]">{stat.name}</span>
                              <span className="font-medium">{isReduction ? '-' : '+'}{formatStatValue(stat.value, stat.suffix)}{stat.suffix}</span>
                            </div>
                          );
                        })}
                        {/* 구분선 */}
                        <div className="border-t border-dashed border-gray-600 my-1"></div>
                        {/* 잠재 옵션 */}
                        {item.stats.map((stat, idx) => {
                          if (stat.isMain) return null;
                          const optionGrade = stat.optionGrade ?? OPTION_GRADES.LOW;
                          const isMaxed = optionGrade === OPTION_GRADES.HIGH;

                          // 하옵: 회색, 중옵: 연두색, 극옵: 빨간색
                          let optionColorClass = 'text-gray-400';
                          if (optionGrade === OPTION_GRADES.HIGH) {
                            optionColorClass = 'text-red-400';
                          } else if (optionGrade === OPTION_GRADES.MID) {
                            optionColorClass = 'text-green-400';
                          }

                          const canPerfect = perfectEssences > 0 && !isMaxed && stat.id !== 'monstersPerStageReduction';

                          return (
                            <div key={`pot-${idx}`} className="flex justify-between items-center group">
                              <span className={`truncate ${optionColorClass}`}>
                                {stat.name}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className={`font-medium ${optionGrade === OPTION_GRADES.HIGH ? 'text-red-400' : optionGrade === OPTION_GRADES.MID ? 'text-green-400' : 'text-gray-400'}`}>
                                  +{formatStatValue(stat.value, stat.suffix)}{stat.suffix}
                                </span>
                                {canPerfect && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUsePerfectEssence(slot, idx);
                                    }}
                                    className="text-[7px] px-1 py-0.5 bg-pink-600 hover:bg-pink-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="완벽의 정수 사용 (극옵화)"
                                  >
                                    💎
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 버튼들 */}
                      <div className="relative space-y-1.5">
                        {upgradesLeft > 0 ? (
                          <button
                            onClick={() => handleUpgrade(slot)}
                            disabled={!canUpgrade}
                            className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                              canUpgrade
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-100'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1">
                              <span className="text-yellow-300">⚡</span> +1
                              <span className={`text-[9px] ${equipmentFragments >= upgradeCost ? 'opacity-80' : 'text-red-400'}`}>
                                ({equipmentFragments}/{upgradeCost})
                              </span>
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAwaken(slot)}
                            disabled={!canAwaken}
                            className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                              canAwaken
                                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-400 hover:via-pink-400 hover:to-purple-400 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-400/60 hover:scale-[1.02] active:scale-100 animate-pulse'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1">
                              <span>✨</span> 각성
                              <span className={`text-[9px] ${awakenStones > 0 ? 'opacity-80' : 'text-red-400'}`}>
                                (💎{awakenStones})
                              </span>
                            </span>
                          </button>
                        )}
                        {/* 오브 재굴림 버튼 */}
                        {orbs > 0 && (
                          <button
                            onClick={() => handleUseOrb(slot)}
                            className="w-full py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white transition-all"
                          >
                            🔮 옵션 재굴림 ({orbs})
                          </button>
                        )}
                        <button
                          onClick={() => handleUnequip(slot)}
                          className="w-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-[10px] py-1 rounded border border-gray-700 hover:border-gray-600 transition-all"
                        >
                          해제
                        </button>
                      </div>
                    </div>

                    {/* 하단 장식 라인 */}
                    {item.type === 'set' && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: `linear-gradient(90deg, transparent, ${setData?.color}60, transparent)` }}
                      />
                    )}
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
        <div className="bg-game-panel border border-game-border rounded-lg p-3 overflow-visible">
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
            <div className="space-y-2 max-h-[250px] overflow-y-auto py-1">
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
                            className={`border rounded p-1 relative group cursor-pointer hover:scale-110 hover:z-10 transition-all ${
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
                              <p
                                className="relative text-[7px] text-center font-bold text-black px-0.5 rounded"
                                style={{
                                  backgroundColor: setData?.color,
                                  textShadow: '0 0 2px rgba(255,255,255,0.5)'
                                }}
                              >
                                {setData?.name}
                              </p>
                            )}

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
