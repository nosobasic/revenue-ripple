import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FaRobot className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Visibility Setup</h1>
          <p className="text-gray-600 mt-2">
            Tell us about your business to start tracking your AI visibility
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaBuilding className="mr-2 text-gray-400" />
                Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g., Revenue Ripple"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaGlobe className="mr-2 text-gray-400" />
                Website URL (optional)
              </label>
              <input
                type="url"
                name="business_url"
                value={formData.business_url}
                onChange={handleChange}
                placeholder="https://www.example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaIndustry className="mr-2 text-gray-400" />
                Industry *
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FaUsers className="mr-2 text-gray-400" />
                  Competitors (up to 3)
                </label>
                {competitors.length < 3 && (
                  <button
                    type="button"
                    onClick={addCompetitor}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => handleCompetitorChange(idx, 'name', e.target.value)}
                      placeholder="Competitor name"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      value={comp.url}
                      onChange={(e) => handleCompetitorChange(idx, 'url', e.target.value)}
                      placeholder="Website (optional)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {competitors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCompetitor(idx)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Add competitors to compare your AI visibility against theirs
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Creating Profile...
              </>
            ) : (
              <>
                Start Tracking <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
