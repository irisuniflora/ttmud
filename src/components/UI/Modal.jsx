import React from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
          borderColor: 'border-green-400',
          titleColor: 'text-green-800',
          buttonColor: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-gradient-to-br from-red-50 to-orange-50',
          borderColor: 'border-red-400',
          titleColor: 'text-red-800',
          buttonColor: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-400',
          titleColor: 'text-yellow-800',
          buttonColor: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
        };
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          borderColor: 'border-blue-400',
          titleColor: 'text-blue-800',
          buttonColor: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`${styles.bgColor} border-2 ${styles.borderColor} rounded-xl shadow-2xl max-w-md w-full transform animate-scaleIn`}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <span className="text-4xl">{styles.icon}</span>
          <h3 className={`text-xl font-bold ${styles.titleColor}`}>
            {title || '알림'}
          </h3>
        </div>

        {/* 메시지 */}
        <div className="px-6 pb-6">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* 버튼 */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg font-bold text-white ${styles.buttonColor} transition-all shadow-md hover:shadow-lg`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
