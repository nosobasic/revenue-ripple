import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavigationUtils } from '../utils/navigationUtils';
import { FaGraduationCap, FaChartLine, FaDollarSign, FaQuestionCircle, FaUser, FaBars, FaTimes, FaLightbulb } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    if (path === '/insights') {
      return location.pathname === '/insights';
    }
    return location.pathname === path;
  };

  const getNavLinkClass = (path) => {
    return `navbar-link ${isActive(path) ? 'active' : ''}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <img 
            src="/assets/icons/revenue_ripple_no_bg.png" 
            alt="Revenue Ripple Logo" 
            className="navbar-logo"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="navbar-links desktop-nav">
          {user ? (
            <>
              {/* Simplified SLC Navigation */}
              <Link to="/courses" className={getNavLinkClass('/learn')} onClick={closeMobileMenu}>
                <FaGraduationCap className="nav-icon" />
                <span>Learn</span>
              </Link>
              
              <Link to="/dashboard" className={getNavLinkClass('/progress')} onClick={closeMobileMenu}>
                <FaChartLine className="nav-icon" />
                <span>Progress</span>
              </Link>
              
              <Link to="/affiliate-centre" className={getNavLinkClass('/earn')} onClick={closeMobileMenu}>
                <FaDollarSign className="nav-icon" />
                <span>Earn</span>
              </Link>
              
              <Link to="/training" className={getNavLinkClass('/support')} onClick={closeMobileMenu}>
                <FaQuestionCircle className="nav-icon" />
                <span>Support</span>
              </Link>

              {/* Insights Link */}
              <Link to="/insights" className={getNavLinkClass('/insights')} onClick={closeMobileMenu}>
                <FaLightbulb className="nav-icon" />
                <span>Insights</span>
                <span style={{ 
                  background: "#f59e0b", 
                  color: "white", 
                  fontSize: "0.7rem", 
                  padding: "2px 6px", 
                  borderRadius: "10px", 
                  marginLeft: "4px",
                  fontWeight: "bold"
                }}>
                  NEW
                </span>
              </Link>

              {/* Profile Link */}
              <Link to="/profile" className="navbar-link" onClick={closeMobileMenu}>
                <FaUser className="nav-icon" />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>Member Sign In</Link>
              <Link to="/affiliate-login" className="navbar-link" onClick={closeMobileMenu}>Affiliates & Resellers</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="mobile-nav">
          <button 
            className="hamburger-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button 
                className="close-mobile-menu"
                onClick={closeMobileMenu}
                aria-label="Close mobile menu"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mobile-menu-links">
              {user ? (
                <>
                  <Link to="/courses" className={`mobile-nav-link ${getNavLinkClass('/learn')}`} onClick={closeMobileMenu}>
                    <FaGraduationCap className="mobile-nav-icon" />
                    <span>Learn</span>
                  </Link>
                  
                  <Link to="/dashboard" className={`mobile-nav-link ${getNavLinkClass('/progress')}`} onClick={closeMobileMenu}>
                    <FaChartLine className="mobile-nav-icon" />
                    <span>Progress</span>
                  </Link>
                  
                  <Link to="/affiliate-centre" className={`mobile-nav-link ${getNavLinkClass('/earn')}`} onClick={closeMobileMenu}>
                    <FaDollarSign className="mobile-nav-icon" />
                    <span>Earn</span>
                  </Link>
                  
                  <Link to="/training" className={`mobile-nav-link ${getNavLinkClass('/support')}`} onClick={closeMobileMenu}>
                    <FaQuestionCircle className="mobile-nav-icon" />
                    <span>Support</span>
                  </Link>
                  
                  <Link to="/insights" className={`mobile-nav-link ${getNavLinkClass('/insights')}`} onClick={closeMobileMenu}>
                    <FaLightbulb className="mobile-nav-icon" />
                    <span>Insights</span>
                    <span style={{ 
                      background: "#f59e0b", 
                      color: "white", 
                      fontSize: "0.7rem", 
                      padding: "2px 6px", 
                      borderRadius: "10px", 
                      marginLeft: "4px",
                      fontWeight: "bold"
                    }}>
                      NEW
                    </span>
                  </Link>

                  <div className="mobile-menu-divider"></div>
                  
                  <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <FaUser className="mobile-nav-icon" />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <button onClick={handleLogout} className="mobile-nav-link logout-link">
                    <FaUser className="mobile-nav-icon" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Member Sign In
                  </Link>
                  <Link to="/affiliate-login" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Affiliates & Resellers
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 