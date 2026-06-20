import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useChatStore } from '../store/chatStore';
import apiClient from '../api/apiClient';

export const useWebSocket = () => {
  const { currentUser, addMessage, setStompClient, activeChat } = useChatStore();
  const clientRef = useRef(null);
  const typingSubscriptionRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // 1. WebSocket Connection lifecycle useEffect
  useEffect(() => {
    if (!currentUser) return;
    if (clientRef.current) return;

    const token = localStorage.getItem('whatsapp_token');
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-chat',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    client.onConnect = () => {
      console.log(`Socket pipe mapped safely for user public scope: ${currentUser.publicId}`);
      setConnected(true);
      
      // Message Subscription Channel (static per session)
      client.subscribe(`/topic/messages/${currentUser.publicId}`, (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        if (receivedMessage.senderId !== currentUser.publicId) {
          const currentActiveChat = useChatStore.getState().activeChat;
          if (currentActiveChat && receivedMessage.publicChatId === currentActiveChat.publicChatId) {
            receivedMessage.status = 'SEEN';
            addMessage(receivedMessage);
            apiClient.post(`/messages/chat/${currentActiveChat.id}/read?userId=${currentUser.publicId}`)
              .catch(err => console.error("Failed to post read receipt: ", err));
          } else {
            addMessage(receivedMessage);
          }
        }
      });

      // Status Updates Channel (read receipts / blue ticks)
      client.subscribe(`/topic/status/${currentUser.publicId}`, (payload) => {
        const update = JSON.parse(payload.body);
        if (update.type === 'READ_RECEIPT') {
          const messages = useChatStore.getState().messages;
          const updatedMessages = messages.map(msg => {
            if (msg.publicChatId === update.publicChatId && msg.senderId === currentUser.publicId) {
              return { ...msg, status: 'SEEN' };
            }
            return msg;
          });
          useChatStore.setState({ messages: updatedMessages });
        }
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;
    setStompClient(client);

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setStompClient(null);
        setConnected(false);
      }
    };
  }, [currentUser, setStompClient]);

  // 2. Typing Indicator dynamic subscription useEffect
  useEffect(() => {
    // If client is not connected or no active chat, unsubscribe and exit
    if (!connected || !clientRef.current || !clientRef.current.connected) {
      return;
    }

    // Unsubscribe from previous typing indicators
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current.unsubscribe();
      typingSubscriptionRef.current = null;
      useChatStore.setState({ partnerTyping: false });
    }

    if (activeChat?.publicChatId) {
      console.log(`Subscribing to typing indicators for room: ${activeChat.publicChatId}`);
      typingSubscriptionRef.current = clientRef.current.subscribe(
        `/topic/typing/${activeChat.publicChatId}`,
        (payload) => {
          const status = JSON.parse(payload.body);
          const currentUsername = currentUser.name || currentUser.username;
          if (status.username !== currentUsername) {
            useChatStore.setState({ partnerTyping: status.typing });
          }
        }
      );
    }

    return () => {
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current.unsubscribe();
        typingSubscriptionRef.current = null;
        useChatStore.setState({ partnerTyping: false });
      }
    };
  }, [connected, activeChat?.publicChatId, currentUser]);
};