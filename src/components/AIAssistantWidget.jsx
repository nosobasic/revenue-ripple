import { authenticatedFetch } from '../lib/authenticatedFetch';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useAIAssistant } from '../context/AIAssistantContext';
import { getApiBase } from '../config/constants';
import { trackAIIteraction } from '../services/engagementTracking';
import CoachDialog from './CoachDialog';
import styles from './CoachDialog.module.css';
import { X } from 'lucide-react';

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
      text: "👋 Hi! I'm Ripple, your AI Marketing Assistant. I'm here to guide you through your learning journey, help you set and achieve goals, and answer any questions!", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const [showProactiveSuggestion, setShowProactiveSuggestion] = useState(false);
  const [proactiveSuggestion, setProactiveSuggestion] = useState(null);
  const [lastHelpOffer, setLastHelpOffer] = useState(0);
  const [activeBriefingContext, setActiveBriefingContext] = useState(null);
  const inputRef = useRef(null);
  const helpBubbleTimer = useRef(null);
  const suggestionTimer = useRef(null);

  // Sync local open state with context
  useEffect(() => {
    setOpen(contextIsOpen);
  }, [contextIsOpen]);

  // Update context when local open state changes
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    setContextIsOpen(newOpen);
    // Clear briefing context when chat is closed
    if (!newOpen) {
      setActiveBriefingContext(null);
    }
  };

  // Handle pending insight context
  useEffect(() => {
    if (pendingInsightContext && open) {
      // Store the active briefing context for future messages
      setActiveBriefingContext(pendingInsightContext.briefing);
      
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

  // Fetch proactive suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user || open) return;
      
      try {
        const response = await authenticatedFetch(`${getApiBase()}/api/ai-assistant/suggestions`, {
          headers: {
            'x-user-id': user.id,
            'x-user-role': user.role || 'member'
          }
        });
        
        if (response.ok) {
          const { suggestions } = await response.json();
          if (suggestions && suggestions.length > 0) {
            const highPriority = suggestions.find(s => s.priority === 'high');
            if (highPriority) {
              setProactiveSuggestion(highPriority);
              setShowProactiveSuggestion(true);
              setTimeout(() => setShowProactiveSuggestion(false), 12000); // Hide after 12 seconds
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };

    suggestionTimer.current = setTimeout(fetchSuggestions, 10000);
    
    return () => {
      if (suggestionTimer.current) {
        clearTimeout(suggestionTimer.current);
      }
    };
  }, [user, open, location.pathname]);

  // Periodic help offers based on page context and user activity
  useEffect(() => {
    if (!user) return;
    const userRole = user.role || 'member';
    if (!allowedRoles.includes(userRole)) return;

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

    if (shouldShowHelp && !showProactiveSuggestion) {
      helpBubbleTimer.current = setTimeout(offerHelp, 15000); // 15 seconds delay
    }

    return () => {
      if (helpBubbleTimer.current) {
        clearTimeout(helpBubbleTimer.current);
      }
    };
  }, [location.pathname, lastHelpOffer, user, showWelcomeBubble, showProactiveSuggestion]);

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

  if (!user) return null;
  const userRole = user.role || 'member';
  if (!allowedRoles.includes(userRole)) return null;

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
    
    // Track AI interaction
    if (user) {
      trackAIIteraction(user.id, 'message_sent', {
        page: location.pathname,
        has_briefing_context: !!activeBriefingContext,
      });
    }
    
    // Add contextual information to the message
    const contextualMessage = pageContext ? 
      `Page context: ${pageContext}. User message: ${userMessage.text}` : 
      userMessage.text;

    try {
      // Include briefing context if available
      const briefingContext = activeBriefingContext ? {
        title: activeBriefingContext.title,
        short_description: activeBriefingContext.short_description,
        full_body: activeBriefingContext.full_body,
        tags: activeBriefingContext.tags
      } : null;

      const response = await authenticatedFetch(`${getApiBase()}/api/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-id': user.id
        },
        body: JSON.stringify({ 
          message: contextualMessage,
          previousMessages: messages.slice(-6),
          context: {
            page: location.pathname,
            learningContext: pageContext,
            userRole: userRole,
            previousMessages: messages.slice(-3), // Send last 3 messages for context
            briefing: briefingContext // Include active briefing context
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
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

  return (
    <>
      <CoachDialog
        open={open} onOpenChange={handleOpenChange}
        messages={messages} input={input} onInputChange={setInput}
        onSend={sendMessage} busy={loading} inputRef={inputRef} showLauncher
      />
      {showProactiveSuggestion && proactiveSuggestion && !open && (
        <aside className={styles.prompt}>
          <button className={styles.promptAction} onClick={() => {
            if (proactiveSuggestion.action?.type === 'navigate') {
              window.location.href = proactiveSuggestion.action.path;
            }
            setShowProactiveSuggestion(false);
          }}>
            <strong>{proactiveSuggestion.title}</strong>
            <span>{proactiveSuggestion.message}</span>
          </button>
          <button className={styles.dismiss} aria-label="Dismiss suggestion" onClick={() => setShowProactiveSuggestion(false)}><X size={18} /></button>
        </aside>
      )}
      {showHelpBubble && !open && !showProactiveSuggestion && (
        <aside className={styles.prompt}>
          <button className={styles.promptAction} onClick={openChatWithContext}>
            <strong>Need a hand?</strong>
            <span>{getContextualWelcome()}</span>
          </button>
          <button className={styles.dismiss} aria-label="Dismiss help" onClick={() => setShowHelpBubble(false)}><X size={18} /></button>
        </aside>
      )}
    </>
  );
}
