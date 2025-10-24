import { useEffect } from 'react';

export default function OAuthTest() {
  useEffect(() => {
    console.log('=================================');
    console.log('🧪 OAuth Test Page Loaded!');
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search:', window.location.search);
    console.log('Pathname:', window.location.pathname);
    console.log('=================================');
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>OAuth Test Page</h1>
      <p>Check the console for debug info</p>
      <div style={{ background: '#f5f5f5', padding: '1rem', marginTop: '1rem' }}>
        <p><strong>URL:</strong> {window.location.href}</p>
        <p><strong>Hash:</strong> {window.location.hash || 'none'}</p>
        <p><strong>Search:</strong> {window.location.search || 'none'}</p>
      </div>
    </div>
  );
}

