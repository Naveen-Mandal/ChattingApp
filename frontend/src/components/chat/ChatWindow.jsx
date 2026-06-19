import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatStore } from '../../store/chatStore';

function ChatWindow() {
  const { activeChat } = useChatStore();

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#efeae2]">
      {/* Dynamic Header */}
      <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
            {activeChat.name ? activeChat.name[0].toUpperCase() : 'C'}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{activeChat.name}</h2>
            <p className="text-xs text-emerald-600 font-medium">Virtual Connection Active</p>
          </div>
        </div>
      </div>

      {/* Message Feed Canvas Layer */}
      <MessageList />

      {/* Input Action Controller Layer */}
      <MessageInput />
    </div>
  );
}

export default ChatWindow;