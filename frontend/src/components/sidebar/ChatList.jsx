import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useChatStore } from '../../store/chatStore';

function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, setActiveChat, activeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser) return;

    apiClient.get('/users')
      .then((response) => {
        // Safe fallback normalization to handle potential mock string-matching variations
        const currentPublicId = currentUser?.publicId?.toString();
        const filteredUsers = response.data.filter(u => u.publicId?.toString() !== currentPublicId);
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
      // FIX: Changed parameters back to numeric .id properties to align with Long arguments on the backend controller
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
        users.map((user) => {
          // Check if the user matches either the sender or recipient publicId of the active conversation entity
          const isChatActive = activeChat?.sender?.publicId === user.publicId || activeChat?.recipient?.publicId === user.publicId;

          return (
            <div 
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-150 ${
                isChatActive ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{user.username}</h3>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">Click to chat securely</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ChatList;