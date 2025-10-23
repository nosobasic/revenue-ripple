import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYouSurvivalPlaybook = () => {
  const [submissionData, setSubmissionData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get submission data from sessionStorage
    const storedData = sessionStorage.getItem('survivalPlaybookSubmission');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setSubmissionData(data);
      } catch (error) {
        console.error('Error parsing submission data:', error);
        navigate('/survival-playbook');
      }
    } else {
      // No submission data found, redirect to landing page
      navigate('/survival-playbook');
    }
  }, [navigate]);

  const handleDownload = () => {
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = '/assets/downloads/The Survival Systems Playbook.pdf';
    link.download = 'The Survival Systems Playbook.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpgrade = () => {
    // Optional: Navigate to a Stripe checkout or upgrade page
    // For now, just navigate to the main site
    navigate('/');
  };

  const handleShare = () => {
    const shareText = `I just downloaded The Survival Systems Playbook - a free guide on lead capture, nurture sequences, and sales systems!`;
    const shareUrl = window.location.origin + '/survival-playbook';
    
    if (navigator.share) {
      navigator.share({
        title: 'The Survival Systems Playbook',
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  if (!submissionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              You're in, {submissionData.name.split(' ')[0]}!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Check your inbox for <strong>The Survival Systems Playbook</strong>. 
              Your free guide is ready for download!
            </p>
          </div>

          {/* Download Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Download Your Free Guide
              </h2>
              
              <div className="mb-8">
                <div className="inline-block bg-white rounded-lg shadow-xl p-6 mb-6">
                  <div className="w-32 h-40 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                    📖 Survival Systems Playbook
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-8">
                Click the button below to download your free copy of The Survival Systems Playbook. 
                Learn how to capture leads, nurture them, and close sales without burning out.
              </p>

              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 px-8 rounded-lg hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-300 transition-all text-xl mb-4"
              >
                📥 Download the Playbook
              </button>

              <p className="text-sm text-gray-500">
                PDF will download automatically to your device
              </p>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 mb-12 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                Upgrade Your System Today
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Ready to take your business to the next level? Explore our premium training programs 
                and business resources designed to help you scale faster.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <h4 className="font-semibold mb-2">🚀 Revenue Ripple Training</h4>
                  <p className="text-sm opacity-90">Access our complete library of business training materials</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <h4 className="font-semibold mb-2">💼 Business Coaching</h4>
                  <p className="text-sm opacity-90">Get personalized guidance from our expert team</p>
                </div>
              </div>
              
              <button
                onClick={handleUpgrade}
                className="bg-white text-orange-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all"
              >
                Explore Revenue Ripple
              </button>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Share This Resource
              </h3>
              <p className="text-gray-600 mb-6">
                Know other entrepreneurs who would benefit from this playbook? Share this free resource with them!
              </p>
              <button
                onClick={handleShare}
                className="bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 transition-all"
              >
                Share with Friends
              </button>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                What's Next?
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                While you're reading the playbook, here are some additional resources to help you implement these systems:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h4 className="font-semibold mb-2 text-orange-600">📧 Email Marketing</h4>
                  <p className="text-sm text-gray-600">Learn how to build effective nurture sequences</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h4 className="font-semibold mb-2 text-orange-600">🎯 Lead Generation</h4>
                  <p className="text-sm text-gray-600">Discover proven lead capture strategies</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h4 className="font-semibold mb-2 text-orange-600">💰 Sales Systems</h4>
                  <p className="text-sm text-gray-600">Master the art of closing more deals</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              Questions about the playbook? Contact us at{' '}
              <a href="mailto:support@revenueripple.org" className="text-orange-600 hover:text-orange-800 underline">
                support@revenueripple.org
              </a>
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-orange-600 hover:text-orange-800 text-sm underline"
              >
                ← Back to Revenue Ripple Homepage
              </button>
              <button
                onClick={() => navigate('/survival-playbook')}
                className="text-orange-600 hover:text-orange-800 text-sm underline"
              >
                Share This Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouSurvivalPlaybook;
