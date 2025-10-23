import { useState } from 'react';
import { FOUNDERS_ANNUAL_CONFIG } from '../config/constants';

export default function PlanSwitcher({ onPlanChange, defaultPlan = 'annual' }) {
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    if (onPlanChange) {
      onPlanChange(plan);
    }
  };

  return (
    <div className="plan-switcher-container">
      <div className="plan-switcher">
        <div 
          className={`plan-option ${selectedPlan === 'annual' ? 'selected' : ''}`}
          onClick={() => handlePlanChange('annual')}
        >
          <div className="plan-header">
            <div className="plan-radio">
              <input 
                type="radio" 
                name="plan" 
                checked={selectedPlan === 'annual'} 
                onChange={() => handlePlanChange('annual')}
              />
            </div>
            <div className="plan-details">
              <h3 className="plan-name">
                Annual Plan 
                <span className="badge best-value">Best Value</span>
              </h3>
              <div className="plan-price">
                <span className="price-amount">${FOUNDERS_ANNUAL_CONFIG.ANNUAL_PRICE}</span>
                <span className="price-period">/year</span>
              </div>
              <p className="plan-equivalent">
                Just ${FOUNDERS_ANNUAL_CONFIG.MONTHLY_EQUIVALENT}/month
              </p>
            </div>
          </div>
          <div className="plan-benefits">
            <div className="benefit-badge savings">
              🎉 Save ${FOUNDERS_ANNUAL_CONFIG.SAVINGS}/year
            </div>
            <div className="benefit-badge">
              {FOUNDERS_ANNUAL_CONFIG.MARKETING_COPY.TAGLINE}
            </div>
          </div>
        </div>

        <div 
          className={`plan-option ${selectedPlan === 'monthly' ? 'selected' : ''}`}
          onClick={() => handlePlanChange('monthly')}
        >
          <div className="plan-header">
            <div className="plan-radio">
              <input 
                type="radio" 
                name="plan" 
                checked={selectedPlan === 'monthly'} 
                onChange={() => handlePlanChange('monthly')}
              />
            </div>
            <div className="plan-details">
              <h3 className="plan-name">Monthly Plan</h3>
              <div className="plan-price">
                <span className="price-amount">${FOUNDERS_ANNUAL_CONFIG.MONTHLY_PRICE}</span>
                <span className="price-period">/month</span>
              </div>
              <p className="plan-equivalent">
                $564/year billed monthly
              </p>
            </div>
          </div>
          <div className="plan-benefits">
            <div className="benefit-note">
              Standard monthly membership
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .plan-switcher-container {
          margin-bottom: 2rem;
        }

        .plan-switcher {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .plan-option {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .plan-option:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .plan-option.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
        }

        .plan-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .plan-radio {
          padding-top: 0.25rem;
        }

        .plan-radio input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .plan-details {
          flex: 1;
        }

        .plan-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge.best-value {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          margin-bottom: 0.25rem;
        }

        .price-amount {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .price-period {
          font-size: 1rem;
          color: #6b7280;
          margin-left: 0.25rem;
        }

        .plan-equivalent {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .plan-benefits {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .benefit-badge {
          background: #f3f4f6;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .benefit-badge.savings {
          background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
          color: #065f46;
        }

        .benefit-note {
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .plan-option {
            padding: 1rem;
          }

          .plan-name {
            font-size: 1.125rem;
          }

          .price-amount {
            font-size: 1.75rem;
          }

          .badge {
            font-size: 0.625rem;
            padding: 0.2rem 0.6rem;
          }

          .benefit-badge {
            font-size: 0.75rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

