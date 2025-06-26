import React from 'react';
import { motion } from 'framer-motion';

export const FloatingCircle = ({ 
  size = 100, 
  color = 'rgba(37, 99, 235, 0.1)', 
  duration = 20,
  delay = 0,
  className = ''
}) => {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        filter: 'blur(1px)',
      }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
};

export const BackgroundPattern = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Floating decorative elements */}
      <FloatingCircle size={120} className="top-10 left-10" delay={0} />
      <FloatingCircle size={80} className="top-20 right-20" delay={2} color="rgba(37, 99, 235, 0.05)" />
      <FloatingCircle size={60} className="bottom-20 left-1/4" delay={4} />
      <FloatingCircle size={100} className="bottom-10 right-10" delay={6} color="rgba(37, 99, 235, 0.08)" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30 pointer-events-none" />
      
      {children}
    </div>
  );
};

export const GlowOrb = ({ className = '', size = "large" }) => {
  const sizeClasses = {
    small: "w-32 h-32",
    medium: "w-48 h-48",
    large: "w-64 h-64"
  };

  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${sizeClasses[size]} ${className}`}
      style={{
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 100%)',
        filter: 'blur(20px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export default { FloatingCircle, BackgroundPattern, GlowOrb };