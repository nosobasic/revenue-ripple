import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaRobot className="mx-auto text-6xl text-blue-600 mb-6" />
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
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Visibility Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Tracking: <span className="font-semibold">{profile.business_name}</span>
            </p>
          </div>
          <button
            onClick={runVisibilityCheck}
            disabled={checking}
            className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {checking ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Checking...
              </>
            ) : (
              <>
                <FaSync className="mr-2" /> Run Visibility Check
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
            <FaExclamationTriangle className="mr-2" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Visibility Score</p>
                <p className="text-3xl font-bold text-blue-600">{summary?.visibility_score || 0}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaChartLine className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Prompts Appearing</p>
                <p className="text-3xl font-bold text-green-600">{summary?.prompts_appearing || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Checked</p>
                <p className="text-3xl font-bold text-gray-900">{summary?.total_prompts_checked || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <FaSearch className="text-gray-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                <p className="text-3xl font-bold text-purple-600">{Math.round((summary?.avg_confidence || 0) * 100)}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaRobot className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-600" /> Competitor Comparison
            </h2>
            {comparison ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-blue-900">{comparison.business.name} (You)</span>
                  <span className="text-blue-600 font-bold">
                    {comparison.business.appearing}/{comparison.business.total} prompts
                  </span>
                </div>
                {comparison.competitors.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{comp.name}</span>
                    <span className="text-gray-600 font-medium">
                      {comp.appearing}/{comp.total} prompts
                    </span>
                  </div>
                ))}
                {comparison.competitors.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No competitors added yet. <Link to="/ai-visibility/setup" className="text-blue-600 hover:underline">Add competitors</Link>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Run a visibility check to see comparison</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaSearch className="mr-2 text-blue-600" /> Prompt Results
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.length > 0 ? results.map((result, idx) => (
                <div key={idx} className="flex items-start p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {result.appears ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {result.ai_visibility_prompts?.prompt_text || 'Unknown prompt'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(result.confidence_score * 100)}%
                      {result.snippet && (
                        <span className="ml-2 text-green-600">Mentioned!</span>
                      )}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-8">
                  No results yet. Click "Run Visibility Check" to start.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
