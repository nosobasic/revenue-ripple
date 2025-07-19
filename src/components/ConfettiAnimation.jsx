import React, { useEffect, useState } from 'react';

const ConfettiAnimation = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create confetti particles
    const newParticles = [];
    const colors = ['#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const shapes = ['square', 'circle', 'triangle'];

    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 1,
        gravity: 0.1,
        wind: (Math.random() - 0.5) * 0.5
      });
    }

    setParticles(newParticles);

    // Animation loop
    const animate = () => {
      setParticles(prevParticles => {
        const updatedParticles = prevParticles.map(particle => {
          // Apply physics
          particle.vy += particle.gravity;
          particle.vx += particle.wind;
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.rotation += particle.rotationSpeed;
          
          // Fade out as particles fall
          if (particle.y > window.innerHeight * 0.8) {
            particle.opacity = Math.max(0, particle.opacity - 0.02);
          }

          return particle;
        }).filter(particle => particle.opacity > 0);

        if (updatedParticles.length === 0) {
          onComplete && onComplete();
          return [];
        }

        return updatedParticles;
      });
    };

    const interval = setInterval(animate, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : '0',
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            transition: 'opacity 0.1s ease',
            ...(particle.shape === 'triangle' && {
              backgroundColor: 'transparent',
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
              width: 0,
              height: 0
            })
          }}
        />
      ))}
      
      {/* Success message overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '2rem 3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
          textAlign: 'center',
          animation: 'bounceIn 0.6s ease-out',
          zIndex: 10000
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Course Completed!
        </h2>
        <p style={{ 
          fontSize: '1rem', 
          margin: 0,
          opacity: 0.9
        }}>
          Congratulations on your achievement!
        </p>
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          70% {
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @media (max-width: 768px) {
          .success-message {
            padding: 1.5rem 2rem !important;
            margin: 0 1rem !important;
          }
          
          .success-title {
            font-size: 1.25rem !important;
          }
          
          .success-text {
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiAnimation; 