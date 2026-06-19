import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import MessageBubble from './MessageBubble';

function MessageList() {
  const { messages, activeChat, currentUser } = useChatStore();
  const listRef = useRef(null);

  // Filter messages dynamically belonging to the current conversation scope
  const filteredMessages = messages.filter(msg => 
    (msg.senderId === currentUser.publicId && msg.receiverId === activeChat.id.toString()) ||
    (msg.senderId === activeChat.id.toString() && msg.receiverId === currentUser.publicId)
  );

  // Auto scroll to the absolute bottom on receiving new live payloads
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2] opacity-95">
      <div className="bg-emerald-50 text-emerald-800 text-[11px] px-3 py-1.5 rounded shadow-sm max-w-xs mx-auto text-center font-medium border border-emerald-100/40 select-none">
        🔒 End-to-end asynchronous Kafka logging active.
      </div>

      {filteredMessages.map((msg, index) => (
        <MessageBubble key={index} msg={msg} />
      ))}
    </div>
  );
}

export default MessageList;