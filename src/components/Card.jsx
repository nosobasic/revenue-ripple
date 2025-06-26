import React from 'react';
import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } : {}}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      {...props}
    >
      {children}
    </motion.div>
  );
} 