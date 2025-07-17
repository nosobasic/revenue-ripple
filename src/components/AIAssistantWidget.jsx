import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function AIAssistantWidget({ showWelcomeBubble = false, pageContext = '' }) {
  const { user } = useAuth();
  const location = useLocation();
  const allowedRoles = ['member', 'affiliate', 'reseller', 'admin'];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      from: 'ai', 
      text: "👋 Hi! I'm Ripple, your AI Marketing Assistant. Ask me anything about Revenue Ripple or internet marketing!", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const [lastHelpOffer, setLastHelpOffer] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const helpBubbleTimer = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Periodic help offers based on page context and user activity
  useEffect(() => {
    if (!user || !allowedRoles.includes(user.role)) return;

    const offerHelp = () => {
      const now = Date.now();
      if (now - lastHelpOffer < 30000) return; // Don't show more than once per 30 seconds
      
      setShowHelpBubble(true);
      setLastHelpOffer(now);
      
      // Auto-hide after 8 seconds
      setTimeout(() => setShowHelpBubble(false), 8000);
    };

    // Show help bubble on certain pages after a delay
    const shouldShowHelp = location.pathname.includes('/courses/') || 
                          location.pathname.includes('/training/') ||
                          location.pathname.includes('/affiliate') ||
                          showWelcomeBubble;

    if (shouldShowHelp) {
      helpBubbleTimer.current = setTimeout(offerHelp, 15000); // 15 seconds delay
    }

    return () => {
      if (helpBubbleTimer.current) {
        clearTimeout(helpBubbleTimer.current);
      }
    };
  }, [location.pathname, lastHelpOffer, user, showWelcomeBubble]);

  // Generate contextual help messages based on current page
  const getContextualWelcome = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/courses/')) {
      return "I see you're exploring our courses! Need help understanding any concepts or have questions about the content?";
    }
    if (path.includes('/training/')) {
      return "Working through our training materials? I'm here to help clarify any strategies or answer questions!";
    }
    if (path.includes('/affiliate')) {
      return "Managing your affiliate activities? I can help with promotion strategies, commission questions, or best practices!";
    }
    if (path.includes('/dashboard')) {
      return "Welcome to your dashboard! Need help navigating or understanding any features?";
    }
    return "Hi there! I'm here to help with any questions you might have. What can I assist you with today?";
  }, [location.pathname]);

  if (!user || !allowedRoles.includes(user.role)) return null;

  // Enhanced streaming message handler with better error handling
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = {
      id: Date.now(),
      from: 'user',
      text: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);
    
    // Add contextual information to the message
    const contextualMessage = pageContext ? 
      `Page context: ${pageContext}. User message: ${userMessage.text}` : 
      userMessage.text;

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role
        },
        body: JSON.stringify({ 
          message: contextualMessage,
          context: {
            page: location.pathname,
            userRole: user.role,
            previousMessages: messages.slice(-3) // Send last 3 messages for context
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        from: 'ai',
        text: data.reply || "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        from: 'ai',
        text: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment, or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChatWithContext = () => {
    setOpen(true);
    setShowHelpBubble(false);
    
    // Add contextual welcome message if not recently added
    const lastMessage = messages[messages.length - 1];
    const isRecentAiMessage = lastMessage?.from === 'ai' && 
      Date.now() - lastMessage.timestamp < 60000; // Within last minute
    
    if (!isRecentAiMessage) {
      const contextualMessage = {
        id: Date.now(),
        from: 'ai',
        text: getContextualWelcome(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, contextualMessage]);
    }
  };

  return (
    <>
      {/* Help Bubble */}
      {showHelpBubble && !open && (
        <div 
          className="fixed bottom-16 right-6 z-40 bg-white rounded-lg shadow-lg border border-blue-100 p-3 max-w-xs cursor-pointer transform transition-all duration-300 hover:scale-105"
          onClick={openChatWithContext}
          style={{
            animation: 'slideInFromRight 0.3s ease-out',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)'
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/assets/icons/revenue_ripple_icon_transparent.png" 
                alt="Ripple" 
                className="w-5 h-5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 font-medium">
                {getContextualWelcome()}
              </p>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1">
                Chat with Ripple →
              </button>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowHelpBubble(false);
              }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fixed bottom-6 right-6 z-50 group"
        onClick={() => setOpen(!open)}
        aria-label="Toggle AI Assistant"
      >
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl">
            <img 
              src="/assets/icons/revenue_ripple_icon_transparent.png" 
              alt="Ripple AI" 
              className="w-6 h-6"
            />
          </div>
          {!open && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          )}
        </div>
      </button>

      {/* Chat Interface */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 h-[28rem] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden transform transition-all duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/assets/icons/revenue_ripple_icon_transparent.png" 
                  alt="Ripple AI" 
                  className="w-8 h-8 rounded-full bg-white p-1"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">Ripple</h3>
                <p className="text-blue-100 text-xs">AI Marketing Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-white hover:text-blue-200 text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.from === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.from === 'ai' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <img 
                        src="/assets/icons/revenue_ripple_icon_transparent.png" 
                        alt="Ripple" 
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-gray-500 font-medium">Ripple</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.from === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${
                    message.from === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
                          {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <img 
                      src="/assets/icons/revenue_ripple_icon_transparent.png" 
                      alt="Ripple" 
                      className="w-4 h-4"
                    />
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex space-x-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about marketing..."
                disabled={loading}
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows="1"
                style={{ 
                  minHeight: '36px', 
                  maxHeight: '100px',
                  fontFamily: 'inherit'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-x-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
} 