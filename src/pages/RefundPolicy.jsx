import Footer from '../components/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Refund Guarantee</h2>
              <p className="text-gray-700 mb-6">
                We stand behind our products and services with a comprehensive refund policy designed 
                to ensure your complete satisfaction. If you're not happy with your purchase, we'll 
                make it right.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Digital Products Refund Policy</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-semibold">
                  All digital products come with a 7-day money-back guarantee, no questions asked.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Eligible Products</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Digital Marketing Domination ebook and lessons</li>
                <li>Membership Mastery guide</li>
                <li>All downloadable resources and templates</li>
                <li>Video courses and training materials</li>
                <li>Software tools and applications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Refund Process</h3>
              <ol className="list-decimal pl-6 text-gray-700 mb-6">
                <li>Contact our support team within 7 days of purchase</li>
                <li>Provide your order number and reason for refund</li>
                <li>We'll process your refund within 5-10 business days</li>
                <li>Refund will be issued to your original payment method</li>
              </ol>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Services</h2>
              <p className="text-gray-700 mb-4">
                For recurring subscription services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Cancel anytime with 7-day notice</li>
                <li>No refunds for partial months</li>
                <li>Access continues until the end of your billing period</li>
                <li>Contact support to cancel your subscription</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Consulting Services</h2>
              <p className="text-gray-700 mb-4">
                For consulting and done-for-you services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>50% refund if cancelled before work begins</li>
                <li>No refunds once work has commenced</li>
                <li>Refunds processed within 10-15 business days</li>
                <li>All work completed remains property of Revenue Ripple</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Exceptions</h2>
              <p className="text-gray-700 mb-4">
                Refunds may not be available in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>More than 7 days have passed since purchase</li>
                <li>Product has been downloaded multiple times</li>
                <li>Account has been suspended for policy violations</li>
                <li>Fraudulent or suspicious activity detected</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Time</h2>
              <p className="text-gray-700 mb-6">
                Refunds are typically processed within 5-10 business days, depending on your 
                payment method. Credit card refunds may take 1-2 billing cycles to appear 
                on your statement.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
              <p className="text-gray-700 mb-4">
                To request a refund, please:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 mb-6">
                <li>Email us at <a href="mailto:refunds@revenueripple.org" className="text-blue-600 hover:text-blue-700">refunds@revenueripple.org</a></li>
                <li>Include your order number and reason for refund</li>
                <li>We'll respond within 24 hours</li>
                <li>Follow any additional instructions we provide</li>
              </ol>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
              <p className="text-gray-700 mb-6">
                If you're not satisfied with our refund decision, you may contact us to discuss 
                alternative solutions. We're committed to resolving all disputes fairly and promptly.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-6">
                For refund requests or questions about this policy:
              </p>
              <p className="text-gray-700">
                Email: <a href="mailto:refunds@revenueripple.org" className="text-blue-600 hover:text-blue-700">refunds@revenueripple.org</a><br/>
                Support: <a href="mailto:support@revenueripple.org" className="text-blue-600 hover:text-blue-700">support@revenueripple.org</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
