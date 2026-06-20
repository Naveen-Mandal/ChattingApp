import React from 'react';
import { useChatStore } from '../../store/chatStore';

function MessageBubble({ msg }) {
  const { currentUser } = useChatStore();
  const isSentByMe = msg.senderId === currentUser?.publicId;

  // FIX: Formats structural timestamp data string or falls back cleanly if empty
  const formatTime = () => {
    if (!msg.createdAt) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      return new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '00:00';
    }
  };

  const renderTicks = () => {
    if (!isSentByMe) return null;
    if (msg.status === 'SENDING') {
      return <span className="text-gray-400 font-light text-[10px] animate-pulse">🕒</span>;
    }
    if (msg.status === 'FAILED') {
      return <span className="text-red-500 font-bold text-[10px]" title="Failed to send">⚠️</span>;
    }
    if (msg.status === 'SENT') {
      return <span className="text-gray-400 font-medium">✓</span>;
    }
    if (msg.status === 'RECEIVED') {
      return <span className="text-gray-400 font-bold">✓✓</span>;
    }
    if (msg.status === 'SEEN') {
      return <span className="text-sky-500 font-bold">✓✓</span>;
    }
    return <span className="text-gray-400 font-medium">✓</span>;
  };

  return (
    <div className={`flex w-full ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm relative text-sm text-gray-800 ${
        isSentByMe 
          ? 'bg-[#d9fdd3] rounded-tr-none' 
          : 'bg-white rounded-tl-none'
      }`}>
        <p className="break-words pr-12">{msg.content}</p>
        
        <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-gray-400 select-none">
          {/* FIX: Dynamic runtime time injection */}
          <span>{formatTime()}</span>
          {renderTicks()}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;