import React from 'react';

const PrestigeConfirmModal = ({ isOpen, onConfirm, onCancel, fragmentsGained, currentFloor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-2 border-purple-500/50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* 상단 장식 바 */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

        {/* 헤더 */}
        <div className="p-6 pb-4 text-center">
          <div className="text-5xl mb-3">🌀</div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            귀환하시겠습니까?
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            현재 <span className="text-yellow-400 font-bold">{currentFloor}층</span>에서 귀환합니다
          </p>
        </div>

        {/* 보상 정보 */}
        <div className="mx-6 p-4 bg-black/40 rounded-xl border border-purple-500/30">
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">획득할 고대 유물</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">🏺</span>
              <span className="text-3xl font-bold text-purple-300">{fragmentsGained}</span>
              <span className="text-lg text-gray-400">개</span>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="px-6 py-4">
          <div className="text-center text-sm text-gray-400">
            <p>1층으로 돌아가지만</p>
            <p className="text-green-400 font-medium mt-1">레벨과 스탯은 유지됩니다!</p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 p-6 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-all"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
          >
            귀환하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrestigeConfirmModal;
