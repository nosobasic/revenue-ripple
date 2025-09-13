import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookGiveaway = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
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

    // Check for duplicate submissions in localStorage (client-side spam prevention)
    const existingSubmissions = JSON.parse(localStorage.getItem('bookGiveawaySubmissions') || '[]');
    const emailExists = existingSubmissions.some(sub => sub.email.toLowerCase() === formData.email.toLowerCase());
    
    if (emailExists) {
      setError('This email has already been used to claim a free book. Please use a different email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('https://revenue-ripple.onrender.com/api/book-giveaway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Store submission data in sessionStorage for thank you page
        const submissionData = {
          name: formData.name,
          email: formData.email,
          timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem('bookGiveawaySubmission', JSON.stringify(submissionData));
        
        // Add to localStorage for client-side duplicate prevention
        existingSubmissions.push(submissionData);
        localStorage.setItem('bookGiveawaySubmissions', JSON.stringify(existingSubmissions));
        
        // Redirect to thank you page
        navigate('/book-giveaway-thank-you');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get Your FREE Copy of
              <span className="block text-blue-600">$100M Money Models</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Alex Hormozi's latest book that reveals the exact money models used to build 
              billion-dollar businesses. Limited to 198 copies - you just cover shipping!
            </p>
            
            {/* Book Image */}
            <div className="mb-8">
              <div className="inline-block bg-white rounded-lg shadow-xl p-6">
                <img 
                  src="/assets/images/images/money-models.jpeg" 
                  alt="$100M Money Models by Alex Hormozi" 
                  className="w-48 h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    // Fallback to original image if new one fails
                    e.target.src = "/assets/images/images/money-book.jpeg";
                  }}
                />
                <div className="w-48 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold hidden">
                  $100M Money Models
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">World-Record Breaking</h3>
              <p className="text-gray-600">Learn the exact money models that built billion-dollar businesses</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Limited Edition</h3>
              <p className="text-gray-600">Only 198 copies available - first come, first served</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Just Cover Shipping</h3>
              <p className="text-gray-600">The book is completely free - you only pay for shipping costs</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                Claim Your Free Copy
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email address"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    'Get My Free Book Now'
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
              <div className="text-2xl font-bold text-gray-400">800K+</div>
              <div className="text-2xl font-bold text-gray-400">4.9/5</div>
              <div className="text-2xl font-bold text-gray-400">#1 Bestseller</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookGiveaway;
