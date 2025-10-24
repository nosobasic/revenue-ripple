import Navbar from '../components/Navbar';
import '../pages.css';

export default function PrivacyPolicy() {
  return (
    <div className="auth-container">
      <Navbar />
      <div className="container" style={{ maxWidth: '900px', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Last updated: October 24, 2024
        </p>

        <div style={{ lineHeight: '1.8', color: '#374151' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              1. Introduction
            </h2>
            <p>
              Revenue Ripple ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our website and services at revenueripple.org.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              2. Information We Collect
            </h2>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>
              Personal Information
            </h3>
            <p>When you register for an account, we collect:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Name (first and last)</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', marginTop: '1rem', color: '#1f2937' }}>
              Social Login Information
            </h3>
            <p>When you sign in using Google, Facebook, or Apple, we receive:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Your name</li>
              <li>Your email address</li>
              <li>Profile picture (if available)</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', marginTop: '1rem', color: '#1f2937' }}>
              Usage Information
            </h3>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Course progress and completion data</li>
              <li>Login history</li>
              <li>Device and browser information</li>
              <li>IP address</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Provide and maintain our services</li>
              <li>Process your payments and transactions</li>
              <li>Send you course updates and notifications</li>
              <li>Improve our platform and user experience</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              4. Information Sharing and Disclosure
            </h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li><strong>Service Providers:</strong> Supabase (database), Stripe (payments), Hotjar (analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security measures to protect 
              your personal information. However, no method of transmission over the Internet is 
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>
              To exercise these rights, please visit our <a href="/data-deletion" style={{ color: '#2563eb', textDecoration: 'underline' }}>Data Deletion page</a> or contact us at support@revenueripple.org.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              7. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service 
              and hold certain information. You can instruct your browser to refuse all cookies 
              or to indicate when a cookie is being sent.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              8. Third-Party Services
            </h2>
            <p>Our service integrates with:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li><strong>Google OAuth:</strong> Subject to Google's Privacy Policy</li>
              <li><strong>Facebook Login:</strong> Subject to Facebook's Data Policy</li>
              <li><strong>Apple Sign In:</strong> Subject to Apple's Privacy Policy</li>
              <li><strong>Stripe:</strong> For payment processing</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              9. Children's Privacy
            </h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              10. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Last 
              updated" date.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              11. Contact Us
            </h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem', listStyle: 'none' }}>
              <li><strong>Email:</strong> support@revenueripple.org</li>
              <li><strong>Website:</strong> https://revenueripple.org</li>
            </ul>
          </section>
        </div>
      </div>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Revenue Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

