import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
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
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/courses" className="navbar-link">Video Courses</Link>
              <Link to="/training" className="navbar-link">Training & Guides</Link>
              <Link to="/affiliate-centre" className="navbar-link">Affiliates & Resellers</Link>
              <div className="navbar-profile">
                <button className="navbar-button">
                  {user.email?.split('@')[0]?.toUpperCase()}
                </button>
                <div className="navbar-dropdown">
                  <Link to="/profile" className="dropdown-link">Profile</Link>
                  <Link to="/change-password" className="dropdown-link">Change Password</Link>
                  <Link to="/training" className="dropdown-link">Training & Guides</Link>
                  <button onClick={handleLogout} className="dropdown-link">Logout</button>
                </div>
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