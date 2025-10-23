import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaDollarSign, 
  FaRocket, 
  FaTimes, 
  FaChevronRight, 
  FaArrowLeft,
  FaRobot,
  FaUserTie,
  FaBook,
  FaChartLine,
  FaEye,
  FaStar
} from 'react-icons/fa';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';

const OnboardingModal = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalSteps = 6;

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setCurrentStep(2);
  };

  const handleComplete = async () => {
    // Save to Supabase
    if (user) {
      await supabase
        .from('user_onboarding')
        .upsert([
          {
            user_id: user.id,
            has_completed: true,
            completed_at: new Date().toISOString(),
            selected_goal: selectedGoal,
          }
        ], { onConflict: ['user_id'] });
    }

    // Fallback to localStorage for non-authenticated users
    localStorage.setItem('userIntent', selectedGoal);
    localStorage.setItem('hasOnboarded', 'true');
    
    // Route user based on their goal
    let redirectPath = '/dashboard';
    switch (selectedGoal) {
      case 'learn':
        redirectPath = '/courses';
        break;
      case 'earn':
        redirectPath = '/affiliate-centre';
        break;
      case 'both':
        redirectPath = '/dashboard';
        break;
      default:
        redirectPath = '/dashboard';
    }
    
    onComplete();
    navigate(redirectPath);
  };

  const handleSkip = async () => {
    if (user) {
      await supabase
        .from('user_onboarding')
        .upsert([
          {
            user_id: user.id,
            has_completed: true,
            completed_at: new Date().toISOString(),
            selected_goal: 'skipped',
          }
        ], { onConflict: ['user_id'] });
    }
    localStorage.setItem('hasOnboarded', 'true');
    onSkip();
  };

  const handleJoinWaitlist = async (featureName) => {
    if (user) {
      await supabase
        .from('feature_waitlist')
        .upsert([
          {
            user_id: user.id,
            feature_name: featureName,
          }
        ], { onConflict: ['user_id', 'feature_name'] });
    }
  };

  const getGoalDisplay = (goal) => {
    switch (goal) {
      case 'learn':
        return 'Learn Marketing';
      case 'earn':
        return 'Earn with Affiliates';
      case 'both':
        return 'Learn & Earn';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] animate-fadeIn p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] relative shadow-2xl animate-slideUp overflow-y-auto">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip onboarding"
            >
              Skip
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
          aria-label="Close"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center pt-2">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl text-blue-600">
              <FaRocket />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Revenue Ripple! 🎉
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Let's get you started on your marketing journey. What's your main goal today?
            </p>

            {/* Goal Options */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleGoalSelect('learn')}
                className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left"
              >
                <div className="bg-blue-100 rounded-lg p-4 text-blue-600 text-2xl min-w-[64px] min-h-[64px] flex items-center justify-center">
                  <FaGraduationCap />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">Learn Marketing Skills</div>
                  <div className="text-sm text-gray-600">Master digital marketing through our courses</div>
                </div>
                <FaChevronRight className="text-gray-400" />
              </button>

              <button
                onClick={() => handleGoalSelect('earn')}
                className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-green-500 hover:bg-green-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left"
              >
                <div className="bg-green-100 rounded-lg p-4 text-green-600 text-2xl min-w-[64px] min-h-[64px] flex items-center justify-center">
                  <FaDollarSign />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">Earn with Affiliates</div>
                  <div className="text-sm text-gray-600">Start earning commissions as an affiliate</div>
                </div>
                <FaChevronRight className="text-gray-400" />
              </button>

              <button
                onClick={() => handleGoalSelect('both')}
                className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-purple-500 hover:bg-purple-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left"
              >
                <div className="bg-purple-100 rounded-lg p-4 text-purple-600 text-2xl min-w-[64px] min-h-[64px] flex items-center justify-center">
                  <FaRocket />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">Both - Learn & Earn</div>
                  <div className="text-sm text-gray-600">Master marketing while building income</div>
                </div>
                <FaChevronRight className="text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Three Pillars */}
        {currentStep === 2 && (
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl text-white">
              <FaStar />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Your Success Framework
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Three powerful pillars to accelerate your growth
            </p>

            {/* Three Pillars */}
            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl text-left border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 rounded-lg p-3 text-white text-2xl">
                    <FaBook />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">📚 Education Hub</h3>
                    <p className="text-sm text-gray-700">
                      Access 30+ marketing courses covering everything from SEO to paid traffic. 
                      Learn at your own pace with actionable tutorials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl text-left border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 rounded-lg p-3 text-white text-2xl">
                    <FaRobot />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">🤖 Ripple AI Chatbot</h3>
                    <p className="text-sm text-gray-700">
                      Get instant answers to your marketing questions. Your AI-powered consultant 
                      is available 24/7 to guide you through any challenge.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-5 rounded-xl text-left border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500 rounded-lg p-3 text-white text-2xl">
                    <FaUserTie />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">💼 Work with Donte</h3>
                    <p className="text-sm text-gray-700">
                      Need personalized strategy? Get 1-on-1 consulting, custom workflow builds, 
                      or dev work tailored to your business.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                <FaArrowLeft />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Continue
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Meet Donte (White Glove) */}
        {currentStep === 3 && (
          <div className="text-center">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl text-white">
              <FaUserTie />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Meet Your Guide
            </h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border border-gray-200">
              <div className="flex items-start gap-5 mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  DW
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Donte Willis</h3>
                  <p className="text-sm text-gray-600 mb-3">Founder & Marketing Strategist</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    "I built Revenue Ripple to give you the unfair advantage I wish I had starting out. 
                    You're not doing this alone. I'm here to help you win."
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  How I Can Help You:
                </h4>
                <ul className="text-left space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><strong>Strategy Calls:</strong> Personalized marketing roadmaps for your business</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><strong>Workflow Builds:</strong> Custom automation and systems setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><strong>Dev Work:</strong> Landing pages, funnels, integrations built for you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><strong>Course Support:</strong> Questions about any training material</span>
                  </li>
                </ul>
              </div>

              <a 
                href="mailto:support@revenueripple.org?subject=Strategy Call Request&body=Hi Donte,%0D%0A%0D%0AI'd like to discuss strategy for my business.%0D%0A%0D%0AThanks!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                📞 Book a Strategy Call
              </a>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                <FaArrowLeft />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Continue
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Future Features Teaser */}
        {currentStep === 4 && (
          <div className="text-center">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl text-white">
              <FaEye />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              What's Coming Next
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Get early access to game-changing features
            </p>

            {/* Future Features */}
            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl text-left border-2 border-indigo-200 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-600 rounded-lg p-3 text-white text-2xl">
                    <FaEye />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">🔍 AI Visibility Dashboard</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Real-time analytics powered by AI. See exactly what's working, what's not, 
                      and what to do next—explained in plain English.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Predictive performance insights</li>
                      <li>• Competitor monitoring & gap analysis</li>
                      <li>• Automated opportunity alerts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl text-left border-2 border-purple-200 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-600 rounded-lg p-3 text-white text-2xl">
                    <FaChartLine />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">🎮 Command Center</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Your mission control for all marketing campaigns. Manage ads, content, 
                      and workflows from one unified dashboard.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Multi-platform campaign management</li>
                      <li>• AI-powered optimization suggestions</li>
                      <li>• One-click deployment & scaling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                await handleJoinWaitlist('AI Visibility & Command Center');
                setCurrentStep(5);
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mb-4"
            >
              🚀 Join Early Access Waitlist
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                <FaArrowLeft />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Skip
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Final Confirmation */}
        {currentStep === 5 && (
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-5xl">
              ✅
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              You're All Set!
            </h2>
            
            <p className="text-lg text-gray-600 mb-2">
              You selected: <strong className="text-blue-600">{getGoalDisplay(selectedGoal)}</strong>
            </p>

            <p className="text-base text-gray-600 mb-8">
              We'll take you to the perfect starting point. Remember, you're not alone on this journey.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">✨ Quick Reminders:</h3>
              <ul className="text-left space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl mt-0.5">💪</span>
                  <span>Most people quit at the first obstacle. You're different. Keep pushing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 text-xl mt-0.5">🎯</span>
                  <span>Progress over perfection. Complete modules, track your wins.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 text-xl mt-0.5">🤝</span>
                  <span>Stuck? Use the AI chatbot or reach out to Donte directly.</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                <FaArrowLeft />
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Let's Go! 🚀
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OnboardingModal;
