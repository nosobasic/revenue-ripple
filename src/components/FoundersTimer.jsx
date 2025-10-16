import { useState, useEffect } from 'react';
import { FOUNDERS_ANNUAL_CONFIG } from '../config/constants';

export default function FoundersTimer({ timerStartedAt, onExpiry }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Get timer start from props or localStorage
    let timerStart = timerStartedAt;
    
    if (!timerStart) {
      const stored = localStorage.getItem('founders_timer_start');
      if (stored) {
        timerStart = stored;
      } else {
        // First visit - start timer
        timerStart = new Date().toISOString();
        localStorage.setItem('founders_timer_start', timerStart);
      }
    }

    const calculateTimeRemaining = () => {
      const startTime = new Date(timerStart);
      const expiryTime = new Date(startTime.getTime() + (FOUNDERS_ANNUAL_CONFIG.TIMER_DAYS * 24 * 60 * 60 * 1000));
      const now = new Date();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        if (onExpiry) onExpiry();
        return null;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, totalMs: remaining };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStartedAt, onExpiry]);

  if (isExpired) {
    return (
      <div className="founders-timer expired">
        <div className="timer-content">
          <div className="timer-icon">⏰</div>
          <div className="timer-text">
            <h3>Offer Expired</h3>
            <p>This exclusive founder offer is no longer available.</p>
            <button className="waitlist-btn">Join Waitlist</button>
          </div>
        </div>
      </div>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  const { days, hours, minutes, seconds } = timeRemaining;
  const isUrgent = timeRemaining.totalMs < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <div className={`founders-timer ${isUrgent ? 'urgent' : ''}`}>
      <div className="timer-content">
        <div className="timer-label">
          ⏱️ Your Exclusive Access Expires In:
        </div>
        <div className="timer-display">
          <div className="time-unit">
            <span className="time-value">{days}</span>
            <span className="time-label">{days === 1 ? 'Day' : 'Days'}</span>
          </div>
          <span className="time-separator">:</span>
          <div className="time-unit">
            <span className="time-value">{String(hours).padStart(2, '0')}</span>
            <span className="time-label">Hours</span>
          </div>
          <span className="time-separator">:</span>
          <div className="time-unit">
            <span className="time-value">{String(minutes).padStart(2, '0')}</span>
            <span className="time-label">Minutes</span>
          </div>
          <span className="time-separator">:</span>
          <div className="time-unit">
            <span className="time-value">{String(seconds).padStart(2, '0')}</span>
            <span className="time-label">Seconds</span>
          </div>
        </div>
      </div>

      <style>{`
        .founders-timer {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .founders-timer.urgent {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          animation: pulse 2s ease-in-out infinite;
        }

        .founders-timer.expired {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 10px 30px rgba(245, 87, 108, 0.3); }
          50% { box-shadow: 0 10px 40px rgba(245, 87, 108, 0.5); }
        }

        .timer-content {
          text-align: center;
        }

        .timer-label {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timer-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .time-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          min-width: 70px;
        }

        .time-value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .time-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .time-separator {
          font-size: 1.5rem;
          font-weight: 700;
          opacity: 0.7;
        }

        .timer-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .timer-text h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .timer-text p {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }

        .waitlist-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .waitlist-btn:hover {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .founders-timer {
            padding: 1rem;
          }

          .timer-label {
            font-size: 0.875rem;
          }

          .time-unit {
            min-width: 60px;
            padding: 0.5rem 0.75rem;
          }

          .time-value {
            font-size: 1.5rem;
          }

          .time-label {
            font-size: 0.625rem;
          }

          .time-separator {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

