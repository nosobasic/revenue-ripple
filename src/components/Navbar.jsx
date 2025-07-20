import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsProfileDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
        
        {/* Desktop Navigation */}
        <div className="navbar-links desktop-nav">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/courses" className="navbar-link">Video Courses</Link>
              <Link to="/training" className="navbar-link">Training & Guides</Link>
              <Link to="/affiliate-centre" className="navbar-link">Affiliates & Resellers</Link>
              <div className="navbar-profile" ref={dropdownRef}>
                <button 
                  className="navbar-button profile-button"
                  onClick={toggleProfileDropdown}
                >
                  <FaUser className="profile-icon" />
                  <span>{user.email?.split('@')[0]?.toUpperCase()}</span>
                </button>
                {isProfileDropdownOpen && (
                  <div className="navbar-dropdown">
                    <Link to="/profile" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                      <FaUser /> Profile Settings
                    </Link>
                    <Link to="/change-password" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                      <FaCog /> Change Password
                    </Link>
                    <button onClick={handleLogout} className="dropdown-link">
                      <FaSignOutAlt /> Logout
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

        {/* Mobile Hamburger Menu */}
        <div className="mobile-menu-container" ref={mobileMenuRef}>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          {isMobileMenuOpen && (
            <div className="mobile-menu">
              {user ? (
                <>
                  <Link to="/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                  <Link to="/courses" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Video Courses
                  </Link>
                  <Link to="/training" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Training & Guides
                  </Link>
                  <Link to="/affiliate-centre" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Affiliates & Resellers
                  </Link>
                  <div className="mobile-profile-section">
                    <div className="mobile-profile-header">
                      <FaUser className="profile-icon" />
                      <span>{user.email?.split('@')[0]?.toUpperCase()}</span>
                    </div>
                    <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                      <FaUser /> Profile Settings
                    </Link>
                    <Link to="/change-password" className="mobile-nav-link" onClick={closeMobileMenu}>
                      <FaCog /> Change Password
                    </Link>
                    <button onClick={handleLogout} className="mobile-nav-link logout-button">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 