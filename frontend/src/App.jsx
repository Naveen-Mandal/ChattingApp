import React, { useState } from 'react';
import { useChatStore } from './store/chatStore';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import apiClient from './api/apiClient';

function App() {
  const { currentUser, setCurrentUser, activeChat } = useChatStore();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Activates the asynchronous bi-directional message consumer pipeline internally 
  useWebSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Authenticate via JWT endpoint
        const res = await apiClient.post('/auth/login', { email, password });
        const { token, id, publicId, username: dbUsername, email: dbEmail } = res.data;
        
        localStorage.setItem('whatsapp_token', token);
        setCurrentUser({
          id,
          name: dbUsername,
          publicId,
          email: dbEmail
        });
        console.log("Session authenticated successfully:", dbUsername);
      } else {
        // Register new user via backend
        const fallbackPic = profilePic || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;
        const res = await apiClient.post('/auth/register', {
          username,
          email,
          password,
          profilePicURL: fallbackPic
        });
        const { token, id, publicId, username: dbUsername, email: dbEmail } = res.data;
        
        localStorage.setItem('whatsapp_token', token);
        setCurrentUser({
          id,
          name: dbUsername,
          publicId,
          email: dbEmail
        });
        console.log("Account created and session synchronized:", dbUsername);
      }
    } catch (err) {
      console.error("Auth error:", err);
      let errMsg = err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Authentication failed. Please verify credentials.';
      if (typeof errMsg === 'object') {
        errMsg = Object.entries(errMsg)
          .map(([key, val]) => `${val}`)
          .join(', ');
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100/50">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6">
            {isLogin ? 'Sign in to start chatting' : 'Register to connect and chat in real-time'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-lg border border-red-100 mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Naveen Mandal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-800"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-800"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Profile Pic URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/pic.png"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-800"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer mt-6 flex justify-center items-center h-11"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-emerald-600 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
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
                <h2 className="text-2xl font-light text-gray-700 mb-2">WhatsApp Web</h2>
                <p className="text-gray-400 text-sm leading-relaxed">Select a contact from the sidebar to start a conversation.</p>
                <div className="mt-8 border-t border-gray-200/60 pt-4 w-full text-xs text-gray-400">🔒 End-to-end encrypted</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;