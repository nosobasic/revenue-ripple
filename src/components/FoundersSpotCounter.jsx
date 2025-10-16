import { useState, useEffect } from 'react';
import { API_ENDPOINTS, FOUNDERS_ANNUAL_CONFIG } from '../config/constants';

export default function FoundersSpotCounter({ className = '' }) {
  const [spotsRemaining, setSpotsRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSoldOut, setIsSoldOut] = useState(false);

  useEffect(() => {
    fetchSpotsRemaining();

    // Refresh every 30 seconds
    const interval = setInterval(fetchSpotsRemaining, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchSpotsRemaining = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/founders-spots-remaining`);
      const data = await response.json();
      
      setSpotsRemaining(data.spots_remaining);
      setIsSoldOut(data.spots_remaining === 0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching spots remaining:', error);
      // Fallback to showing some spots available
      setSpotsRemaining(12);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`spot-counter loading ${className}`}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <div className={`spot-counter sold-out ${className}`}>
        <div className="spot-content">
          <span className="spot-icon">🚀</span>
          <div className="spot-text">
            <h3>{FOUNDERS_ANNUAL_CONFIG.MARKETING_COPY.SOLD_OUT_TEXT}</h3>
            <p>All 20 founder spots have been claimed</p>
          </div>
        </div>
      </div>
    );
  }

  const urgencyLevel = spotsRemaining <= 5 ? 'critical' : spotsRemaining <= 10 ? 'medium' : 'low';

  return (
    <div className={`spot-counter ${urgencyLevel} ${className}`}>
      <div className="spot-content">
        <div className="spot-icon-container">
          <span className="spot-icon">🎯</span>
          {urgencyLevel === 'critical' && <span className="pulse-ring"></span>}
        </div>
        <div className="spot-text">
          <h3 className="spot-number">
            <span className="number">{spotsRemaining}</span>
            <span className="total"> of {FOUNDERS_ANNUAL_CONFIG.TOTAL_SPOTS}</span>
          </h3>
          <p className="spot-label">Founder Spots Remaining</p>
        </div>
      </div>

      <style>{`
        .spot-counter {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }

        .spot-counter.loading {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spot-counter.medium {
          border-color: #fbbf24;
          background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
        }

        .spot-counter.critical {
          border-color: #ef4444;
          background: linear-gradient(135deg, #fee2e2 0%, #ffffff 100%);
          animation: border-pulse 2s ease-in-out infinite;
        }

        @keyframes border-pulse {
          0%, 100% { border-color: #ef4444; }
          50% { border-color: #dc2626; }
        }

        .spot-counter.sold-out {
          border-color: #9ca3af;
          background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%);
        }

        .spot-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .spot-icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spot-icon {
          font-size: 2.5rem;
          display: block;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid #ef4444;
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .spot-text {
          flex: 1;
        }

        .spot-number {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .spot-counter.critical .number {
          color: #ef4444;
        }

        .spot-counter.medium .number {
          color: #f59e0b;
        }

        .spot-counter.low .number {
          color: #10b981;
        }

        .total {
          font-size: 1.25rem;
          color: #6b7280;
          font-weight: 500;
        }

        .spot-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .spot-counter.sold-out .spot-text h3 {
          font-size: 1.25rem;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .spot-counter.sold-out .spot-text p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        @media (max-width: 768px) {
          .spot-counter {
            padding: 1rem;
          }

          .spot-icon {
            font-size: 2rem;
          }

          .spot-number {
            font-size: 1.5rem;
          }

          .total {
            font-size: 1rem;
          }

          .spot-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

