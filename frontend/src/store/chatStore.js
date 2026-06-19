import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Injected for cache layer management

export const useChatStore = create(
  persist(
    (set) => ({
      currentUser: null,
      activeChat: null,
      messages: [],
      stompClient: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setActiveChat: (chat) => set({ activeChat: chat }),
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      
      setStompClient: (client) => set({ stompClient: client }),
      
      logout: () => {
        set({ currentUser: null, activeChat: null, messages: [], stompClient: null });
        localStorage.removeItem('whatsapp-cluster-storage'); // Secure purge
      }
    }),
    {
      name: 'whatsapp-cluster-storage',
      // CRITICAL: Do NOT serialize active stompClient WebSocket socket instances
      partialize: (state) => ({
        currentUser: state.currentUser,
        activeChat: state.activeChat
      })
    }
  )
);