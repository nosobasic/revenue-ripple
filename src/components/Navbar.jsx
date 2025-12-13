import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { FaGraduationCap, FaChartLine, FaDollarSign, FaQuestionCircle, FaUser, FaBars, FaTimes, FaRobot, FaUsers, FaComments, FaTrophy, FaDiscord, FaChevronDown } from 'react-icons/fa';
import { logger } from '../config/constants';
import './Navbar.css';

const Navbar = React.memo(() => {
  const { user, logout } = useAuth();
  const { isAffiliate, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      logger.error('Failed to log out:', error);
    }
  }, [logout, navigate]);

  const isActive = useCallback((path) => {
    if (path === '/learn') {
      return location.pathname.includes('/courses') || location.pathname.includes('/training');
    }
    if (path === '/progress') {
      return location.pathname === '/dashboard';
    }
    if (path === '/earn') {
      return location.pathname.includes('/affiliate');
    }
    if (path === '/community') {
      return location.pathname.includes('/community');
    }
    return location.pathname === path;
  }, [location.pathname]);

  const getNavLinkClass = useCallback((path) => {
    return `navbar-link ${isActive(path) ? 'active' : ''}`;
  }, [isActive]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleCommunityMouseEnter = useCallback(() => {
    setCommunityDropdownOpen(true);
  }, []);

  const handleCommunityMouseLeave = useCallback(() => {
    setCommunityDropdownOpen(false);
  }, []);

  // Memoize navigation items
  const navItems = useMemo(() => {
    const items = [
      { path: '/progress', icon: FaChartLine, label: 'Progress' },
      { path: '/learn', icon: FaGraduationCap, label: 'Learn' },
      { path: '/earn', icon: FaDollarSign, label: 'Earn' },
      { path: '/support', icon: FaQuestionCircle, label: 'Support' }
    ];
    
    // Add Command Center for authenticated users
    if (user) {
      items.push({ path: '/command-center', icon: FaRobot, label: 'Command Center' });
    }
    
    return items;
  }, [user]);

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
              {(isAffiliate || isAdmin) &&
              <Link to="/affiliate-centre" className={getNavLinkClass('/earn')} onClick={closeMobileMenu}>
                <FaDollarSign className="nav-icon" />
                <span>Earn</span>
              </Link>}
              
              <Link to="/training" className={getNavLinkClass('/support')} onClick={closeMobileMenu}>
                <FaQuestionCircle className="nav-icon" />
                <span>Support</span>
              </Link>

              {/* Community Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleCommunityMouseEnter}
                onMouseLeave={handleCommunityMouseLeave}
              >
                <div className={`navbar-link ${isActive('/community') ? 'active' : ''} cursor-pointer`}>
                  <FaUsers className="nav-icon" />
                  <span>Community</span>
                  <FaChevronDown className="ml-1 text-xs" />
                </div>
                
                {communityDropdownOpen && (
                  <div className="navbar-dropdown">
                    <Link to="/community" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                      <FaUsers className="dropdown-icon" />
                      <span>Community Hub</span>
                    </Link>
                    <Link to="/community/forum" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                      <FaComments className="dropdown-icon" />
                      <span>Forum</span>
                    </Link>
                    <Link to="/community/success-stories" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                      <FaTrophy className="dropdown-icon" />
                      <span>Success Stories</span>
                    </Link>
                    <a 
                      href="https://discord.gg/q2b6BDtsyr" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="navbar-dropdown-item"
                      onClick={closeMobileMenu}
                    >
                      <FaDiscord className="dropdown-icon" />
                      <span>Discord</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Founders CTA moved out of navbar for signed-in users */}
              
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
              <Link to="/register?redirect=founders-checkout" className="founders-cta-btn-guest" onClick={closeMobileMenu}>
                🚀 Founders Circle
              </Link>
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
                  {(isAffiliate || isAdmin) &&
                  <Link to="/affiliate-centre" className={`mobile-nav-link ${getNavLinkClass('/earn')}`} onClick={closeMobileMenu}>
                    <FaDollarSign className="mobile-nav-icon" />
                    <span>Earn</span>
                  </Link>
}
                  <Link to="/training" className={`mobile-nav-link ${getNavLinkClass('/support')}`} onClick={closeMobileMenu}>
                    <FaQuestionCircle className="mobile-nav-icon" />
                    <span>Support</span>
                  </Link>

                  <div className="mobile-menu-divider"></div>

                  {/* Community Section - Mobile */}
                  <div className="mobile-community-section">
                    <div className="mobile-nav-link mobile-community-header">
                      <FaUsers className="mobile-nav-icon" />
                      <span>Community</span>
                    </div>
                    <div className="mobile-community-submenu">
                      <Link to="/community" className="mobile-nav-link mobile-community-subitem" onClick={closeMobileMenu}>
                        <FaUsers className="mobile-nav-icon" />
                        <span>Community Hub</span>
                      </Link>
                      <Link to="/community/forum" className="mobile-nav-link mobile-community-subitem" onClick={closeMobileMenu}>
                        <FaComments className="mobile-nav-icon" />
                        <span>Forum</span>
                      </Link>
                      <Link to="/community/success-stories" className="mobile-nav-link mobile-community-subitem" onClick={closeMobileMenu}>
                        <FaTrophy className="mobile-nav-icon" />
                        <span>Success Stories</span>
                      </Link>
                      <a 
                        href="https://discord.gg/q2b6BDtsyr" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mobile-nav-link mobile-community-subitem"
                        onClick={closeMobileMenu}
                      >
                        <FaDiscord className="mobile-nav-icon" />
                        <span>Discord</span>
                      </a>
                    </div>
                  </div>

                  <div className="mobile-menu-divider"></div>
                  
                  {/* Founders CTA moved out of navbar for signed-in users (mobile) */}
                  
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
});

Navbar.displayName = 'Navbar';

export default Navbar; 