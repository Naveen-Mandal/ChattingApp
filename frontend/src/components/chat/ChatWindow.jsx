import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatStore } from '../../store/chatStore';

function ChatWindow() {
  const { activeChat, currentUser } = useChatStore();

  // FIX: Prevent application crash by returning early if no chat is active
  if (!activeChat) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#efeae2] text-gray-500 font-medium text-sm">
        Select a contact from the sidebar to begin messaging.
      </div>
    );
  }

  // FIX: Identify the other user in the room to display their username
  const chatPartner = activeChat.recipient?.publicId === currentUser?.publicId 
    ? activeChat.sender 
    : activeChat.recipient;

  const partnerName = chatPartner?.username || 'Unknown User';

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#efeae2]">
      {/* Dynamic Header */}
      <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
            {partnerName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{partnerName}</h2>
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