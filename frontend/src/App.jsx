import React from 'react';
import { useChatStore } from './store/chatStore';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import apiClient from './api/apiClient';

function App() {
  const { currentUser, setCurrentUser, activeChat } = useChatStore();

  // Activates the asynchronous bi-directional message consumer pipeline internally 
  useWebSocket();

  // Fetch the exact user record from DB to synchronize local state with correct UUIDs
  const handleMockLogin = (id, name) => {
    apiClient.get('/users')
      .then((res) => {
        // Find the database entity based on numeric ID or match name rules
        const dbUser = res.data.find(u => u.id === id || u.username === name);
        if (dbUser) {
          setCurrentUser({
            id: dbUser.id,
            name: dbUser.username,      // Secure fallback tracking property
            publicId: dbUser.publicId   // The actual absolute UUID string from MySQL
          });
          console.log("Session synchronized securely with database metadata runtime:", dbUser);
        } else {
          // Dynamic fallback creation loop if context row is absent in DB
          apiClient.post('/users/register', {
            username: name,
            publicId: id.toString(),
            email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            status: "ONLINE"
          }).then(regRes => {
            setCurrentUser({
              id: regRes.data.id,
              name: regRes.data.username,
              publicId: regRes.data.publicId
            });
          });
        }
      })
      .catch((err) => {
        console.error("Critical error performing gateway session synchronization loop:", err);
      });
  };

  if (!currentUser) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center border border-gray-100">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shrink-0">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp Async Mesh</h1>
          <p className="text-gray-500 text-sm mb-8">Select a profile context to boot the real-time decoupled application runtime environment.</p>
          <div className="space-y-3">
            <button onClick={() => handleMockLogin(1, "Naveen Mandal")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition-all active:scale-95 cursor-pointer">Login as Naveen (User 1)</button>
            <button onClick={() => handleMockLogin(2, "Developer Partner")} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow transition-all active:scale-95 cursor-pointer">Login as Partner (User 2)</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#dadbd3] flex items-center justify-center p-0 md:p-5 font-sans">
      <div className="w-full h-full max-w-[1600px] md:h-[95vh] bg-[#f0f2f5] shadow-2xl rounded-none md:rounded-lg flex overflow-hidden">
        <Sidebar />
        <div className="hidden md:flex flex-1 flex-col bg-[#efeae2] relative">
          {activeChat ? (
            <ChatWindow />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
              <div className="max-w-md flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200/60 rounded-full flex items-center justify-center mb-6 text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-gray-700 mb-2">WhatsApp Web Async Engine</h2>
                <p className="text-gray-400 text-sm leading-relaxed">Select an available user endpoint from the contact matrix to establish a live virtual thread WebSocket session.</p>
                <div className="mt-8 border-t border-gray-200/60 pt-4 w-full text-xs text-gray-400">⚙️ Node 22 + pnpm Cluster Architecture v11.8</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;