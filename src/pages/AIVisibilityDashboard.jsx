import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { 
  FaRobot, 
  FaSearch, 
  FaChartLine, 
  FaUsers, 
  FaPlus,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function AIVisibilityDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ai-visibility/profile?user_id=${user.id}`);
      const data = await res.json();
      
      if (data.profile) {
        setProfile(data.profile);
        await Promise.all([
          loadResults(data.profile.business_name),
          loadPrompts(data.profile.industry),
          loadComparison(data.profile.id)
        ]);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (businessName) => {
    try {
      const res = await fetch(`/api/ai-visibility/results?business_name=${encodeURIComponent(businessName)}`);
      const data = await res.json();
      setResults(data.results || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  };

  const loadPrompts = async (industry) => {
    try {
      const res = await fetch(`/api/ai-visibility/prompts?industry=${encodeURIComponent(industry || '')}`);
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  };

  const loadComparison = async (profileId) => {
    try {
      const res = await fetch(`/api/ai-visibility/compare?profile_id=${profileId}`);
      const data = await res.json();
      setComparison(data.comparison || null);
    } catch (err) {
      console.error('Failed to load comparison:', err);
    }
  };

  const runVisibilityCheck = async () => {
    if (!profile || prompts.length === 0) return;
    
    setChecking(true);
    setError(null);
    
    try {
      const allBusinesses = [
        profile.business_name,
        ...(profile.competitors || []).map(c => c.competitor_name)
      ];
      
      for (const businessName of allBusinesses) {
        await fetch('/api/ai-visibility/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name: businessName,
            prompt_ids: prompts.slice(0, 10).map(p => p.id)
          })
        });
      }
      
      await loadResults(profile.business_name);
      await loadComparison(profile.id);
    } catch (err) {
      setError('Failed to run visibility check');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO title="AI Visibility" description="Track how your business appears in AI chatbots" />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO title="AI Visibility" description="Track how your business appears in AI chatbots" />
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <FaRobot className="mx-auto text-5xl text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Set Up Your AI Visibility Profile
            </h1>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Track how your business appears in AI chatbots like ChatGPT, Perplexity, and Gemini. 
              Compare against competitors and get insights to boost your visibility.
            </p>
            <Link 
              to="/ai-visibility/setup"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" /> Create Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="AI Visibility Dashboard"
        description="Monitor your AI visibility score, track appearance in AI chatbots, and compare against competitors."
        url="https://revenueripple.org/ai-visibility"
      />
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Visibility</h1>
            <p className="text-gray-500 text-sm">{profile.business_name}</p>
          </div>
          <button
            onClick={runVisibilityCheck}
            disabled={checking}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {checking ? <FaSpinner className="animate-spin" /> : <><FaSync className="inline mr-1" /> Check</>}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 text-center">
            <p className="text-4xl font-bold text-blue-600">{summary?.visibility_score || 0}%</p>
            <p className="text-sm text-gray-500 mt-1">Visibility Score</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 text-center">
            <p className="text-4xl font-bold text-green-600">{summary?.prompts_appearing || 0}<span className="text-lg text-gray-400">/{summary?.total_prompts_checked || 0}</span></p>
            <p className="text-sm text-gray-500 mt-1">Prompts Appearing</p>
          </div>

        </div>

        {comparison && comparison.competitors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">vs Competitors</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-blue-600">{comparison.business.name} (You)</span>
                <span className="text-blue-600 font-bold">{comparison.business.appearing}/{comparison.business.total}</span>
              </div>
              {comparison.competitors.map((comp, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <span className="text-gray-600">{comp.name}</span>
                  <span className="text-gray-500">{comp.appearing}/{comp.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Prompt Results</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {results.length > 0 ? results.map((result, idx) => (
              <div key={idx} className="flex items-center py-2 border-b last:border-0">
                {result.appears ? (
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-gray-300 flex-shrink-0" />
                )}
                <span className="ml-3 text-sm text-gray-700 truncate">
                  {result.ai_visibility_prompts?.prompt_text || 'Unknown prompt'}
                </span>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-6 text-sm">
                Click "Check" to scan AI visibility
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
