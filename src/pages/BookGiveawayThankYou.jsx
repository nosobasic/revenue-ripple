import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookGiveawayThankYou = () => {
  const [submissionData, setSubmissionData] = useState(null);
  const [copiesRemaining, setCopiesRemaining] = useState(198);
  const navigate = useNavigate();

  useEffect(() => {
    // Get submission data from sessionStorage
    const storedData = sessionStorage.getItem('bookGiveawaySubmission');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setSubmissionData(data);
        
        // Calculate remaining copies (mock calculation - in real app, this would come from backend)
        const submissions = JSON.parse(localStorage.getItem('bookGiveawaySubmissions') || '[]');
        const remaining = Math.max(0, 198 - submissions.length);
        setCopiesRemaining(remaining);
      } catch (error) {
        console.error('Error parsing submission data:', error);
        navigate('/book-giveaway');
      }
    } else {
      // No submission data found, redirect to landing page
      navigate('/book-giveaway');
    }
  }, [navigate]);

  const handleGetBook = () => {
    // Open the book redemption link in a new tab
    window.open('https://shop.acquisition.com/cart/46752763936993:1?discount=155709-60VXU-199', '_blank');
  };

  const handleShare = () => {
    const shareText = `I just got my FREE copy of Alex Hormozi's $100M Money Models book! Only 198 copies available - get yours before they're gone!`;
    const shareUrl = window.location.origin + '/book-giveaway';
    
    if (navigator.share) {
      navigator.share({
        title: 'Free $100M Money Models Book',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
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
              Congratulations, {submissionData.name.split(' ')[0]}!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              You've successfully claimed your FREE copy of <strong>$100M Money Models</strong> by Alex Hormozi. 
              Your book is ready for pickup - just cover the shipping costs!
            </p>
          </div>

          {/* Book Redemption Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Your Book is Ready!
              </h2>
              
              <div className="mb-8">
                <div className="inline-block bg-white rounded-lg shadow-xl p-6 mb-6">
                  <img 
                    src="/assets/images/images/money-book.jpeg" 
                    alt="$100M Money Models by Alex Hormozi" 
                    className="w-32 h-40 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-32 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold hidden">
                    $100M Money Models
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-8">
                Click the button below to complete your order. You'll only pay for shipping - the book is completely free!
              </p>

              <button
                onClick={handleGetBook}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-300 transition-all text-xl"
              >
                Get My Free Book Now
              </button>

              <p className="text-sm text-gray-500 mt-4">
                This will open the Acquisition.com checkout page in a new tab
              </p>
            </div>
          </div>

          {/* Urgency Section */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-red-800 mb-4">
                ⚠️ Limited Time Offer
              </h3>
              <p className="text-lg text-red-700 mb-4">
                Only <strong>{copiesRemaining} copies</strong> remaining out of 198!
              </p>
              <div className="w-full bg-red-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-red-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${((198 - copiesRemaining) / 198) * 100}%` }}
                ></div>
              </div>
              <p className="text-red-600">
                Don't wait - claim your copy now before they're all gone!
              </p>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Share This Opportunity
              </h3>
              <p className="text-gray-600 mb-6">
                Know other entrepreneurs who would benefit from this book? Share this opportunity with them!
              </p>
              <button
                onClick={handleShare}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all"
              >
                Share with Friends
              </button>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                What's Next?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                While you wait for your book to arrive, check out these resources to start building your business:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <h4 className="font-semibold mb-2">📚 Read the $100M Series</h4>
                  <p className="text-sm opacity-90">Check out Alex's other bestsellers: $100M Offers and $100M Leads</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <h4 className="font-semibold mb-2">🎯 Join Our Community</h4>
                  <p className="text-sm opacity-90">Connect with other entrepreneurs in our mastermind group</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <h4 className="font-semibold mb-2">🚀 Scale Your Business</h4>
                  <p className="text-sm opacity-90">Get access to our premium training and coaching programs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Questions? Contact us at support@revenueripple.org
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookGiveawayThankYou;
