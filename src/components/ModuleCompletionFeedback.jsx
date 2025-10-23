import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight, FaTrophy, FaFire } from 'react-icons/fa';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';

const ModuleCompletionFeedback = ({ 
  courseSlug, 
  moduleId, 
  nextModule, 
  courseTitle,
  onClose 
}) => {
  const [stats, setStats] = useState(null);
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Motivational quotes rotation
  const motivationalQuotes = [
    "You're not alone. We're with you every step of the way.",
    "Most people pause here. Push through. You've got this.",
    "Another milestone down. You're building real momentum.",
    "This is where winners separate from wishers. Keep going.",
    "Small wins compound into massive results. You're doing it.",
    "Every module completed is a skill gained. You're unstoppable.",
    "Doubt kills more dreams than failure ever will. Trust the process.",
    "You're investing in yourself. That's the best investment you'll ever make.",
    "Success isn't linear. You're exactly where you need to be.",
    "The fact that you're here proves you're serious. Keep that energy.",
  ];

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // Get all completed modules for this course
      const { data: completedModules } = await supabase
        .from('user_module_completion')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('course_id', courseSlug)
        .eq('completed', true)
        .order('completed_at', { ascending: true });

      if (completedModules && completedModules.length > 0) {
        const firstCompletion = new Date(completedModules[0].completed_at);
        const now = new Date();
        const daysDiff = Math.max(1, Math.ceil((now - firstCompletion) / (1000 * 60 * 60 * 24)));
        
        setStats({
          modulesCompleted: completedModules.length,
          daysSinceStart: daysDiff,
        });
      }

      // Set random motivational quote
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    };

    fetchStats();
  }, [user, courseSlug]);

  const handleNextModule = () => {
    if (nextModule) {
      navigate(`/courses/${courseSlug}/module-${nextModule.id}`);
    } else {
      navigate(`/courses/${courseSlug}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-bounceIn">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-24 h-24 flex items-center justify-center animate-pulse">
              <FaCheckCircle className="text-white text-5xl" />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center animate-bounce">
              <FaTrophy className="text-yellow-800 text-2xl" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Module Complete! 🎉
          </h2>
          <p className="text-gray-600 text-lg">
            Way to push through and finish strong.
          </p>
        </div>

        {/* Progress Stats */}
        {stats && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-6 border border-blue-200">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FaFire className="text-orange-500 text-2xl" />
              <h3 className="text-lg font-bold text-gray-900">Your Progress</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.modulesCompleted}
                </div>
                <div className="text-sm text-gray-600">
                  Module{stats.modulesCompleted !== 1 ? 's' : ''} Completed
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.daysSinceStart}
                </div>
                <div className="text-sm text-gray-600">
                  Day{stats.daysSinceStart !== 1 ? 's' : ''} of Learning
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 mb-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <p className="text-gray-800 font-medium italic leading-relaxed">
                "{quote}"
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {nextModule ? (
            <>
              <button
                onClick={handleNextModule}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Keep Going
                <FaArrowRight className="text-xl" />
              </button>
              <button
                onClick={() => {
                  navigate(`/courses/${courseSlug}`);
                  onClose();
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Back to Course Overview
              </button>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="font-bold text-gray-900 mb-1">Course Complete!</h3>
                  <p className="text-sm text-gray-700">
                    You've finished <strong>{courseTitle}</strong>. Time to apply what you've learned!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigate('/courses');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Explore More Courses
                <FaArrowRight className="text-xl" />
              </button>
            </>
          )}
        </div>

        {/* Subtle reminder about support */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? <a href="mailto:support@revenueripple.org" className="text-blue-600 hover:underline font-medium">Reach out to Donte</a> anytime.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ModuleCompletionFeedback;

