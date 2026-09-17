import { COMPANY_MAILING_ADDRESS, COMPANY_SUPPORT_EMAIL } from '../config/constants';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                opt in on a form, make a purchase, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Name and email address</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Account preferences and settings</li>
                <li>Communication history with our support team</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Email we send</h2>
              <p className="text-gray-700 mb-4">
                If you submit your email on revenueripple.org (for example the Digital Marketing
                Domination or membership opt-in forms), you are asking us to send educational
                course emails. That is an explicit, single opt-in on our website — not a purchased,
                scraped, or rented list.
              </p>
              <p className="text-gray-700 mb-4">We send:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>A short welcome series (nine emails) after you opt in</li>
                <li>A 26-lesson course, one lesson every two weeks</li>
                <li>Occasional product or account updates to the same opted-in list</li>
              </ul>
              <p className="text-gray-700 mb-4">
                People who previously opted in on this site and received those emails through
                GetResponse are the same list. We are changing email providers. We do not buy lists.
              </p>
              <p className="text-gray-700 mb-6">
                You can unsubscribe at any time at{' '}
                <a href="/unsubscribe" className="text-blue-600 hover:text-blue-700">revenueripple.org/unsubscribe</a>
                , via the unsubscribe link in every email, or by emailing {COMPANY_SUPPORT_EMAIL}.
                We honor one-click List-Unsubscribe. Bounces and spam complaints are suppressed
                automatically and those addresses are not mailed again.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Provide, maintain, and improve our services</li>
                <li>Deliver the course and welcome emails you requested</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 mb-6">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share your information 
                with trusted third parties who assist us in operating our website and conducting our business.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet is 100% secure.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-6">
                We use cookies and similar tracking technologies to enhance your experience on our site. 
                You can control cookie settings through your browser preferences. For more information, 
                see our Cookie Policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-700 mb-2">
                Email:{' '}
                <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className="text-blue-600 hover:text-blue-700">
                  {COMPANY_SUPPORT_EMAIL}
                </a>
              </p>
              <p className="text-gray-700">{COMPANY_MAILING_ADDRESS}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;