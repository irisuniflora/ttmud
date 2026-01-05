import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../store/GameContext';
import { EQUIPMENT_SETS, EQUIPMENT_SLOT_NAMES, NORMAL_GRADES, ANCIENT_CONFIG } from '../../data/equipmentSets';
import { INSCRIPTIONS, INSCRIPTION_GRADES } from '../../data/inscriptions';
import { HEROES, HERO_GRADES, getHeroById } from '../../data/heroes';
import { createEquipmentLink, createInscriptionLink, createHeroLink } from '../../utils/chatLinkParser';

// 장비 아이템 카드
const EquipmentCard = ({ item, onClick }) => {
  const setData = item.setId ? EQUIPMENT_SETS[item.setId] : null;
  const normalGrade = item.normalGrade ? NORMAL_GRADES[item.normalGrade] : null;
  const color = item.isAncient ? ANCIENT_CONFIG.color : (setData?.color || normalGrade?.color || '#888');

  return (
    <button
      onClick={() => onClick(item)}
      className="flex items-center gap-2 p-2 rounded border hover:brightness-110 transition-all text-left w-full"
      style={{ backgroundColor: `${color}15`, borderColor: `${color}50` }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate" style={{ color }}>
          {item.enhanceLevel > 0 && `+${item.enhanceLevel} `}
          {item.name || EQUIPMENT_SLOT_NAMES[item.slot]}
        </div>
        <div className="text-xs text-gray-400">
          Lv.{item.itemLevel || 1} • {EQUIPMENT_SLOT_NAMES[item.slot]}
        </div>
      </div>
    </button>
  );
};

// 문양 카드
const InscriptionCard = ({ inscription, onClick }) => {
  const inscriptionData = INSCRIPTIONS[inscription.inscriptionId];
  const gradeData = INSCRIPTION_GRADES[inscription.grade];

  if (!inscriptionData || !gradeData) return null;

  const colorMap = {
    'text-gray-400': '#9CA3AF',
    'text-green-400': '#4ADE80',
    'text-blue-400': '#60A5FA',
    'text-purple-400': '#C084FC',
    'text-yellow-400': '#FACC15',
    'text-orange-400': '#FB923C',
    'text-red-400': '#F87171',
    'text-fuchsia-500': '#D946EF'
  };
  const color = colorMap[gradeData.color] || '#888';

  return (
    <button
      onClick={() => onClick(inscription)}
      className="flex items-center gap-2 p-2 rounded border hover:brightness-110 transition-all text-left w-full"
      style={{ backgroundColor: `${color}15`, borderColor: `${color}50` }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate" style={{ color }}>
          [{gradeData.name}] {inscriptionData.name}
        </div>
        <div className="text-xs text-gray-400">
          +{inscription.level || 1}강 • 🔥 {inscriptionData.baseStats?.finalDamagePercent || 0}%
        </div>
      </div>
    </button>
  );
};

// 동료 카드
const HeroCard = ({ heroId, heroState, onClick }) => {
  const hero = getHeroById(heroId);
  const gradeData = HERO_GRADES[heroState.grade];

  if (!hero || !gradeData) return null;

  const colorMap = {
    normal: '#9CA3AF',
    rare: '#60A5FA',
    epic: '#C084FC',
    unique: '#FACC15',
    legendary: '#FB923C',
    mythic: '#F87171',
    dark: '#D946EF'
  };
  const color = colorMap[heroState.grade] || '#888';

  return (
    <button
      onClick={() => onClick(heroId, heroState)}
      className="flex items-center gap-2 p-2 rounded border hover:brightness-110 transition-all text-left w-full"
      style={{ backgroundColor: `${color}15`, borderColor: `${color}50` }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate" style={{ color }}>
          {hero.name}
        </div>
        <div className="text-xs text-gray-400">
          {gradeData.name} • {'★'.repeat(heroState.stars || 0)}{'☆'.repeat(5 - (heroState.stars || 0))}
        </div>
      </div>
    </button>
  );
};

const ItemLinkPicker = ({ isOpen, onClose, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState('equipment');
  const { gameState } = useGame();

  if (!isOpen) return null;

  const { equipment, newInventory = [], sealedZone = {}, heroes = {} } = gameState;
  const ownedInscriptions = sealedZone.ownedInscriptions || [];

  // 장착 장비 + 인벤토리 장비
  const allEquipment = [
    ...Object.values(equipment || {}).filter(Boolean),
    ...newInventory
  ];

  // 각인된 동료만
  const inscribedHeroes = Object.entries(heroes).filter(([_, state]) => state.inscribed);

  const handleEquipmentSelect = (item) => {
    const link = createEquipmentLink(item);
    onSelect(link);
  };

  const handleInscriptionSelect = (inscription) => {
    const link = createInscriptionLink(inscription);
    onSelect(link);
  };

  const handleHeroSelect = (heroId, heroState) => {
    const link = createHeroLink(heroId, heroState);
    onSelect(link);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-gray-900 border-2 border-cyan-500 rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyan-400">📎 아이템 링크 선택</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveCategory('equipment')}
            className={`px-4 py-2 rounded font-bold transition-all ${
              activeCategory === 'equipment'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⚔️ 장비 ({allEquipment.length})
          </button>
          <button
            onClick={() => setActiveCategory('inscription')}
            className={`px-4 py-2 rounded font-bold transition-all ${
              activeCategory === 'inscription'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📿 문양 ({ownedInscriptions.length})
          </button>
          <button
            onClick={() => setActiveCategory('hero')}
            className={`px-4 py-2 rounded font-bold transition-all ${
              activeCategory === 'hero'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🦸 동료 ({inscribedHeroes.length})
          </button>
        </div>

        {/* 아이템 목록 */}
        <div className="overflow-y-auto max-h-[50vh] space-y-1">
          {activeCategory === 'equipment' && (
            allEquipment.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {allEquipment.map((item, idx) => (
                  <EquipmentCard
                    key={item.id || idx}
                    item={item}
                    onClick={handleEquipmentSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                장비가 없습니다
              </div>
            )
          )}

          {activeCategory === 'inscription' && (
            ownedInscriptions.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {ownedInscriptions.map((inscription, idx) => (
                  <InscriptionCard
                    key={inscription.id || idx}
                    inscription={inscription}
                    onClick={handleInscriptionSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                보유한 문양이 없습니다
              </div>
            )
          )}

          {activeCategory === 'hero' && (
            inscribedHeroes.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {inscribedHeroes.map(([heroId, heroState]) => (
                  <HeroCard
                    key={heroId}
                    heroId={heroId}
                    heroState={heroState}
                    onClick={handleHeroSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                각인된 동료가 없습니다
              </div>
            )
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mt-4 pt-3 border-t border-gray-700 text-center text-xs text-gray-500">
          클릭하면 채팅에 링크가 삽입됩니다
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ItemLinkPicker;
