import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useChatStore } from '../store/chatStore';

export const useWebSocket = () => {
  const { currentUser, addMessage, setStompClient, activeChat } = useChatStore();
  const clientRef = useRef(null);
  const typingSubscriptionRef = useRef(null);

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
      
      // 1. Message Subscription Channel
      client.subscribe(`/topic/messages/${currentUser.publicId}`, (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        if (receivedMessage.senderId !== currentUser.publicId) {
            addMessage(receivedMessage);
        }
      });

      // 2. Typing Indicator Listener
      if (activeChat?.publicChatId) {
        typingSubscriptionRef.current = client.subscribe(
          `/topic/typing/${activeChat.publicChatId}`,
          (payload) => {
            const status = JSON.parse(payload.body);
            if (status.username !== currentUser.username) {
              // Update local store dynamic state tracking fields
              useChatStore.setState({ partnerTyping: status.isTyping });
            }
          }
        );
      }
    };

    client.activate();
    clientRef.current = client;
    setStompClient(client);

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setStompClient(null);
      }
    };
  }, [currentUser, activeChat?.publicChatId]); // Re-bind subscriptions when room scope changes
};