import React, { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import apiClient from '../../api/apiClient';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatWindow() {
  const { activeChat, setMessages } = useChatStore();

  // FIXED: Trigger API call to fetch message history whenever activeChat contextual ID changes
  useEffect(() => {
    if (!activeChat) return;

    apiClient.get(`/messages/chat/${activeChat.id}`)
      .then(res => {
        setMessages(res.data);
        console.log("Chat history hydrated from database:", res.data);
      })
      .catch(err => {
        console.error("Critical error fetching persistent chat history:", err);
      });
  }, [activeChat?.id, setMessages]);

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      {/* Header section */}
      <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold shadow-sm">
            {activeChat?.name ? activeChat.name[0].toUpperCase() : 'C'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{activeChat?.name}</h2>
            <p className="text-xs text-emerald-600">Secure AES Session</p>
          </div>
        </div>
      </div>

      {/* Message space */}
      <MessageList />
      <MessageInput />
    </div>
  );
}

export default ChatWindow;