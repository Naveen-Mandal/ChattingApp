import React from 'react';
import { useChatStore } from './store/chatStore';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';

function App() {
  const { currentUser, setCurrentUser, activeChat } = useChatStore();

  // Activates the asynchronous bi-directional message consumer pipeline internally 
  useWebSocket();

  const handleMockLogin = (id, name) => {
    setCurrentUser({ id: id, name: name, publicId: id.toString() });
  };

  if (!currentUser) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.321 5.325 0 11.834 0 15.001 0 17.93 1.207 20.143 3.423 22.356 5.64 24 8.57 24 11.892c-.003 6.512-5.325 11.833-11.832 11.833-2.001-.001-3.967-.51-5.711-1.48L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.713.002-2.588-1.008-5.023-2.844-6.853C16.657 4.21 14.243 3.195 11.83 3.195c-5.439 0-9.863 4.372-9.867 9.715-.001 1.734.456 3.426 1.323 4.927l-.403 1.472 1.513-.393z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp Async Mesh</h1>
          <p className="text-gray-500 text-sm mb-8">Select a profile context to boot the real-time decoupled application runtime environment.</p>
          <div className="space-y-3">
            <button onClick={() => handleMockLogin(1, "Naveen Mandal")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition-all">Login as Naveen (User 1)</button>
            <button onClick={() => handleMockLogin(2, "Developer Partner")} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow transition-all">Login as Partner (User 2)</button>
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
            // FIXED: Swapped static layout with the real-time connected core ChatWindow component
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