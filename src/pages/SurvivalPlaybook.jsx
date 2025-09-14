import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SurvivalPlaybook = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState(null);
  const navigate = useNavigate();

  // Parse UTM parameters and inject them into hidden form fields
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source') || 'direct',
      utm_medium: urlParams.get('utm_medium') || 'organic',
      utm_campaign: urlParams.get('utm_campaign') || 'survival-playbook',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || ''
    };
    
    // Store UTM params in sessionStorage for the API call
    sessionStorage.setItem('utmParams', JSON.stringify(utmParams));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    
    // Real-time email validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value.length === 0) {
        setEmailValid(null);
      } else {
        setEmailValid(emailRegex.test(value));
      }
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Get UTM parameters from sessionStorage
      const utmParams = JSON.parse(sessionStorage.getItem('utmParams') || '{}');
      
      const requestData = {
        ...formData,
        source: 'ig', // Hidden field as specified
        ...utmParams
      };

      const response = await fetch('https://revenue-ripple.onrender.com/api/getresponse/survival-playbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        // Store submission data for thank you page
        const submissionData = {
          name: formData.name,
          email: formData.email,
          timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem('survivalPlaybookSubmission', JSON.stringify(submissionData));
        
        // Redirect to thank you page
        navigate('/thank-you-survival-playbook');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Free Guide: The Survival Systems Playbook
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Learn how to capture leads, nurture them, and close sales without burning out.
            </p>
            
            {/* Book Image */}
            <div className="mb-8">
              <div className="inline-block bg-white rounded-lg shadow-xl p-6">
                <img 
                  src="/assets/downloads/The Survival Systems Playbook.pdf" 
                  alt="The Survival Systems Playbook" 
                  className="w-48 h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    // Fallback to a placeholder if the PDF preview doesn't work
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-48 h-64 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-lg font-bold hidden">
                  The Survival Systems Playbook
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lead Capture Systems</h3>
              <p className="text-gray-600">Build automated systems that capture high-quality leads 24/7</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Nurture Sequences</h3>
              <p className="text-gray-600">Turn cold leads into warm prospects with proven nurture campaigns</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Close More Sales</h3>
              <p className="text-gray-600">Increase your conversion rates with battle-tested sales systems</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                Get the Playbook
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        emailValid === true ? 'border-green-300 bg-green-50' : 
                        emailValid === false ? 'border-red-300 bg-red-50' : 
                        'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                      disabled={isSubmitting}
                    />
                    {emailValid === true && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {emailValid === false && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {emailValid === false && (
                    <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Get the Playbook'
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you agree to receive marketing communications from us. 
                You can unsubscribe at any time.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Trusted by entrepreneurs worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">10K+</div>
              <div className="text-2xl font-bold text-gray-400">4.8/5</div>
              <div className="text-2xl font-bold text-gray-400">Free Guide</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurvivalPlaybook;
