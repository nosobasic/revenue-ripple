import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';

const AffiliatePayouts = () => {
  const earningsData = {
    currentBalance: 1250.75,
    pendingBalance: 450.25,
    totalEarned: 8750.50,
    lastPayout: {
      date: '2024-02-15',
      amount: 1200.00,
      status: 'Completed'
    }
  };

  const recentTransactions = [
    {
      id: 1,
      date: '2024-03-01',
      type: 'Commission',
      amount: 250.75,
      status: 'Pending'
    },
    {
      id: 2,
      date: '2024-02-28',
      type: 'Commission',
      amount: 175.50,
      status: 'Pending'
    },
    {
      id: 3,
      date: '2024-02-15',
      type: 'Payout',
      amount: -1200.00,
      status: 'Completed'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Total Clicks',
      value: '2,450',
      change: '+15%'
    },
    {
      label: 'Conversions',
      value: '45',
      change: '+8%'
    },
    {
      label: 'Conversion Rate',
      value: '1.84%',
      change: '+0.5%'
    }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Earnings & Payouts</h1>
          <p className="dashboard-welcome">Track your performance and earnings</p>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* Earnings Overview */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">💰</div>
              <h2>Earnings Overview</h2>
            </div>
            <div className="section-content">
              <div className="grid-layout">
                <div className="course-item">
                  <h3>Current Balance</h3>
                  <div className="course-details">
                    <div className="earnings-amount">${earningsData.currentBalance}</div>
                    <p>Available for withdrawal</p>
                    <button className="cta-button">Request Payout</button>
                  </div>
                </div>
                <div className="course-item">
                  <h3>Pending Balance</h3>
                  <div className="course-details">
                    <div className="earnings-amount">${earningsData.pendingBalance}</div>
                    <p>Clearing in 30 days</p>
                  </div>
                </div>
                <div className="course-item">
                  <h3>Total Earned</h3>
                  <div className="course-details">
                    <div className="earnings-amount">${earningsData.totalEarned}</div>
                    <p>All-time earnings</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">📊</div>
              <h2>Recent Transactions</h2>
            </div>
            <div className="section-content">
              <div className="transactions-list">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type">{transaction.type}</span>
                      <span className="transaction-date">{transaction.date}</span>
                    </div>
                    <div className="transaction-details">
                      <span className={`transaction-amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                      <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="side-content">
          {/* Performance Metrics */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">📈</div>
              <h2>Performance Metrics</h2>
            </div>
            <div className="section-content">
              <div className="stats-grid">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-number">{metric.value}</div>
                    <div className="stat-label">{metric.label}</div>
                    <div className={`stat-change ${metric.change.startsWith('+') ? 'positive' : 'negative'}`}>
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Last Payout */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">💳</div>
              <h2>Last Payout</h2>
            </div>
            <div className="section-content">
              <div className="payout-details">
                <div className="detail-group">
                  <strong>Date:</strong>
                  <span>{earningsData.lastPayout.date}</span>
                </div>
                <div className="detail-group">
                  <strong>Amount:</strong>
                  <span>${earningsData.lastPayout.amount}</span>
                </div>
                <div className="detail-group">
                  <strong>Status:</strong>
                  <span className={`status ${earningsData.lastPayout.status.toLowerCase()}`}>
                    {earningsData.lastPayout.status}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">📋</div>
              <h2>Navigation</h2>
            </div>
            <div className="section-content">
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre" className="cta-link">
                    <span className="item-icon">🏠</span>
                    Dashboard
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/tools" className="cta-link">
                    <span className="item-icon">🛠️</span>
                    Marketing Tools
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/training" className="cta-link">
                    <span className="item-icon">📚</span>
                    Training & Guides
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/support" className="cta-link">
                    <span className="item-icon">💬</span>
                    Support & FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePayouts; 