import { useState } from 'react';
import Navbar from '../components/Navbar';
import '../pages.css';

export default function DataDeletion() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // For now, just show confirmation. You can later add API integration
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <Navbar />
      <div className="container" style={{ maxWidth: '900px', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>
          Data Deletion Instructions
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          We respect your right to privacy and data control
        </p>

        <div style={{ lineHeight: '1.8', color: '#374151' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Request Data Deletion
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              If you would like to delete your account and all associated data from Revenue Ripple, 
              please follow the instructions below. We will process your request within 30 days.
            </p>

            {!submitted ? (
              <div className="auth-box" style={{ maxWidth: '600px', margin: '2rem 0' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1f2937' }}>
                  Submit Deletion Request
                </h3>
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email">Account Email Address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="form-input"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="auth-button">
                    Submit Deletion Request
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ 
                background: '#ecfdf5', 
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '1.5rem',
                margin: '2rem 0'
              }}>
                <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>
                  ✓ Request Submitted
                </h3>
                <p style={{ color: '#047857', margin: 0 }}>
                  Your data deletion request has been received. We will process it within 30 days 
                  and send a confirmation to {email}.
                </p>
              </div>
            )}
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Alternative Methods
            </h2>
            
            <div style={{ 
              background: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                📧 Email Request
              </h3>
              <p style={{ margin: 0 }}>
                Send an email to <strong>support@revenueripple.org</strong> with the subject 
                "Data Deletion Request" and include your account email address.
              </p>
            </div>

            <div style={{ 
              background: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                👤 In-App Deletion
              </h3>
              <p style={{ margin: 0 }}>
                If you're logged in, you can delete your account from your{' '}
                <a href="/profile" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  Profile Settings
                </a>
                {' '}page.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              What Data Will Be Deleted?
            </h2>
            <p>When you request data deletion, we will remove:</p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Your account information (name, email, profile)</li>
              <li>Course progress and completion records</li>
              <li>Payment history (subject to legal retention requirements)</li>
              <li>Login and activity logs</li>
              <li>Any other personal data associated with your account</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Data Retention
            </h2>
            <p>
              Some data may be retained for legal, tax, or security purposes as required by law. 
              This includes:
            </p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li>Transaction records (retained for 7 years for tax purposes)</li>
              <li>Fraud prevention and security logs</li>
              <li>Legal compliance records</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Third-Party Data
            </h2>
            <p>
              If you signed in using Google, Facebook, or Apple, you may need to revoke access 
              to Revenue Ripple in your respective account settings:
            </p>
            <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
              <li><strong>Google:</strong> <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Google Account Permissions</a></li>
              <li><strong>Facebook:</strong> <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Facebook Apps Settings</a></li>
              <li><strong>Apple:</strong> Settings → Apple ID → Password & Security → Apps Using Apple ID</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Timeline
            </h2>
            <p>
              Data deletion requests are typically processed within <strong>30 days</strong>. 
              You will receive a confirmation email once your data has been deleted.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Questions?
            </h2>
            <p>
              If you have any questions about data deletion or privacy, please contact us at{' '}
              <a href="mailto:support@revenueripple.org" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                support@revenueripple.org
              </a>
              {' '}or visit our{' '}
              <a href="/privacy-policy" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                Privacy Policy
              </a>.
            </p>
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

