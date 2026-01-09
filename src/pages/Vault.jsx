import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AIAssistantWidget from '../components/AIAssistantWidget';
import '../pages.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const Vault = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [layout, setLayout] = useState('grid'); // 'grid' or 'carousel'

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vault/playbooks`);
      const data = await response.json();
      
      if (data.success) {
        setPlaybooks(data.playbooks || []);
      } else {
        setError(data.error || 'Failed to load playbooks');
      }
    } catch (err) {
      setError('Failed to fetch playbooks. Please try again later.');
      console.error('Error fetching playbooks:', err);
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

  const getUniqueTags = () => {
    const tagSet = new Set();
    playbooks.forEach(playbook => {
      if (playbook.tags && Array.isArray(playbook.tags)) {
        playbook.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  };

  const filteredPlaybooks = selectedTag
    ? playbooks.filter(p => p.tags && p.tags.includes(selectedTag))
    : playbooks;

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <AIAssistantWidget 
          showWelcomeBubble={true} 
          pageContext="Vault - Weekly playbooks"
        />
        <header className="dashboard-header">
          <div className="container">
            <h1 className="dashboard-title">VAULT</h1>
            <div className="dashboard-welcome">Weekly Playbooks</div>
          </div>
        </header>
        <div className="container dashboard-content">
          <div className="main-content">
            <div className="skeleton-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem',
              padding: '2rem 0'
            }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="playbook-skeleton" style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  minHeight: '280px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                  <div style={{ height: '24px', background: '#e9ecef', borderRadius: '4px', marginBottom: '1rem' }} />
                  <div style={{ height: '16px', background: '#e9ecef', borderRadius: '4px', width: '60%', marginBottom: '0.5rem' }} />
                  <div style={{ height: '16px', background: '#e9ecef', borderRadius: '4px', width: '80%' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Navbar />
        <AIAssistantWidget 
          showWelcomeBubble={true} 
          pageContext="Vault - Weekly playbooks"
        />
        <header className="dashboard-header">
          <div className="container">
            <h1 className="dashboard-title">VAULT</h1>
            <div className="dashboard-welcome">Weekly Playbooks</div>
          </div>
        </header>
        <div className="container dashboard-content">
          <div className="main-content">
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center',
              background: '#f8f9fa',
              borderRadius: '12px',
              margin: '2rem 0'
            }}>
              <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '1rem' }}>
                {error}
              </p>
              <button 
                onClick={fetchPlaybooks}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Try Again
              </button>
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
        pageContext="Vault - Weekly playbooks"
      />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">VAULT</h1>
          <div className="dashboard-welcome">Weekly Playbooks</div>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* Filter and Layout Controls */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  padding: '0.5rem 1rem',
                  background: selectedTag === null ? '#2563eb' : '#e9ecef',
                  color: selectedTag === null ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                All
              </button>
              {getUniqueTags().map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: selectedTag === tag ? '#2563eb' : '#e9ecef',
                    color: selectedTag === tag ? 'white' : '#495057',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setLayout('grid')}
                style={{
                  padding: '0.5rem',
                  background: layout === 'grid' ? '#2563eb' : '#e9ecef',
                  color: layout === 'grid' ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ⚏ Grid
              </button>
              <button
                onClick={() => setLayout('carousel')}
                style={{
                  padding: '0.5rem',
                  background: layout === 'carousel' ? '#2563eb' : '#e9ecef',
                  color: layout === 'carousel' ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ⏍ Carousel
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredPlaybooks.length === 0 && (
            <div style={{ 
              padding: '4rem 2rem', 
              textAlign: 'center',
              background: '#f8f9fa',
              borderRadius: '12px',
              margin: '2rem 0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ color: '#495057', marginBottom: '0.5rem' }}>
                {selectedTag ? `No playbooks with tag "${selectedTag}"` : 'No playbooks yet'}
              </h3>
              <p style={{ color: '#6c757d', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                {selectedTag 
                  ? 'Try selecting a different tag or view all playbooks.'
                  : 'Weekly playbooks are published regularly. Check back soon for new content to help guide your journey.'}
              </p>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  View All Playbooks
                </button>
              )}
            </div>
          )}

          {/* Playbooks Grid */}
          {filteredPlaybooks.length > 0 && (
            <div 
              className="playbooks-container"
              style={{
                display: layout === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'none',
                gap: '1.5rem',
                overflowX: layout === 'carousel' ? 'auto' : 'visible',
                padding: layout === 'carousel' ? '1rem 0' : '0',
                scrollBehavior: 'smooth'
              }}
            >
              {filteredPlaybooks.map((playbook) => (
                <PlaybookCard 
                  key={playbook.id} 
                  playbook={playbook} 
                  formatWeekDate={formatWeekDate}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side Content */}
        <div className="side-content">
          <div className="section">
            <div className="section-header">
              <div className="section-icon">📚</div>
              <h2>About the Vault</h2>
            </div>
            <div className="section-content">
              <p style={{ color: '#6c757d', lineHeight: '1.6', fontSize: '0.95rem' }}>
                The Vault contains your weekly playbooks—premium content designed to guide your progress. Each playbook is a living asset, updated regularly to reflect the latest strategies and insights.
              </p>
              <p style={{ color: '#6c757d', lineHeight: '1.6', fontSize: '0.95rem', marginTop: '1rem' }}>
                New playbooks are published weekly, so check back regularly to stay ahead.
              </p>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div className="section-icon">💡</div>
              <h2>Quick Links</h2>
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
              <Link to="/dashboard" className="cta-link" style={{ display: 'block' }}>
                <span className="item-icon">🏠</span>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaybookCard = ({ playbook, formatWeekDate, navigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="playbook-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/vault/${playbook.id}`)}
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e9ecef',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
        opacity: isHovered ? 1 : 0.95,
        minWidth: '320px'
      }}
    >
      <div style={{ 
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#6c757d',
        fontWeight: '500'
      }}>
        {formatWeekDate(playbook.published_at)}
      </div>
      
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        color: '#1a1a1a',
        marginBottom: '0.75rem',
        lineHeight: '1.4'
      }}>
        {playbook.title}
      </h3>

      {playbook.short_description && (
        <p style={{ 
          color: '#6c757d', 
          fontSize: '0.95rem', 
          lineHeight: '1.6',
          marginBottom: '1rem'
        }}>
          {playbook.short_description.length > 120 
            ? `${playbook.short_description.substring(0, 120)}...` 
            : playbook.short_description}
        </p>
      )}

      {playbook.tags && playbook.tags.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {playbook.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              style={{
                padding: '0.25rem 0.75rem',
                background: '#e9ecef',
                color: '#495057',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid #e9ecef'
      }}>
        <span style={{ 
          fontSize: '0.875rem', 
          color: '#6c757d',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          ⏱️ {playbook.estimated_read_time || '5 min'}
        </span>
        <div
          style={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            color: '#2563eb',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          Open Playbook →
        </div>
      </div>
    </div>
  );
};

export default Vault;
