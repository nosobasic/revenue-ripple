import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const MotionButton = ({ 
  children, 
  className = '', 
  variant = 'primary',
  magnetic = true,
  glow = false,
  ...props 
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!magnetic || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    x.set(deltaX * 0.3);
    y.set(deltaY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseClasses = "relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden";
  const variantClasses = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 ${glow ? 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40' : ''}`,
    secondary: `bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 ${glow ? 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40' : ''}`,
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50"
  };

  return (
    <motion.button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        x: springX,
        y: springY,
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 blur-xl"
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default MotionButton;