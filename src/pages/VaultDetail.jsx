import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AIAssistantWidget from '../components/AIAssistantWidget';
import '../pages.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const VaultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playbook, setPlaybook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    fetchPlaybook();
    
    // Handle sticky header
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const fetchPlaybook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vault/playbooks/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setPlaybook(data.playbook);
      } else {
        setError(data.error || 'Playbook not found');
      }
    } catch (err) {
      setError('Failed to fetch playbook. Please try again later.');
      console.error('Error fetching playbook:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatWeekDate = (publishedAt) => {
    if (!publishedAt) return '';
    const date = new Date(publishedAt);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleTagClick = (tag) => {
    navigate(`/vault?tag=${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <AIAssistantWidget 
          showWelcomeBubble={true} 
          pageContext="Vault - Playbook detail"
        />
        <div className="container dashboard-content" style={{ paddingTop: '2rem' }}>
          <div className="main-content">
            <div style={{ 
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '3rem',
              minHeight: '400px'
            }}>
              <div style={{ height: '32px', background: '#e9ecef', borderRadius: '4px', marginBottom: '1rem', width: '60%' }} />
              <div style={{ height: '20px', background: '#e9ecef', borderRadius: '4px', marginBottom: '2rem', width: '40%' }} />
              <div style={{ height: '16px', background: '#e9ecef', borderRadius: '4px', marginBottom: '1rem' }} />
              <div style={{ height: '16px', background: '#e9ecef', borderRadius: '4px', marginBottom: '1rem', width: '95%' }} />
              <div style={{ height: '16px', background: '#e9ecef', borderRadius: '4px', marginBottom: '1rem', width: '90%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playbook) {
    return (
      <div className="dashboard">
        <Navbar />
        <AIAssistantWidget 
          showWelcomeBubble={true} 
          pageContext="Vault - Playbook detail"
        />
        <div className="container dashboard-content" style={{ paddingTop: '2rem' }}>
          <div className="main-content">
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center',
              background: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <h2 style={{ color: '#495057', marginBottom: '1rem' }}>
                {error || 'Playbook not found'}
              </h2>
              <Link 
                to="/vault"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: '#2563eb',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                Back to Vault
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <AIAssistantWidget 
        showWelcomeBubble={true} 
        pageContext="Vault - Playbook detail"
      />
      
      {/* Sticky Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: '#ffffff',
          borderBottom: '1px solid #e9ecef',
          padding: '1rem 0',
          zIndex: 100,
          transition: 'all 0.3s ease',
          boxShadow: isSticky ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          display: isSticky ? 'block' : 'none'
        }}
      >
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1a1a1a',
                margin: 0
              }}>
                {playbook.title}
              </h2>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6c757d',
                margin: '0.25rem 0 0 0'
              }}>
                {formatWeekDate(playbook.published_at)}
              </p>
            </div>
            <button
              onClick={() => navigate('/vault')}
              style={{
                padding: '0.5rem 1rem',
                background: '#e9ecef',
                color: '#495057',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ← Back to Vault
            </button>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* Header Section */}
          <div style={{ 
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid #e9ecef'
          }}>
            <Link 
              to="/vault"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6c757d',
                textDecoration: 'none',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#6c757d'}
            >
              ← Back to Vault
            </Link>
            
            <div style={{ 
              fontSize: '0.875rem',
              color: '#6c757d',
              fontWeight: '500',
              marginBottom: '0.75rem'
            }}>
              {formatWeekDate(playbook.published_at)}
            </div>
            
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#1a1a1a',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              {playbook.title}
            </h1>

            {playbook.short_description && (
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#6c757d', 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                {playbook.short_description}
              </p>
            )}

            {/* Tags and Meta */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {playbook.tags && playbook.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {playbook.tags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTagClick(tag)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#e9ecef',
                        color: '#495057',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#2563eb';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#e9ecef';
                        e.target.style.color = '#495057';
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#6c757d'
              }}>
                <span>⏱️</span>
                <span>{playbook.estimated_read_time || '5 min'}</span>
              </div>
            </div>
          </div>

          {/* Playbook Body */}
          <div 
            className="playbook-body"
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#2d3748',
              maxWidth: '100%'
            }}
            dangerouslySetInnerHTML={{ 
              __html: playbook.full_body 
                ? playbook.full_body.replace(/\n/g, '<br />') 
                : '<p>Content coming soon...</p>' 
            }}
          />

          {/* AI Assistant CTA */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Dive deeper with Ripple AI
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '1rem',
              marginBottom: '1.5rem'
            }}>
              Have questions about this playbook? Get personalized insights and strategies.
            </p>
            <button
              onClick={() => {
                // Open AI Assistant - this would need to be implemented based on your AI widget
                const aiWidget = document.querySelector('[data-ai-widget]');
                if (aiWidget) {
                  aiWidget.click();
                }
              }}
              style={{
                padding: '0.75rem 2rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Open AI Assistant
            </button>
          </div>
        </div>

        {/* Side Content */}
        <div className="side-content">
          <div className="section">
            <div className="section-header">
              <div className="section-icon">📚</div>
              <h2>Related Resources</h2>
            </div>
            <div className="section-content">
              <Link to="/training" className="cta-link" style={{ display: 'block', marginBottom: '0.75rem' }}>
                <span className="item-icon">📖</span>
                Training Center
              </Link>
              <Link to="/courses" className="cta-link" style={{ display: 'block', marginBottom: '0.75rem' }}>
                <span className="item-icon">🎓</span>
                Courses
              </Link>
              <Link to="/vault" className="cta-link" style={{ display: 'block' }}>
                <span className="item-icon">📚</span>
                All Playbooks
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultDetail;
