import React, { useState, useEffect } from 'react';
import { resolveVideoSrc } from '../utils/videoCdn';
import ConfettiAnimation from './ConfettiAnimation';

const VideoModal = ({ isOpen, onClose, video, title, onMarkComplete, completed, buttonLoading }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [cdnFailed, setCdnFailed] = useState(false);

  useEffect(() => {
    setCdnFailed(false);
  }, [video?.cdnPath, video?.vimeoId, video?.url, isOpen]);

  if (!isOpen) return null;

  const preferred = resolveVideoSrc(video);
  const useCdn = preferred?.type === 'cdn' && !cdnFailed;

  let iframeSrc = null;
  if (!useCdn) {
    if (video?.vimeoId) {
      iframeSrc = `https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`;
    } else if (preferred?.type === 'iframe') {
      iframeSrc = preferred.src;
    } else if (video?.url && !/\.mp4(\?|$)/i.test(video.url)) {
      iframeSrc = video.url;
    }
  }

  const handleMarkComplete = async () => {
    if (onMarkComplete) {
      await onMarkComplete();
      setShowConfetti(true);
    }
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

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
      <ConfettiAnimation
        isActive={showConfetti}
        onComplete={handleConfettiComplete}
      />

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
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          background: '#000'
        }}>
          {useCdn ? (
            <video
              src={preferred.src}
              controls
              playsInline
              preload="metadata"
              title={title}
              onError={() => setCdnFailed(true)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                objectFit: 'contain',
                background: '#000'
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : iframeSrc ? (
            <iframe
              src={iframeSrc}
              title={title}
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
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af'
            }}>
              Video unavailable
            </div>
          )}
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={handleMarkComplete}
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
