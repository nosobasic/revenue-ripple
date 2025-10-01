import "../pages.css";

import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PayPalPayoutButton from "../components/PayPalPayoutButton";
import { useAuth } from "../context/AuthContext";
import { supabase } from '../supabase/client';
import moment from "moment";

const AffiliatePayouts = () => {
  const { user } = useAuth();
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutError, setPayoutError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastPayout, setLastPayout] = useState();
  const [recentTransactions, setRecentTransaction] = useState([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [conversion, setConversion] = useState(0)
  const [payoutData, setPayoutData] = useState({
    currentBalance: 0,
    pendingBalance: 0,
    totalEarned: 0
  });


  const earningsData = {
    currentBalance: 1250.75,
    pendingBalance: 450.25,
    totalEarned: 8750.5,
    lastPayout: {
      date: "2024-02-15",
      amount: 1200.0,
      status: "Completed",
    },
  };

  const handlePayoutSuccess = (data) => {
    setPayoutSuccess(true);
    setPayoutError(null);
    // You could also refresh the earnings data here
    console.log("Payout successful:", data);
  };

  const handlePayoutError = (error) => {
    setPayoutError(error.message);
    setPayoutSuccess(false);
    console.error("Payout error:", error);
  };

  // const recentTransactions = [
  //   {
  //     id: 1,
  //     date: "2024-03-01",
  //     type: "Commission",
  //     amount: 250.75,
  //     status: "Pending",
  //   },
  //   {
  //     id: 2,
  //     date: "2024-02-28",
  //     type: "Commission",
  //     amount: 175.5,
  //     status: "Pending",
  //   },
  //   {
  //     id: 3,
  //     date: "2024-02-15",
  //     type: "Payout",
  //     amount: -1200.0,
  //     status: "Completed",
  //   },
  // ];

  const performanceMetrics = [
    {
      label: "Total Clicks",
      value: "2,450",
      change: "+15%",
    },
    {
      label: "Conversions",
      value: "45",
      change: "+8%",
    },
    {
      label: "Conversion Rate",
      value: "1.84%",
      change: "+0.5%",
    },
  ];

   useEffect(() => {
      const fetchStats = async () => {
        if (!user?.id) return;
  
        try {
          setLoading(true);
          setError(null);
  
          // Fetch payout
          const { data: payout, error: payoutError } = await supabase
          .from('payouts')
          .select('*')
          .eq('user_email', user.email);

          setRecentTransaction(payout)


        if (payoutError) throw payoutError;
        const totalPayoutAmount = payout.reduce((sum, row) => sum + row.amount, 0);

        const mostRecentPayout = payout.reduce((latest, current) => {
          return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
        });
        setLastPayout(mostRecentPayout)
  
  
          // Fetch commissions
          const { data: commissions, error: commissionsError } = await supabase
            .from('commissions')
            .select('*')
            .eq('referrer_username', user.id);
  
          if (commissionsError) throw commissionsError;
  
          const totalEarnings = commissions.reduce((sum, row) => sum + row.commission, 0);
          const totalSales = commissions.length;
          setConversion(totalSales)

          setPayoutData({
            currentBalance:totalEarnings - totalPayoutAmount,
            pendingBalance: totalEarnings - totalPayoutAmount,
            totalEarned:totalEarnings
          })

          const { data:totalClicks, error:totalClicksError } = await supabase
          .from('affiliate_visits')
          .select('id, count, ref_id')
          .eq('ref_id', user.id);
        
        setTotalClicks(totalClicks[0].count)
        
        if (totalClicksError) {
          console.error("Fetch error: ", error);
          return;
        }
  
         
        } catch (err) {
          console.error('Error fetching data:', err);
          // setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchStats();
    }, [user]);

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Earnings & Payouts</h1>
          <p className="dashboard-welcome">
            Track your performance and earnings
          </p>
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
                    <div className="earnings-amount">
                      ${payoutData?.currentBalance.toFixed(2)}
                    </div>
                    <p>Available for withdrawal</p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        marginTop: "0.25rem",
                      }}
                    >
                      Minimum payout: $10.00
                    </p>
                    <PayPalPayoutButton
                      userEmail={user?.paypal_email}
                      amount={payoutData?.currentBalance}
                      onSuccess={handlePayoutSuccess}
                      onError={handlePayoutError}
                      disabled={
                        !user?.email || earningsData.currentBalance <= 0
                      }
                      minimumAmount={10.0}
                    />
                    {payoutSuccess && (
                      <div
                        style={{
                          color: "#10b981",
                          fontSize: "0.875rem",
                          marginTop: "0.5rem",
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        ✅ Payout request submitted successfully!
                      </div>
                    )}
                  </div>
                </div>
                <div className="course-item">
                  <h3>Pending Balance</h3>
                  <div className="course-details">
                    <div className="earnings-amount">
                      ${payoutData?.pendingBalance.toFixed(2)}
                    </div>
                    <p>Clearing in 30 days</p>
                  </div>
                </div>
                <div className="course-item">
                  <h3>Total Earned</h3>
                  <div className="course-details">
                    <div className="earnings-amount">
                      ${payoutData?.totalEarned.toFixed(2)}
                    </div>
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
                {recentTransactions.length > 0 && recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type">
                        {/* {transaction.type} */}Commission
                      </span>
                      <span className="transaction-date">
                        {transaction?.date}
                      </span>
                    </div>
                    <div className="transaction-details">
                      <span
                        className={`transaction-amount ${
                          transaction?.amount < 0 ? "negative" : "positive"
                        }`}
                      >
                        ${Math.abs(transaction?.amount).toFixed(2)}
                      </span>
                      <span
                        className={`transaction-status ${transaction?.status.toLowerCase()}`}
                      >
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
                {/* {performanceMetrics.map((metric, index) => ( */}
                  <div  className="stat-card">
                    <div className="stat-number">{totalClicks}</div>
                    <div className="stat-label">Total Clicks</div>
                    {/* <div
                      className={`stat-change ${
                        metric.change.startsWith("+") ? "positive" : "negative"
                      }`}
                    >
                      {metric.change}
                    </div> */}
                  </div>
                  <div  className="stat-card">
                    <div className="stat-number">{conversion}</div>
                    <div className="stat-label">Conversions</div>
                    {/* <div
                      className={`stat-change ${
                        metric.change.startsWith("+") ? "positive" : "negative"
                      }`}
                    >
                      {metric.change}
                    </div> */}
                  </div>
                  <div  className="stat-card">
                    <div className="stat-number">{(conversion / 100) *totalClicks} %</div>
                    <div className="stat-label">Conversion Rate%</div>
                    {/* <div
                      className={`stat-change ${
                        metric.change.startsWith("+") ? "positive" : "negative"
                      }`}
                    >
                      {metric.change}
                    </div> */}
                  </div>
                {/* ))} */}
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
                  <span>{moment(lastPayout?.created_at).format("DD-MM-YYYY")}</span>
                </div>
                <div className="detail-group">
                  <strong>Amount:</strong>
                  <span>${lastPayout?.amount}</span>
                </div>
                <div className="detail-group">
                  <strong>Status:</strong>
                  <span
                    className={`status ${earningsData.lastPayout.status.toLowerCase()}`}
                  >
                    {lastPayout?.status}
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
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "1rem" }}>
                  <Link to="/affiliate-centre" className="cta-link">
                    <span className="item-icon">🏠</span>
                    Dashboard
                  </Link>
                </li>
                <li style={{ marginBottom: "1rem" }}>
                  <Link to="/affiliate-centre/tools" className="cta-link">
                    <span className="item-icon">🛠️</span>
                    Marketing Tools
                  </Link>
                </li>
                <li style={{ marginBottom: "1rem" }}>
                  <Link to="/affiliate-centre/training" className="cta-link">
                    <span className="item-icon">📚</span>
                    Training & Guides
                  </Link>
                </li>
                <li style={{ marginBottom: "1rem" }}>
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
