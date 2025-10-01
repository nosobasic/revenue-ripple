import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ThankYouMembershipMastery = () => {
  const [submissionData, setSubmissionData] = useState(null);

  useEffect(() => {
    // Get submission data from sessionStorage
    const data = sessionStorage.getItem('membershipMasterySubmission');
    if (data) {
      setSubmissionData(JSON.parse(data));
    }

    // Track thank you page view with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView', {
        content_name: 'Membership Mastery Thank You Page',
        content_category: 'Thank You Page',
        value: 0,
        currency: 'USD'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
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
            Your copy of <strong>Membership Mastery</strong> is on its way to your inbox.
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Check Your Email</h3>
                  <p className="text-gray-600">Look for your Membership Mastery guide in your inbox (check spam folder too)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Follow the System</h3>
                  <p className="text-gray-600">Use the step-by-step guide to build your membership site</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Start Building</h3>
                  <p className="text-gray-600">Begin implementing the strategies to create your recurring income stream</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white mb-6">
            <h3 className="text-2xl font-bold mb-4">📖 Your Ebook is Ready!</h3>
            <p className="text-lg mb-6 opacity-90">
              Download your Membership Mastery guide and start building your recurring income machine today.
            </p>
            <a 
              href="https://www.revenueripple.org/dlds/MembershipMastery.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                // Track download event with Meta Pixel
                if (typeof window !== 'undefined' && window.fbq) {
                  window.fbq('track', 'Lead', {
                    content_name: 'Membership Mastery Download',
                    content_category: 'Lead Conversion',
                    value: 7,
                    currency: 'USD'
                  });
                }
              }}
            >
              Download Membership Mastery Ebook
            </a>
          </div>

          {/* Revenue Ripple CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-4">Want to Earn Recurring Revenue While You Learn?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join Revenue Ripple and get access to 46+ comprehensive marketing tutorials, AI-powered strategies, and our exclusive affiliate program where you can earn $47/month per referral - sent straight to your PayPal!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                className="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🚀 Explore Revenue Ripple
              </Link>
              <Link 
                to="/reseller" 
                className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors"
              >
                💰 Join Reseller Program
              </Link>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need help getting started? We're here to support you.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/support" 
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Get Support
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                to="/" 
                className="text-purple-600 hover:text-purple-700 font-semibold"
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

export default ThankYouMembershipMastery;
