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

  const testimonials = [
    {
      name: "Matthew Mckinley",
      role: "Business Owner",
      quote: "My guy Donte made a work flow that perfectly handles my YouTube video summary automation",
      avatar: "https://i.pravatar.cc/100?img=11"
    },
    {
      name: "Dorian Morgan",
      role: "Entrepreneur",
      quote: "I've been learning so much about marketing and leads on revenue ripple, I seriously can't thank you enough! Applying the knowledge ive gained from the site, I've been able to generate and convert way more leads for my business 💪🔥",
      avatar: "https://i.pravatar.cc/100?img=32"
    },
    {
      name: "Sarah L.",
      role: "Membership Creator",
      quote: "Built my first membership site in 2 weeks using this system.",
      avatar: "https://i.pravatar.cc/100?img=23"
    }
  ];

  const hjEvent = (name) => {
    if (typeof window !== "undefined" && window.hj) {
      window.hj("event", name);
    }
  };

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
            You're now signed up for your <strong>Membership Mastery</strong> guide!
          </p>

          {/* Founder Welcome Video */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Quick welcome from Donte</h2>
            <p className="text-gray-600 mb-4">
              Here is how to get the most value from your membership guide and the next step when you are ready.
            </p>
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://player.vimeo.com/video/1130965044?title=0&byline=0&portrait=0"
                title="Welcome"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Guide Delivery Info */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-6">
            <h2 className="text-2xl font-bold mb-4">📖 Your Guide is Ready!</h2>
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Download Available Now!</h3>
                  <p className="opacity-90">Complete step-by-step system</p>
                </div>
              </div>
              <p className="text-lg opacity-90 text-center">
                Your Membership Mastery guide is ready for download. 
                Follow the proven system to build your recurring income stream.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Download Your Guide</h3>
                  <p className="text-gray-600">Get instant access to the complete Membership Mastery system and start building today.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Follow the System</h3>
                  <p className="text-gray-600">Use the step-by-step guide to build your membership site from scratch.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Start Earning</h3>
                  <p className="text-gray-600">Begin implementing the strategies to create your recurring income stream.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Micro-Offer CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white mb-6">
            <h3 className="text-2xl font-bold mb-4">🚀 Ready to Scale Faster?</h3>
            <p className="text-lg mb-6 opacity-90">
              Get a Done-For-You funnel consultation and skip the learning curve. 
              Let us build your membership funnel while you focus on your content.
            </p>
            <Link 
              to="/dfy-funnel-consultation" 
              onClick={() => hjEvent("membership_mastery_dfy_consult_click")}
              className="inline-block bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              💼 DFY Funnel Consult - $197
            </Link>
            <p className="mt-3 text-sm opacity-90">Includes custom funnel design and setup.</p>
            <p className="text-sm opacity-80">7-day refund, no questions asked.</p>
          </div>

          {/* Revenue Ripple CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-4">Want to Earn Recurring Revenue While You Learn?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join Revenue Ripple and get access to 46+ comprehensive marketing tutorials, AI-powered strategies, 
              and our exclusive affiliate program where you can earn $47/month per referral - sent straight to your PayPal!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                onClick={() => hjEvent("membership_mastery_explore_revenue_ripple_click")}
                className="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🚀 Explore Revenue Ripple
              </Link>
              <Link 
                to="/reseller" 
                onClick={() => hjEvent("membership_mastery_join_reseller_click")}
                className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors"
              >
                💰 Join Reseller Program
              </Link>
            </div>
          </div>

          {/* Social Proof / Testimonials */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Real people, real momentum</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need help getting started? We're here to support you.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                onClick={() => hjEvent("membership_mastery_support_click")}
                href="mailto:support@revenueripple.org?subject=Support Request - Membership Mastery&amp;body=Hi Support Team,%0D%0A%0D%0AI need help with my Membership Mastery guide.%0D%0A%0D%0APlease provide details about your issue below:%0D%0A%0D%0A%0D%0A%0D%0AThanks!"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Get Support
              </a>
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