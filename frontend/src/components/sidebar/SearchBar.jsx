import React from 'react';

function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="p-2 bg-white border-b border-gray-100">
      <div className="bg-gray-100 flex items-center px-3 py-1.5 rounded-lg">
        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Search or start a new chat" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm w-full focus:outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
    </div>
  );
}

export default SearchBar;