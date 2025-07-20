import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
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
              <Link to="/profile" className="navbar-link">Profile</Link>
              <button onClick={handleLogout} className="navbar-link logout-button">Logout</button>
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