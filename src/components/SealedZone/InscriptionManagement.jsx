import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { INSCRIPTIONS, INSCRIPTION_GRADES, INSCRIPTION_ABILITIES, calculateInscriptionStats, rollInscriptionGrade } from '../../data/inscriptions';
import { formatNumber } from '../../utils/formatter';

const InscriptionManagement = () => {
  const { gameState, setGameState } = useGame();
  const { player, sealedZone = {} } = gameState;

  const [selectedInscription, setSelectedInscription] = useState(null);

  const { ownedInscriptions = [], inscriptionTokens = 0 } = sealedZone;

  // 문양 뽑기
  const gachaInscription = () => {
    if (inscriptionTokens <= 0) {
      alert('문양 각인권이 부족합니다!');
      return;
    }

    const grade = rollInscriptionGrade();
    const inscriptionKeys = Object.keys(INSCRIPTIONS);
    const randomInscriptionId = inscriptionKeys[Math.floor(Math.random() * inscriptionKeys.length)];

    const newInscription = {
      id: `inscription_${Date.now()}_${Math.random()}`,
      inscriptionId: randomInscriptionId,
      grade,
      level: 1
    };

    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        ownedInscriptions: [...(prev.sealedZone?.ownedInscriptions || []), newInscription],
        inscriptionTokens: (prev.sealedZone?.inscriptionTokens || 0) - 1
      }
    }));

    const inscriptionData = calculateInscriptionStats(randomInscriptionId, grade);
    alert(`📿 ${inscriptionData.name} (${inscriptionData.gradeName}) 획득!`);
  };

  // 문양 삭제
  const deleteInscription = (inscriptionId) => {
    if (!confirm('정말로 이 문양을 삭제하시겠습니까?')) return;

    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        ownedInscriptions: (prev.sealedZone?.ownedInscriptions || []).filter(i => i.id !== inscriptionId)
      }
    }));

    if (selectedInscription === inscriptionId) {
      setSelectedInscription(null);
    }
  };

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">📿 문양 관리</h2>
        <div className="text-sm text-gray-300">
          각인권: <span className="text-purple-400 font-bold">{inscriptionTokens}</span>
        </div>
      </div>

      {/* 문양 뽑기 */}
      <div className="mb-4">
        <button
          onClick={gachaInscription}
          disabled={inscriptionTokens <= 0}
          className={`w-full py-3 rounded font-bold ${
            inscriptionTokens <= 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          문양 각인 (각인권 -1)
        </button>

        {/* 확률 표시 */}
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">등급별 확률</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            {Object.entries(INSCRIPTION_GRADES).map(([gradeId, grade]) => (
              <div key={gradeId} className="flex items-center justify-between gap-1">
                <span className={`${grade.color} font-bold whitespace-nowrap`}>{grade.name}:</span>
                <span className="text-gray-300 font-bold">
                  {gradeId === 'common' ? '50%' :
                   gradeId === 'rare' ? '30%' :
                   gradeId === 'epic' ? '15%' :
                   gradeId === 'unique' ? '4%' :
                   gradeId === 'legendary' ? '0.9%' :
                   gradeId === 'mythic' ? '0.1%' :
                   '0.01%'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-1">
              <span className="text-red-600 font-bold whitespace-nowrap">다크:</span>
              <span className="text-gray-300 font-bold">0.01%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 보유 문양 목록 */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-200 mb-2">보유 문양 ({ownedInscriptions.length})</h3>
        {ownedInscriptions.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-8">
            보유한 문양이 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {ownedInscriptions.map(inscription => {
              const inscriptionData = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
              return (
                <button
                  key={inscription.id}
                  onClick={() => setSelectedInscription(inscription.id)}
                  className={`p-2 rounded border ${
                    selectedInscription === inscription.id
                      ? 'bg-blue-900 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">📿</div>
                  <div className={`text-xs font-bold ${inscriptionData.gradeColor}`}>
                    {inscriptionData.gradeName}
                  </div>
                  <div className="text-xs text-gray-300 truncate">{inscriptionData.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 문양 상세 정보 */}
      {selectedInscription && (() => {
        const inscription = ownedInscriptions.find(i => i.id === selectedInscription);
        if (!inscription) return null;

        const inscriptionData = calculateInscriptionStats(inscription.inscriptionId, inscription.grade);
        const inscriptionBase = INSCRIPTIONS[inscription.inscriptionId];

        return (
          <div className="bg-gray-800 border border-gray-700 rounded p-3">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-2xl mb-1">📿</div>
                <div className={`text-sm font-bold ${inscriptionData.gradeColor}`}>
                  {inscriptionData.gradeName}
                </div>
                <div className="text-sm text-gray-200">{inscriptionData.name}</div>
              </div>
              <button
                onClick={() => deleteInscription(inscription.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
              >
                삭제
              </button>
            </div>

            {/* 설명 */}
            <div className="text-xs text-gray-400 mb-3">{inscriptionBase.description}</div>

            {/* 기본 스탯 */}
            <div className="mb-3 bg-gray-900 rounded p-2">
              <div className="text-xs font-bold text-gray-300 mb-1">기본 스탯</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">공격력</span>
                  <span className="text-red-400">{formatNumber(inscriptionData.attack)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">공격력 %</span>
                  <span className="text-red-400">{inscriptionData.attackPercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">치명타 확률</span>
                  <span className="text-yellow-400">{inscriptionData.critChance.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">치명타 데미지</span>
                  <span className="text-orange-400">{inscriptionData.critDamage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">명중률</span>
                  <span className="text-blue-400">{inscriptionData.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">관통</span>
                  <span className="text-purple-400">{inscriptionData.penetration.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 특수 능력 */}
            <div className="mb-3 bg-gray-900 rounded p-2">
              <div className="text-xs font-bold text-gray-300 mb-1">특수 능력</div>
              <div className="text-xs">
                <div className="text-cyan-400 font-bold mb-1">
                  ✨ {inscriptionBase.specialAbility.name}
                </div>
                <div className="text-gray-400">{inscriptionBase.specialAbility.description}</div>
              </div>
            </div>

            {/* 보스 대응 능력 */}
            <div className="bg-gray-900 rounded p-2">
              <div className="text-xs font-bold text-gray-300 mb-1">보스 대응 능력</div>
              <div className="space-y-1">
                {inscriptionBase.abilities.map(abilityId => {
                  const ability = INSCRIPTION_ABILITIES[abilityId];
                  return (
                    <div key={abilityId} className="text-xs">
                      <div className="text-purple-400 font-bold">
                        {ability.icon} {ability.name}
                      </div>
                      <div className="text-gray-400">{ability.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default InscriptionManagement;
