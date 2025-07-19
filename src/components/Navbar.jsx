import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaChartLine, FaDollarSign, FaQuestionCircle, FaUser, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/learn') {
      return location.pathname.includes('/courses') || location.pathname.includes('/training');
    }
    if (path === '/progress') {
      return location.pathname === '/dashboard';
    }
    if (path === '/earn') {
      return location.pathname.includes('/affiliate');
    }
    return location.pathname === path;
  };

  const getNavLinkClass = (path) => {
    return `navbar-link ${isActive(path) ? 'active' : ''}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img 
            src="/assets/icons/revenue_ripple_no_bg.png" 
            alt="Revenue Ripple Logo" 
            className="navbar-logo"
          />
        </Link>
        
        <div className="navbar-links">
          {user ? (
            <>
              {/* Simplified SLC Navigation */}
              <Link to="/courses" className={getNavLinkClass('/learn')}>
                <FaGraduationCap className="nav-icon" />
                <span>Learn</span>
              </Link>
              
              <Link to="/dashboard" className={getNavLinkClass('/progress')}>
                <FaChartLine className="nav-icon" />
                <span>Progress</span>
              </Link>
              
              <Link to="/affiliate-centre" className={getNavLinkClass('/earn')}>
                <FaDollarSign className="nav-icon" />
                <span>Earn</span>
              </Link>
              
              <Link to="/training" className={getNavLinkClass('/support')}>
                <FaQuestionCircle className="nav-icon" />
                <span>Support</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="navbar-profile">
                <button 
                  className="navbar-profile-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <FaUser className="nav-icon" />
                  <span>{user.email?.split('@')[0]?.toUpperCase()}</span>
                  <FaChevronDown className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <Link to="/profile" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                      <FaUser className="dropdown-icon" />
                      Profile Settings
                    </Link>
                    <button onClick={handleLogout} className="dropdown-link logout-btn">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Member Sign In</Link>
              <Link to="/affiliate-login" className="navbar-link">Affiliates & Resellers</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 