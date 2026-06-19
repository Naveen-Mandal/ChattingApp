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
      
      // FIXED: Switched listener from authenticated /user/ queue to explicit /topic/ channel
      client.subscribe(`/topic/messages/${currentUser.publicId}`, (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        
        // Prevent duplicate appending if the sender is receiving their own broadcast reflection
        if (receivedMessage.senderId !== currentUser.publicId) {
            addMessage(receivedMessage);
        }
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