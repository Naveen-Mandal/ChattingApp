import React, { createContext, useState, useEffect, useContext } from 'react';
import { Client } from '@stomp/stompjs';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  // Trigger WebSocket activation when a user logs in
  useEffect(() => {
    if (!currentUser) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-chat', // Connects directly to Spring Boot WebSocket Config
      connectHeaders: {},
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000, // Automatic reconnection strategy
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('Connected to WebSocket server as user: ' + currentUser.id);
      
      // Subscribe to personal live queue stream mapped from MessageConsumer.java
      client.subscribe(`/user/${currentUser.id}/queue/messages`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) client.deactivate();
    };
  }, [currentUser]);

  return (
    <ChatContext.Provider value={{ 
      currentUser, setCurrentUser, 
      activeChat, setActiveChat, 
      messages, setMessages, 
      stompClient 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);