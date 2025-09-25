import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ThankYouDMD = () => {
  const [submissionData, setSubmissionData] = useState(null);

  useEffect(() => {
    // Get submission data from sessionStorage
    const data = sessionStorage.getItem('dmdSubmission');
    if (data) {
      setSubmissionData(JSON.parse(data));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Thank You, {submissionData?.name || 'Friend'}!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your copy of <strong>Digital Marketing Domination</strong> is on its way to your inbox.
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Check Your Email</h3>
                  <p className="text-gray-600">Look for your Digital Marketing Domination guide in your inbox (check spam folder too)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Study the 26 Strategies</h3>
                  <p className="text-gray-600">Learn the proven tactics that consistently drive traffic, leads, and sales</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Implement & Dominate</h3>
                  <p className="text-gray-600">Start applying the strategies to turn every click into a customer</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Dominate Digital Marketing?</h3>
            <p className="text-lg mb-6 opacity-90">
              Get access to our complete training platform with advanced courses, 
              tools, and expert guidance to accelerate your success.
            </p>
            <Link 
              to="/checkout" 
              className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Join Revenue Ripple - $47/month
            </Link>
          </div>

          {/* Additional Resources */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need help implementing these strategies? We're here to support you.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/support" 
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Get Support
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouDMD;
