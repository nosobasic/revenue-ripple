import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AIAssistantWidget() {
  const { user } = useAuth();
  const allowedRoles = ['member', 'affiliate', 'reseller', 'admin'];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: "👋 Hi! I'm Ripple, your AI Marketing Assistant. Ask me anything about Revenue Ripple or internet marketing!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !allowedRoles.includes(user.role)) return null;

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setLoading(true);
    try {
      const res = await fetch('https://revenue-ripple.onrender.com/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role
        },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { from: 'ai', text: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(msgs => [...msgs, { from: 'ai', text: "Sorry, there was a problem connecting to the AI." }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div>
      <button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 text-white rounded-full p-4 shadow-lg hover:from-blue-800 hover:to-blue-700 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Assistant"
        style={{ boxShadow: '0 4px 24px 0 rgba(30, 58, 138, 0.25)' }}
      >
        💬
      </button>
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-xl shadow-2xl flex flex-col border border-blue-900"
          style={{ background: 'white', boxShadow: '0 8px 32px 0 rgba(30, 58, 138, 0.25)' }}
        >
          <div
            className="p-4 border-b font-bold flex items-center"
            style={{
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
              color: 'white',
              borderTopLeftRadius: '0.75rem',
              borderTopRightRadius: '0.75rem',
            }}
          >
            <img src="/assets/icons/revenue_ripple_no_bg.png" alt="Ripple AI" style={{ width: 32, marginRight: 8 }} />
            Ripple AI Assistant
            <button className="ml-auto text-white text-2xl leading-none" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 300 }}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === 'user' ? 'text-right mb-2' : 'text-left mb-2'}>
                <span className={msg.from === 'user'
                  ? 'inline-block bg-blue-100 text-blue-900 px-2 py-1 rounded-lg'
                  : 'inline-block bg-gray-100 text-gray-900 px-2 py-1 rounded-lg'}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-gray-400">Ripple is thinking...</div>}
          </div>
          <div className="p-2 border-t flex bg-gray-50 rounded-b-xl">
            <input
              className="flex-1 border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              disabled={loading}
              style={{ color: '#1e3a8a', background: '#f8fafc' }}
            />
            <button
              className="ml-2 px-4 py-1 rounded-lg font-semibold text-white"
              style={{ background: 'linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)', boxShadow: '0 2px 8px 0 rgba(30, 58, 138, 0.10)' }}
              onClick={sendMessage}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 