import React from 'react';
import { clearAuthCache, forceSessionRefresh } from '../utils/authUtils';

const ClearCacheButton = ({ variant = 'button' }) => {
  const handleClearCache = () => {
    if (window.confirm('This will clear all authentication data and reload the page. Continue?')) {
      clearAuthCache();
      forceSessionRefresh();
    }
  };

  const buttonStyle = {
    padding: '8px 16px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    margin: '4px'
  };

  const linkStyle = {
    color: '#dc2626',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '12px'
  };

  if (variant === 'link') {
    return (
      <span style={linkStyle} onClick={handleClearCache}>
        Clear Auth Cache
      </span>
    );
  }

  return (
    <button style={buttonStyle} onClick={handleClearCache}>
      Clear Auth Cache
    </button>
  );
};

export default ClearCacheButton;