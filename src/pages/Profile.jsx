import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import '../pages.css';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        role: user.role || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return (
      <div className="dashboard">
        <Navbar />
        <header className="dashboard-header">
          <div className="container">
            <h1 className="dashboard-title">Access Required</h1>
            <p className="dashboard-welcome">Please log in to view your profile</p>
          </div>
        </header>
        <div className="container dashboard-content">
          <div className="section">
            <div className="section-content">
              <div className="course-item">
                <div className="course-details">
                  <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    You need to be logged in to access your profile settings.
                  </p>
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => navigate('/login')}
                      className="cta-button"
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      
      {/* Profile Header */}
      <header className="dashboard-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1.5rem',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}>
                <FaUser style={{ fontSize: '2rem', color: 'white' }} />
              </div>
              <div>
                <h1 className="dashboard-title">{user.name || 'Your Profile'}</h1>
                <p className="dashboard-welcome">
                  {user.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account` : 'Member Account'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="cta-button"
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {isEditing ? (
                <>
                  <FaTimes style={{ marginRight: '0.5rem' }} />
                  Cancel
                </>
              ) : (
                <>
                  <FaEdit style={{ marginRight: '0.5rem' }} />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container dashboard-content">
        <div className="main-content">
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">👤</div>
              <h2>Personal Information</h2>
            </div>
            <div className="section-content">
              <form onSubmit={handleSubmit}>
                <div className="course-item">
                  <div className="course-details">
                    {/* Name */}
                    <div className="form-group">
                      <label style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                        <FaUser style={{ marginRight: '0.5rem' }} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input"
                        style={{
                          background: isEditing ? '#ffffff' : '#f9fafb',
                          border: '1px solid #d1d5db',
                          color: '#1f2937',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          width: '100%',
                          marginBottom: '1rem'
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                        <FaEnvelope style={{ marginRight: '0.5rem' }} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input"
                        style={{
                          background: isEditing ? '#ffffff' : '#f9fafb',
                          border: '1px solid #d1d5db',
                          color: '#1f2937',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          width: '100%',
                          marginBottom: '1rem'
                        }}
                      />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                        <FaPhone style={{ marginRight: '0.5rem' }} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="Enter your phone number"
                        style={{
                          background: isEditing ? '#ffffff' : '#f9fafb',
                          border: '1px solid #d1d5db',
                          color: '#1f2937',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          width: '100%',
                          marginBottom: '1rem'
                        }}
                      />
                    </div>

                    {/* Company */}
                    <div className="form-group">
                      <label style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                        <FaBuilding style={{ marginRight: '0.5rem' }} />
                        Company/Business Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="Enter your company name"
                        style={{
                          background: isEditing ? '#ffffff' : '#f9fafb',
                          border: '1px solid #d1d5db',
                          color: '#1f2937',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          width: '100%',
                          marginBottom: '1rem'
                        }}
                      />
                    </div>

                    {/* Bio */}
                    <div className="form-group">
                      <label style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                        About You
                      </label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="Tell us about yourself and your marketing goals..."
                        style={{
                          background: isEditing ? '#ffffff' : '#f9fafb',
                          border: '1px solid #d1d5db',
                          color: '#1f2937',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          width: '100%',
                          marginBottom: '1rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                          type="submit"
                          className="cta-button"
                        >
                          <FaSave style={{ marginRight: '0.5rem' }} />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* Side Content */}
        <div className="side-content">
          {/* Account Status */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">⭐</div>
              <h2>Account Status</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <div className="course-details">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ 
                      background: user.role === 'pro_reseller' ? '#10B981' : user.role === 'reseller' ? '#F59E0B' : '#3B82F6',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {user.role ? user.role.replace('_', ' ').toUpperCase() : 'MEMBER'}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    {user.role === 'pro_reseller' 
                      ? 'You have access to all premium features and earn 100% commission on every sale.'
                      : user.role === 'reseller'
                      ? 'You can resell memberships and earn 100% commission on every other sale.'
                      : user.role === 'affiliate'
                      ? 'You can promote products and earn commissions on successful referrals.'
                      : 'Access to all member training and resources.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Account Actions */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">🚀</div>
              <h2>Quick Actions</h2>
            </div>
            <div className="section-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {user.role !== 'pro_reseller' && (
                  <button 
                    onClick={() => navigate('/affiliate-centre/tools')}
                    className="cta-link"
                    style={{ textAlign: 'left', padding: '0.75rem' }}
                  >
                    <span className="item-icon">🛠️</span>
                    Marketing Tools
                  </button>
                )}
                <button 
                  onClick={() => navigate('/affiliate-centre/training')}
                  className="cta-link"
                  style={{ textAlign: 'left', padding: '0.75rem' }}
                >
                  <span className="item-icon">📚</span>
                  Training & Guides
                </button>
                <button 
                  onClick={() => navigate('/affiliate-centre/payouts')}
                  className="cta-link"
                  style={{ textAlign: 'left', padding: '0.75rem' }}
                >
                  <span className="item-icon">💰</span>
                  Earnings & Payouts
                </button>
                <button 
                  onClick={() => navigate('/affiliate-centre/support')}
                  className="cta-link"
                  style={{ textAlign: 'left', padding: '0.75rem' }}
                >
                  <span className="item-icon">💬</span>
                  Support & FAQ
                </button>
              </div>
            </div>
          </section>

          {/* Upgrade Options */}
          {user.role !== 'pro_reseller' && (
            <section className="section">
              <div className="section-header reseller">
                <div className="section-icon">⬆️</div>
                <h2>Upgrade Your Account</h2>
              </div>
              <div className="section-content">
                <div className="course-item">
                  <div className="course-details">
                    {user.role === 'affiliate' && (
                      <>
                        <p style={{ color: '#374151', marginBottom: '1rem' }}>
                          Upgrade to Reseller and start earning 100% commission on every other membership sale.
                        </p>
                        <button 
                          onClick={() => navigate('/special')}
                          className="cta-button"
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        >
                          Become a Reseller
                        </button>
                      </>
                    )}
                    {(user.role === 'affiliate' || user.role === 'reseller') && (
                      <>
                        <p style={{ color: '#374151', marginBottom: '1rem', fontSize: '0.9rem' }}>
                          Pro Resellers earn 100% commission on EVERY sale and get exclusive marketing materials.
                        </p>
                        <button 
                          onClick={() => navigate('/affiliate-centre/tools')}
                          className="cta-button"
                          style={{ width: '100%' }}
                        >
                          Upgrade to Pro Reseller
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 