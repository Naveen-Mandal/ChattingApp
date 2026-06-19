import React from 'react';
import SearchBar from './SearchBar';
import ChatList from './ChatList';
import { useChatStore } from '../../store/chatStore';

function Sidebar() {
  const { currentUser, logout } = useChatStore();

  // FIXED: Safe dynamic fallback variable parsing to completely eliminate undefined property extraction crashes
  const userDisplayName = currentUser?.name || currentUser?.username || 'User';
  const displayInitial = userDisplayName[0].toUpperCase();

  return (
    <div className="w-full md:w-[35%] lg:w-[30%] border-r border-gray-200 flex flex-col bg-white h-full">
      <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white shadow-sm">
            {displayInitial}
          </div>
          <span className="font-semibold text-sm text-gray-700 truncate max-w-[120px]">{userDisplayName}</span>
        </div>
        <button 
          onClick={logout}
          className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded transition-all bg-white shadow-sm cursor-pointer"
        >
          Logout
        </button>
      </div>
      <SearchBar />
      <ChatList />
    </div>
  );
}

export default Sidebar;