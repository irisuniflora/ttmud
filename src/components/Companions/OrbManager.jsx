import React, { useState } from 'react';
import { COMPANION_CATEGORIES, COMPANION_GRADES } from '../../data/companions';
import { ORBS, ORB_GRADES, getOrbById, getOrbDisplayInfo, getOrbEffect } from '../../data/orbs';

const OrbManager = ({
  companionId,
  companion,
  companionState,
  availableOrbs = [],
  onEquip,
  onUnequip,
  onClose
}) => {
  const [selectedSlot, setSelectedSlot] = useState(0);

  if (!companion) return null;

  const category = COMPANION_CATEGORIES[companion.category];
  const grade = COMPANION_GRADES[companion.grade];
  const maxSlots = grade.orbSlots;
  const equippedOrbs = companionState?.equippedOrbs || [];

  // 장착 가능한 오브 (다른 동료에게 장착되지 않은 것)
  const unequippedOrbs = availableOrbs.filter(orb => !orb.equippedTo);

  // 현재 슬롯의 오브
  const currentSlotOrb = equippedOrbs[selectedSlot];
  const currentOrbInfo = currentSlotOrb ? getOrbDisplayInfo(currentSlotOrb) : null;
  const currentOrbData = currentSlotOrb ? getOrbById(currentSlotOrb.orbType) : null;

  // 시너지 체크
  const hasSynergy = (orbType) => {
    const orbData = ORBS.find(o => o.id === orbType);
    return orbData?.category === companion.category;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border-2 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        style={{ borderColor: category.color }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: `${category.color}30` }}
            >
              🌀
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: category.color }}>
                {companion.name}
              </h3>
              <p className="text-xs text-gray-400">오브 관리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* 오브 슬롯 */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">오브 슬롯 ({maxSlots}개)</p>
          <div className="flex gap-2 justify-center">
            {[...Array(maxSlots)].map((_, idx) => {
              const orb = equippedOrbs[idx];
              const orbInfo = orb ? getOrbDisplayInfo(orb) : null;
              const orbData = orb ? getOrbById(orb.orbType) : null;
              const synergy = orb && hasSynergy(orb.orbType);
              const isSelected = selectedSlot === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSlot(idx)}
                  className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSelected ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                  } ${orb ? '' : 'border-dashed'}`}
                  style={{
                    borderColor: orb ? orbData?.color : '#4B5563',
                    backgroundColor: orb ? `${orbData?.color}30` : 'transparent',
                    boxShadow: synergy ? `0 0 12px ${orbData?.color}` : 'none'
                  }}
                >
                  {orb ? (
                    <>
                      <img
                        src={`/images/orbs/${orb.orbType}.png`}
                        alt={orbInfo?.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-[8px] font-bold" style={{ color: orbData?.color }}>
                        {orbInfo?.gradeName}
                      </span>
                      {synergy && (
                        <span className="text-[8px] text-yellow-400">✨</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-600 text-xl">+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 현재 슬롯 정보 */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-400 mb-2">슬롯 {selectedSlot + 1}</p>
          {currentSlotOrb ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentOrbData?.color}40` }}
                >
                  <img
                    src={`/images/orbs/${currentSlotOrb.orbType}.png`}
                    alt={currentOrbInfo?.name}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <p className="font-bold" style={{ color: currentOrbData?.color }}>
                    {currentOrbInfo?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentOrbInfo?.statName} +{currentOrbInfo?.value}{currentOrbInfo?.unit}
                    {hasSynergy(currentSlotOrb.orbType) && (
                      <span className="text-yellow-400 ml-1">(×1.5 시너지!)</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onUnequip(companionId, selectedSlot)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded font-bold"
              >
                해제
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">빈 슬롯 - 아래에서 오브를 선택하세요</p>
          )}
        </div>

        {/* 보유 오브 목록 */}
        <div>
          <p className="text-sm text-gray-400 mb-2">🌀 보유 오브 ({unequippedOrbs.length}개)</p>

          {unequippedOrbs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              장착 가능한 오브가 없습니다.
              <br />
              <span className="text-xs">크리스탈 상점에서 뽑기를 해보세요!</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {unequippedOrbs.map((orb, idx) => {
                const orbData = getOrbById(orb.orbType);
                const orbGrade = ORB_GRADES[orb.grade];
                const synergy = hasSynergy(orb.orbType);
                const effect = getOrbEffect(orb, companion.category);

                return (
                  <div
                    key={orb.id || idx}
                    onClick={() => onEquip(companionId, orb.id, selectedSlot)}
                    className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                      synergy ? 'ring-2 ring-yellow-400/50' : ''
                    }`}
                    style={{
                      borderColor: orbData?.color,
                      backgroundColor: `${orbData?.color}20`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={`/images/orbs/${orb.orbType}.png`}
                        alt={orbData?.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-xs font-bold" style={{ color: orbGrade?.color }}>
                        {orbGrade?.name}
                      </span>
                    </div>
                    <p className="text-xs font-bold" style={{ color: orbData?.color }}>
                      {orbData?.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {orbData?.statName} +{effect.value.toFixed(0)}{orbData?.unit}
                      {synergy && <span className="text-yellow-400"> ✨</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 시너지 설명 */}
        <div className="mt-4 p-2 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">
            💡 <span style={{ color: category.color }}>{category.name}</span> 계열 동료에게
            같은 색상의 오브를 장착하면 <span className="text-yellow-400">1.5배 시너지</span>!
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrbManager;
