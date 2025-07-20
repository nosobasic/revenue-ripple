import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthService } from '../services/authService';
import { AffiliateUtils } from '../utils/affiliateUtils';
import Navbar from '../components/Navbar';
import '../pages.css';

export default function AffiliateSignupFixed() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactEmail: '',
    paypal: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      const validation = AffiliateUtils.validateAffiliateData(formData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Create user account
      const authUser = await AuthService.signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (!authUser) throw new Error('Failed to create user account');

      // Update user to affiliate role with additional data
      const { error: profileError } = await supabase
        .from('users')
        .update({
          role: 'affiliate',
          status: 'active',
          plan: 'affiliate',
          contact_email: formData.contactEmail,
          paypal_email: formData.paypal,
          commission_rate: 0.5, // Default commission rate for affiliates (50%)
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);

      if (profileError) throw profileError;

      // Show success message and redirect
      alert('Affiliate account created successfully! You can now start earning commissions.');
      navigate('/special-invite');
    } catch (err) {
      console.error('Affiliate signup error:', err);
      setError(err.message || 'Failed to create affiliate account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container auth-container">
        <div className="auth-box" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <div className="auth-header">
            <h1 className="auth-title">Create Your Affiliate Account</h1>
            <p className="auth-subtitle">
              Join our affiliate program and start earning commissions today!
            </p>
          </div>
          
          <div className="auth-form">
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              So you've decided to become an affiliate for this awesome membership site. That's fantastic! 
              As someone who loves spreading the word about things that I'm passionate about, I think it's 
              awesome that you're doing the same. Plus, you'll earn some commission along the way - that's a win-win, right?
              <br /><br />
              To get started, fill the form below. As soon as you sign up, I'm going to send you all the tools 
              you need to start making bank. You can use 'em to drive traffic to your link or advertise in 
              other ways and start earning commissions right away.
              <br /><br />
              Here's the deal: for every person you refer to us, you'll get a <strong>50% commission</strong>. 
              That means serious earning potential as you build your affiliate business.
              <br /><br />
              And the best part? That money is gonna go straight to your PayPal account, and there's no waiting 
              for monthly or bi-monthly payments. So why wait? Let's get started and make some serious cash together!
              <br /><br />
              <b>Please Note:</b> You must have a verified Premier or Business PayPal account in order to receive affiliate payments.
            </p>

            {error && (
              <div className="error-message" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="First Name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Contact Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Contact email for affiliate communications"
                />
              </div>

              <div className="form-group">
                <label htmlFor="paypal">PayPal Email *</label>
                <input
                  type="email"
                  id="paypal"
                  name="paypal"
                  value={formData.paypal}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="PayPal email for commission payments"
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  This is where your commission payments will be sent
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="form-input"
                    placeholder="Choose a password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="form-input"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  background: loading ? '#9ca3af' : '#3b82f6',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Affiliate Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ color: '#6b7280' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/affiliate/login')}
                  className="auth-link"
                  style={{ background: 'none', border: 'none', textDecoration: 'underline' }}
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}