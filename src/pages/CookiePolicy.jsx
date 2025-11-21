import Footer from '../components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 mb-6">
                Cookies are small text files that are placed on your computer or mobile device when you 
                visit a website. They are widely used to make websites work more efficiently and to 
                provide information to website owners.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">
                Revenue Ripple uses cookies for several purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> We use these to understand how visitors interact with our website</li>
                <li><strong>Marketing Cookies:</strong> These help us deliver relevant advertisements</li>
                <li><strong>Preference Cookies:</strong> These remember your settings and preferences</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are essential for you to browse the website and use its features. 
                Without these cookies, services like shopping carts and e-billing cannot be provided.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies collect information about how you use our website, such as which 
                pages you visit most often. This data helps us optimize our website performance.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Functionality Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies allow the website to remember choices you make and provide enhanced, 
                more personal features. For example, they may remember your login details.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Targeting/Advertising Cookies</h3>
              <p className="text-gray-700 mb-6">
                These cookies are used to deliver advertisements more relevant to you and your interests. 
                They also limit the number of times you see an advertisement and help measure the 
                effectiveness of advertising campaigns.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may also use third-party cookies from trusted partners such as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
                <li><strong>Facebook Pixel:</strong> To track conversions and optimize advertising</li>
                <li><strong>Payment Processors:</strong> To securely process transactions</li>
                <li><strong>Email Marketing:</strong> To track email engagement and deliverability</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in various ways:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies</li>
                <li><strong>Cookie Preferences:</strong> Use our cookie preference center when available</li>
                <li><strong>Opt-Out Tools:</strong> Use industry opt-out tools for advertising cookies</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
              <p className="text-gray-700 mb-6">
                Cookies have different lifespans. Session cookies are deleted when you close your browser, 
                while persistent cookies remain on your device for a set period or until you delete them. 
                We typically retain cookies for 30 days to 2 years, depending on their purpose.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any 
                material changes by posting the updated policy on our website.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <p className="text-gray-700">
                Email: <a href="mailto:privacy@revenueripple.org" className="text-blue-600 hover:text-blue-700">privacy@revenueripple.org</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
