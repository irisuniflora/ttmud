import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ItemLinkPicker from './ItemLinkPicker';
import ItemLinkPreview from './ItemLinkPreview';

const Chat = () => {
  const { chatMessages, addChatMessage, clearChatMessages } = useGame();
  const [showPicker, setShowPicker] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pendingLink, setPendingLink] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 새 메시지 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 메시지 전송
  const handleSend = (content) => {
    if (content.trim()) {
      addChatMessage(content, 'Player');
    }
  };

  // 아이템 링크 선택
  const handleLinkSelect = (linkString) => {
    console.log('Link selected:', linkString);
    setPendingLink(prev => prev + linkString + ' ');
    setShowPicker(false);
  };

  // 링크 클릭 시 미리보기
  const handleLinkClick = (linkData) => {
    setPreviewData(linkData);
  };

  // 입력창에 pending link 적용
  const handleSendWithPending = (content) => {
    const fullContent = pendingLink + content;
    if (fullContent.trim()) {
      addChatMessage(fullContent.trim(), 'Player');
    }
    setPendingLink('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="text-lg font-bold text-cyan-400">채팅</h3>
          <span className="text-xs text-gray-500">({chatMessages.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChatMessages}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            title="채팅 기록 삭제"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <div className="text-sm">채팅을 시작해보세요!</div>
            <div className="text-xs mt-2 text-gray-600">
              📎 버튼으로 아이템/문양/동료를 공유할 수 있습니다
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onLinkClick={handleLinkClick}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 선택된 링크 미리보기 */}
      {pendingLink && (
        <div className="px-3 py-2 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-400 mb-1">첨부된 링크:</div>
          <div className="text-sm text-cyan-400 truncate">{pendingLink}</div>
        </div>
      )}

      {/* 입력창 */}
      <ChatInput
        ref={inputRef}
        onSend={handleSendWithPending}
        onOpenPicker={() => setShowPicker(true)}
      />

      {/* 아이템 선택 모달 */}
      <ItemLinkPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleLinkSelect}
      />

      {/* 아이템 미리보기 모달 */}
      <ItemLinkPreview
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        linkData={previewData}
      />
    </div>
  );
};

export default Chat;
