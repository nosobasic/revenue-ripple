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
                style={{ width: '20px', height: '20px' }}
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
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}
      >
        <div className="relative">
          <div 
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl"
            style={{ width: '48px', height: '48px' }}
          >
            <img 
              src="/assets/icons/revenue_ripple_icon_transparent.png" 
              alt="Ripple AI" 
              style={{ width: '24px', height: '24px' }}
            />
          </div>
          {!open && (
            <div 
              className="absolute bg-green-500 border-2 border-white rounded-full animate-pulse"
              style={{ 
                top: '-4px', 
                right: '-4px', 
                width: '12px', 
                height: '12px' 
              }}
            ></div>
          )}
        </div>
      </button>

      {/* Chat Interface */}
      {open && (
        <div 
          className="fixed bottom-20 right-6 z-50 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden transform transition-all duration-200"
          style={{ 
            width: '320px', 
            height: '448px', 
            bottom: '80px', 
            right: '24px', 
            zIndex: 50,
            position: 'fixed',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div 
            className="bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between"
            style={{ 
              padding: '12px 16px',
              background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/assets/icons/revenue_ripple_icon_transparent.png" 
                  alt="Ripple AI" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    padding: '4px'
                  }}
                />
                <div 
                  className="absolute bg-green-500 border-2 border-white rounded-full"
                  style={{ 
                    bottom: '-4px', 
                    right: '-4px', 
                    width: '12px', 
                    height: '12px' 
                  }}
                ></div>
              </div>
              <div>
                <h3 
                  className="text-white font-semibold"
                  style={{ 
                    color: 'white', 
                    fontWeight: '600', 
                    fontSize: '16px',
                    margin: 0
                  }}
                >
                  Ripple
                </h3>
                <p 
                  className="text-blue-100"
                  style={{ 
                    color: '#dbeafe', 
                    fontSize: '12px',
                    margin: 0
                  }}
                >
                  AI Marketing Assistant
                </p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-white hover:text-blue-200 text-2xl leading-none transition-colors"
              style={{ 
                color: 'white',
                fontSize: '24px',
                lineHeight: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto space-y-4"
            style={{ 
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              scrollbarWidth: 'thin'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ 
                  display: 'flex',
                  justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  className={`max-w-[85%] ${message.from === 'user' ? 'order-2' : 'order-1'}`}
                  style={{ 
                    maxWidth: '85%',
                    order: message.from === 'user' ? 2 : 1
                  }}
                >
                  {message.from === 'ai' && (
                    <div 
                      className="flex items-center space-x-2 mb-1"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}
                    >
                      <img 
                        src="/assets/icons/revenue_ripple_icon_transparent.png" 
                        alt="Ripple" 
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span 
                        className="text-xs text-gray-500 font-medium"
                        style={{ 
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}
                      >
                        Ripple
                      </span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.from === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                    style={{
                      borderRadius: '16px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      background: message.from === 'user' 
                        ? 'linear-gradient(to right, #2563eb, #1d4ed8)' 
                        : '#f3f4f6',
                      color: message.from === 'user' ? 'white' : '#1f2937',
                      border: message.from === 'user' ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    {message.text}
                  </div>
                  <div 
                    className={`text-xs text-gray-400 mt-1 ${
                      message.from === 'user' ? 'text-right' : 'text-left'
                    }`}
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginTop: '4px',
                      textAlign: message.from === 'user' ? 'right' : 'left'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div 
                className="flex justify-start"
                style={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <div 
                  className="flex items-center space-x-2"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <img 
                    src="/assets/icons/revenue_ripple_icon_transparent.png" 
                    alt="Ripple" 
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div 
                    className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200"
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div 
                      className="flex space-x-1"
                      style={{ display: 'flex', gap: '4px' }}
                    >
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#9ca3af',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite'
                        }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#9ca3af',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite 0.1s'
                        }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#9ca3af',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite 0.2s'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="border-t border-gray-200 p-3"
            style={{
              borderTop: '1px solid #e5e7eb',
              padding: '12px'
            }}
          >
            <div 
              className="flex space-x-3"
              style={{ display: 'flex', gap: '12px' }}
            >
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
                  flex: 1,
                  resize: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  minHeight: '36px',
                  maxHeight: '100px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
                style={{
                  flexShrink: 0,
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: (loading || !input.trim()) ? 0.5 : 1,
                  pointerEvents: (loading || !input.trim()) ? 'none' : 'auto'
                }}
              >
                {loading ? (
                  <div 
                    className="border-2 border-white border-t-transparent rounded-full animate-spin"
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  ></div>
                ) : (
                  <svg 
                    className="transition-transform group-hover:translate-x-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{
                      width: '20px',
                      height: '20px',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p 
              className="text-xs text-gray-400 mt-1 text-center"
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginTop: '4px',
                textAlign: 'center'
              }}
            >
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
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
} 