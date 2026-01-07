import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { COMPANIONS, COMPANION_CATEGORIES, COMPANION_GRADES, GRADE_ORDER, getCompanionById } from '../../data/companions';
import CompanionCard from './CompanionCard';
import OrbManager from './OrbManager';
import OrbWorkshop from './OrbWorkshop';
import NotificationModal from '../UI/NotificationModal';
import DiamondShop from './DiamondShop';
import CompanionEffects from './CompanionEffects';

const CompanionList = () => {
  const { gameState, upgradeCompanionStar, equipOrbToCompanion, unequipOrbFromCompanion, equipCompanion, unequipCompanion } = useGame();
  const { companions = {}, companionCards = {}, companionOrbs = [], companionSlots = {} } = gameState;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [showOnlyOwned, setShowOnlyOwned] = useState(false);
  const [managingOrbsFor, setManagingOrbsFor] = useState(null);
  const [showSummonModal, setShowSummonModal] = useState(false);
  const [showOrbWorkshop, setShowOrbWorkshop] = useState(false);

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

  // 필터링된 동료 목록
  const filteredCompanions = COMPANIONS.filter(comp => {
    if (selectedCategory !== 'all' && comp.category !== selectedCategory) return false;
    if (selectedGrade !== 'all' && comp.grade !== selectedGrade) return false;
    if (showOnlyOwned && !companions[comp.id]?.owned) return false;
    return true;
  });

  // 계열별 그룹화
  const groupedByCategory = {};
  Object.keys(COMPANION_CATEGORIES).forEach(catId => {
    groupedByCategory[catId] = filteredCompanions.filter(c => c.category === catId);
  });

  // 별 업그레이드 핸들러
  const handleUpgradeStar = (companionId) => {
    if (!upgradeCompanionStar) {
      showNotification('오류', '별 업그레이드 기능이 준비 중입니다.', 'error');
      return;
    }
    const result = upgradeCompanionStar(companionId);
    if (result?.success) {
      showNotification('별 업그레이드!', `${result.companionName}의 별이 올라갔습니다!`, 'success');
    } else {
      showNotification('업그레이드 실패', result?.message || '카드가 부족합니다.', 'warning');
    }
  };

  // 오브 관리 모달 열기
  const handleManageOrbs = (companionId) => {
    setManagingOrbsFor(companionId);
  };

  // 오브 장착
  const handleEquipOrb = (companionId, orbId, slotIndex) => {
    if (!equipOrbToCompanion) {
      showNotification('오류', '오브 장착 기능이 준비 중입니다.', 'error');
      return;
    }
    equipOrbToCompanion(companionId, orbId, slotIndex);
  };

  // 오브 해제
  const handleUnequipOrb = (companionId, slotIndex) => {
    if (!unequipOrbFromCompanion) {
      showNotification('오류', '오브 해제 기능이 준비 중입니다.', 'error');
      return;
    }
    unequipOrbFromCompanion(companionId, slotIndex);
  };

  // 동료 장착/해제
  const handleCompanionClick = (companionId, category) => {
    const compState = companions[companionId];
    if (!compState || !compState.owned) {
      showNotification('미보유', '보유하지 않은 동료입니다.', 'warning');
      return;
    }

    const currentEquipped = companionSlots[category];

    if (currentEquipped === companionId) {
      // 이미 장착된 동료 클릭 -> 해제
      const result = unequipCompanion(category);
      if (result?.success) {
        showNotification('해제', result.message, 'info');
      }
    } else {
      // 다른 동료 클릭 -> 장착 (기존 장착된 동료는 자동 해제됨)
      const result = equipCompanion(companionId);
      if (result?.success) {
        showNotification('장착', result.message, 'success');
      } else {
        showNotification('장착 실패', result?.message || '장착에 실패했습니다.', 'error');
      }
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

      {/* 오브 관리 모달 */}
      {managingOrbsFor && (
        <OrbManager
          companionId={managingOrbsFor}
          companion={getCompanionById(managingOrbsFor)}
          companionState={companions[managingOrbsFor]}
          availableOrbs={companionOrbs}
          onEquip={handleEquipOrb}
          onUnequip={handleUnequipOrb}
          onClose={() => setManagingOrbsFor(null)}
        />
      )}

      {/* 오브 공방 모달 */}
      {showOrbWorkshop && (
        <OrbWorkshop onClose={() => setShowOrbWorkshop(false)} />
      )}

      <div className="space-y-4 p-2">
        {/* 동료 효과 요약 */}
        <CompanionEffects />

        {/* 보유 오브 현황 + 공방 버튼 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌀</span>
                <span className="font-bold text-blue-300">보유 오브</span>
              </div>
              <span className="text-2xl font-bold text-white">{companionOrbs.length}개</span>
            </div>
          </div>
          <button
            onClick={() => setShowOrbWorkshop(true)}
            className="bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 border border-purple-400 rounded-lg p-3 font-bold text-white transition-all transform hover:scale-105"
          >
            🔮 오브 공방
          </button>
        </div>

        {/* 필터 + 소환 버튼 */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {/* 계열 필터 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-200"
          >
            <option value="all">모든 계열</option>
            {Object.entries(COMPANION_CATEGORIES).map(([id, cat]) => (
              <option key={id} value={id} style={{ color: cat.color }}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* 등급 필터 */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-200"
          >
            <option value="all">모든 등급</option>
            {GRADE_ORDER.map(gradeId => (
              <option key={gradeId} value={gradeId} style={{ color: COMPANION_GRADES[gradeId].color }}>
                {COMPANION_GRADES[gradeId].name}
              </option>
            ))}
          </select>

          {/* 보유만 보기 */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyOwned}
              onChange={(e) => setShowOnlyOwned(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            보유만 보기
          </label>

          {/* 소환 버튼 */}
          <button
            onClick={() => setShowSummonModal(true)}
            className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            🎴 소환
          </button>
        </div>

        {/* 계열별 섹션 */}
        {Object.entries(COMPANION_CATEGORIES).map(([catId, category]) => {
          const categoryCompanions = groupedByCategory[catId];
          if (!categoryCompanions || categoryCompanions.length === 0) return null;

          return (
            <div key={catId} className="space-y-2">
              {/* 계열 헤더 */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-bold" style={{ color: category.color }}>
                  {category.name}
                </span>
                <span className="text-xs text-gray-400">
                  - {category.description}
                </span>
              </div>

              {/* 동료 그리드 */}
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
                {categoryCompanions.map(comp => {
                  const compState = companions[comp.id] || { owned: false, stars: 0, equippedOrbs: [] };
                  const cardCount = companionCards[comp.id] || 0;
                  const isEquipped = companionSlots[comp.category] === comp.id;

                  return (
                    <CompanionCard
                      key={comp.id}
                      companion={comp}
                      owned={compState.owned}
                      stars={compState.stars}
                      cardCount={cardCount}
                      equippedOrbs={compState.equippedOrbs || []}
                      onUpgradeStar={handleUpgradeStar}
                      onManageOrbs={handleManageOrbs}
                      isEquipped={isEquipped}
                      onClick={handleCompanionClick}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredCompanions.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            조건에 맞는 동료가 없습니다.
          </div>
        )}

        {/* 소환 플로팅 모달 */}
        {showSummonModal && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowSummonModal(false)}
          >
            <div
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">🎴 동료 소환</h3>
                <button
                  onClick={() => setShowSummonModal(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* 다이아몬드 샵 */}
              <DiamondShop />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CompanionList;
