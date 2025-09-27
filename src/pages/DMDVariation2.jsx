import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DMDVariation2 = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
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
      utm_campaign: urlParams.get('utm_campaign') || 'dmd-variation-2',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || ''
    };
    
    // Store UTM params in sessionStorage for the API call
    sessionStorage.setItem('utmParams', JSON.stringify(utmParams));

    // Track page view with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView', {
        content_name: 'DMD Variation 2',
        content_category: 'Landing Page',
        value: 7,
        currency: 'USD'
      });
    }
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
        source: 'dmd-variation-2',
        ...utmParams
      };

      const response = await fetch('https://revenue-ripple.onrender.com/api/getresponse/digital-marketing-domination', {
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
          timestamp: new Date().toISOString(),
          source: 'dmd-variation-2'
        };
        
        sessionStorage.setItem('dmdSubmission', JSON.stringify(submissionData));
        
        // Track lead event with Meta Pixel
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: 'DMD Variation 2',
            content_category: 'Lead Generation',
            value: 7,
            currency: 'USD',
            email: formData.email,
            name: formData.name
          });
        }
        
        // Redirect to thank you page
        navigate('/thank-you-dmd');
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              The Playbook Top Marketers
              <span className="block text-red-600">Don't Want You to See</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Most small business owners guess at digital marketing. The ones who win follow a system. 
              Digital Marketing Domination is that system. Email, SEO, social media, PPC, funnels—broken down so you can apply it today. 
              Download it free now.
            </p>
            
            {/* Book Image */}
            <div className="mb-8">
              <div className="inline-block bg-white rounded-lg shadow-xl p-6">
                <img 
                  src="/assets/images/images/DMD-book.png" 
                  alt="Digital Marketing Domination Guide" 
                  className="w-48 h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    // Fallback to a placeholder if the image doesn't load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-48 h-64 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg font-bold hidden">
                  Digital Marketing Domination
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Proven System</h3>
              <p className="text-gray-600">Stop guessing - follow the exact system that top marketers use</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">All Channels Covered</h3>
              <p className="text-gray-600">Email, SEO, social media, PPC, funnels - everything you need</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Apply Today</h3>
              <p className="text-gray-600">Step-by-step strategies you can implement immediately</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                Download Free Copy
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                        emailValid === true ? 'border-green-300 bg-green-50' : 
                        emailValid === false ? 'border-red-300 bg-red-50' : 
                        'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                      disabled={isSubmitting}
                      required
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

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    'Download Free Copy'
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
            <p className="text-gray-600 mb-4">Trusted by business owners worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">12K+</div>
              <div className="text-2xl font-bold text-gray-400">4.8/5</div>
              <div className="text-2xl font-bold text-gray-400">Free Guide</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMDVariation2;
