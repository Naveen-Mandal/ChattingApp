import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useChatStore } from '../store/chatStore';

export const useWebSocket = () => {
  const { currentUser, addMessage, setStompClient } = useChatStore();
  const clientRef = useRef(null); 

  useEffect(() => {
    if (!currentUser) return;
    if (clientRef.current) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-chat',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log(`Socket pipe mapped safely for user public scope: ${currentUser.publicId}`);
      
      // FIX: Changed subscription from .id to .publicId to align with backend routing target
      client.subscribe(`/user/${currentUser.publicId}/queue/messages`, (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        addMessage(receivedMessage);
      });
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
  }, [currentUser]); 
};