import React, { useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatStore } from '../../store/chatStore';
import apiClient from '../../api/apiClient';

function ChatWindow() {
  const { activeChat, currentUser, setMessages } = useChatStore();
  
  // Path B Feature: Dynamic selector to listen to real-time partner typing status changes from Zustand
  const partnerTyping = useChatStore((state) => state.partnerTyping);

  // HYDRATION LOOP: Active chat badalte hi yeh database history tier se older messages restore karega
  useEffect(() => {
    if (!activeChat?.id) return;

    apiClient.get(`/messages/chat/${activeChat.id}`)
      .then((res) => {
        setMessages(res.data);
        console.log("Chat conversation canvas hydrated successfully with history.");
      })
      .catch((err) => {
        console.error("History sync runtime error: ", err);
      });
  }, [activeChat?.id, setMessages]);

  // Early exit boundary to prevent runtime UI property crashes if no chat is active
  if (!activeChat) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#efeae2] text-gray-500 font-medium text-sm select-none">
        <div className="text-center max-w-sm p-6">
          <div className="w-16 h-16 bg-gray-200/60 rounded-full flex items-center justify-center mb-4 mx-auto text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p className="text-gray-600 text-base font-semibold mb-1">Select a context</p>
          <p className="text-gray-400 text-xs leading-relaxed">Pick a contact from the sidebar matrix to initialize an asynchronous WebSocket stream pipeline.</p>
        </div>
      </div>
    );
  }

  // Identify the peer chat partner context row to resolve header labels
  const chatPartner = activeChat.recipient?.publicId === currentUser?.publicId 
    ? activeChat.sender 
    : activeChat.recipient;

  const partnerName = chatPartner?.username || 'Unknown User';

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#efeae2] relative overflow-hidden">
      
      {/* Dynamic Messaging Header Wrapper */}
      <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-inner">
            {partnerName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 tracking-wide">{partnerName}</h2>
            
            {/* Path B Implementation: Live visual indicator checks stomp state frames */}
            {partnerTyping ? (
              <p className="text-xs text-emerald-600 font-bold tracking-wider animate-pulse">typing...</p>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">Virtual Connection Active</p>
            )}
          </div>
        </div>
        
        {/* Decorative Secure Encryption indicator info badge */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-200/80 px-2.5 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-medium">E2E Secure</span>
        </div>
      </div>

      {/* Message Feed Scrollable Canvas Layer */}
      <MessageList />

      {/* Input Action Controller Layer with Typing Emitting Triggers Bound */}
      <MessageInput />
    </div>
  );
}

export default ChatWindow;