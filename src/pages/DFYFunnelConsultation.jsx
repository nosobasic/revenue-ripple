import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

const DFYFunnelConsultation = () => {
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);

  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => setIsCalendlyLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
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
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Let's Build Your Funnel — Together
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Skip the guesswork. In this private 1-on-1 session, I'll map your offer, funnel flow, 
              and automation so you can launch confidently — with your system ready to run.
            </p>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-4">🚀 DFY Funnel Fast Track</h2>
              <p className="text-lg opacity-90">
                Get your funnel strategy, implementation plan, and automation setup in one powerful session
              </p>
            </div>
          </div>

          {/* Quick Intro Video Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why This Works</h2>
            <div className="relative w-full rounded-xl overflow-hidden mb-6" style={{ paddingTop: "56.25%" }}>
              <iframe
                src="https://player.vimeo.com/video/1131714866?title=0&byline=0&portrait=0&badge=0&autopause=0"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title="Why This Works"
              />
            </div>
            <p className="text-gray-600 text-center">
              See how I've helped entrepreneurs build profitable funnels that convert visitors into customers
            </p>
          </div>

          {/* What's Included Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">60-Min Deep Dive Call</h3>
                    <p className="text-gray-600">Private 1-on-1 session to understand your business, goals, and current challenges</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Funnel Strategy + Wireframe</h3>
                    <p className="text-gray-600">Complete funnel blueprint with step-by-step flow and conversion optimization</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-xl">⚙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Automation Setup</h3>
                    <p className="text-gray-600">Get your email sequences and basic automation configured (optional implementation credit)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-xl">📈</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized Traffic Plan</h3>
                    <p className="text-gray-600">Custom strategy for driving qualified traffic to your new funnel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Real Results from Real People</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4" />
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

          {/* Calendly Booking Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-600 mb-6">
                Book your DFY Funnel Strategy Session and let's build something amazing together
              </p>
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6">
                <h3 className="text-2xl font-bold mb-2">Investment: $197</h3>
                <p className="opacity-90">
                  Includes 60-min strategy session + funnel blueprint + implementation roadmap
                </p>
                <p className="text-sm opacity-80 mt-2">
                  Bonus: $97 credit toward full DFY funnel setup if you decide to move forward
                </p>
              </div>
            </div>

            {/* Calendly Widget */}
            <div className="calendly-inline-widget" 
                 data-url="https://calendly.com/donte-binrichmediagroup/30min"
                 style={{ minWidth: '320px', height: '700px' }}>
            </div>
          </div>

          {/* Trust Elements */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white mb-12">
            <h3 className="text-2xl font-bold mb-4 text-center">🛡️ Risk-Free Guarantee</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="text-lg font-semibold mb-2">7-Day Money Back</h4>
                <p className="opacity-90 text-sm">Not satisfied? Get a full refund, no questions asked</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Proven System</h4>
                <p className="opacity-90 text-sm">Based on 100+ successful funnel implementations</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Personal Support</h4>
                <p className="opacity-90 text-sm">Direct access to Donte for questions and guidance</p>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Questions about the consultation? We're here to help.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                onClick={() => hjEvent("dfy_consultation_support_click")}
                href="mailto:support@revenueripple.org?subject=DFY Funnel Consultation Questions&amp;body=Hi Support Team,%0D%0A%0D%0AI have questions about the DFY Funnel Consultation.%0D%0A%0D%0APlease provide details about your question below:%0D%0A%0D%0A%0D%0A%0D%0AThanks!"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Get Support
              </a>
              <span className="text-gray-400">•</span>
              <a 
                href="/"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DFYFunnelConsultation;
