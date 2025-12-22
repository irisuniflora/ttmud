import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import {
  PRESTIGE_RELICS,
  calculateRelicEffect,
  getRelicUpgradeCost,
  getRelicGachaCost,
  getTotalRelicEffects
} from '../../data/prestigeRelics';
import { formatNumber } from '../../utils/formatter';
import NotificationModal from '../UI/NotificationModal';

// GitHub Pages 배포용 BASE_URL
const BASE_URL = import.meta.env.BASE_URL || '/';

// 유물 이미지 컴포넌트 (png → jpg → jpeg 순서로 시도, 모두 실패 시 이모지 fallback)
const RelicImage = ({ relicId, icon, size = 48 }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const extensions = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'];

  const handleError = () => {
    if (imgIndex < extensions.length - 1) {
      setImgIndex(imgIndex + 1);
    } else {
      setImgIndex(-1); // 모든 확장자 실패
    }
  };

  if (imgIndex === -1) {
    return <span style={{ fontSize: size * 0.7 }}>{icon}</span>;
  }

  return (
    <div
      className="rounded-lg p-1"
      style={{
        background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(30,30,40,0.8) 70%)',
        boxShadow: '0 0 12px rgba(147,51,234,0.4), inset 0 0 8px rgba(147,51,234,0.2)'
      }}
    >
      <img
        src={`${BASE_URL}images/relics/${relicId}.${extensions[imgIndex]}`}
        alt={relicId}
        className="object-contain rounded-md"
        style={{ width: size, height: size }}
        onError={handleError}
      />
    </div>
  );
};

const PrestigeRelics = () => {
  const { gameState, gachaRelic: doGachaRelic, upgradeRelic: doUpgradeRelic } = useGame();
  const { player, prestigeRelics = {}, relicFragments = 0, relicGachaCount = 0 } = gameState;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [showEffectsPopup, setShowEffectsPopup] = useState(false);

  const showNotification = (title, message, type = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  // 현재 가챠 비용 계산
  const currentGachaCost = getRelicGachaCost(relicGachaCount);

  // 유물 효과 합산
  const totalRelicEffects = getTotalRelicEffects(prestigeRelics);
  const relicUpgradeCostReduction = totalRelicEffects.relicUpgradeCostReduction || 0;

  // 아직 보유하지 않은 유물 목록
  const unownedRelicIds = Object.keys(PRESTIGE_RELICS).filter(id => !prestigeRelics[id]);
  const hasAllRelics = unownedRelicIds.length === 0;

  // 유물 뽑기 (GameEngine을 통해)
  const handleGachaRelic = () => {
    const result = doGachaRelic();
    if (result.success) {
      showNotification('유물 획득!', result.message, 'success');
    } else {
      showNotification('소환 실패', result.message, 'warning');
    }
  };

  // 유물 레벨업 (GameEngine을 통해)
  const handleUpgradeRelic = (relicId) => {
    const result = doUpgradeRelic(relicId);
    if (!result.success) {
      showNotification('강화 실패', result.message, 'warning');
    }
  };

  // 카테고리별 유물 필터링
  const categories = {
    all: '전체',
    prestige: '환생',
    gold: '골드',
    damage: '데미지',
    equipment: '장비',
    inscription: '문양',
    collection: '도감',
    monster: '몬스터',
    utility: '유틸리티'
  };

  const ownedRelics = Object.entries(prestigeRelics)
    .filter(([relicId, data]) => {
      if (selectedCategory === 'all') return true;
      const relic = PRESTIGE_RELICS[relicId];
      return relic && relic.category === selectedCategory;
    })
    .map(([relicId, data]) => ({
      relicId,
      ...data,
      ...PRESTIGE_RELICS[relicId]
    }));

  return (
    <div className="space-y-3">
      {/* 헤더 + 소환 합친 컴팩트 UI */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500 rounded-lg p-3">
        <div className="flex items-center justify-between gap-3">
          {/* 왼쪽: 제목 + 보유 조각 */}
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-purple-300">고대 유물</h2>
              <p className="text-xs text-gray-400">미보유: {unownedRelicIds.length} / {Object.keys(PRESTIGE_RELICS).length}</p>
            </div>
            <div className="text-2xl font-bold text-pink-400">🏺 {relicFragments}</div>
          </div>

          {/* 오른쪽: 소환 버튼 */}
          <button
            onClick={handleGachaRelic}
            disabled={relicFragments < currentGachaCost || hasAllRelics}
            className={`px-4 py-2 rounded font-bold text-sm transition-all whitespace-nowrap ${
              hasAllRelics
                ? 'bg-green-800 text-green-300 cursor-not-allowed'
                : relicFragments < currentGachaCost
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
            }`}
          >
            {hasAllRelics ? '✓ 모두 보유' : `소환 (🏺 ${currentGachaCost})`}
          </button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-game-panel border border-game-border rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded text-sm font-bold transition-all ${
                selectedCategory === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* 보유 유물 */}
      <div className="bg-game-panel border border-game-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">
            보유 유물 ({ownedRelics.length})
            {relicUpgradeCostReduction > 0 && (
              <span className="text-sm text-green-400 ml-2">
                (강화 비용 -{relicUpgradeCostReduction.toFixed(0)}%)
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowEffectsPopup(true)}
            className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold rounded transition-all"
          >
            📊 전체 효과
          </button>
        </div>

        {ownedRelics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedCategory === 'all' ? '보유한 유물이 없습니다' : '이 카테고리의 유물이 없습니다'}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {ownedRelics.map(relicData => {
              const { relicId, level, name, icon, description, maxLevel, effectPerLevel, effectType, category } = relicData;
              const effect = calculateRelicEffect(relicId, level);
              const upgradeCost = getRelicUpgradeCost(level, relicUpgradeCostReduction);
              const canUpgrade = relicFragments >= upgradeCost;
              const isMaxLevel = maxLevel && level >= maxLevel;

              // 다음 레벨 효과 계산
              const nextEffect = !isMaxLevel ? calculateRelicEffect(relicId, level + 1) : null;

              // 효과 접미사
              const getSuffix = () => {
                if (effectType?.includes('Percent') || effectType?.includes('Chance') ||
                    effectType?.includes('Spawn') || effectType?.includes('Reduction') ||
                    effectType?.includes('Bonus')) return '%';
                if (effectType === 'bossTimeLimit') return '초';
                if (effectType === 'monstersPerStageReduction') return '마리';
                return '';
              };

              return (
                <div
                  key={relicId}
                  className="bg-gray-800 border border-purple-700 rounded-lg p-2 hover:border-purple-500 transition-colors group relative"
                >
                  {/* 아이콘 + 레벨 */}
                  <div className="flex items-center justify-center mb-1">
                    <RelicImage relicId={relicId} icon={icon} size={56} />
                  </div>
                  <div className="text-[10px] font-bold text-purple-300 text-center truncate">{name}</div>
                  <div className="text-[9px] text-gray-400 text-center">Lv.{level}{maxLevel && `/${maxLevel}`}</div>

                  {/* 효과 (컴팩트) */}
                  <div className="bg-gray-900/80 rounded px-1 py-0.5 mt-1 mb-1.5">
                    <div className="text-[9px] text-gray-400 truncate">{description}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-yellow-400">+{formatNumber(effect.value)}{getSuffix()}</span>
                      {nextEffect && <span className="text-[9px] text-green-400">→ {formatNumber(nextEffect.value)}{getSuffix()}</span>}
                    </div>
                  </div>

                  {/* 강화 버튼 */}
                  <button
                    onClick={() => handleUpgradeRelic(relicId)}
                    disabled={!canUpgrade || isMaxLevel}
                    className={`w-full py-1 rounded font-bold text-[10px] transition-all ${
                      isMaxLevel
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : canUpgrade
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isMaxLevel ? 'MAX' : `강화 (🏺 ${upgradeCost})`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 전체 효과 팝업 */}
      {showEffectsPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowEffectsPopup(false)}>
          <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-4 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-purple-300">📊 유물 전체 효과</h3>
              <button onClick={() => setShowEffectsPopup(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-2">
              {Object.entries(totalRelicEffects).length === 0 ? (
                <p className="text-gray-500 text-center py-4">보유한 유물이 없습니다</p>
              ) : (
                Object.entries(totalRelicEffects).map(([effectType, value]) => {
                  const effectLabels = {
                    relicFragmentPercent: '환생당 유물 조각 획득량',
                    relicUpgradeCostReduction: '유물 강화 비용 감소',
                    damagePerRelic: '유물당 데미지 증가',
                    goldPercent: '모든 골드 획득량',
                    normalMonsterGold: '일반 몬스터 골드',
                    bossGold: '보스 골드',
                    fairyGold: '요정 골드',
                    rareMonsterGold: '희귀 몬스터 골드',
                    treasureChestChance: '보물상자 출현 확률',
                    miracleChance: '기적 발동 확률',
                    allDamagePercent: '모든 데미지',
                    damagePercent: '데미지 증가',
                    critDamageBonus: '치명타 데미지',
                    critDmg: '치명타 데미지',
                    critChance: '치명타 확률',
                    bossDamage: '보스 데미지',
                    bossExtraDamage: '보스 추가 데미지',
                    giantSlayerDamage: '보스 HP비례 추가 데미지',
                    equipUpgradeCostReduction: '장비 업그레이드 비용 감소',
                    equipmentUpgradeCostReduction: '장비 업그레이드 비용 감소',
                    setEffectBonus: '세트 효과 보너스',
                    inscriptionStatBonus: '문양 기본 스탯',
                    inscriptionLevelBonus: '문양 레벨당 스탯',
                    inscriptionUpgradeCostReduction: '문양 강화 비용 감소',
                    collectionStatBonus: '도감 스탯 보너스',
                    explorerBonus: '탐험 보너스',
                    rareMonsterSpawnRate: '희귀 몬스터 출현율',
                    rareMonsterRewardBonus: '희귀 몬스터 보상',
                    monstersPerStageReduction: '스테이지당 몬스터 수 감소',
                    bossTimeLimit: '보스 처치 제한시간',
                    monsterHpReduction: '몬스터 HP 감소',
                    challengeTokenBonus: '도전권 획득 보너스',
                    goldRelicBonus: '유물 골드 보너스',
                    gold10xChance: '골드 10배 확률',
                    damageRelicBonus: '유물 데미지 보너스',
                    equipmentPercent: '모든 장비 능력치',
                    weaponPercent: '무기 능력치',
                    helmetPercent: '투구 능력치',
                    armorPercent: '갑옷 능력치',
                    bootsPercent: '신발 능력치',
                    necklacePercent: '목걸이 능력치',
                    ringPercent: '반지 능력치',
                    inscriptionDamage: '문양 데미지',
                    inscriptionStats: '문양 스탯'
                  };
                  const suffix = effectType.includes('Percent') || effectType.includes('Chance') ||
                    effectType.includes('Spawn') || effectType.includes('Reduction') ||
                    effectType.includes('Bonus') || effectType.includes('Rate') || effectType.includes('Damage')
                    ? '%' : effectType === 'bossTimeLimit' ? '초' : effectType === 'monstersPerStageReduction' ? '마리' : '';

                  return (
                    <div key={effectType} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
                      <span className="text-gray-300 text-sm">{effectLabels[effectType] || effectType}</span>
                      <span className="text-yellow-400 font-bold">+{formatNumber(value)}{suffix}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 알림 모달 */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default PrestigeRelics;
