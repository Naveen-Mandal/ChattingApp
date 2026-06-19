import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { useChatStore } from '../../store/chatStore';

function MessageInput() {
  const [text, setText] = useState('');
  const { currentUser, activeChat, addMessage } = useChatStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Package the pure DTO frame
    const messageDto = {
      publicChatId: activeChat.id.toString(), // The active shared Chat room ID
      senderId: currentUser.publicId,
      receiverId: activeChat.id.toString(), // In our logic, activeChat model returns the target User node
      content: text,
      type: 'TEXT'
    };

    // Optimistic local update: instant visual append on sender's screen before network response
    addMessage(messageDto);
    setText('');

    try {
      // Fire and forget: drop the payload onto Kafka asynchronous queue pipeline
      await apiClient.post('/messages/send', messageDto);
    } catch (err) {
      console.error("Pipeline failure routing message payload through Kafka endpoint: ", err);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="h-16 bg-[#f0f2f5] flex items-center px-4 gap-3 border-t border-gray-200 shrink-0">
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..." 
        className="flex-1 bg-white text-sm py-2.5 px-4 rounded-lg focus:outline-none text-gray-700 shadow-sm placeholder-gray-400"
      />
      <button 
        type="submit"
        className="bg-emerald-500 text-white p-2.5 rounded-full shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
      >
        <svg className="w-4 h-4 transform rotate-90 fill-current" viewBox="0 0 24 24">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
        </svg>
      </button>
    </form>
  );
}

export default MessageInput;