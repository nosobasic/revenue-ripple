import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const VaultPreview = () => {
  const [latestPlaybook, setLatestPlaybook] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestPlaybook();
  }, []);

  const fetchLatestPlaybook = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vault/playbooks`);
      const data = await response.json();
      
      if (data.success && data.playbooks && data.playbooks.length > 0) {
        setLatestPlaybook(data.playbooks[0]); // Get the most recent (first in list)
      }
    } catch (err) {
      console.error('Error fetching latest playbook:', err);
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

  if (loading || !latestPlaybook) {
    return null; // Don't show anything while loading or if no playbook
  }

  return (
    <div className="section mb-8">
      <div className="section-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <FaBook className="section-icon" />
        <h2>LATEST PLAYBOOK</h2>
      </div>
      <div className="section-content">
        <div
          onClick={() => navigate(`/vault/${latestPlaybook.id}`)}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e9ecef',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{ 
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            color: '#6c757d',
            fontWeight: '500'
          }}>
            {formatWeekDate(latestPlaybook.published_at)}
          </div>
          
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1a1a1a',
            marginBottom: '0.75rem',
            lineHeight: '1.4'
          }}>
            {latestPlaybook.title}
          </h3>

          {latestPlaybook.short_description && (
            <p style={{ 
              color: '#6c757d', 
              fontSize: '1rem', 
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              {latestPlaybook.short_description.length > 150 
                ? `${latestPlaybook.short_description.substring(0, 150)}...` 
                : latestPlaybook.short_description}
            </p>
          )}

          {latestPlaybook.tags && latestPlaybook.tags.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {latestPlaybook.tags.slice(0, 3).map((tag, idx) => (
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
            marginTop: '1rem',
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
              ⏱️ {latestPlaybook.estimated_read_time || '5 min'}
            </span>
            <div style={{ 
              color: '#2563eb', 
              fontWeight: '600', 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Open Playbook →
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link 
            to="/vault"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.color = '#2563eb'}
          >
            View All Playbooks →
          </Link>
        </div>
        
        <hr className="section-divider" />
      </div>
    </div>
  );
};

export default VaultPreview;
