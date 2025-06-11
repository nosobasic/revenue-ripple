import React from 'react';

const VideoModal = ({ isOpen, onClose, video, title, onMarkComplete, completed, buttonLoading }) => {
  if (!isOpen) return null;

  let embedUrl = '';
  if (video?.vimeoId) {
    embedUrl = `https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`;
  } else if (video?.url) {
    embedUrl = video.url;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '90%',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#4b5563'
          }}
        >
          ×
        </button>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{title}</h2>
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          overflow: 'hidden'
        }}>
          <iframe
            src={embedUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowFullScreen
          />
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={onMarkComplete}
            disabled={completed || buttonLoading}
            style={{
              background: completed ? '#ccc' : '#2563eb',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: completed ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem'
            }}
          >
            {completed ? 'Module Completed' : buttonLoading ? 'Marking...' : 'Mark as Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoModal; 