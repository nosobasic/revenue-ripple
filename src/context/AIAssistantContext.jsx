import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AIAssistantContext = createContext();

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};

export const AIAssistantProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Global AI assistant state
  const [isOpen, setIsOpen] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [lastInteraction, setLastInteraction] = useState(0);
  const [userPreferences, setUserPreferences] = useState({
    showHelpBubbles: true,
    helpFrequency: 'normal', // 'low', 'normal', 'high'
    preferredTopics: []
  });
  
  // Analytics and smart suggestions
  const [pageVisitTime, setPageVisitTime] = useState(0);
  const [strugglingIndicators, setStrugglingIndicators] = useState({
    timeOnPage: 0,
    scrollPattern: 'normal',
    returnVisits: 0
  });
  
  // Deep dive insight context
  const [pendingInsightContext, setPendingInsightContext] = useState(null);

  // Initialize message history with welcome message
  useEffect(() => {
    if (messageHistory.length === 0) {
      setMessageHistory([{
        id: 1,
        from: 'ai',
        text: "👋 Hi! I'm Ripple, your AI Marketing Assistant. Ask me anything about Revenue Ripple or internet marketing!",
        timestamp: new Date()
      }]);
    }
  }, [messageHistory.length]);

  // Track page visit time for smart suggestions
  useEffect(() => {
    const startTime = Date.now();
    setPageVisitTime(startTime);

    return () => {
      const endTime = Date.now();
      const timeSpent = endTime - startTime;
      
      // Update struggling indicators based on time spent
      if (timeSpent > 180000) { // More than 3 minutes
        setStrugglingIndicators(prev => ({
          ...prev,
          timeOnPage: timeSpent
        }));
      }
    };
  }, [location.pathname]);

  // Smart help suggestions based on user behavior
  const shouldOfferHelp = () => {
    const now = Date.now();
    const timeSinceLastInteraction = now - lastInteraction;
    const minimumInterval = userPreferences.helpFrequency === 'high' ? 20000 : 
                           userPreferences.helpFrequency === 'low' ? 60000 : 30000;

    if (!userPreferences.showHelpBubbles) return false;
    if (timeSinceLastInteraction < minimumInterval) return false;
    if (isOpen) return false;

    // Offer help on specific pages
    const helpfulPages = ['/courses/', '/training/', '/affiliate', '/dashboard'];
    const isHelpfulPage = helpfulPages.some(page => location.pathname.includes(page));
    
    return isHelpfulPage;
  };

  // Get contextual suggestions based on current page
  const getContextualSuggestions = () => {
    const path = location.pathname;
    
    if (path.includes('/courses/')) {
      return [
        "What's the best way to implement what I'm learning?",
        "Can you explain this concept in simpler terms?",
        "How does this relate to my marketing goals?"
      ];
    }
    
    if (path.includes('/affiliate')) {
      return [
        "What are the most effective promotion strategies?",
        "How can I increase my commission earnings?",
        "What content should I create for my audience?"
      ];
    }
    
    if (path.includes('/training/')) {
      return [
        "Can you help me understand this strategy better?",
        "What are the key takeaways from this guide?",
        "How can I apply this to my business?"
      ];
    }
    
    return [
      "What can you help me with today?",
      "I have a marketing question",
      "Tell me about Revenue Ripple features"
    ];
  };

  // Add message to history
  const addMessage = (message) => {
    setMessageHistory(prev => [...prev, {
      ...message,
      id: Date.now(),
      timestamp: new Date()
    }]);
    setLastInteraction(Date.now());
  };

  // Open chat with contextual message
  const openWithContext = (contextMessage) => {
    setIsOpen(true);
    if (contextMessage) {
      addMessage({
        from: 'ai',
        text: contextMessage
      });
    }
  };

  // Format insight context message for AI
  const formatInsightContext = (briefing) => {
    if (!briefing) return null;
    
    const tagsText = briefing.tags && briefing.tags.length > 0 
      ? `\n\nRelated topics: ${briefing.tags.join(', ')}` 
      : '';
    
    const contentSummary = briefing.short_description 
      ? briefing.short_description.substring(0, 300) + (briefing.short_description.length > 300 ? '...' : '')
      : briefing.full_body 
        ? briefing.full_body.substring(0, 300) + (briefing.full_body.length > 300 ? '...' : '')
        : '';
    
    let message = `I see you'd like to dive deeper into "${briefing.title}". Let me provide you with a more detailed analysis.\n\n`;
    
    if (contentSummary) {
      message += `Here's what this insight covers:\n${contentSummary}\n`;
    }
    
    if (tagsText) {
      message += tagsText;
    }
    
    message += `\n\nWhat specific aspects would you like me to explore further? I can provide deeper analysis, actionable strategies, real-world examples, or answer any questions you have about this topic.`;
    
    return message;
  };

  // Open chat with insight/briefing context
  const openWithInsight = (briefing) => {
    if (!briefing) return;
    
    const contextMessage = formatInsightContext(briefing);
    setPendingInsightContext({
      briefing,
      contextMessage
    });
    setIsOpen(true);
  };

  // Update user preferences
  const updatePreferences = (newPreferences) => {
    setUserPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
    
    // Store in localStorage for persistence
    localStorage.setItem('ripple-ai-preferences', JSON.stringify({
      ...userPreferences,
      ...newPreferences
    }));
  };

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ripple-ai-preferences');
    if (stored) {
      try {
        const preferences = JSON.parse(stored);
        setUserPreferences(prev => ({ ...prev, ...preferences }));
      } catch (error) {
        console.warn('Failed to parse AI assistant preferences:', error);
      }
    }
  }, []);

  // Smart notification system
  const getSmartSuggestion = () => {
    const path = location.pathname;
    const timeOnCurrentPage = Date.now() - pageVisitTime;
    
    // Time-based suggestions
    if (timeOnCurrentPage > 120000 && path.includes('/courses/')) { // 2 minutes on course
      return "I notice you've been on this course for a while. Need help understanding any concepts?";
    }
    
    if (timeOnCurrentPage > 180000 && path.includes('/training/')) { // 3 minutes on training
      return "Working through this training material? I can help clarify strategies or answer questions!";
    }
    
    // Page-specific suggestions
    if (path.includes('/affiliate-centre') && timeOnCurrentPage > 60000) {
      return "Managing your affiliate activities? I can help with promotion strategies and best practices!";
    }
    
    return null;
  };

  const value = {
    // State
    isOpen,
    setIsOpen,
    messageHistory,
    setMessageHistory,
    userPreferences,
    strugglingIndicators,
    pendingInsightContext,
    setPendingInsightContext,
    
    // Methods
    addMessage,
    openWithContext,
    openWithInsight,
    updatePreferences,
    shouldOfferHelp,
    getContextualSuggestions,
    getSmartSuggestion,
    
    // Analytics
    pageVisitTime,
    lastInteraction
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};