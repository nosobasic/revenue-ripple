import React, { useEffect, useState } from 'react';
import { FaTrophy, FaRocket, FaStar, FaUserTie, FaTimes } from 'react-icons/fa';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';

const MilestoneCheckIn = () => {
  const [milestone, setMilestone] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  // Milestone configurations
  const milestones = {
    first_course_completed: {
      icon: <FaTrophy className="text-5xl text-yellow-500" />,
      title: "First Course Completed! 🎓",
      message: "You just crossed a major milestone. Most people never finish what they start. You're different.",
      submessage: "This is just the beginning. Keep this momentum going.",
      cta: "What's Next?",
      ctaLink: "/courses",
      color: "from-yellow-400 to-orange-500"
    },
    first_chatbot_interaction: {
      icon: <FaRocket className="text-5xl text-blue-500" />,
      title: "You Just Unlocked AI Power! 🤖",
      message: "You're already using Ripple AI like a pro. Smart move.",
      submessage: "The more you use it, the better your results. Don't hesitate to ask anything.",
      cta: "Keep Learning",
      ctaLink: "/courses",
      color: "from-blue-400 to-purple-500"
    },
    halfway_education: {
      icon: <FaStar className="text-5xl text-purple-500" />,
      title: "You're Halfway There! 🔥",
      message: "50% of the education track completed. You're outpacing 95% of people who start.",
      submessage: "This is where the magic happens. Most people quit here. You won't.",
      cta: "Finish Strong",
      ctaLink: "/courses",
      color: "from-purple-400 to-pink-500"
    },
    need_support_check: {
      icon: <FaUserTie className="text-5xl text-amber-500" />,
      title: "How's It Going? 💬",
      message: "You've been putting in the work. Stuck on anything? Need a second opinion?",
      submessage: "Book a quick call with Donte. Sometimes 15 minutes can save you weeks.",
      cta: "Book a Call",
      ctaLink: "mailto:support@revenueripple.org?subject=Strategy Call Request",
      color: "from-amber-400 to-orange-500"
    }
  };

  useEffect(() => {
    if (!user) return;

    const checkMilestones = async () => {
      // Get unshown milestones
      const { data: unshownMilestones } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', user.id)
        .eq('shown', false)
        .order('achieved_at', { ascending: false })
        .limit(1);

      if (unshownMilestones && unshownMilestones.length > 0) {
        const milestoneData = unshownMilestones[0];
        const milestoneConfig = milestones[milestoneData.milestone_type];
        
        if (milestoneConfig) {
          setMilestone({
            id: milestoneData.id,
            type: milestoneData.milestone_type,
            ...milestoneConfig
          });
          
          // Show after a short delay
          setTimeout(() => {
            setIsVisible(true);
          }, 1000);
        }
      }
    };

    checkMilestones();
    
    // Check periodically for new milestones
    const interval = setInterval(checkMilestones, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const handleClose = async () => {
    if (milestone && milestone.id) {
      // Mark milestone as shown
      await supabase
        .from('user_milestones')
        .update({ 
          shown: true, 
          shown_at: new Date().toISOString() 
        })
        .eq('id', milestone.id);
    }
    
    setIsVisible(false);
    setTimeout(() => setMilestone(null), 300);
  };

  const handleCTA = () => {
    handleClose();
    if (milestone.ctaLink.startsWith('mailto:')) {
      window.open(milestone.ctaLink, '_blank');
    }
  };

  if (!milestone || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9998] animate-slideInRight">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-[90vw] md:w-96 overflow-hidden border-t-4 bg-gradient-to-br ${milestone.color}`}>
        <div className="bg-white p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-24 h-24 flex items-center justify-center">
              {milestone.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-5">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {milestone.title}
            </h3>
            <p className="text-gray-700 font-medium mb-2 leading-relaxed">
              {milestone.message}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {milestone.submessage}
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            {milestone.ctaLink ? (
              milestone.ctaLink.startsWith('mailto:') ? (
                <button
                  onClick={handleCTA}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${milestone.color} text-white rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                >
                  {milestone.cta}
                </button>
              ) : (
                <a
                  href={milestone.ctaLink}
                  onClick={handleClose}
                  className={`block w-full px-6 py-3 bg-gradient-to-r ${milestone.color} text-white rounded-lg font-bold text-center hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                >
                  {milestone.cta}
                </a>
              )
            ) : (
              <button
                onClick={handleClose}
                className={`w-full px-6 py-3 bg-gradient-to-r ${milestone.color} text-white rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all`}
              >
                {milestone.cta}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full px-6 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Donte signature */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              - Donte & the Revenue Ripple team
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

// Helper function to trigger milestones (call this from various parts of the app)
export const triggerMilestone = async (userId, milestoneType, milestoneValue = null) => {
  if (!userId) return;

  try {
    // Check if this milestone already exists
    const { data: existing } = await supabase
      .from('user_milestones')
      .select('id')
      .eq('user_id', userId)
      .eq('milestone_type', milestoneType)
      .single();

    if (!existing) {
      // Insert new milestone
      await supabase
        .from('user_milestones')
        .insert([
          {
            user_id: userId,
            milestone_type: milestoneType,
            milestone_value: milestoneValue,
            shown: false,
          }
        ]);
    }
  } catch (error) {
    console.error('Error triggering milestone:', error);
  }
};

export default MilestoneCheckIn;

