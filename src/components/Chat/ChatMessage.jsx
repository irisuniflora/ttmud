import React, { useMemo } from 'react';
import { parseMessageContent, getLinkDisplayInfo } from '../../utils/chatLinkParser';

// 아이템 링크 배지 컴포넌트
const ItemLinkBadge = ({ linkData, onClick }) => {
  const { displayName, color, icon } = getLinkDisplayInfo(linkData);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(linkData);
      }}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold
                 cursor-pointer hover:brightness-125 transition-all mx-0.5"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}50`
      }}
    >
      {icon} {displayName}
    </button>
  );
};

// 개별 채팅 메시지 컴포넌트
const ChatMessage = ({ message, onLinkClick }) => {
  // 메시지 파싱 (링크와 텍스트 분리)
  const parsedContent = useMemo(() => {
    return parseMessageContent(message.content);
  }, [message.content]);

  // 발신자 색상
  const getSenderColor = (sender) => {
    if (sender === 'System') return 'text-yellow-400';
    if (sender === 'Player') return 'text-cyan-400';
    return 'text-green-400';
  };

  return (
    <div className="flex gap-2 py-1 px-2 hover:bg-gray-800/50 rounded text-sm">
      <span className="text-gray-500 text-xs whitespace-nowrap">[{message.timestamp}]</span>
      <span className={`font-bold whitespace-nowrap ${getSenderColor(message.sender)}`}>
        {message.sender}:
      </span>
      <span className="text-gray-200 break-words flex-1">
        {parsedContent.map((part, idx) => {
          if (part.type === 'text') {
            return <span key={idx}>{part.value}</span>;
          }
          if (part.type === 'link') {
            return (
              <ItemLinkBadge
                key={idx}
                linkData={part}
                onClick={onLinkClick}
              />
            );
          }
          return null;
        })}
      </span>
    </div>
  );
};

export default ChatMessage;
