import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useChatStore } from '../store/chatStore';

export const useWebSocket = () => {
  const { currentUser, addMessage, setStompClient } = useChatStore();
  const clientRef = useRef(null); // Ref use karenge taaki client persistent rahe

  useEffect(() => {
    if (!currentUser) return;

    // Pehle se connection hai toh dobara mat banao
    if (clientRef.current) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-chat',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log(`Socket pipe mapped for user: ${currentUser.id}`);
      client.subscribe(`/user/${currentUser.id}/queue/messages`, (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        addMessage(receivedMessage);
      });
    };

    client.activate();
    clientRef.current = client; // Ref mein store karo
    setStompClient(client); // Zustand mein set karo

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setStompClient(null);
      }
    };
  }, [currentUser]); // dependencies sirf currentUser rakhi
};