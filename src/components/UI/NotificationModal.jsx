import React, { useEffect, useRef } from 'react';

const NotificationModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const closeHandledRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      closeHandledRef.current = false;

      const timer = setTimeout(() => {
        if (!closeHandledRef.current) {
          closeHandledRef.current = true;
          onClose();
        }
      }, 3000);

      const handleKeyDown = (e) => {
        // Enter 또는 스페이스 키로 닫기
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          if (!closeHandledRef.current) {
            closeHandledRef.current = true;
            onClose();
          }
        } else {
          // 다른 키는 막기만 하고 처리는 안함
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // 키 입력을 캡처 단계에서 먼저 잡아서 막기
      window.addEventListener('keydown', handleKeyDown, true);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [isOpen, onClose]);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!closeHandledRef.current) {
      closeHandledRef.current = true;
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500',
          bg: 'bg-gradient-to-br from-green-900/95 to-emerald-900/95',
          icon: '✅',
          iconColor: 'text-green-400'
        };
      case 'error':
        return {
          border: 'border-red-500',
          bg: 'bg-gradient-to-br from-red-900/95 to-rose-900/95',
          icon: '❌',
          iconColor: 'text-red-400'
        };
      case 'warning':
        return {
          border: 'border-yellow-500',
          bg: 'bg-gradient-to-br from-yellow-900/95 to-orange-900/95',
          icon: '⚠️',
          iconColor: 'text-yellow-400'
        };
      default:
        return {
          border: 'border-blue-500',
          bg: 'bg-gradient-to-br from-blue-900/95 to-cyan-900/95',
          icon: 'ℹ️',
          iconColor: 'text-blue-400'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className={`relative ${styles.bg} border-2 ${styles.border} rounded-xl p-6 shadow-2xl max-w-md w-full mx-4 animate-scaleIn`}>
        {/* 아이콘 */}
        <div className="flex items-center justify-center mb-4">
          <div className={`text-5xl ${styles.iconColor}`}>
            {styles.icon}
          </div>
        </div>

        {/* 타이틀 */}
        {title && (
          <h3 className="text-xl font-bold text-white text-center mb-3">
            {title}
          </h3>
        )}

        {/* 메시지 */}
        <p className="text-gray-200 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* 확인 버튼 */}
        <button
          onClick={handleButtonClick}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
            type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
            type === 'error' ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700' :
            type === 'warning' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' :
            'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
          }`}
        >
          확인
        </button>

        {/* 자동 닫힘 프로그레스 바 */}
        <div className="mt-3 w-full bg-gray-700 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{
              animation: 'progress 3s linear forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;
