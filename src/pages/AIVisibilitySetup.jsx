import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { 
  FaRobot, 
  FaBuilding, 
  FaGlobe, 
  FaIndustry, 
  FaUsers,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaArrowRight
} from 'react-icons/fa';

const INDUSTRIES = [
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'coaching', label: 'Coaching & Consulting' },
  { value: 'saas', label: 'SaaS & Technology' },
  { value: 'technology', label: 'Technology & IT Services' },
  { value: 'design', label: 'Design & Creative' },
  { value: 'ecommerce', label: 'E-commerce & Retail' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'finance', label: 'Finance & Accounting' },
  { value: 'healthcare', label: 'Healthcare & Wellness' },
  { value: 'education', label: 'Education & Training' },
  { value: 'other', label: 'Other' }
];

export default function AIVisibilitySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_url: '',
    industry: ''
  });
  
  const [competitors, setCompetitors] = useState([
    { name: '', url: '' }
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCompetitorChange = (index, field, value) => {
    const updated = [...competitors];
    updated[index][field] = value;
    setCompetitors(updated);
  };

  const addCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, { name: '', url: '' }]);
    }
  };

  const removeCompetitor = (index) => {
    const updated = competitors.filter((_, i) => i !== index);
    setCompetitors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.business_name || !formData.industry) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validCompetitors = competitors
        .filter(c => c.name.trim())
        .map(c => ({ name: c.name.trim(), url: c.url.trim() || null }));

      const res = await fetch('/api/ai-visibility/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          business_name: formData.business_name,
          business_url: formData.business_url || null,
          industry: formData.industry,
          competitors: validCompetitors
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      navigate('/ai-visibility');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="AI Visibility Setup"
        description="Set up your AI visibility profile to track how your business appears in ChatGPT, Perplexity, and other AI chatbots."
        url="https://revenueripple.org/ai-visibility/setup"
      />
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <FaRobot className="mx-auto text-4xl text-blue-600 mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Set Up AI Visibility</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Track how AI chatbots see your business
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Business Name *</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Your business name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Website (optional)</label>
              <input
                type="url"
                name="business_url"
                value={formData.business_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Industry *</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Competitors (optional)</label>
                {competitors.length < 3 && (
                  <button type="button" onClick={addCompetitor} className="text-xs text-blue-600 hover:text-blue-700">
                    + Add
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => handleCompetitorChange(idx, 'name', e.target.value)}
                      placeholder="Competitor name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {competitors.length > 1 && (
                      <button type="button" onClick={() => removeCompetitor(idx)} className="p-2 text-red-400 hover:text-red-600">
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Start Tracking'}
          </button>
        </form>
      </div>
    </div>
  );
}
