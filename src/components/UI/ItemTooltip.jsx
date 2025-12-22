import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EQUIPMENT_SETS, EQUIPMENT_SLOT_NAMES, OPTION_GRADES, ANCIENT_CONFIG, NORMAL_GRADES } from '../../data/equipmentSets';
import { formatNumber, formatStatValue } from '../../utils/formatter';

// 툴팁 컴포넌트 - 마우스 오버 시 아이템 정보 표시
const ItemTooltip = ({ item, children, equipment = {}, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // 세트 개수 계산
  const getSetCount = (setId) => {
    if (!setId) return 0;
    let count = 0;
    Object.values(equipment).forEach(eq => {
      if (eq && eq.setId === setId) count++;
    });
    return count;
  };

  // 마우스 위치에 따라 툴팁 위치 계산
  const updatePosition = (e) => {
    if (!tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = e.clientX + 15;
    let y = e.clientY + 10;

    // 오른쪽 경계 체크
    if (x + tooltipRect.width > viewportWidth - 10) {
      x = e.clientX - tooltipRect.width - 15;
    }

    // 하단 경계 체크
    if (y + tooltipRect.height > viewportHeight - 10) {
      y = viewportHeight - tooltipRect.height - 10;
    }

    // 상단 경계 체크
    if (y < 10) {
      y = 10;
    }

    setPosition({ x, y });
  };

  const handleMouseEnter = (e) => {
    if (disabled || !item) return;
    setIsVisible(true);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    if (disabled || !item) return;
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  if (!item) {
    return children;
  }

  const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
  const normalGradeData = item.normalGrade ? NORMAL_GRADES[item.normalGrade] : null;
  const isSet = item.type === 'set';
  const isAncient = item.isAncient;
  const setCount = getSetCount(item.setId);

  // 이름 색상 결정
  const getNameColor = () => {
    if (isAncient) return ANCIENT_CONFIG.color;
    if (isSet && setData) return setData.color;
    if (normalGradeData) return normalGradeData.color;
    return '#9CA3AF';
  };

  // 제련도 표시 (10회 만땅 기준)
  const getRefineLevel = () => {
    const upgradesLeft = item.upgradesLeft ?? 10;
    return 10 - upgradesLeft; // 0~10
  };

  const tooltip = (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.1s ease-in-out',
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      {/* 메이플스토리 스타일 툴팁 */}
      <div
        className="rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          border: `2px solid ${isAncient ? ANCIENT_CONFIG.color : (setData?.color || '#444')}`,
          minWidth: '280px',
          maxWidth: '320px',
        }}
      >
        {/* 헤더 - 아이템 이름 */}
        <div
          className="px-3 py-2 text-center"
          style={{
            background: isAncient
              ? `linear-gradient(180deg, ${ANCIENT_CONFIG.color}30, transparent)`
              : isSet
                ? `linear-gradient(180deg, ${setData?.color}30, transparent)`
                : 'linear-gradient(180deg, #333, transparent)',
            borderBottom: '1px solid #333',
          }}
        >
          {/* 고대 뱃지 */}
          {isAncient && (
            <div
              className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-1"
              style={{
                background: `linear-gradient(135deg, ${ANCIENT_CONFIG.color}, ${ANCIENT_CONFIG.glowColor})`,
                color: '#000'
              }}
            >
              {ANCIENT_CONFIG.icon} 고대
            </div>
          )}

          {/* 아이템 이름 */}
          <div
            className="font-bold text-sm"
            style={{ color: getNameColor(), textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
          >
            {item.name || `${EQUIPMENT_SLOT_NAMES[item.slot]}`}
          </div>

          {/* 세트명 */}
          {isSet && setData && (
            <div className="text-xs mt-0.5" style={{ color: setData.color }}>
              {setData.icon} {setData.name} 세트
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="px-3 py-2 border-b border-gray-700">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">장비분류</span>
            <span className="text-white">{EQUIPMENT_SLOT_NAMES[item.slot]}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-gray-400">아이템 레벨</span>
            <span className="text-yellow-400 font-bold">Lv.{item.itemLevel || 1}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-gray-400">제련도</span>
            <span className={getRefineLevel() >= 10 ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
              {getRefineLevel()}/10
            </span>
          </div>
          {(item.awakeningCount || 0) > 0 && (
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-gray-400">각성</span>
              <span className="text-purple-400 font-bold">⭐ {item.awakeningCount}</span>
            </div>
          )}
        </div>

        {/* 기본 능력치 */}
        {item.stats && item.stats.filter(s => s.isMain).length > 0 && (
          <div className="px-3 py-2 border-b border-gray-700">
            <div className="text-xs text-gray-500 mb-1">기본 능력치</div>
            {item.stats.filter(s => s.isMain).map((stat, idx) => {
              const isReduction = stat.id === 'monstersPerStageReduction';
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-cyan-300">{stat.name}</span>
                  <span className="text-cyan-300 font-bold">
                    {isReduction ? '-' : '+'}{formatStatValue(stat.value, stat.suffix)}{stat.suffix}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 잠재 능력치 */}
        {item.stats && item.stats.filter(s => !s.isMain).length > 0 && (
          <div className="px-3 py-2 border-b border-gray-700">
            <div className="text-xs text-gray-500 mb-1">잠재옵션</div>
            {item.stats.filter(s => !s.isMain).map((stat, idx) => {
              const optionGrade = stat.optionGrade ?? OPTION_GRADES.LOW;
              const gradeColor = optionGrade === OPTION_GRADES.HIGH
                ? '#EF4444' // 극옵 - 빨강
                : optionGrade === OPTION_GRADES.MID
                  ? '#4ADE80' // 중옵 - 연두
                  : '#9CA3AF'; // 하옵 - 회색
              const gradeLabel = optionGrade === OPTION_GRADES.HIGH
                ? '(극옵)'
                : optionGrade === OPTION_GRADES.MID
                  ? '(중옵)'
                  : '(하옵)';

              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span style={{ color: gradeColor }}>{stat.name}</span>
                  <span style={{ color: gradeColor }} className="font-bold">
                    +{formatStatValue(stat.value, stat.suffix)}{stat.suffix}
                    <span className="text-[10px] ml-1 opacity-70">{gradeLabel}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 세트 효과 */}
        {isSet && setData && (
          <div className="px-3 py-2">
            <div className="text-xs mb-2" style={{ color: setData.color }}>
              {setData.icon} {setData.name} 세트 효과
            </div>

            {/* 세트 아이템 목록 */}
            <div className="flex flex-wrap gap-1 mb-2">
              {['weapon', 'armor', 'gloves', 'boots', 'necklace', 'ring'].map(slot => {
                const hasSlot = Object.values(equipment).some(eq => eq?.setId === item.setId && eq?.slot === slot);
                return (
                  <span
                    key={slot}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${hasSlot ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}
                  >
                    {EQUIPMENT_SLOT_NAMES[slot]}
                  </span>
                );
              })}
            </div>

            {/* 3세트 효과 */}
            <div className={`text-xs py-1 ${setCount >= 3 ? 'text-green-400' : 'text-gray-500'}`}>
              <span className="font-bold">3세트 효과</span>
              <span className="text-gray-500 ml-1">({setCount}/3)</span>
              <div className="mt-0.5 pl-2">
                {setData.setBonus[3].description}
              </div>
            </div>

            {/* 6세트 효과 */}
            <div className={`text-xs py-1 ${setCount >= 6 ? 'text-green-400' : 'text-gray-500'}`}>
              <span className="font-bold">6세트 효과</span>
              <span className="text-gray-500 ml-1">({setCount}/6)</span>
              <div className="mt-0.5 pl-2">
                {setData.setBonus[6].description}
              </div>
            </div>
          </div>
        )}

        {/* 하단 정보 */}
        <div
          className="px-3 py-2 text-center text-[10px] text-gray-500"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          {item.dropFloor && <span>획득: {item.dropFloor}층</span>}
          {item.fromShop && <span> (상점)</span>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {createPortal(tooltip, document.body)}
    </>
  );
};

export default ItemTooltip;
