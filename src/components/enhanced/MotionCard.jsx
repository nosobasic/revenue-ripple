import React from 'react';
import { motion } from 'framer-motion';

export const MotionCard = ({ 
  children, 
  className = '', 
  delay = 0,
  hover = true,
  scale = true,
  blur = false,
  ...props 
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const hoverVariants = hover ? {
    hover: {
      y: -8,
      scale: scale ? 1.02 : 1,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  } : {};

  return (
    <motion.div
      className={`bg-white rounded-xl overflow-hidden transition-all duration-300 ${
        blur ? 'backdrop-blur-sm bg-white/90' : ''
      } ${className}`}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover={hover ? "hover" : undefined}
      viewport={{ once: true, margin: "-100px" }}
      {...hoverVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;