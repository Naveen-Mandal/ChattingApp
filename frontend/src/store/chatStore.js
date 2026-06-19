import { create } from 'zustand';

export const useChatStore = create((set) => ({
  // State initialization
  currentUser: null,
  activeChat: null,
  messages: [],
  stompClient: null,

  // Setters
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setActiveChat: (chat) => set({ activeChat: chat }),
  
  setMessages: (messages) => set({ messages }),
  
  // Real-time message logic: Ensure immutability for state consistency
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  // WebSocket client setter: Ab `useWebSocket` hook iska control rakhega
  setStompClient: (client) => set({ stompClient: client }),
  
  // Clean shutdown on logout
  logout: () => set({ 
    currentUser: null, 
    activeChat: null, 
    messages: [], 
    stompClient: null 
  })
}));