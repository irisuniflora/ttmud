import React, { useEffect, memo } from 'react';

const Toast = memo(({ id, title, message, type = 'info', onClose, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  const typeStyles = {
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500',
    warning: 'bg-gradient-to-r from-yellow-600 to-amber-600 border-yellow-500',
    error: 'bg-gradient-to-r from-red-600 to-rose-600 border-red-500',
    info: 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500'
  };

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div
      className={`${typeStyles[type]} border-l-4 rounded-lg shadow-2xl p-4 mb-3 min-w-[300px] max-w-md animate-slideIn cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={() => onClose(id)}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
          {message && <p className="text-white/90 text-xs break-words">{message}</p>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(id);
          }}
          className="text-white/60 hover:text-white text-lg font-bold flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
