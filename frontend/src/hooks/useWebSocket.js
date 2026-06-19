import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useChatStore } from '../store/chatStore';

export const useWebSocket = () => {
  const { currentUser, addMessage, stompClient, setStompClient } = useChatStore();

  useEffect(() => {
    if (!currentUser || stompClient) return;

    // Initialize the enterprise STOMP broker client
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-chat', 
      reconnectDelay: 5000, // Safe automated retry loop if network drops
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP Core Info: ', str),
    });

    client.onConnect = () => {
      console.log(`Successfully mapped bi-directional socket pipe for user ID: ${currentUser.id}`);
      
      // Subscribe strictly to the unique user channel assigned by MessageConsumer.java
      client.subscribe(`/user/${currentUser.id}/queue/messages`, (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        
        // Push message instantly to Zustand store state mesh
        addMessage(receivedMessage);
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Protocol layer malfunctioned: ', frame.headers['message']);
    };

    client.activate();
    setStompClient(client);

    // Cleanup hook on unmount/logout context switch
    return () => {
      if (client) {
        client.deactivate();
        setStompClient(null);
      }
    };
  }, [currentUser, stompClient, addMessage, setStompClient]);
};