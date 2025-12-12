import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useAIAssistant } from '../context/AIAssistantContext';
import { getApiBase } from '../config/constants';

export default function AIAssistantWidget({ showWelcomeBubble = false, pageContext = '' }) {
  const { user } = useAuth();
  const location = useLocation();
  const { 
    isOpen: contextIsOpen, 
    setIsOpen: setContextIsOpen,
    pendingInsightContext,
    setPendingInsightContext
  } = useAIAssistant();
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
  const [isMobile, setIsMobile] = useState(false);
  const [apiUnreachable, setApiUnreachable] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const helpBubbleTimer = useRef(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Sync local open state with context
  useEffect(() => {
    setOpen(contextIsOpen);
  }, [contextIsOpen]);

  // Update context when local open state changes
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    setContextIsOpen(newOpen);
  };

  // Handle pending insight context
  useEffect(() => {
    if (pendingInsightContext && open) {
      // Add the AI message with insight context
      const insightMessage = {
        id: Date.now(),
        from: 'ai',
        text: pendingInsightContext.contextMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => {
        // Check if we already added this insight message (avoid duplicates)
        const hasInsightMessage = prev.some(msg => 
          msg.text && msg.text.includes(pendingInsightContext.briefing.title) && 
          msg.from === 'ai' &&
          Date.now() - new Date(msg.timestamp).getTime() < 5000 // Within last 5 seconds
        );
        
        if (hasInsightMessage) {
          return prev;
        }
        
        return [...prev, insightMessage];
      });
      
      // Clear the pending context
      setPendingInsightContext(null);
    }
  }, [pendingInsightContext, open, setPendingInsightContext]);

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
      const response = await fetch(`${getApiBase()}/api/ai-assistant`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      setApiUnreachable(false);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        from: 'ai',
        text: data.reply || "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      let errorText = "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment, or contact support if the issue persists.";
      
      // Provide more specific error messages based on the error type
      if (error.message.includes('403')) {
        errorText = "I'm not authorized to help you right now. Please make sure you're logged in with the correct permissions.";
      } else if (error.message.includes('404')) {
        errorText = "The AI service is currently unavailable. Please try again later or contact support.";
      } else if (error.message.includes('503')) {
        errorText = "The AI service is temporarily unavailable. Please try again in a few moments.";
      } else if (error.message.includes('OpenAI API key not configured')) {
        errorText = "The AI service is not properly configured. Please contact support.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        from: 'ai',
        text: errorText,
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
    handleOpenChange(true);
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

  // Mobile-specific styles
  const getChatPanelStyles = () => {
    if (isMobile) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        backgroundColor: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s ease-in-out'
      };
    }
    
    return {
      position: 'fixed',
      right: 0,
      top: '50%',
      transform: open ? 'translateY(-50%)' : 'translate(100%, -50%)',
      width: '380px',
      height: '500px',
      backgroundColor: 'white',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      borderLeft: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      transition: 'all 0.3s ease-in-out'
    };
  };

  const getTriggerButtonStyles = () => {
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 30,
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        cursor: 'pointer',
        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease-in-out',
        transform: open ? 'scale(0.8)' : 'scale(1)'
      };
    }
    
    return {
      position: 'fixed',
      right: open ? '380px' : '0',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 30,
      transition: 'all 0.3s ease-in-out',
      background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
      border: 'none',
      borderRadius: '8px 0 0 8px',
      padding: '16px 12px',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    };
  };

  const getHelpBubbleStyles = () => {
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        left: '20px',
        zIndex: 40,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '20px',
        maxWidth: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        opacity: 1
      };
    }
    
    return {
      position: 'fixed',
      right: '50px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 40,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '16px',
      maxWidth: '280px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      opacity: 1
    };
  };

  return (
    <>
      {apiUnreachable && (
        <div style={{ position: 'fixed', bottom: '96px', right: '24px', background: '#FEF3C7', color: '#92400E', padding: '8px 12px', border: '1px solid #FDE68A', borderRadius: '6px', zIndex: 50 }}>
          Ripple is having trouble connecting to the API. <button onClick={sendMessage} style={{ textDecoration: 'underline' }}>Retry</button>
        </div>
      )}
      {/* Main Chat Panel */}
      <div style={getChatPanelStyles()}>
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between"
          style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '20px' : '16px',
            minHeight: isMobile ? '80px' : 'auto'
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="/assets/icons/revenue_ripple_icon_transparent.png" 
                alt="Ripple AI" 
                style={{ 
                  width: isMobile ? '40px' : '32px', 
                  height: isMobile ? '40px' : '32px', 
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
                  width: isMobile ? '16px' : '12px', 
                  height: isMobile ? '16px' : '12px' 
                }}
              ></div>
            </div>
            <div>
              <h3 
                className="text-white font-semibold"
                style={{ 
                  color: 'white', 
                  fontWeight: '600', 
                  fontSize: isMobile ? '20px' : '16px',
                  margin: 0
                }}
              >
                Ripple Assistant
              </h3>
              <p 
                className="text-blue-100"
                style={{ 
                  color: '#dbeafe', 
                  fontSize: isMobile ? '14px' : '12px',
                  margin: 0
                }}
              >
                AI Marketing Help
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenChange(false)}
            className="text-white hover:text-blue-200 transition-colors"
            style={{ 
              color: 'white',
              fontSize: isMobile ? '32px' : '24px',
              lineHeight: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: isMobile ? '8px' : '0',
              borderRadius: isMobile ? '50%' : '0',
              width: isMobile ? '48px' : 'auto',
              height: isMobile ? '48px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
            padding: isMobile ? '20px' : '16px',
            scrollbarWidth: 'thin',
            // Ensure messages are visible above keyboard
            maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto',
            minHeight: isMobile ? '200px' : 'auto'
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
                  maxWidth: isMobile ? '90%' : '85%',
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
                      style={{ width: isMobile ? '20px' : '16px', height: isMobile ? '20px' : '16px' }}
                    />
                    <span 
                      className="text-xs text-gray-500 font-medium"
                      style={{ 
                        fontSize: isMobile ? '14px' : '12px',
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
                    padding: isMobile ? '16px 20px' : '12px 16px',
                    fontSize: isMobile ? '16px' : '14px',
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
                    fontSize: isMobile ? '14px' : '12px',
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
                  style={{ width: isMobile ? '20px' : '16px', height: isMobile ? '20px' : '16px' }}
                />
                <div 
                  className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200"
                  style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '16px',
                    padding: isMobile ? '16px 20px' : '12px 16px',
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
                        width: isMobile ? '10px' : '8px',
                        height: isMobile ? '10px' : '8px',
                        backgroundColor: '#9ca3af',
                        borderRadius: '50%',
                        animation: 'bounce 1s infinite'
                      }}
                    ></div>
                    <div 
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{
                        width: isMobile ? '10px' : '8px',
                        height: isMobile ? '10px' : '8px',
                        backgroundColor: '#9ca3af',
                        borderRadius: '50%',
                        animation: 'bounce 1s infinite 0.1s'
                      }}
                    ></div>
                    <div 
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{
                        width: isMobile ? '10px' : '8px',
                        height: isMobile ? '10px' : '8px',
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
          className="border-t border-gray-200"
          style={{
            borderTop: '1px solid #e5e7eb',
            padding: isMobile ? '20px' : '16px'
          }}
        >
          <div 
            className="flex space-x-3"
            style={{ display: 'flex', gap: isMobile ? '16px' : '12px' }}
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
                borderRadius: '12px',
                padding: isMobile ? '16px 20px' : '8px 12px',
                fontSize: isMobile ? '16px' : '14px',
                outline: 'none',
                minHeight: isMobile ? '56px' : '36px',
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
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                color: 'white',
                borderRadius: '12px',
                padding: isMobile ? '16px 20px' : '8px 16px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                opacity: (loading || !input.trim()) ? 0.5 : 1,
                pointerEvents: (loading || !input.trim()) ? 'none' : 'auto',
                minWidth: isMobile ? '56px' : 'auto',
                minHeight: isMobile ? '56px' : 'auto'
              }}
            >
              {loading ? (
                <div 
                  className="border-2 border-white border-t-transparent rounded-full animate-spin"
                  style={{
                    width: isMobile ? '20px' : '16px',
                    height: isMobile ? '20px' : '16px',
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
                    width: isMobile ? '24px' : '20px',
                    height: isMobile ? '24px' : '20px',
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
              fontSize: isMobile ? '14px' : '12px',
              color: '#9ca3af',
              marginTop: '8px',
              textAlign: 'center'
            }}
          >
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Tab Trigger Button */}
      <button
        onClick={() => handleOpenChange(!open)}
        aria-label="Toggle AI Assistant"
        style={getTriggerButtonStyles()}
      >
        {isMobile ? (
          <>
            <img 
              src="/assets/icons/revenue_ripple_icon_transparent.png" 
              alt="Ripple AI" 
              style={{ 
                width: '28px', 
                height: '28px',
                filter: 'brightness(0) invert(1)'
              }}
            />
            {!open && (
              <div 
                className="bg-green-500 border-2 border-white rounded-full animate-pulse"
                style={{ 
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '12px', 
                  height: '12px',
                  animation: 'pulse 2s infinite'
                }}
              ></div>
            )}
          </>
        ) : (
          <>
            <img 
              src="/assets/icons/revenue_ripple_icon_transparent.png" 
              alt="Ripple AI" 
              style={{ 
                width: '24px', 
                height: '24px',
                filter: 'brightness(0) invert(1)'
              }}
            />
            <span 
              className="text-white text-xs font-medium"
              style={{
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)'
              }}
            >
              AI Help
            </span>
            {!open && (
              <div 
                className="bg-green-500 border-2 border-white rounded-full animate-pulse"
                style={{ 
                  width: '8px', 
                  height: '8px',
                  animation: 'pulse 2s infinite'
                }}
              ></div>
            )}
          </>
        )}
      </button>

      {/* Contextual Thought Bubble */}
      {showHelpBubble && !open && (
        <div 
          onClick={openChatWithContext}
          style={getHelpBubbleStyles()}
        >
          {!isMobile && (
            <>
              {/* Thought bubble tail for desktop */}
              <div 
                style={{
                  position: 'absolute',
                  right: '-8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderLeft: '8px solid #e5e7eb',
                  zIndex: 1
                }}
              ></div>
              <div 
                style={{
                  position: 'absolute',
                  right: '-7px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderLeft: '8px solid white',
                  zIndex: 2
                }}
              ></div>
            </>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/assets/icons/revenue_ripple_icon_transparent.png" 
                alt="Ripple" 
                style={{ width: isMobile ? '24px' : '20px', height: isMobile ? '24px' : '20px' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p 
                className="text-sm text-gray-700 font-medium"
                style={{
                  fontSize: isMobile ? '16px' : '14px',
                  color: '#374151',
                  fontWeight: '500',
                  margin: 0,
                  lineHeight: '1.4'
                }}
              >
                {getContextualWelcome()}
              </p>
              <button 
                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2"
                style={{
                  fontSize: isMobile ? '14px' : '12px',
                  color: '#2563eb',
                  fontWeight: '500',
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Chat with Ripple →
              </button>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowHelpBubble(false);
              }}
              className="text-gray-400 hover:text-gray-600 leading-none"
              style={{
                color: '#9ca3af',
                fontSize: isMobile ? '24px' : '18px',
                lineHeight: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: isMobile ? '8px' : '0',
                marginLeft: '8px',
                borderRadius: isMobile ? '50%' : '0',
                width: isMobile ? '40px' : 'auto',
                height: isMobile ? '40px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          /* Ensure touch targets are accessible */
          button {
            min-height: 48px;
          }
          
          /* Improve readability on small screens */
          textarea {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </>
  );
} 