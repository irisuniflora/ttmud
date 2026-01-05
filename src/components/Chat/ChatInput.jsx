import React, { useState, useRef } from 'react';

const ChatInput = ({ onSend, onOpenPicker }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 외부에서 링크 삽입 시 호출
  const insertLink = (linkString) => {
    setMessage(prev => prev + linkString);
    inputRef.current?.focus();
  };

  // 부모 컴포넌트에서 insertLink 함수 사용할 수 있도록 ref 노출
  React.useImperativeHandle(
    React.useRef(),
    () => ({ insertLink }),
    []
  );

  return (
    <div className="flex gap-2 p-3 border-t border-gray-700 bg-gray-900">
      {/* 아이템 링크 버튼 */}
      <button
        onClick={onOpenPicker}
        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold transition-colors
                   flex items-center justify-center"
        title="아이템/문양/동료 링크 추가"
      >
        📎
      </button>

      {/* 입력창 */}
      <input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2
                   text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500
                   transition-colors"
        placeholder="메시지를 입력하세요... (Enter로 전송)"
        maxLength={500}
      />

      {/* 전송 버튼 */}
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className={`px-4 py-2 rounded font-bold transition-colors
          ${message.trim()
            ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
      >
        전송
      </button>
    </div>
  );
};

export default ChatInput;
