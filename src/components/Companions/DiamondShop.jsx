import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { useToast } from '../UI/ToastContainer';
import { DIAMOND_CONFIG, PULL_PACKAGES } from '../../data/diamondShop';
import { COMPANION_GRADES, GRADE_ORDER } from '../../data/companions';
import { ORB_GRADES, getOrbDisplayInfo } from '../../data/orbs';
import { formatNumber } from '../../utils/formatter';
import CardPullAnimation from './CardPullAnimation';

const DiamondShop = () => {
  const { gameState, pullCompanionCards, pullOrbs } = useGame();
  const toast = useToast();
  const { diamonds = 0, companionCards = {}, companionOrbs = [] } = gameState;

  const [pullResults, setPullResults] = useState(null);
  const [isPulling, setIsPulling] = useState(false);
  const [orbPullResult, setOrbPullResult] = useState(null);
  const [localCardCounts, setLocalCardCounts] = useState({});
  const [localOrbCount, setLocalOrbCount] = useState(0);

  // 동료 뽑기 실행
  const handleCompanionPull = async (packageId) => {
    const pkg = PULL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    if (diamonds < pkg.cost) {
      toast.warning('다이아 부족', '다이아가 부족합니다!');
      return;
    }

    if (!pullCompanionCards) {
      toast.info('준비 중', '뽑기 기능이 준비 중입니다.');
      return;
    }

    setIsPulling(true);
    const results = pullCompanionCards(packageId);

    if (results?.success) {
      setPullResults(results.cards);

      // 즉시 로컬 카드 카운트 업데이트
      const newCounts = { ...localCardCounts };
      results.cards.forEach(card => {
        const currentCount = companionCards[card.companionId] || 0;
        const localIncrease = newCounts[card.companionId] || 0;
        newCounts[card.companionId] = localIncrease + 1;
      });
      setLocalCardCounts(newCounts);
    } else {
      toast.error('뽑기 실패', results?.message || '뽑기에 실패했습니다.');
      setIsPulling(false);
    }
  };

  // 오브 뽑기 실행
  const handleOrbPull = (count) => {
    const cost = count * 10;

    if (diamonds < cost) {
      toast.warning('다이아 부족', '다이아가 부족합니다!');
      return;
    }

    if (!pullOrbs) {
      toast.info('준비 중', '오브 뽑기 기능이 준비 중입니다.');
      return;
    }

    const result = pullOrbs(count);
    if (result?.success) {
      setOrbPullResult(result.orbs);

      // 즉시 로컬 오브 카운트 업데이트
      setLocalOrbCount(localOrbCount + result.orbs.length);
    } else {
      toast.error('뽑기 실패', result?.message || '오브 뽑기에 실패했습니다.');
    }
  };

  // 뽑기 애니메이션 완료
  const handlePullComplete = () => {
    setIsPulling(false);
    setPullResults(null);
  };

  return (
    <div className="space-y-4">
      {/* 동료 뽑기 애니메이션 */}
      {pullResults && (
        <CardPullAnimation
          results={pullResults}
          onComplete={handlePullComplete}
          companionCards={companionCards}
          localCardCounts={localCardCounts}
        />
      )}

      {/* 오브 뽑기 결과 모달 */}
      {orbPullResult && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setOrbPullResult(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-2 text-center">🌀 오브 소환 결과</h3>

            {/* 즉시 반영된 오브 수량 표시 */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-300">🌀 보유 오브</span>
                <span className="text-lg font-bold text-white">
                  {companionOrbs.length} → <span className="text-green-400">{companionOrbs.length + localOrbCount}</span>
                  <span className="text-green-400 text-sm ml-1">(+{localOrbCount})</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {orbPullResult.map((orb, idx) => {
                const orbInfo = getOrbDisplayInfo(orb);
                if (!orbInfo) return null;
                return (
                  <div
                    key={idx}
                    className="bg-gray-800 border rounded-lg p-3 text-center"
                    style={{ borderColor: orbInfo.gradeColor }}
                  >
                    <div className="text-3xl mb-2">🌀</div>
                    <p className="text-xs font-bold" style={{ color: orbInfo.gradeColor }}>
                      {orbInfo.gradeName}
                    </p>
                    <p className="text-sm font-bold text-white truncate">{orbInfo.name}</p>
                    <p className="text-xs text-gray-400">
                      {orbInfo.statName} +{orbInfo.value}{orbInfo.unit}
                    </p>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setOrbPullResult(null)}
              className="w-full py-3 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 다이아 보유량 */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">보유 다이아</span>
          <span className="text-2xl font-bold text-cyan-400">💎 {formatNumber(diamonds)}</span>
        </div>
      </div>

      {/* 동료 소환 */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-3">🎴 동료 소환</h4>

        {/* 확률 표시 */}
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 mb-2">소환 확률</p>
          <div className="flex flex-wrap gap-2">
            {GRADE_ORDER.map(gradeId => {
              const grade = COMPANION_GRADES[gradeId];
              return (
                <span
                  key={gradeId}
                  className="px-2 py-1 rounded text-xs font-bold bg-gray-800"
                  style={{ color: grade.color }}
                >
                  {grade.name}: {grade.pullRate}%
                </span>
              );
            })}
          </div>
        </div>

        {/* 뽑기 버튼들 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {PULL_PACKAGES.map(pkg => (
            <button
              key={pkg.id}
              onClick={() => handleCompanionPull(pkg.id)}
              disabled={diamonds < pkg.cost || isPulling}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                diamonds >= pkg.cost && !isPulling
                  ? 'border-cyan-500 bg-gray-700 hover:bg-gray-600 cursor-pointer'
                  : 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl mb-1">{pkg.id === 'single' ? '🎴' : '🎴🎴🎴'}</p>
                <p className="font-bold text-white">{pkg.name}</p>
                <p className="text-xs text-gray-400 mb-2">{pkg.description}</p>
                <p className="text-cyan-400 font-bold">
                  💎 {pkg.cost}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* 천장 정보 */}
        <div className="bg-gray-900 rounded-lg p-2">
          <p className="text-xs text-gray-400 text-center">
            🎯 {DIAMOND_CONFIG.pitySystem.epicPity}회 내 에픽 확정
          </p>
        </div>
      </div>

      {/* 오브 소환 */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-3">🌀 오브 소환</h4>

        {/* 오브 확률 표시 */}
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 mb-2">소환 확률</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ORB_GRADES).map(([gradeId, grade]) => (
              <span
                key={gradeId}
                className="px-2 py-1 rounded text-xs font-bold bg-gray-800"
                style={{ color: grade.color }}
              >
                {grade.name}: {grade.pullRate}%
              </span>
            ))}
          </div>
        </div>

        {/* 오브 뽑기 버튼들 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOrbPull(1)}
            disabled={diamonds < 10}
            className={`p-4 rounded-lg border-2 transition-all ${
              diamonds >= 10
                ? 'border-cyan-500 bg-gray-700 hover:bg-gray-600 cursor-pointer'
                : 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl mb-1">🌀</p>
              <p className="font-bold text-white">단일 소환</p>
              <p className="text-xs text-gray-400 mb-2">오브 1개 소환</p>
              <p className="text-cyan-400 font-bold">💎 10</p>
            </div>
          </button>
          <button
            onClick={() => handleOrbPull(10)}
            disabled={diamonds < 100}
            className={`p-4 rounded-lg border-2 transition-all ${
              diamonds >= 100
                ? 'border-cyan-500 bg-gray-700 hover:bg-gray-600 cursor-pointer'
                : 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl mb-1">🌀🌀🌀</p>
              <p className="font-bold text-white">10연차 소환</p>
              <p className="text-xs text-gray-400 mb-2">오브 10개 소환</p>
              <p className="text-cyan-400 font-bold">💎 100</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiamondShop;
