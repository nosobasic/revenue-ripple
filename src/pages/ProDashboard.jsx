import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../pages.css';
import { 
  FaMoneyBillWave, 
  FaChartBar, 
  FaUsers, 
  FaCrown,
  FaStar
} from 'react-icons/fa';

export const ProDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard pro-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header pro-header">
          <div className="header-content">
            <h1>
              <FaCrown className="crown-icon" />
              Pro Reseller Dashboard (Test Version)
            </h1>
            <p>Welcome back, {user?.name || 'Pro Reseller'}! This is a minimal test version.</p>
          </div>
          <div className="pro-badge">
            <FaStar /> PRO MEMBER
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h2>Test Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card highlight">
                <FaMoneyBillWave className="stat-icon" />
                <div className="stat-content">
                  <h3>$0.00</h3>
                  <p>Test Earnings</p>
                </div>
              </div>
              <div className="stat-card">
                <FaChartBar className="stat-icon" />
                <div className="stat-content">
                  <h3>0</h3>
                  <p>Test Stats</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUsers className="stat-icon" />
                <div className="stat-content">
                  <h3>0</h3>
                  <p>Test Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;