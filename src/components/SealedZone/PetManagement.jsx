import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { useToast } from '../UI/ToastContainer';
import { PETS, PET_GRADES, PET_ABILITIES, calculatePetStats, rollPetGrade } from '../../data/pets';
import { formatNumber } from '../../utils/formatter';

const PetManagement = () => {
  const { gameState, setGameState } = useGame();
  const toast = useToast();
  const { player, sealedZone = {} } = gameState;

  const [selectedPet, setSelectedPet] = useState(null);

  const { ownedPets = [], petGachaTokens = 0 } = sealedZone;

  // 펫 뽑기
  const gachaPet = () => {
    if (petGachaTokens <= 0) {
      toast.warning('소환권 부족', '펫 소환권이 부족합니다!');
      return;
    }

    const grade = rollPetGrade();
    const petKeys = Object.keys(PETS);
    const randomPetId = petKeys[Math.floor(Math.random() * petKeys.length)];

    const newPet = {
      id: `pet_${Date.now()}_${Math.random()}`,
      petId: randomPetId,
      grade,
      level: 1
    };

    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        ownedPets: [...(prev.sealedZone?.ownedPets || []), newPet],
        petGachaTokens: (prev.sealedZone?.petGachaTokens || 0) - 1
      }
    }));

    const petData = calculatePetStats(randomPetId, grade);
    toast.success('펫 획득', `${petData.icon} ${petData.name} (${petData.gradeName}) 획득!`);
  };

  // 펫 삭제
  const deletePet = (petId) => {
    if (!confirm('정말로 이 펫을 삭제하시겠습니까?')) return;

    setGameState(prev => ({
      ...prev,
      sealedZone: {
        ...prev.sealedZone,
        ownedPets: (prev.sealedZone?.ownedPets || []).filter(p => p.id !== petId)
      }
    }));

    if (selectedPet === petId) {
      setSelectedPet(null);
    }
  };

  return (
    <div className="bg-game-panel border border-game-border rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">🐾 펫 관리</h2>
        <div className="text-sm text-gray-300">
          소환권: <span className="text-purple-400 font-bold">{petGachaTokens}</span>
        </div>
      </div>

      {/* 펫 뽑기 */}
      <div className="mb-4">
        <button
          onClick={gachaPet}
          disabled={petGachaTokens <= 0}
          className={`w-full py-3 rounded font-bold ${
            petGachaTokens <= 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          펫 소환 (소환권 -1)
        </button>

        {/* 확률 표시 */}
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">등급별 확률</div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            {Object.entries(PET_GRADES).map(([gradeId, grade]) => (
              <div key={gradeId} className="flex justify-between">
                <span className={grade.color}>{grade.name}</span>
                <span className="text-gray-400">
                  {gradeId === 'common' ? '50%' :
                   gradeId === 'rare' ? '30%' :
                   gradeId === 'epic' ? '15%' :
                   gradeId === 'unique' ? '4%' :
                   gradeId === 'legendary' ? '0.9%' :
                   '0.1%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 보유 펫 목록 */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-200 mb-2">보유 펫 ({ownedPets.length})</h3>
        {ownedPets.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-8">
            보유한 펫이 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {ownedPets.map(pet => {
              const petData = calculatePetStats(pet.petId, pet.grade);
              return (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet.id)}
                  className={`p-2 rounded border ${
                    selectedPet === pet.id
                      ? 'bg-blue-900 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{petData.icon}</div>
                  <div className={`text-xs font-bold ${petData.gradeColor}`}>
                    {petData.gradeName}
                  </div>
                  <div className="text-xs text-gray-300 truncate">{petData.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 펫 상세 정보 */}
      {selectedPet && (() => {
        const pet = ownedPets.find(p => p.id === selectedPet);
        if (!pet) return null;

        const petData = calculatePetStats(pet.petId, pet.grade);
        const petBase = PETS[pet.petId];

        return (
          <div className="bg-gray-800 border border-gray-700 rounded p-3">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-2xl mb-1">{petData.icon}</div>
                <div className={`text-sm font-bold ${petData.gradeColor}`}>
                  {petData.gradeName}
                </div>
                <div className="text-sm text-gray-200">{petData.name}</div>
              </div>
              <button
                onClick={() => deletePet(pet.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
              >
                삭제
              </button>
            </div>

            {/* 설명 */}
            <div className="text-xs text-gray-400 mb-3">{petBase.description}</div>

            {/* 스탯 */}
            <div className="mb-3 bg-gray-900 rounded p-2">
              <div className="text-xs font-bold text-gray-300 mb-1">스탯</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">공격력</span>
                  <span className="text-red-400">{formatNumber(petData.attack)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">공격속도</span>
                  <span className="text-blue-400">{petData.attackSpeed.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">치명타 확률</span>
                  <span className="text-yellow-400">{petData.critChance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">치명타 데미지</span>
                  <span className="text-orange-400">{petData.critDamage}%</span>
                </div>
              </div>
            </div>

            {/* 능력 */}
            <div className="bg-gray-900 rounded p-2">
              <div className="text-xs font-bold text-gray-300 mb-1">능력</div>
              <div className="space-y-1">
                {petBase.abilities.map(abilityId => {
                  const ability = PET_ABILITIES[abilityId];
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

export default PetManagement;
