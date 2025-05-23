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
      const res = await fetch('/api/ai-assistant', {
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
        className="fixed bottom-6 right-6 z-50 bg-blue-700 text-white rounded-full p-4 shadow-lg hover:bg-blue-800 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Assistant"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-lg shadow-lg flex flex-col border border-blue-700">
          <div className="p-4 border-b font-bold bg-blue-700 text-white flex items-center">
            <img src="/assets/icons/revenue_ripple_no_bg.png" alt="Ripple AI" style={{ width: 32, marginRight: 8 }} />
            Ripple AI Assistant
            <button className="ml-auto text-white" onClick={() => setOpen(false)}>&times;</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 300 }}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === 'user' ? 'text-right mb-2' : 'text-left mb-2'}>
                <span className={msg.from === 'user'
                  ? 'inline-block bg-blue-100 px-2 py-1 rounded'
                  : 'inline-block bg-gray-100 px-2 py-1 rounded'}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-gray-400">Ripple is thinking...</div>}
          </div>
          <div className="p-2 border-t flex bg-gray-50">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button className="ml-2 bg-blue-700 text-white px-3 py-1 rounded" onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 