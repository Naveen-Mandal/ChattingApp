import React, { useState, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import apiClient from '../../api/apiClient';

function MessageInput() {
  const [text, setText] = useState('');
  const { activeChat, currentUser, stompClient, addMessage } = useChatStore();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Path B Feature: WebSocket emit trigger for real-time typing indicators
  const sendTypingStatus = (typing) => {
    if (stompClient && stompClient.connected && activeChat) {
      stompClient.publish({
        destination: `/app/typing/${activeChat.publicChatId}`,
        body: JSON.stringify({ 
          username: currentUser.name || currentUser.username, 
          typing 
        })
      });
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Debounce engine for typing status
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingStatus(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStatus(false);
    }, 2000); // 2-second timeout before resetting typing state
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    // Construct the payload for Kafka propagation
    const payload = {
      publicChatId: activeChat.publicChatId,
      senderId: currentUser.publicId,
      receiverId: activeChat.recipient.publicId === currentUser.publicId 
                  ? activeChat.sender.publicId 
                  : activeChat.recipient.publicId,
      content: text,
      type: "TEXT"
    };

    // Optimistic UI Update: Turant list mein append karein (Zero-latency feel)
    const optimisticMessage = {
        ...payload,
        id: Date.now(), 
        status: "SENDING",
        createdAt: new Date().toISOString()
    };
    addMessage(optimisticMessage);
    
    const currentInput = text;
    setText('');

    try {
      clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
      sendTypingStatus(false); // Stop typing indicator upon send
      
      await apiClient.post('/messages/send', payload);

      // Update optimistic message status to SENT
      const currentMessages = useChatStore.getState().messages;
      const updatedMessages = currentMessages.map(msg => {
        if (msg.id === optimisticMessage.id) {
          return { ...msg, status: 'SENT' };
        }
        return msg;
      });
      useChatStore.setState({ messages: updatedMessages });
    } catch (err) {
      console.error("Critical failure during async message propagation loop:", err);
      // Mark optimistic message as FAILED
      const currentMessages = useChatStore.getState().messages;
      const updatedMessages = currentMessages.map(msg => {
        if (msg.id === optimisticMessage.id) {
          return { ...msg, status: 'FAILED' };
        }
        return msg;
      });
      useChatStore.setState({ messages: updatedMessages });
    }
  };

  return (
    <form 
      onSubmit={handleSendMessage} 
      className="h-16 bg-[#f0f2f5] px-4 flex items-center gap-3 shrink-0 border-t border-gray-200"
    >
      <input
        type="text"
        value={text}
        onChange={handleInputChange}
        placeholder="Type a secure message..."
        className="flex-1 bg-white py-2.5 px-4 rounded-lg text-sm outline-none border border-transparent focus:border-emerald-400 shadow-sm transition-all"
      />
      <button 
        type="submit" 
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
      >
        Send
      </button>
    </form>
  );
}

export default MessageInput;