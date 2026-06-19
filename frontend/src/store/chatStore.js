import { create } from 'zustand';

export const useChatStore = create((set) => ({
  currentUser: null,
  activeChat: null,
  messages: [],
  stompClient: null,

  // State Modifiers
  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setMessages: (messages) => set({ messages }),
  
  // Appends new real-time messages coming from Kafka/WebSockets pipeline
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  setStompClient: (client) => set({ stompClient: client }),
  
  // Reset store on logout
  logout: () => set({ currentUser: null, activeChat: null, messages: [], stompClient: null })
}));