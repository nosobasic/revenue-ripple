import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaChartLine, FaDollarSign, FaQuestionCircle, FaUser, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar-profile') && !event.target.closest('.mobile-menu')) {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const navItems = [
    { path: '/courses', label: 'Learn', icon: FaGraduationCap, key: '/learn' },
    { path: '/dashboard', label: 'Progress', icon: FaChartLine, key: '/progress' },
    { path: '/affiliate-centre', label: 'Earn', icon: FaDollarSign, key: '/earn' },
    { path: '/training', label: 'Support', icon: FaQuestionCircle, key: '/support' }
  ];

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
        
        {/* Desktop Navigation */}
        <div className={`navbar-links ${isMobile ? 'mobile-hidden' : ''}`}>
          {user ? (
            <>
              {/* Simplified SLC Navigation */}
              {navItems.map(({ path, label, icon: Icon, key }) => (
                <Link key={path} to={path} className={getNavLinkClass(key)}>
                  <Icon className="nav-icon" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Profile Dropdown */}
              <div className="navbar-profile">
                <button 
                  className="navbar-profile-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
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

        {/* Mobile Menu Button */}
        {isMobile && user && (
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && user && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {/* Mobile Navigation Items */}
              <div className="mobile-nav-items">
                {navItems.map(({ path, label, icon: Icon, key }) => (
                  <Link 
                    key={path} 
                    to={path} 
                    className={`mobile-nav-link ${isActive(key) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mobile-nav-icon" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Profile Section */}
              <div className="mobile-profile">
                <div className="mobile-profile-info">
                  <FaUser className="mobile-profile-icon" />
                  <span className="mobile-profile-email">
                    {user.email?.split('@')[0]?.toUpperCase()}
                  </span>
                </div>
                
                <Link 
                  to="/profile" 
                  className="mobile-profile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUser className="mobile-link-icon" />
                  Profile Settings
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="mobile-logout-btn"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Non-authenticated Links */}
        {isMobile && !user && (
          <div className="mobile-auth-links">
            <Link to="/login" className="mobile-auth-link">Sign In</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 