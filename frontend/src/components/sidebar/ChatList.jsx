import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useChatStore } from '../../store/chatStore';

function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, setActiveChat, activeChat } = useChatStore();

  useEffect(() => {
    // Fetches all available profiles from MySQL via backend controller
    apiClient.get('/users')
      .then((response) => {
        // Filter out the currently logged-in user themselves
        const filteredUsers = response.data.filter(u => u.publicId !== currentUser.publicId);
        setUsers(filteredUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load user network array: ", err);
        setLoading(false);
      });
  }, [currentUser]);

  const handleSelectUser = async (targetUser) => {
    try {
      // Hits ChatController.java to either generate or fetch the unified Chat Room Instance
      const response = await apiClient.post(`/chats?senderId=${currentUser.id}&recipientId=${targetUser.id}`);
      setActiveChat(response.data);
    } catch (err) {
      console.error("Critical error mapping chat room initialization channel: ", err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-400 animate-pulse">Loading active contacts...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
      {users.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-400">No alternate contacts found in MySQL.</div>
      ) : (
        users.map((user) => (
          <div 
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-150 ${
              activeChat?.id === user.id ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold text-gray-800 truncate">{user.name}</h3>
                <span className="text-xs text-gray-400">Live</span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">Click to chat securely</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ChatList;