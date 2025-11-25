import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { INSCRIPTIONS, INSCRIPTION_GRADES, INSCRIPTION_ABILITIES, INSCRIPTION_UPGRADE_CONFIG, calculateInscriptionStats, INSCRIPTION_DROP_TABLE, migrateGrade } from '../../data/inscriptions';
import { formatNumber } from '../../utils/formatter';

const InscriptionManagement = () => {
  const { gameState, setGameState } = useGame();
  const { player, sealedZone = {} } = gameState;

  const [selectedInscription, setSelectedInscription] = useState(null);
  const [sellPopup, setSellPopup] = useState(null);

  const { ownedInscriptions = [], inscriptionDust = 0, autoSellGrade = null } = sealedZone;

  // 등급 순서 (낮은 순)
  const GRADE_ORDER = ['common', 'uncommon', 'rare', 'unique', 'legendary', 'mythic'];

  // 문양 판매 (문양가루 획득) - 확인 없이 바로 판매
  const sellInscription = (inscriptionId, showPopup = false, event = null) => {
    const inscription = ownedInscriptions.find(i => i.id === inscriptionId);
    if (!inscription) return;

    const gradeData = INSCRIPTION_GRADES[migrateGrade(inscription.grade)];
    const dustAmount = gradeData?.sellDust || 1;

    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        ownedInscriptions: (prev.sealedZone?.ownedInscriptions || []).filter(i => i.id !== inscriptionId),
        inscriptionDust: (prev.sealedZone?.inscriptionDust || 0) + dustAmount
      }
    }));

    // 팝업 표시
    if (showPopup && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setSellPopup({ x: rect.left, y: rect.top, dust: dustAmount, id: Date.now() });
      setTimeout(() => setSellPopup(null), 1500);
    }

    if (selectedInscription === inscriptionId) {
      setSelectedInscription(null);
    }
  };

  // 일괄 판매 (특정 등급 이하)
  const bulkSellByGrade = (maxGrade) => {
    const maxGradeIndex = GRADE_ORDER.indexOf(maxGrade);
    const toSell = ownedInscriptions.filter(i => {
      const migratedGrade = migrateGrade(i.grade);
      const gradeIndex = GRADE_ORDER.indexOf(migratedGrade);
      return gradeIndex <= maxGradeIndex;
    });

    if (toSell.length === 0) {
      alert('판매할 문양이 없습니다!');
      return;
    }

    let totalDust = 0;
    toSell.forEach(i => {
      const gradeData = INSCRIPTION_GRADES[migrateGrade(i.grade)];
      totalDust += gradeData?.sellDust || 1;
    });

    if (!confirm(`${INSCRIPTION_GRADES[maxGrade]?.name || maxGrade} 이하 문양 ${toSell.length}개를 판매하시겠습니까?\n획득: 문양가루 ${totalDust}개`)) return;

    const toSellIds = toSell.map(i => i.id);

    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        ownedInscriptions: (prev.sealedZone?.ownedInscriptions || []).filter(i => !toSellIds.includes(i.id)),
        inscriptionDust: (prev.sealedZone?.inscriptionDust || 0) + totalDust
      }
    }));

    if (toSellIds.includes(selectedInscription)) {
      setSelectedInscription(null);
    }
  };

  // 자동판매 토글 (gameState에 저장)
  const toggleAutoSell = (grade) => {
    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        autoSellGrade: prev.sealedZone?.autoSellGrade === grade ? null : grade
      }
    }));
  };

  // 문양 강화
  const upgradeInscription = (inscriptionId) => {
    const inscription = ownedInscriptions.find(i => i.id === inscriptionId);
    if (!inscription) return;

    const currentLevel = inscription.level || 1;
    if (currentLevel >= INSCRIPTION_UPGRADE_CONFIG.maxLevel) {
      alert('최대 레벨입니다!');
      return;
    }

    const cost = INSCRIPTION_UPGRADE_CONFIG.getCost(currentLevel);
    if (inscriptionDust < cost) {
      alert(`문양가루가 부족합니다! (필요: ${cost}개)`);
      return;
    }

    const successRate = INSCRIPTION_UPGRADE_CONFIG.getSuccessRate(currentLevel);
    const isSuccess = Math.random() * 100 < successRate;

    setGameState(prev => {
      const newInscriptions = (prev.sealedZone?.ownedInscriptions || []).map(i => {
        if (i.id === inscriptionId && isSuccess) {
          return { ...i, level: (i.level || 1) + 1 };
        }
        return i;
      });

      return {
        ...prev,
        sealedZone: {
          ...prev.sealedZone,
          ownedInscriptions: newInscriptions,
          inscriptionDust: (prev.sealedZone?.inscriptionDust || 0) - cost
        }
      };
    });

    if (isSuccess) {
      alert(`강화 성공! Lv.${currentLevel + 1}`);
    } else {
      alert(`강화 실패... (확률: ${successRate}%)`);
    }
  };

  // 등급별 색상
  const getGradeButtonColor = (grade, isActive) => {
    const colors = {
      common: isActive ? 'bg-gray-600 border-gray-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700',
      uncommon: isActive ? 'bg-blue-700 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700',
      rare: isActive ? 'bg-purple-700 border-purple-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700',
      unique: isActive ? 'bg-yellow-700 border-yellow-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700',
    };
    return colors[grade] || (isActive ? 'bg-gray-600 border-gray-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700');
  };

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
      {/* 판매 팝업 */}
      {sellPopup && (
        <div
          className="fixed pointer-events-none z-50 animate-bounce"
          style={{ left: sellPopup.x - 20, top: sellPopup.y - 30 }}
        >
          <span className="text-cyan-400 font-bold text-sm bg-gray-900 px-2 py-1 rounded border border-cyan-500 shadow-lg">
            +{sellPopup.dust}✨
          </span>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-100">📿 문양 관리</h2>
        <span className="text-sm text-gray-300">문양가루: <span className="text-cyan-400 font-bold">{inscriptionDust}</span></span>
      </div>

      {/* 문양 드랍 정보 + 자동판매 설정 */}
      <div className="mb-3 flex gap-2 items-center bg-gradient-to-r from-purple-900 to-blue-900 rounded p-2 border border-purple-500">
        <div className="text-[10px] text-gray-200 leading-tight">
          <span className="text-purple-400 font-bold">📿 문양 드랍:</span> 보스 처치 시 층별 문양 드랍<br/>
          <span className="text-gray-400">일반50% 희귀30% 레어15% 유니크4% 레전드0.9% 신화0.1%</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] text-gray-400">자동판매:</span>
          {['common', 'uncommon', 'rare', 'unique'].map(grade => (
            <button
              key={grade}
              onClick={() => toggleAutoSell(grade)}
              className={`text-[9px] px-1.5 py-0.5 rounded border ${getGradeButtonColor(grade, autoSellGrade === grade)}`}
              title={`${INSCRIPTION_GRADES[grade]?.name || grade} 이하 자동판매`}
            >
              {INSCRIPTION_GRADES[grade]?.name?.charAt(0) || grade.charAt(0)}
            </button>
          ))}
          {autoSellGrade && (
            <span className="text-[9px] text-yellow-400 ml-1">
              ({INSCRIPTION_GRADES[autoSellGrade]?.name}↓)
            </span>
          )}
        </div>
      </div>

      {/* 일괄판매 버튼 */}
      <div className="mb-3 flex gap-1 items-center">
        <span className="text-[10px] text-gray-400 mr-1">일괄판매:</span>
        {['common', 'uncommon', 'rare', 'unique'].map(grade => {
          const count = ownedInscriptions.filter(i => {
            const migratedGrade = migrateGrade(i.grade);
            const gradeIndex = GRADE_ORDER.indexOf(migratedGrade);
            return gradeIndex <= GRADE_ORDER.indexOf(grade);
          }).length;
          return (
            <button
              key={grade}
              onClick={() => bulkSellByGrade(grade)}
              disabled={count === 0}
              className={`text-[9px] px-2 py-1 rounded border ${
                count > 0
                  ? 'bg-yellow-700 border-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
              }`}
            >
              {INSCRIPTION_GRADES[grade]?.name || grade}↓ ({count})
            </button>
          );
        })}
      </div>

      {/* 좌우 분할 레이아웃 */}
      <div className="flex gap-3">
        {/* 왼쪽: 문양 인벤토리 */}
        <div className="w-1/2">
          <h3 className="text-xs font-bold text-gray-200 mb-2">보유 문양 ({ownedInscriptions.length})</h3>
          {ownedInscriptions.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-8 bg-gray-900 rounded">
              문양이 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto pr-1">
              {ownedInscriptions.map(inscription => {
                const inscriptionData = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
                const level = inscription.level || 1;
                const gradeData = INSCRIPTION_GRADES[migrateGrade(inscription.grade)];
                return (
                  <div
                    key={inscription.id}
                    className={`relative p-2 rounded border cursor-pointer ${
                      selectedInscription === inscription.id
                        ? 'bg-blue-900 border-blue-500'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedInscription(inscription.id)}
                  >
                    {/* 우측상단 판매 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sellInscription(inscription.id, true, e);
                      }}
                      className="absolute top-0.5 right-0.5 bg-yellow-600 hover:bg-yellow-500 text-white text-[8px] w-4 h-4 rounded flex items-center justify-center"
                      title={`판매 (가루 +${gradeData?.sellDust || 1})`}
                    >
                      ×
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="text-base">📿</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] font-bold ${inscriptionData.gradeColor} truncate`}>
                          {inscriptionData.name}
                        </div>
                        <div className="text-[9px] text-gray-400">
                          {inscriptionData.gradeName} Lv.{level}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 오른쪽: 문양 옵션 콘솔 */}
        <div className="w-1/2">
          <h3 className="text-xs font-bold text-gray-200 mb-2">문양 정보</h3>
          {selectedInscription ? (() => {
            const inscription = ownedInscriptions.find(i => i.id === selectedInscription);
            if (!inscription) return null;

            const inscriptionData = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
            const inscriptionBase = INSCRIPTIONS[inscription.inscriptionId];
            const level = inscription.level || 1;
            const levelMultiplier = INSCRIPTION_UPGRADE_CONFIG.getStatMultiplier(level);
            const gradeData = INSCRIPTION_GRADES[migrateGrade(inscription.grade)];
            const upgradeCost = INSCRIPTION_UPGRADE_CONFIG.getCost(level);
            const successRate = INSCRIPTION_UPGRADE_CONFIG.getSuccessRate(level);
            const isMaxLevel = level >= INSCRIPTION_UPGRADE_CONFIG.maxLevel;

            return (
              <div className="bg-gray-800 border border-gray-700 rounded p-2 h-[320px] overflow-y-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📿</span>
                    <div>
                      <div className={`text-sm font-bold ${inscriptionData.gradeColor}`}>
                        {inscriptionData.name} <span className="text-yellow-400">Lv.{level}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">{inscriptionData.gradeName}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => sellInscription(inscription.id)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] px-2 py-1 rounded"
                  >
                    💰 판매 ({gradeData.sellDust})
                  </button>
                </div>

                {/* 강화 */}
                <div className="mb-2 bg-gray-900 rounded p-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    비용: <span className={inscriptionDust >= upgradeCost ? 'text-cyan-400' : 'text-red-400'}>{upgradeCost}</span>
                    <span className="ml-2">성공: {successRate}%</span>
                  </span>
                  <button
                    onClick={() => upgradeInscription(inscription.id)}
                    disabled={isMaxLevel || inscriptionDust < upgradeCost}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isMaxLevel ? 'bg-gray-700 text-gray-500' :
                      inscriptionDust >= upgradeCost ? 'bg-green-600 hover:bg-green-700 text-white' :
                      'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {isMaxLevel ? 'MAX' : `+${level + 1}`}
                  </button>
                </div>

                {/* 기본 스탯 */}
                <div className="mb-2 bg-gray-900 rounded p-1.5">
                  <div className="text-[10px] font-bold text-gray-300 mb-1">
                    스탯 <span className="text-yellow-400">(x{levelMultiplier.toFixed(2)})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-1 gap-y-0.5 text-[9px]">
                    <div className="flex justify-between"><span className="text-gray-500">공격</span><span className="text-red-400">{formatNumber(Math.floor(inscriptionData.attack * levelMultiplier))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">공%</span><span className="text-red-400">{(inscriptionData.attackPercent * levelMultiplier).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">치확</span><span className="text-yellow-400">{(inscriptionData.critChance * levelMultiplier).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">치피</span><span className="text-orange-400">{(inscriptionData.critDamage * levelMultiplier).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">명중</span><span className="text-blue-400">{(inscriptionData.accuracy * levelMultiplier).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">관통</span><span className="text-purple-400">{(inscriptionData.penetration * levelMultiplier).toFixed(1)}%</span></div>
                  </div>
                </div>

                {/* 특수 능력 */}
                <div className="mb-2 bg-gray-900 rounded p-1.5">
                  <div className="text-[10px] text-cyan-400 font-bold">
                    ✨ {inscriptionBase.specialAbility.name}
                  </div>
                  <div className="text-[9px] text-gray-400">{inscriptionBase.specialAbility.description}</div>
                </div>

                {/* 보스 대응 능력 */}
                <div className="bg-gray-900 rounded p-1.5">
                  <div className="text-[10px] font-bold text-gray-300 mb-0.5">보스 대응</div>
                  <div className="space-y-0.5">
                    {inscriptionBase.abilities.map(abilityId => {
                      const ability = INSCRIPTION_ABILITIES[abilityId];
                      return (
                        <div key={abilityId} className="text-[9px]">
                          <span className="text-purple-400 font-bold">{ability.icon} {ability.name}</span>
                          <span className="text-gray-500 ml-1">- {ability.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="flex items-center justify-center h-[320px] bg-gray-900 rounded text-gray-500 text-sm">
              문양을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InscriptionManagement;
