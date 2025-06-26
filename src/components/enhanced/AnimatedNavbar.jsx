import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AnimatedNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navVariants = {
    top: {
      backgroundColor: 'rgba(37, 99, 235, 0.95)',
      backdropFilter: 'blur(0px)',
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
    },
    scrolled: {
      backgroundColor: 'rgba(37, 99, 235, 0.9)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }
  };

  const linkHoverVariants = {
    rest: { scale: 1, color: '#ffffff' },
    hover: { 
      scale: 1.05, 
      color: '#bfdbfe',
      transition: { duration: 0.2 }
    }
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      variants={navVariants}
      animate={scrolled ? 'scrolled' : 'top'}
      initial="top"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center">
              <motion.img 
                src="/assets/icons/revenue_ripple_no_bg.png" 
                alt="Revenue Ripple Logo" 
                className="h-10 w-auto"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <motion.div variants={linkHoverVariants} initial="rest" whileHover="hover">
                  <Link to="/dashboard" className="text-white font-medium transition-colors">
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div variants={linkHoverVariants} initial="rest" whileHover="hover">
                  <Link to="/courses" className="text-white font-medium transition-colors">
                    Video Courses
                  </Link>
                </motion.div>
                <motion.div variants={linkHoverVariants} initial="rest" whileHover="hover">
                  <Link to="/training" className="text-white font-medium transition-colors">
                    Training & Guides
                  </Link>
                </motion.div>
                <motion.div variants={linkHoverVariants} initial="rest" whileHover="hover">
                  <Link to="/affiliate-centre" className="text-white font-medium transition-colors">
                    Affiliates & Resellers
                  </Link>
                </motion.div>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {user.email?.split('@')[0]?.toUpperCase()}
                  </motion.button>
                  
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden"
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/change-password"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          Change Password
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.div variants={linkHoverVariants} initial="rest" whileHover="hover">
                  <Link to="/login" className="text-white font-medium">
                    Member Sign In
                  </Link>
                </motion.div>
                <motion.div variants={linkHoverVariants} initial="rest" whileHover="hover">
                  <Link to="/affiliate-login" className="text-white font-medium">
                    Affiliates & Resellers
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default AnimatedNavbar;