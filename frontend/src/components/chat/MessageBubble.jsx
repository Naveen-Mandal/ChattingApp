import React from 'react';
import { useChatStore } from '../../store/chatStore';

function MessageBubble({ msg }) {
  const { currentUser } = useChatStore();
  const isSentByMe = msg.senderId === currentUser.publicId;

  return (
    <div className={`flex w-full ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm relative text-sm text-gray-800 ${
        isSentByMe 
          ? 'bg-[#d9fdd3] rounded-tr-none' 
          : 'bg-white rounded-tl-none'
      }`}>
        <p className="break-words pr-12">{msg.content}</p>
        
        {/* Timestamp and Meta indicator floor */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-gray-400 select-none">
          <span>15:45</span>
          {isSentByMe && (
            <span className="text-sky-500 font-bold">✓✓</span> // Blue ticks placeholder
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;