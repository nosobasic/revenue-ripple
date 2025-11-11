import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

const DFYFunnelConsultation = () => {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaO8invI2lpY5BCpQWA2d4C8UhXLihhM58VVlgCSFPXjxO2uoBGZLdohjHbHvBjOoU4g/exec';

  const initialFormData = {
    fullName: '',
    email: '',
    businessName: '',
    website: '',
    industry: '',
    offerDescription: '',
    funnelGoal: '',
    funnelProblem: '',
    offerPromoting: '',
    offerPrice: '',
    hasAssets: '',
    assetsLink: '',
    idealCustomer: '',
    customerPain: '',
    acquisitionChannels: '',
    funnelType: '',
    copyPreference: '',
    designPreferences: '',
    currentTools: '',
    domainSetup: '',
    needPayments: '',
    launchTimeline: '',
    budgetRange: '',
    callTopics: '',
    referralSource: ''
  };

  const funnelGoalOptions = [
    'Generate leads',
    'Sell a product',
    'Book calls',
    'Grow email list',
    'Launch offer',
    'Onboard clients',
    'Other'
  ];

  const funnelTypeOptions = [
    'Lead generation funnel',
    'Sales page funnel',
    'Webinar funnel',
    'Application funnel',
    'Tripwire funnel',
    'Challenge funnel',
    'Other / Not sure'
  ];

  const copyPreferenceOptions = [
    'You write the copy',
    "I’ll provide the copy",
    'Mix of both'
  ];

  const budgetOptions = [
    'Under $1k',
    '$1k - $3k',
    '$3k - $5k',
    '$5k - $10k',
    '$10k+',
    'Not sure yet'
  ];

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  const requiredFields = [
    'fullName',
    'email',
    'businessName',
    'industry',
    'offerDescription',
    'funnelGoal',
    'offerPromoting',
    'offerPrice',
    'funnelType',
    'copyPreference',
    'launchTimeline',
    'budgetRange'
  ];

  const sanitizeUrl = (value) => {
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed.length === 0) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const validateForm = (data) => {
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!data[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    const urlPattern = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;

    if (data.website && !urlPattern.test(data.website.trim())) {
      newErrors.website = 'Enter a valid URL (example: https://yourwebsite.com)';
    }

    if (data.assetsLink && !urlPattern.test(data.assetsLink.trim())) {
      newErrors.assetsLink = 'Enter a valid URL (example: https://drive.google.com/your-folder)';
    }

    return newErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage('');
    setStatusType('');

    const normalizedData = {
      ...formData,
      website: sanitizeUrl(formData.website),
      assetsLink: sanitizeUrl(formData.assetsLink)
    };

    setFormData(normalizedData);

    const validationErrors = validateForm(normalizedData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = new URLSearchParams();
    Object.entries(normalizedData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    const fallbackPayload = new FormData();
    Object.entries(normalizedData).forEach(([key, value]) => {
      fallbackPayload.append(key, value);
    });

    const dataSnapshot = { ...normalizedData };

    const submitWithCors = async () => {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: payload.toString(),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      let result = null;
      try {
        result = await response.json();
      } catch (err) {
        // If the Apps Script returns plain text, fall back to text parsing
        const text = await response.text();
        if (text && text.trim().length > 0) {
          result = JSON.parse(text);
        }
      }

      if (result && result.success === false) {
        throw new Error(result.error || 'Submission failed');
      }
    };

    const submitWithNoCors = async () => {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: fallbackPayload,
        mode: 'no-cors',
        credentials: 'omit'
      });
    };

    try {
      let submitted = false;
      try {
        await submitWithCors();
        submitted = true;
      } catch (corsError) {
        console.warn('CORS submission failed, attempting fallback:', corsError);
        await submitWithNoCors();
        submitted = true;
      }

      if (!submitted) {
        throw new Error('Unable to submit intake form.');
      }

      hjEvent('dfy_consultation_form_submit');

      setStatusMessage("Thanks! Redirecting you to pick a time on Calendly…");
      setStatusType('success');
      setFormData(initialFormData);

      const redirectTarget = buildCalendlyUrl(dataSnapshot);

      setTimeout(() => {
        window.location.assign(redirectTarget);
      }, 1200);
    } catch (error) {
      console.error('Failed to submit intake form:', error);
      setStatusMessage('We couldn’t save your intake. Please check your connection and try again.');
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildCalendlyUrl = (data) => {
    const url = new URL(CALENDLY_URL);
    if (data.fullName) {
      url.searchParams.set('name', data.fullName);
    }
    if (data.email) {
      url.searchParams.set('email', data.email);
    }
    if (data.funnelGoal) {
      url.searchParams.set('customAnswers[0]', data.funnelGoal);
    }
    if (data.launchTimeline) {
      url.searchParams.set('customAnswers[1]', data.launchTimeline);
    }
    return url.toString();
  };

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
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Complete this short intake so we can prepare for your call and quote a fair price.
                </p>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6">
                  <h3 className="text-2xl font-bold mb-2">Investment: $197</h3>
                  <p className="opacity-90">
                    Includes 60-min strategy session + funnel blueprint + implementation roadmap.
                  </p>
                  <p className="text-sm opacity-80 mt-2">
                    Bonus: $97 credit toward full DFY funnel setup if you decide to move forward.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  We&apos;ll send your answers to Google Sheets and then send you to Calendly to book your call.
                </p>
              </div>

              {statusMessage && (
                <div
                  className={`rounded-lg p-4 text-sm ${
                    statusType === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              {/* Business Background */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Business Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="fullName">
                      Your name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Jane Doe"
                    />
                    {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="you@business.com"
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="businessName">
                      Business name *
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Acme Marketing Co."
                    />
                    {errors.businessName && <p className="text-sm text-red-600">{errors.businessName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="website">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://yourwebsite.com"
                    />
                    {errors.website && <p className="text-sm text-red-600">{errors.website}</p>}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="industry">
                      Industry or niche *
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Coaching, SaaS, eCommerce, service business..."
                    />
                    {errors.industry && <p className="text-sm text-red-600">{errors.industry}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="offerDescription">
                      What do you sell? *
                    </label>
                    <textarea
                      id="offerDescription"
                      name="offerDescription"
                      value={formData.offerDescription}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of your product/service/offer."
                    />
                    {errors.offerDescription && <p className="text-sm text-red-600">{errors.offerDescription}</p>}
                  </div>
                </div>
              </section>

              {/* Funnel Goal */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Funnel Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="funnelGoal">
                      What&apos;s the primary goal for this funnel? *
                    </label>
                    <select
                      id="funnelGoal"
                      name="funnelGoal"
                      value={formData.funnelGoal}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select a goal</option>
                      {funnelGoalOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.funnelGoal && <p className="text-sm text-red-600">{errors.funnelGoal}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="funnelProblem">
                      What problem are you trying to solve with this funnel?
                    </label>
                    <textarea
                      id="funnelProblem"
                      name="funnelProblem"
                      value={formData.funnelProblem}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Share a few sentences about the challenge you want to fix."
                    />
                  </div>
                </div>
              </section>

              {/* Offer Details */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Offer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="offerPromoting">
                      What are you promoting in this funnel? *
                    </label>
                    <input
                      id="offerPromoting"
                      name="offerPromoting"
                      type="text"
                      value={formData.offerPromoting}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Course, coaching, product, event, etc."
                    />
                    {errors.offerPromoting && <p className="text-sm text-red-600">{errors.offerPromoting}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="offerPrice">
                      Price point *
                    </label>
                    <input
                      id="offerPrice"
                      name="offerPrice"
                      type="text"
                      value={formData.offerPrice}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="$197, $1,997, etc."
                    />
                    {errors.offerPrice && <p className="text-sm text-red-600">{errors.offerPrice}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="hasAssets">
                      Do you already have an offer page or assets?
                    </label>
                    <select
                      id="hasAssets"
                      name="hasAssets"
                      value={formData.hasAssets}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="In progress">In progress</option>
                    </select>
                  </div>
                  {formData.hasAssets === 'Yes' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="assetsLink">
                        Link to assets or folder
                      </label>
                      <input
                        id="assetsLink"
                        name="assetsLink"
                        type="url"
                        value={formData.assetsLink}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://drive.google.com/..."
                      />
                      {errors.assetsLink && <p className="text-sm text-red-600">{errors.assetsLink}</p>}
                    </div>
                  )}
                </div>
              </section>

              {/* Audience Insight */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Audience Insight</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="idealCustomer">
                      Who&apos;s your ideal customer?
                    </label>
                    <textarea
                      id="idealCustomer"
                      name="idealCustomer"
                      value={formData.idealCustomer}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Demographics, role, mindset, etc."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="customerPain">
                      Biggest pain or desire?
                    </label>
                    <textarea
                      id="customerPain"
                      name="customerPain"
                      value={formData.customerPain}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="What do they care about most?"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="acquisitionChannels">
                      How do customers find you today?
                    </label>
                    <textarea
                      id="acquisitionChannels"
                      name="acquisitionChannels"
                      value={formData.acquisitionChannels}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Social, ads, referrals, partnerships, etc."
                    />
                  </div>
                </div>
              </section>

              {/* Funnel Preferences */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Funnel Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="funnelType">
                      What type of funnel are you considering? *
                    </label>
                    <select
                      id="funnelType"
                      name="funnelType"
                      value={formData.funnelType}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select funnel type</option>
                      {funnelTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.funnelType && <p className="text-sm text-red-600">{errors.funnelType}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="copyPreference">
                      Do you want me to write the copy? *
                    </label>
                    <select
                      id="copyPreference"
                      name="copyPreference"
                      value={formData.copyPreference}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select an option</option>
                      {copyPreferenceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.copyPreference && <p className="text-sm text-red-600">{errors.copyPreference}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="designPreferences">
                      Any design or branding preferences?
                    </label>
                    <textarea
                      id="designPreferences"
                      name="designPreferences"
                      value={formData.designPreferences}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Colors, vibe, inspiration links, etc."
                    />
                  </div>
                </div>
              </section>

              {/* Tech + Integrations */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Tech & Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="currentTools">
                      What tools are you currently using?
                    </label>
                    <textarea
                      id="currentTools"
                      name="currentTools"
                      value={formData.currentTools}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="GetResponse, Stripe, Calendly, CRM, Zapier, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="domainSetup">
                      Do you have a domain & hosting set up?
                    </label>
                    <select
                      id="domainSetup"
                      name="domainSetup"
                      value={formData.domainSetup}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Working on it">Working on it</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="needPayments">
                      Do you need payment processing set up?
                    </label>
                    <select
                      id="needPayments"
                      name="needPayments"
                      value={formData.needPayments}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Not sure yet">Not sure yet</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Timeline + Budget */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Timeline & Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="launchTimeline">
                      Timeline or launch date *
                    </label>
                    <input
                      id="launchTimeline"
                      name="launchTimeline"
                      type="text"
                      value={formData.launchTimeline}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. Mid March, ASAP, within 60 days"
                    />
                    {errors.launchTimeline && <p className="text-sm text-red-600">{errors.launchTimeline}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="budgetRange">
                      Budget range for the full project *
                    </label>
                    <select
                      id="budgetRange"
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select a range</option>
                      {budgetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.budgetRange && <p className="text-sm text-red-600">{errors.budgetRange}</p>}
                  </div>
                </div>
              </section>

              {/* Call Prep */}
              <section>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. Call Prep</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="callTopics">
                      Anything specific you want to discuss on the call?
                    </label>
                    <textarea
                      id="callTopics"
                      name="callTopics"
                      value={formData.callTopics}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Share any details, questions, or context you want me to know."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="referralSource">
                      How did you hear about me?
                    </label>
                    <input
                      id="referralSource"
                      name="referralSource"
                      type="text"
                      value={formData.referralSource}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Instagram, YouTube, referral, ad, Revenue Ripple, etc."
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-200 pt-6 flex items-center justify-between flex-col sm:flex-row gap-4">
                <p className="text-sm text-gray-500">
                  By submitting you agree to be contacted about this project. We&apos;ll never spam you.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Intake & Book Call'}
                </button>
              </div>
            </form>
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
