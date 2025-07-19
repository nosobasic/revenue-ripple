import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client.jsx';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import AIAssistantWidget from '../components/AIAssistantWidget';
import OnboardingModal from '../components/OnboardingModal';
import '../pages.css';
import { 
  FaMoneyBillWave, 
  FaChartBar, 
  FaGraduationCap, 
  FaLightbulb, 
  FaGlobe, 
  FaShareAlt, 
  FaShoppingCart, 
  FaUsers, 
  FaFunnelDollar, 
  FaBriefcase, 
  FaRobot, 
  FaUserPlus, 
  FaFlask, 
  FaUserTie, 
  FaImage, 
  FaBook, 
  FaChartLine, 
  FaBell,
  FaRocket,
  FaHandshake,
  FaHeadset,
  FaClock,
  FaCertificate,
  FaBook
} from 'react-icons/fa';

// Dashboard Router - redirects to appropriate role-based dashboard
const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'member':
          navigate('/dashboard/member', { replace: true });
          break;
        case 'reseller':
        case 'affiliate':
          navigate('/dashboard/reseller', { replace: true });
          break;
        case 'pro_reseller':
          navigate('/dashboard/pro', { replace: true });
          break;
        default:
          navigate('/dashboard/member', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span style={{ marginLeft: 16 }}>Loading dashboard...</span>
      </div>
    );
  }

  return null; // Component will redirect, so don't render anything
};

// Member Dashboard Component (renamed from main Dashboard)
export const MemberDashboard = () => {
  const { user, signOut } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userIntent, setUserIntent] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalShipments: 0,
    totalCommissions: 0,
    lowStockItems: 0
  });
  const [courseProgress, setCourseProgress] = useState({});

  // Check for first-time user onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    const savedUserIntent = localStorage.getItem('userIntent');
    
    if (!hasOnboarded) {
      // Small delay to let the page load before showing modal
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
    } else {
      setUserIntent(savedUserIntent);
    }
  }, []);

  const handleOnboardingComplete = (intent) => {
    setUserIntent(intent);
    localStorage.setItem('userIntent', intent);
    localStorage.setItem('hasOnboarded', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!user) {
      setError('No user found');
      setLoading(false);
      return;
    }
    
    const fetchAllProgress = async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('course_id, percent_done')
        .eq('user_id', user.id);
      if (error) {
        setError('Failed to fetch progress');
        return;
      }
      // Map course_id to percent_done
      const progressMap = {};
      if (data) {
        data.forEach(row => {
          progressMap[row.course_id] = row.percent_done;
        });
      }
      setCourseProgress(progressMap);
    };
    fetchAllProgress();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Course data
  const courses = [
    {
      id: 'marketing-fundamentals',
      title: 'Marketing Fundamentals',
      description: 'Master the basics of digital marketing',
      icon: <FaGraduationCap />,
      progress: courseProgress['marketing-fundamentals'] || 0,
      modules: 8,
      estimatedTime: '3 hours'
    },
    {
      id: 'seo-mastery',
      title: 'SEO Mastery',
      description: 'Learn search engine optimization',
      icon: <FaChartLine />,
      progress: courseProgress['seo-mastery'] || 0,
      modules: 12,
      estimatedTime: '5 hours'
    },
    {
      id: 'affiliate-marketing',
      title: 'Affiliate Marketing',
      description: 'Build your affiliate empire',
      icon: <FaHandshake />,
      progress: courseProgress['affiliate-marketing'] || 0,
      modules: 10,
      estimatedTime: '4 hours'
    }
  ];

  // Quick action cards
  const quickActions = [
    {
      id: 'learn',
      title: 'Continue Learning',
      description: 'Resume your training modules',
      icon: <FaGraduationCap />,
      action: () => navigate('/courses'),
      color: 'blue'
    },
    {
      id: 'upgrade',
      title: 'Upgrade to Reseller',
      description: 'Unlock earning potential',
      icon: <FaRocket />,
      action: () => navigate('/special'),
      color: 'green'
    },
    {
      id: 'support',
      title: 'Get Support',
      description: 'Contact our expert team',
      icon: <FaHeadset />,
      action: () => navigate('/contact'),
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading-spinner">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <ReferralTracker />
      <Navbar />
      <AIAssistantWidget />
      
      {showOnboarding && (
        <OnboardingModal 
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name || 'Member'}!</h1>
          <p>Continue your marketing journey with Revenue Ripple</p>
        </div>

        {/* Role-specific content for members */}
        <div className="dashboard-grid">
          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <div 
                  key={action.id}
                  className={`quick-action-card ${action.color}`}
                  onClick={action.action}
                >
                  <div className="action-icon">{action.icon}</div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Course Progress */}
          <div className="dashboard-section">
            <h2>Your Training Progress</h2>
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-icon">{course.icon}</div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span>{course.progress}% complete</span>
                  </div>
                  <div className="course-meta">
                    <span>{course.modules} modules</span>
                    <span>{course.estimatedTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Stats */}
          <div className="dashboard-section">
            <h2>Your Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <FaBook className="stat-icon" />
                <div className="stat-content">
                  <h3>0</h3>
                  <p>Courses Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <FaCertificate className="stat-icon" />
                <div className="stat-content">
                  <h3>0</h3>
                  <p>Certificates Earned</p>
                </div>
              </div>
              <div className="stat-card">
                <FaClock className="stat-icon" />
                <div className="stat-content">
                  <h3>0h</h3>
                  <p>Learning Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
