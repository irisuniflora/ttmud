import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { useToast } from '../UI/ToastContainer';
import { ORBS, ORB_GRADES, ORB_GRADE_ORDER, ORB_UPGRADE_CONFIG, getOrbById, getOrbDisplayInfo } from '../../data/orbs';

const OrbWorkshop = ({ onClose }) => {
  const { gameState, disassembleOrb, upgradeOrb, craftOrb } = useGame();
  const toast = useToast();
  const { companionOrbs = [], orbDust = 0 } = gameState;

  const [activeTab, setActiveTab] = useState('upgrade'); // upgrade, disassemble, craft
  const [selectedBaseOrb, setSelectedBaseOrb] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedCraftType, setSelectedCraftType] = useState(ORBS[0].id);
  const [selectedCraftGrade, setSelectedCraftGrade] = useState('normal');

  // 장착되지 않은 오브만 필터
  const unequippedOrbs = companionOrbs.filter(orb => !orb.equippedTo);

  // ===== 업그레이드 탭 =====
  const handleSelectBaseOrb = (orb) => {
    setSelectedBaseOrb(orb);
    setSelectedMaterials([]);
  };

  const handleSelectMaterial = (orb) => {
    if (selectedMaterials.find(m => m.id === orb.id)) {
      // 이미 선택된 재료면 제거
      setSelectedMaterials(selectedMaterials.filter(m => m.id !== orb.id));
    } else if (selectedMaterials.length < ORB_UPGRADE_CONFIG.materialsRequired - 1) {
      // 재료 추가 (base 제외 4개까지)
      setSelectedMaterials([...selectedMaterials, orb]);
    }
  };

  const handleUpgradeOrb = () => {
    if (!selectedBaseOrb) {
      toast.warning('오브 미선택', '강화할 베이스 오브를 선택하세요.');
      return;
    }
    if (selectedMaterials.length !== ORB_UPGRADE_CONFIG.materialsRequired - 1) {
      toast.warning('재료 부족', `재료 오브 ${ORB_UPGRADE_CONFIG.materialsRequired - 1}개가 필요합니다.`);
      return;
    }

    const materialIds = selectedMaterials.map(m => m.id);
    const result = upgradeOrb(selectedBaseOrb.id, materialIds);

    if (result.success) {
      toast.success('강화 성공!', `${result.message}`, 3000);
      setSelectedBaseOrb(null);
      setSelectedMaterials([]);
    } else if (result.failure) {
      toast.error('강화 실패', `${result.message}`, 3000);
      setSelectedBaseOrb(null);
      setSelectedMaterials([]);
    } else {
      toast.error('강화 오류', result.message || '강화에 실패했습니다.');
    }
  };

  // ===== 분해 탭 =====
  const handleDisassembleOrb = (orb) => {
    const orbData = getOrbById(orb.orbType);
    const orbGrade = ORB_GRADES[orb.grade];
    const dustGain = ORB_UPGRADE_CONFIG.dustByGrade[orb.grade];

    const result = disassembleOrb(orb.id);
    if (result.success) {
      toast.success('분해 완료', `${orbData.name} (${orbGrade.name})을 분해하여 가루 ${dustGain}개를 획득했습니다!`, 3000);
    } else {
      toast.error('분해 실패', result.message || '분해에 실패했습니다.');
    }
  };

  // ===== 제작 탭 =====
  const handleCraftOrb = () => {
    const cost = ORB_UPGRADE_CONFIG.craftCost[selectedCraftGrade];
    if (orbDust < cost) {
      toast.warning('가루 부족', `가루 ${cost}개가 필요합니다. (보유: ${orbDust})`);
      return;
    }

    const result = craftOrb(selectedCraftType, selectedCraftGrade);
    if (result.success) {
      const orbData = getOrbById(selectedCraftType);
      const gradeData = ORB_GRADES[selectedCraftGrade];
      toast.success('제작 완료!', `${orbData.name} (${gradeData.name})을 제작했습니다!`, 3000);
    } else {
      toast.error('제작 실패', result.message || '제작에 실패했습니다.');
    }
  };

  // 업그레이드 가능한 오브 필터 (베이스 선택 시)
  const getUpgradableOrbs = () => {
    if (!selectedBaseOrb) return [];
    const baseData = getOrbById(selectedBaseOrb.orbType);
    const baseGradeIndex = ORB_GRADE_ORDER.indexOf(selectedBaseOrb.grade);

    // 같은 타입, 같은 등급, 베이스가 아니고, 아직 선택 안 된 것
    return unequippedOrbs.filter(orb =>
      orb.orbType === selectedBaseOrb.orbType &&
      orb.grade === selectedBaseOrb.grade &&
      orb.id !== selectedBaseOrb.id &&
      !selectedMaterials.find(m => m.id === orb.id)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border-2 border-purple-500 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl">
              🔮
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">오브 공방</h3>
              <p className="text-sm text-gray-400">강화 · 분해 · 제작</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 가루 표시 */}
        <div className="bg-gradient-to-r from-amber-900/50 to-yellow-900/50 border border-yellow-600 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-bold text-yellow-300">오브 가루</span>
            </div>
            <span className="text-2xl font-bold text-white">{orbDust}</span>
          </div>
        </div>

        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab('upgrade');
              setSelectedBaseOrb(null);
              setSelectedMaterials([]);
            }}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'upgrade'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ⬆️ 강화
          </button>
          <button
            onClick={() => setActiveTab('disassemble')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'disassemble'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            💎 분해
          </button>
          <button
            onClick={() => setActiveTab('craft')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'craft'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🛠️ 제작
          </button>
        </div>

        {/* ===== 강화 탭 ===== */}
        {activeTab === 'upgrade' && (
          <div className="space-y-4">
            {/* 강화 설명 */}
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                💡 같은 타입·등급의 오브 5개를 합쳐 1등급 상승 (성공률 {ORB_UPGRADE_CONFIG.successRate}%)
                <br />
                <span className="text-yellow-400">✨ 실패 시 1개 재료 반환</span>
              </p>
            </div>

            {/* 베이스 오브 선택 */}
            <div>
              <p className="text-sm text-gray-400 mb-2">1️⃣ 강화할 베이스 오브 선택</p>
              {selectedBaseOrb ? (
                <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={`/images/orbs/${selectedBaseOrb.orbType}.png`}
                      alt={getOrbById(selectedBaseOrb.orbType)?.name}
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <p className="font-bold" style={{ color: getOrbById(selectedBaseOrb.orbType)?.color }}>
                        {getOrbById(selectedBaseOrb.orbType)?.name}
                      </p>
                      <p className="text-xs" style={{ color: ORB_GRADES[selectedBaseOrb.grade]?.color }}>
                        {ORB_GRADES[selectedBaseOrb.grade]?.name} → {ORB_GRADE_ORDER[ORB_GRADE_ORDER.indexOf(selectedBaseOrb.grade) + 1]
                          ? ORB_GRADES[ORB_GRADE_ORDER[ORB_GRADE_ORDER.indexOf(selectedBaseOrb.grade) + 1]]?.name
                          : '최대 등급'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBaseOrb(null);
                      setSelectedMaterials([]);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded font-bold"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                  {unequippedOrbs
                    .filter(orb => ORB_GRADE_ORDER.indexOf(orb.grade) < ORB_GRADE_ORDER.length - 1) // 최대 등급 제외
                    .map((orb) => {
                      const orbData = getOrbById(orb.orbType);
                      const orbGrade = ORB_GRADES[orb.grade];
                      return (
                        <div
                          key={orb.id}
                          onClick={() => handleSelectBaseOrb(orb)}
                          className="p-2 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all"
                          style={{
                            borderColor: orbData?.color,
                            backgroundColor: `${orbData?.color}20`
                          }}
                        >
                          <img
                            src={`/images/orbs/${orb.orbType}.png`}
                            alt={orbData?.name}
                            className="w-8 h-8 mx-auto mb-1"
                          />
                          <p className="text-[10px] font-bold text-center" style={{ color: orbGrade?.color }}>
                            {orbGrade?.name}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* 재료 오브 선택 */}
            {selectedBaseOrb && (
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  2️⃣ 재료 오브 선택 ({selectedMaterials.length}/{ORB_UPGRADE_CONFIG.materialsRequired - 1})
                </p>
                <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto mb-3">
                  {getUpgradableOrbs().map((orb) => {
                    const orbData = getOrbById(orb.orbType);
                    const orbGrade = ORB_GRADES[orb.grade];
                    const isSelected = selectedMaterials.find(m => m.id === orb.id);
                    return (
                      <div
                        key={orb.id}
                        onClick={() => handleSelectMaterial(orb)}
                        className={`p-2 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all ${
                          isSelected ? 'ring-2 ring-white' : ''
                        }`}
                        style={{
                          borderColor: orbData?.color,
                          backgroundColor: `${orbData?.color}20`
                        }}
                      >
                        <img
                          src={`/images/orbs/${orb.orbType}.png`}
                          alt={orbData?.name}
                          className="w-8 h-8 mx-auto mb-1"
                        />
                        <p className="text-[10px] font-bold text-center" style={{ color: orbGrade?.color }}>
                          {orbGrade?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleUpgradeOrb}
                  disabled={selectedMaterials.length !== ORB_UPGRADE_CONFIG.materialsRequired - 1}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
                >
                  ⬆️ 강화하기 (성공률 {ORB_UPGRADE_CONFIG.successRate}%)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== 분해 탭 ===== */}
        {activeTab === 'disassemble' && (
          <div className="space-y-4">
            {/* 분해 설명 */}
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                💎 오브를 분해하여 가루를 얻습니다. 등급이 높을수록 더 많은 가루 획득!
              </p>
            </div>

            {/* 오브 목록 */}
            <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {unequippedOrbs.map((orb) => {
                const orbData = getOrbById(orb.orbType);
                const orbGrade = ORB_GRADES[orb.grade];
                const dustGain = ORB_UPGRADE_CONFIG.dustByGrade[orb.grade];

                return (
                  <div
                    key={orb.id}
                    className="p-3 rounded-lg border-2 relative"
                    style={{
                      borderColor: orbData?.color,
                      backgroundColor: `${orbData?.color}20`
                    }}
                  >
                    <img
                      src={`/images/orbs/${orb.orbType}.png`}
                      alt={orbData?.name}
                      className="w-12 h-12 mx-auto mb-2"
                    />
                    <p className="text-xs font-bold text-center mb-1" style={{ color: orbData?.color }}>
                      {orbData?.name}
                    </p>
                    <p className="text-[10px] text-center mb-2" style={{ color: orbGrade?.color }}>
                      {orbGrade?.name}
                    </p>
                    <div className="text-center text-xs text-yellow-400 mb-2">
                      ✨ +{dustGain}
                    </div>
                    <button
                      onClick={() => handleDisassembleOrb(orb)}
                      className="w-full py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded font-bold transition-all"
                    >
                      분해
                    </button>
                  </div>
                );
              })}
            </div>

            {unequippedOrbs.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                분해할 오브가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* ===== 제작 탭 ===== */}
        {activeTab === 'craft' && (
          <div className="space-y-4">
            {/* 제작 설명 */}
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                🛠️ 오브 가루를 사용하여 원하는 타입과 등급의 오브를 제작합니다.
              </p>
            </div>

            {/* 타입 선택 */}
            <div>
              <p className="text-sm text-gray-400 mb-2">1️⃣ 오브 타입 선택</p>
              <div className="grid grid-cols-5 gap-2">
                {ORBS.map((orbData) => {
                  const isSelected = selectedCraftType === orbData.id;
                  return (
                    <div
                      key={orbData.id}
                      onClick={() => setSelectedCraftType(orbData.id)}
                      className={`p-2 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all ${
                        isSelected ? 'ring-2 ring-white' : ''
                      }`}
                      style={{
                        borderColor: orbData.color,
                        backgroundColor: `${orbData.color}20`
                      }}
                    >
                      <img
                        src={`/images/orbs/${orbData.id}.png`}
                        alt={orbData.name}
                        className="w-8 h-8 mx-auto mb-1"
                      />
                      <p className="text-[10px] font-bold text-center" style={{ color: orbData.color }}>
                        {orbData.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 등급 선택 */}
            <div>
              <p className="text-sm text-gray-400 mb-2">2️⃣ 등급 선택</p>
              <div className="grid grid-cols-5 gap-2">
                {ORB_GRADE_ORDER.map((gradeId) => {
                  const gradeData = ORB_GRADES[gradeId];
                  const cost = ORB_UPGRADE_CONFIG.craftCost[gradeId];
                  const isSelected = selectedCraftGrade === gradeId;
                  const canAfford = orbDust >= cost;

                  return (
                    <div
                      key={gradeId}
                      onClick={() => setSelectedCraftGrade(gradeId)}
                      className={`p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all ${
                        isSelected ? 'ring-2 ring-white' : ''
                      } ${!canAfford ? 'opacity-50' : ''}`}
                      style={{
                        borderColor: gradeData.color,
                        backgroundColor: `${gradeData.color}20`
                      }}
                    >
                      <p className="text-sm font-bold text-center mb-1" style={{ color: gradeData.color }}>
                        {gradeData.name}
                      </p>
                      <p className="text-xs text-center text-yellow-400">
                        ✨ {cost}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 제작 미리보기 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">제작 미리보기</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <img
                    src={`/images/orbs/${selectedCraftType}.png`}
                    alt={getOrbById(selectedCraftType)?.name}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <p className="font-bold" style={{ color: getOrbById(selectedCraftType)?.color }}>
                    {getOrbById(selectedCraftType)?.name}
                  </p>
                  <p className="text-sm" style={{ color: ORB_GRADES[selectedCraftGrade]?.color }}>
                    {ORB_GRADES[selectedCraftGrade]?.name}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  비용: <span className="text-yellow-400 font-bold">✨ {ORB_UPGRADE_CONFIG.craftCost[selectedCraftGrade]}</span>
                </p>
                <p className="text-xs text-gray-500">
                  (보유: {orbDust})
                </p>
              </div>
            </div>

            <button
              onClick={handleCraftOrb}
              disabled={orbDust < ORB_UPGRADE_CONFIG.craftCost[selectedCraftGrade]}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
            >
              🛠️ 제작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrbWorkshop;
