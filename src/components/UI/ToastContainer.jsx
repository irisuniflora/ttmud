import React, { useState, useCallback, createContext, useContext } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info', duration = 2000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (title, message, duration) => addToast(title, message, 'success', duration),
    warning: (title, message, duration) => addToast(title, message, 'warning', duration),
    error: (title, message, duration) => addToast(title, message, 'error', duration),
    info: (title, message, duration) => addToast(title, message, 'info', duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* 토스트 컨테이너 */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
        {toasts.map(t => (
          <Toast
            key={t.id}
            id={t.id}
            title={t.title}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
